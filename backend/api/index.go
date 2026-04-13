package handler

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/routes"
)

var (
	app  *gin.Engine
	once sync.Once
)

// Handler is the entry point for Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	// Ensure initialization happens once
	once.Do(func() {
		// Initialize database connection
		config.InitDatabase()
		
		// Setup Gin router
		gin.SetMode(gin.ReleaseMode)
		app = routes.SetupRouter()
	})

	// Serve the request using Gin
	if config.DB == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "Database connection failed. Check DB_DSN environment variable."}`))
		return
	}

	app.ServeHTTP(w, r)
}
