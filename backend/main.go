package main

import (
	"log"
	"os"

	"kbm-backend/config"
	"kbm-backend/routes"
)

func main() {
	// Initialize database
	config.InitDatabase()

	// Setup Router
	r := routes.SetupRouter()

	// Get port from env
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🏠 KBM - Kos Bu Mary Backend running on :%s\n", port)
	r.Run("0.0.0.0:" + port)
}
