package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/MicahParks/keyfunc"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
)

type Data struct {
	Prop  string `json:"prop"`
	Value string `json:"value"`
}

var jwksEndpoint string = "https://gateway.e1-us-east-azure.choreoapis.dev/.wellknown/jwks"

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

	if validate(r.Header.Get("x-jwt-assertion")) {
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

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/data", AddDataHandler).Methods("POST")
	router.HandleFunc("/data", ViewDataHandler).Methods("GET")

	log.Fatal(http.ListenAndServe(":8000", router))
}
