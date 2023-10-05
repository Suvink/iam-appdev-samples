const url = require("url");
const { AsgardeoExpressClient } = require("@asgardeo/auth-express");
const cookieParser = require("cookie-parser");
const express = require("express");
const config = require("./config.json");
const axios = require('axios');

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");

app.use("/", express.static("static"));
app.use("/home", express.static("static"));

const backendApiUrl = process.env.BACKEND_API_URL || "http://localhost:5000";

AsgardeoExpressClient.getInstance(config);

const onSignIn = (res) => {
  res.redirect("/home");
}

const onSignOut = (res) => {
  res.redirect("/");
}

const onError = (res, error) => {
  res.redirect(
    url.format({
      pathname: "/",
      query: {
        message: error && error.message
      }
    })
  );
}

app.use(AsgardeoExpressClient.asgardeoExpressAuth(onSignIn, onSignOut, onError));


const dataTemplate = {
  authenticateResponse: null,
  error: false,
  errorMessage: "",
  idToken: null,
  isAuthenticated: true,
  isConfigPresent: Boolean(config && config.clientID && config.clientSecret)
};

app.get("/", async (req, res) => {
  let data = { ...dataTemplate };
  data.error = req.query.message ? true : false;
  data.errorMessage =
    req.query.message ||
    "Something went wrong during the authentication process.";
  res.render("landingPage", data);
});

const authCallback = (res, error) => {
  res.redirect(
    url.format({
      pathname: "/",
      query: {
        message: error
      }
    })
  );

  return true;
};

const isAuthenticated = AsgardeoExpressClient.protectRoute(authCallback);

app.get("/home", isAuthenticated, async (req, res) => {
  const data = { ...dataTemplate, backendApiUrl: process.env.BACKEND_API_URL || "http://localhost:5000" };

  try {
    data.idToken = data.isAuthenticated
      ? await req.asgardeoAuth.getIDToken(req.cookies.ASGARDEO_SESSION_ID)
      : null;

    data.authenticateResponse = data.isAuthenticated
      ? await req.asgardeoAuth.getBasicUserInfo(req.cookies.ASGARDEO_SESSION_ID)
      : {};

    data.error = req.query.error === "true";

    res.render("home", data);
  } catch (error) {
    res.render("home", { ...data, error: true });
  }
});

app.get("/products", isAuthenticated, async (req, res) => {
  const data = { ...dataTemplate };
  const accessToken = data.isAuthenticated
      ? await req.asgardeoAuth.getAccessToken(req.cookies.ASGARDEO_SESSION_ID)
      : null;
      try {
        const response = await axios.get(`${backendApiUrl}/products`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-access-token': accessToken
          }
        });
        res.send(response.data);
      } catch (error) {
        console.log(error);
        res.send(error);
      }
});

app.post("/products", isAuthenticated, async (req, res) => {
  const data = { ...dataTemplate };
  const accessToken = data.isAuthenticated
      ? await req.asgardeoAuth.getAccessToken(req.cookies.ASGARDEO_SESSION_ID)
      : null;
  try {
    const response = await axios.post(`${backendApiUrl}/products`, req.body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-access-token': accessToken
      }
    });
    res.send(response.data);
  } catch (error) {
    console.log(error);
  }
});


app.listen(PORT, () => {
  console.log(`Server Started at PORT ${PORT}`);
});