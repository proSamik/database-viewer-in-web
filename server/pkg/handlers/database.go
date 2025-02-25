package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"dbviewer-saas/pkg/database"

	"github.com/gorilla/mux"
)

type DatabaseHandler struct {
	dbManager *database.DatabaseManager
}

func NewDatabaseHandler(dbManager *database.DatabaseManager) *DatabaseHandler {
	return &DatabaseHandler{
		dbManager: dbManager,
	}
}

// HandleConnect handles database connection requests
func (h *DatabaseHandler) HandleConnect(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Parse the request body
	var connConfig database.ConnectionConfig
	if err := json.NewDecoder(r.Body).Decode(&connConfig); err != nil {
		log.Printf("Error parsing connection request: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if connConfig.URL == "" {
		log.Printf("Missing URL in connection request")
		http.Error(w, "Database URL is required", http.StatusBadRequest)
		return
	}

	if connConfig.Username == "" {
		log.Printf("Missing username in connection request")
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	if connConfig.Database == "" {
		log.Printf("Missing database name in connection request")
		http.Error(w, "Database name is required", http.StatusBadRequest)
		return
	}

	// Log connection attempt (without password)
	log.Printf("Connection attempt with URL: %s, Username: %s, Database: %s",
		connConfig.URL, connConfig.Username, connConfig.Database)

	// Try to connect
	if err := h.dbManager.Connect(connConfig); err != nil {
		log.Printf("Connection failed: %v", err)

		// Check error type to determine appropriate status code
		if strings.Contains(strings.ToLower(err.Error()), "authentication") ||
			strings.Contains(strings.ToLower(err.Error()), "password") {
			http.Error(w, fmt.Sprintf("Authentication failed: %v", err), http.StatusUnauthorized)
			return
		}

		if strings.Contains(strings.ToLower(err.Error()), "no such host") ||
			strings.Contains(strings.ToLower(err.Error()), "connection refused") {
			http.Error(w, fmt.Sprintf("Connection refused: %v", err), http.StatusBadGateway)
			return
		}

		// Default error response
		http.Error(w, fmt.Sprintf("Failed to connect: %v", err), http.StatusBadRequest)
		return
	}

	// Log successful connection
	log.Printf("Successfully connected to database %s via %s",
		connConfig.Database, connConfig.URL)

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "connected",
		"database": connConfig.Database,
		"host":     connConfig.URL,
	})
}

// HandleTableData handles table data requests
func (h *DatabaseHandler) HandleTableData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	tableName := vars["table"]
	if tableName == "" {
		http.Error(w, "Table name is required", http.StatusBadRequest)
		return
	}

	// Parse pagination
	page, pageSize := getPaginationParams(r)

	// Get total count
	totalCount, err := h.dbManager.GetTableCount(tableName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get data with schema-aware conversions
	rows, err := h.dbManager.GetTableDataPaginated(tableName, page, pageSize)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"rows":       rows,
		"totalCount": totalCount,
		"page":       page,
		"pageSize":   pageSize,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
	}
}

func getPaginationParams(r *http.Request) (page, pageSize int) {
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("pageSize")

	page = 0
	pageSize = 25

	if p, err := strconv.Atoi(pageStr); err == nil {
		page = p
	}
	if ps, err := strconv.Atoi(pageSizeStr); err == nil {
		pageSize = ps
	}

	return page, pageSize
}

// HandleListTables handles listing all tables in the database
func (h *DatabaseHandler) HandleListTables(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	tables, err := h.dbManager.ListTables()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to list tables: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string][]string{
		"tables": tables,
	})
}

// HandleTableSchema handles requests for table schema
func (h *DatabaseHandler) HandleTableSchema(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	vars := mux.Vars(r)
	tableName := vars["table"]
	if tableName == "" {
		http.Error(w, "Table name is required", http.StatusBadRequest)
		return
	}

	schema, err := h.dbManager.GetTableSchema(tableName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(schema); err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
	}
}

