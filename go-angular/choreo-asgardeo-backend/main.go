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

var jwksEndpoint = "https://gateway.e1-us-east-azure.choreoapis.dev/.wellknown/jwks"

type Person struct {
	Name    string `json: "name"`
	Role    string `json: "role"`
	Address string `json: "address"`
	Email   string `json: "email"`
}
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

var people = []Person{
	{Name: "John", Role: "customer", Address: "123 Main St", Email: "john@gmail.com"},
	{Name: "Jane", Role: "admin", Address: "123 Main St", Email: "jane@gmail.com"},
	{Name: "Bob", Role: "customer", Address: "123 Main St", Email: "bob@gmail.com"},
	{Name: "Mary", Role: "admin", Address: "123 Main St", Email: "mary@gmail.com"},
}

func AllPersons(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint hit: returnAllPersons")

	// Get the JWT from the request header
	jwtString := r.Header.Get("x-jwt-assertion")
	fmt.Println(jwtString)

	if validate(jwtString) {
		json.NewEncoder(w).Encode(people)
	} else {
		json.NewEncoder(w).Encode("Access token not valid")
	}
}

func AllCustomers(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint hit: returnAllCustomers")

	// Get the JWT from the request header
	jwtString := r.Header.Get("x-jwt-assertion")

	if validate(jwtString) {
		customers := []Person{}
		for _, person := range people {
			if person.Role == "customer" {
				customers = append(customers, person)
			}
		}
		json.NewEncoder(w).Encode(customers)
	} else {
		json.NewEncoder(w).Encode("Access token not valid")
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
	jwt.DecodePaddingAllowed = true
	// Parse the JWT.
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

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/people", AllPersons)
	router.HandleFunc("/customers", AllCustomers)
	log.Fatal(http.ListenAndServe(":10000", router))
}
