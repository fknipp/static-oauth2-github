// Global variables

// You must fill in the credentials of your own OAuth app
const CLIENT_ID = "6d40d1235ad144ba4af0";
const CLIENT_SECRET = "32968595ea70b4d69b76cd6d8f63fc0df8bdce3c";

const ENDPOINTS = {
  authorize: "https://github.com/login/oauth/authorize",
  // must use proxy accessToken: "https://github.com/login/oauth/access_token",
  accessToken: "/login/oauth/access_token",
  user: "https://api.github.com/user"
};

window.localStorage.oAuthState =
  window.localStorage.oAuthState ?? Math.floor(Math.random() * 9000 + 1000);

const oAuthState = window.localStorage.oAuthState;
const { protocol, hostname, pathname } = window.location;
const redirectUri = `${protocol}//${hostname}${pathname}`;

// Main function

prepareLogin();
prepareResetState();
if (document.location.search) {
  activate(["authcode", "request"]);
  showReturnedCode();
  prepareRequestAccessToken(entries => {
    activate(["accesstoken"]);
    showAccessToken(entries);
    const accessToken = Object.fromEntries(entries).access_token;
    if (accessToken) {
      prepareResourceAccess(accessToken, response => {
        activate(["resource"]);
        showResponse(response);
      });
    }
  });
} else {
  activate(["login"]);
}

///////////////////////////////////////////////////////////////

// Functions for the flow

function prepareLogin() {
  const loginParameters = {
    client_id: CLIENT_ID,
    state: oAuthState
    //redirect_uri: redirectUri
  };

  fillDlWithEntries("login", Object.entries(loginParameters));
  const link = document.querySelector("#login a");
  link.href =
    ENDPOINTS.authorize + "?" + new URLSearchParams(loginParameters).toString();
}

function prepareResetState() {
  const resetButton = document.querySelector("#login button");
  resetButton.onclick = () => {
    delete window.localStorage.oAuthState;
    location.reload();
  };
}

function showReturnedCode() {
  const params = new URLSearchParams(document.location.search);
  fillDlWithEntries("authcode", params.entries());
}

function prepareRequestAccessToken(onAccessToken) {
  const params = new URLSearchParams(document.location.search);
  const requestParameters = {
    code: params.get("code"),
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
    //redirect_uri: redirectUri
  };
  fillDlWithEntries("request", Object.entries(requestParameters));

  // Request access token
  const requestButton = document.querySelector("#request button");
  requestButton.onclick = async () => {
    const response = await fetch(ENDPOINTS.accessToken, {
      method: "POST",
      body: new URLSearchParams(requestParameters)
    });
    const body = await response.text();
    const returnedParameters = new URLSearchParams(body);
    onAccessToken?.(Array.from(returnedParameters.entries()));
  };
  requestButton.disabled = false;
}

function showAccessToken(entries) {
  fillDlWithEntries("accesstoken", entries);
}

function prepareResourceAccess(token, onResponse) {
  const accessButton = document.querySelector("#accesstoken button");
  accessButton.onclick = async () => {
    const response = await fetch(ENDPOINTS.user, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    const body = await response.text();
    onResponse?.(body);
  };
  accessButton.disabled = false;
}

function showResponse(response) {
  document.querySelector("#resource pre").textContent = response;
}

// Function to fill out the document

function fillDlWithEntries(id, entries) {
  const dl = document.querySelector(`#${id} dl`);
  const children = [];

  for (const [key, value] of entries) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = value;

    children.push(dt, dd);
  }
  dl.replaceChildren(...children);
}

// Function to highlight the current step of the flow

function activate(ids) {
  document.querySelectorAll("section").forEach(e => {
    if (ids.includes(e.id)) {
      e.className = "active";
    } else {
      e.className = "";
    }
  });
  if (ids[0] !== "login") {
    window.location.hash = ids[0];
  }
}