// HandleDirectConnect handles direct database URL connections
func (h *DatabaseHandler) HandleDirectConnect(w http.ResponseWriter, r *http.Request) {
	// Handle CORS preflight
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Parse request body
	var req struct {
		URL string `json:"url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate URL
	if req.URL == "" {
		http.Error(w, "Database URL is required", http.StatusBadRequest)
		return
	}

	// Parse the database URL
	dbURL, err := url.Parse(req.URL)
	if err != nil {
		http.Error(w, "Invalid database URL", http.StatusBadRequest)
		return
	}

	// Extract credentials from the URL
	username := ""
	password := ""
	if dbURL.User != nil {
		username = dbURL.User.Username()
		password, _ = dbURL.User.Password()
	}

	// Extract database name from path
	dbName := strings.TrimPrefix(dbURL.Path, "/")

	// Create connection config
	config := database.DirectConnectionConfig{
		Host:     dbURL.Hostname(),
		Port:     dbURL.Port(),
		User:     username,
		Password: password,
		DBName:   dbName,
		SSLMode:  "require",
	}

	// Attempt to connect
	if err := h.dbManager.ConnectDirect(config); err != nil {
		http.Error(w, fmt.Sprintf("Failed to connect to database: %v", err), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Successfully connected to database",
	})
}

// HandleCreateRow handles creating a new row in a table
func (h *DatabaseHandler) HandleCreateRow(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	tableName := vars["table"]
	if tableName == "" {
		http.Error(w, "Table name is required", http.StatusBadRequest)
		return
	}

	var rowData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&rowData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create the row
	if err := h.dbManager.CreateRow(tableName, rowData); err != nil {
		http.Error(w, fmt.Sprintf("Failed to create row: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Row created successfully",
	})
}

// HandleUpdateRow handles updating an existing row in a table
func (h *DatabaseHandler) HandleUpdateRow(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	tableName := vars["table"]
	id := vars["id"]

	if tableName == "" || id == "" {
		http.Error(w, "Table name and ID are required", http.StatusBadRequest)
		return
	}

	var rowData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&rowData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update the row
	if err := h.dbManager.UpdateRow(tableName, id, rowData); err != nil {
		http.Error(w, fmt.Sprintf("Failed to update row: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Row updated successfully",
	})
}

// HandleDeleteRow handles deleting a row from a table
func (h *DatabaseHandler) HandleDeleteRow(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	tableName := vars["table"]
	id := vars["id"]

	if tableName == "" || id == "" {
		http.Error(w, "Table name and ID are required", http.StatusBadRequest)
		return
	}

	// Delete the row
	if err := h.dbManager.DeleteRow(tableName, id); err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete row: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Row deleted successfully",
	})
}

// HandleUpdateCell handles updating a single cell in a table
func (h *DatabaseHandler) HandleUpdateCell(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	tableName := vars["table"]
	pkValue := vars["id"]
	columnName := vars["column"]

	log.Printf("Attempting to update cell - Table: %s, Column: %s, PK Value: %s", tableName, columnName, pkValue)

	if tableName == "" || pkValue == "" || columnName == "" {
		log.Printf("Error: Missing required parameters - Table: %s, Column: %s, PK Value: %s", tableName, columnName, pkValue)
		http.Error(w, "Table name, ID, and column name are required", http.StatusBadRequest)
		return
	}

	// Get the primary key column name
	schema, err := h.dbManager.GetTableSchema(tableName)
	if err != nil {
		log.Printf("Error getting table schema: %v", err)
		http.Error(w, fmt.Sprintf("Failed to get table schema: %v", err), http.StatusInternalServerError)
		return
	}

	// Find the primary key column
	var pkColumn string
	for _, col := range schema.Columns {
		if col.IsPrimary {
			pkColumn = col.Name
			break
		}
	}

	if pkColumn == "" {
		log.Printf("Error: No primary key found for table %s", tableName)
		http.Error(w, "No primary key found for table", http.StatusBadRequest)
		return
	}

	var cellData struct {
		Value interface{} `json:"value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&cellData); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("Updating cell - Table: %s, PK Column: %s, PK Value: %s, Column: %s, New Value: %v",
		tableName, pkColumn, pkValue, columnName, cellData.Value)

	// Update the cell using the primary key
	if err := h.dbManager.UpdateCell(tableName, pkColumn, pkValue, columnName, cellData.Value); err != nil {
		log.Printf("Error updating cell: %v", err)
		http.Error(w, fmt.Sprintf("Failed to update cell: %v", err), http.StatusInternalServerError)
		return
	}

	log.Printf("Successfully updated cell - Table: %s, PK Column: %s, PK Value: %s, Column: %s",
		tableName, pkColumn, pkValue, columnName)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Cell updated successfully",
	})
}
