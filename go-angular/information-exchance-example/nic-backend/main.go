package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type Data struct {
	Prop  string `json:"prop"`
	Value string `json:"value"`
}

var storage []Data

func AddDataHandler(w http.ResponseWriter, r *http.Request) {
	var newData Data
	err := json.NewDecoder(r.Body).Decode(&newData)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	storage = append(storage, newData)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newData)

}

func ViewDataHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ViewDataHandler")
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

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/data", AddDataHandler).Methods("POST")
	router.HandleFunc("/data", ViewDataHandler).Methods("GET")

	log.Fatal(http.ListenAndServe(":8000", router))
}
