package handler

import (
	"net/http"
	"sync"
	_ "time/tzdata"

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
	// 1. Manual CORS for all responses (including errors)
	origin := r.Header.Get("Origin")
	if origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept, X-Requested-With, X-Vercel-Protection")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	}

	// 2. Handle OPTIONS preflight early
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

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
