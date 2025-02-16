package main

import (
	"log"
	"net/http"
	"os"

	"dbviewer-saas/config"
	"dbviewer-saas/pkg/database"
	"dbviewer-saas/pkg/handlers"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Initialize system resources
	resources := config.NewSystemResources()

	// Initialize router with CORS middleware
	r := mux.NewRouter()

	// Enable CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Set CORS headers
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Max-Age", "3600")

			// Handle preflight requests
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			// Call the next handler
			next.ServeHTTP(w, r)
		})
	}

	// Apply CORS middleware
	r.Use(corsMiddleware)

	// Initialize database manager
	dbManager, err := database.NewDatabaseManager("", resources)
	if err != nil {
		log.Fatalf("Failed to initialize database manager: %v", err)
	}
	defer dbManager.Close()

	// Initialize handlers
	dbHandler := handlers.NewDatabaseHandler(dbManager)

	// Register routes
	registerRoutes(r, dbHandler)

	// Start server
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func registerRoutes(r *mux.Router, h *handlers.DatabaseHandler) {
	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("GET", "OPTIONS")

	// API routes with versioning
	api := r.PathPrefix("/api").Subrouter()

	// Database connection endpoints
	api.HandleFunc("/connect", h.HandleConnect).Methods("POST", "OPTIONS")
	api.HandleFunc("/connect/direct", h.HandleDirectConnect).Methods("POST", "OPTIONS")

	// Table operations
	api.HandleFunc("/tables", h.HandleListTables).Methods("GET", "OPTIONS")
	api.HandleFunc("/tables/{table}/schema", h.HandleTableSchema).Methods("GET", "OPTIONS")
	api.HandleFunc("/tables/{table}", h.HandleTableData).Methods("GET", "OPTIONS")
}
