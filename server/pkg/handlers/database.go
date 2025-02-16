package handlers

import (
	"encoding/json"
	"fmt"
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

	var connConfig database.ConnectionConfig
	if err := json.NewDecoder(r.Body).Decode(&connConfig); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Try to connect
	if err := h.dbManager.Connect(connConfig); err != nil {
		http.Error(w, fmt.Sprintf("Failed to connect: %v", err), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "connected",
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
	id := vars["id"]
	columnName := vars["column"]

	if tableName == "" || id == "" || columnName == "" {
		http.Error(w, "Table name, ID, and column name are required", http.StatusBadRequest)
		return
	}

	var cellData struct {
		Value interface{} `json:"value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&cellData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update the cell
	if err := h.dbManager.UpdateCell(tableName, id, columnName, cellData.Value); err != nil {
		http.Error(w, fmt.Sprintf("Failed to update cell: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Cell updated successfully",
	})
}
