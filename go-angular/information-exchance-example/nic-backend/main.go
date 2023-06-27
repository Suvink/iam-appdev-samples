package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
)

type Data struct {
	Prop  string `json:"prop"`
	Value string `json:"value"`
}
type AuthorizationURLParams struct {
	org               string
	clientID          string
	SignInRedirectURL string
	EnablePKCE        bool
	ResponseMode      string
	Scope             string
	AdditionalParams  map[string]interface{}
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	// Add more fields as needed
}

var jwksEndpoint string = "https://gateway.e1-us-east-azure.choreoapis.dev/.wellknown/jwks"
var endpointBaseURL string = "https://62b887b7-3196-4e81-b161-125bafac2fc7-prod.e1-us-east-azure.choreoapis.dev/uixy/nic-api/nic-service-be2/1.0.0"
var tokenEndpoint string = "https://api.asgardeo.io/t/iamapptesting/oauth2/token"
var clientAppURL string = "http://localhost:4200"

var storage []Data

type JWKS struct {
	Keys []JSONWebKey `json:"keys"`
}

type JSONWebKey struct {
	Kty string `json:"kty"`
	N   string `json:"n"`
	E   string `json:"e"`
	Kid string `json:"kid"`
	Use string `json:"use"`
}

func AddDataHandler(w http.ResponseWriter, r *http.Request) {

	//debug
	fmt.Println("AddDataHandler endpoint hit")
	fmt.Println(r.Header.Get("x-jwt-assertion"))

	if validate(r.Header.Get("x-jwt-assertion")) {
		var newData Data
		err := json.NewDecoder(r.Body).Decode(&newData)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		storage = append(storage, newData)

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newData)
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		response := struct {
			Message string `json:"message"`
		}{
			Message: "Unauthorized access token",
		}
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			json.NewEncoder(w).Encode(jsonResponse)
		}
		return
	}

}

func ViewDataHandler(w http.ResponseWriter, r *http.Request) {

	//debug
	fmt.Println("ViewDataHandler endpoint hit")
	fmt.Println(r.Header.Get("x-jwt-assertion"))

	prop := r.URL.Query().Get("prop")
	fmt.Println(prop)
	if prop != "" {
		for _, data := range storage {
			if data.Prop == prop {
				json.NewEncoder(w).Encode(data)
				return
			}
		}

	} else {
		json.NewEncoder(w).Encode(storage)
	}

}

func AuthorizeHandler(w http.ResponseWriter, r *http.Request) {

	//debug
	fmt.Println("AuthorizeHandler endpoint hit")

	var authURL = getAuthorizationURL()
	http.Redirect(w, r, authURL, http.StatusFound)
	return

}

func validate(jwtString string) bool {

	ctx, cancel := context.WithCancel(context.Background())

	options := keyfunc.Options{
		Ctx: ctx,
		RefreshErrorHandler: func(err error) {
			log.Printf("There was an error with the jwt.Keyfunc\nError: %s", err.Error())
		},
		RefreshInterval:   time.Hour,
		RefreshRateLimit:  time.Minute * 5,
		RefreshTimeout:    time.Second * 10,
		RefreshUnknownKID: true,
	}

	// Create the JWKS from the resource at the given URL.
	jwks, err := keyfunc.Get(jwksEndpoint, options)

	if err != nil {
		log.Fatalf("Failed to create JWKS from resource at the given URL.\nError: %s", err.Error())
	}

	// Parse the JWT.
	jwt.DecodePaddingAllowed = true
	token, err := jwt.Parse(jwtString, jwks.Keyfunc)
	if err != nil {
		log.Fatalf("Failed to parse the JWT.\nError: %s", err.Error())
	}

	// Check if the token is valid.
	if !token.Valid {
		log.Println("The token is not valid.")
		cancel()
		jwks.EndBackground()
		return false
	}

	log.Println("The token is valid.")
	cancel()
	jwks.EndBackground()
	return true
}

func getAuthorizationURL() string {

	var authConfig = AuthorizationURLParams{
		org:               "iamapptesting",
		clientID:          "6D98HOjAtBY5cIxbEosJJ8XX_Hsa",
		SignInRedirectURL: endpointBaseURL + "/processToken",
		EnablePKCE:        true,
		ResponseMode:      "code",
		Scope:             "openid email groups profile urn:iamapptesting:nicapinicservicebe2:read_data",
		AdditionalParams:  nil,
	}

	return `https://api.asgardeo.io/t/` +
		authConfig.org +
		`/oauth2/authorize?client_id=` +
		authConfig.clientID +
		`&redirect_uri=` + url.QueryEscape(authConfig.SignInRedirectURL) +
		`&response_type=` + authConfig.ResponseMode +
		`&scope=` + url.QueryEscape(authConfig.Scope)
}

func ProcessToken(w http.ResponseWriter, r *http.Request) {
	oidc_auth_code := r.URL.Query().Get("code")
	fmt.Println(oidc_auth_code)

	if oidc_auth_code != "" {

		// Create form data
		formData := url.Values{
			"code":         {oidc_auth_code},
			"grant_type":   {"authorization_code"},
			"client_id":    {"6D98HOjAtBY5cIxbEosJJ8XX_Hsa"},
			"redirect_uri": {endpointBaseURL + "/processToken"},
		}

		resp, err := http.Post(tokenEndpoint,
			"application/x-www-form-urlencoded",
			strings.NewReader(formData.Encode()))

		fmt.Println(resp)

		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		// Parse JSON response
		var tokenResponse TokenResponse
		err = json.Unmarshal(body, &tokenResponse)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		cookie := http.Cookie{
			Name:     "nic-api-nic-service-auth",
			Value:    tokenResponse.AccessToken,
			Path:     "/",
			HttpOnly: false,
			SameSite: http.SameSiteNoneMode,
			Domain:   "http://localhost:4200",
			MaxAge:   90000,
			Secure:   true,
		}
		http.SetCookie(w, &cookie)

		http.Redirect(w, r, clientAppURL+"?consent_status=success", http.StatusFound)

	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error reading request body",
				http.StatusBadRequest)
			return
		}

		defer r.Body.Close()

		fmt.Println(string(body))
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Token processed successfully"))
	}

}

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/data", AddDataHandler).Methods("POST")
	router.HandleFunc("/data", ViewDataHandler).Methods("GET")
	router.HandleFunc("/authorize", AuthorizeHandler).Methods("GET")
	router.HandleFunc("/processToken", ProcessToken).Methods("GET")

	log.Fatal(http.ListenAndServe(":8000", router))
}
