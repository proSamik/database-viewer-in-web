package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"dbviewer-saas/config"

	"github.com/go-redis/redis/v8"
	"github.com/lib/pq"
)

// ConnectionConfig represents database connection parameters for ngrok connections
type ConnectionConfig struct {
	URL      string `json:"url"`
	Username string `json:"username"`
	Password string `json:"password"`
	Database string `json:"database"`
}

// DirectConnectionConfig represents direct database connection parameters
type DirectConnectionConfig struct {
	Host     string `json:"host"`
	Port     string `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	DBName   string `json:"dbname"`
	SSLMode  string `json:"sslmode"`
}

// DatabaseManager handles all database operations
type DatabaseManager struct {
	pool      *sql.DB
	cache     *redis.Client
	resources *config.SystemResources
	currentDB *sql.DB
}

// NewDatabaseManager creates a new database manager instance
func NewDatabaseManager(connStr string, resources *config.SystemResources) (*DatabaseManager, error) {
	// Initialize connection pool based on system resources
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Configure pool based on CPU cores
	db.SetMaxOpenConns(resources.MaxConnections)
	db.SetMaxIdleConns(resources.MaxIdleConnections)
	db.SetConnMaxLifetime(15 * time.Minute)

	// Initialize Redis cache
	rdb := redis.NewClient(&redis.Options{
		Addr:     resources.RedisURL,
		Password: resources.RedisPassword,
		DB:       0,
		PoolSize: resources.MaxConnections,
	})

	return &DatabaseManager{
		pool:      db,
		cache:     rdb,
		resources: resources,
	}, nil
}

// Close closes all connections
func (dm *DatabaseManager) Close() error {
	if err := dm.pool.Close(); err != nil {
		return err
	}
	return dm.cache.Close()
}

// Connect establishes a connection to the specified database
func (dm *DatabaseManager) Connect(connConfig ConnectionConfig) error {
	// Build connection string using localhost since ngrok is forwarding to it
	connStr := fmt.Sprintf(
		"user=%s password=%s host=localhost dbname=%s sslmode=disable",
		connConfig.Username,
		connConfig.Password,
		connConfig.Database,
	)

	// Log connection details (without password)
	log.Printf("Connection attempt details:")
	log.Printf("- Database Name: %s", connConfig.Database)
	log.Printf("- Username: %s", connConfig.Username)
	log.Printf("- Ngrok URL: %s", connConfig.URL)

	// Try to connect
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("Failed to open database: %v", err)
		return fmt.Errorf("failed to open database: %v", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(dm.resources.MaxConnections)
	db.SetMaxIdleConns(dm.resources.MaxIdleConnections)
	db.SetConnMaxLifetime(15 * time.Minute)

	// Test the connection with timeout context
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Verify connection and get current database name
	var dbName string
	err = db.QueryRowContext(ctx, "SELECT current_database()").Scan(&dbName)
	if err != nil {
		db.Close()
		log.Printf("Failed to verify database connection: %v", err)
		return fmt.Errorf("failed to verify database connection: %v", err)
	}

	// Close existing connection if any
	if dm.currentDB != nil {
		if err := dm.currentDB.Close(); err != nil {
			log.Printf("Warning: failed to close previous connection: %v", err)
		}
		dm.currentDB = nil
	}

	// Store the new connection
	dm.currentDB = db
	log.Printf("Successfully connected to database:")
	log.Printf("- Confirmed Database Name: %s", dbName)
	log.Printf("- Requested Database Name: %s", connConfig.Database)

	// Verify if connected to the requested database
	if dbName != connConfig.Database {
		log.Printf("WARNING: Connected to %s but requested database was %s", dbName, connConfig.Database)
	}

	return nil
}

// ListTables returns all tables in the current database
func (dm *DatabaseManager) ListTables() ([]string, error) {
	if dm.currentDB == nil {
		return nil, fmt.Errorf("no database connection")
	}

	query := `
		SELECT table_name 
		FROM information_schema.tables 
		WHERE table_schema = 'public' 
		AND table_type = 'BASE TABLE'
		ORDER BY table_name;
	`

	rows, err := dm.currentDB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query tables: %v", err)
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, fmt.Errorf("failed to scan table name: %v", err)
		}
		tables = append(tables, tableName)
	}

	return tables, nil
}

// GetTableColumns returns the column information for a given table
func (dm *DatabaseManager) GetTableColumns(tableName string) ([]map[string]interface{}, error) {
	if dm.currentDB == nil {
		return nil, fmt.Errorf("no database connection")
	}

	columnsQuery := `
		SELECT column_name, data_type
		FROM information_schema.columns
		WHERE table_schema = 'public'
		AND table_name = $1
		ORDER BY ordinal_position;
	`

	columnRows, err := dm.currentDB.Query(columnsQuery, tableName)
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %v", err)
	}
	defer columnRows.Close()

	var columns []map[string]interface{}
	for columnRows.Next() {
		var columnName, dataType string
		if err := columnRows.Scan(&columnName, &dataType); err != nil {
			return nil, fmt.Errorf("failed to scan column: %v", err)
		}

		column := map[string]interface{}{
			"field":      columnName,
			"headerName": strings.Title(strings.Replace(columnName, "_", " ", -1)),
			"width":      150,
			"type":       getColumnType(dataType),
		}
		columns = append(columns, column)
	}

	return columns, nil
}

// GetTableData returns the data for a given table
func (dm *DatabaseManager) GetTableData(tableName string) ([]map[string]interface{}, error) {
	if dm.currentDB == nil {
		return nil, fmt.Errorf("no database connection")
	}

	dataQuery := fmt.Sprintf("SELECT * FROM %s LIMIT 100", pq.QuoteIdentifier(tableName))
	dataRows, err := dm.currentDB.Query(dataQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to get data: %v", err)
	}
	defer dataRows.Close()

	columnNames, err := dataRows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get column names: %v", err)
	}

	var rows []map[string]interface{}
	for dataRows.Next() {
		values := make([]interface{}, len(columnNames))
		valuePtrs := make([]interface{}, len(columnNames))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := dataRows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		row := make(map[string]interface{})
		for i, name := range columnNames {
			if values[i] == nil {
				row[name] = nil
			} else {
				switch v := values[i].(type) {
				case []byte:
					row[name] = string(v)
				default:
					row[name] = v
				}
			}
		}
		if _, hasID := row["id"]; !hasID {
			row["id"] = len(rows)
		}
		rows = append(rows, row)
	}

	return rows, nil
}

// Helper function to map PostgreSQL types to DataGrid types
func getColumnType(pgType string) string {
	switch strings.ToLower(pgType) {
	case "integer", "bigint", "smallint":
		return "number"
	case "boolean":
		return "boolean"
	case "timestamp", "timestamp without time zone", "timestamp with time zone", "date":
		return "dateTime"
	default:
		return "string"
	}
}

// GetTableCount returns the total number of rows in a table
func (dm *DatabaseManager) GetTableCount(tableName string) (int64, error) {
	// Check if we have an active connection
	if dm.currentDB == nil {
		return 0, fmt.Errorf("no active database connection")
	}

	var count int64
	// Use standard SQL query to count all rows in the table
	query := fmt.Sprintf("SELECT COUNT(*) FROM %s", pq.QuoteIdentifier(tableName))
	err := dm.currentDB.QueryRow(query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get table count: %v", err)
	}

	return count, nil
}

// TableSchema represents the structure of a database table
type TableSchema struct {
	Columns []ColumnSchema `json:"columns"`
}

type ColumnSchema struct {
	Name       string `json:"name"`
	DataType   string `json:"dataType"`
	IsNullable bool   `json:"isNullable"`
	IsPrimary  bool   `json:"isPrimary"`
}

// GetTableSchema returns the schema for a given table
func (dm *DatabaseManager) GetTableSchema(tableName string) (*TableSchema, error) {
	if dm.currentDB == nil {
		return nil, fmt.Errorf("no database connection")
	}

	query := `
		SELECT 
			c.column_name,
			c.data_type,
			c.is_nullable = 'YES' as is_nullable,
			CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary
		FROM information_schema.columns c
		LEFT JOIN (
			SELECT kcu.column_name
			FROM information_schema.table_constraints tc
			JOIN information_schema.key_column_usage kcu 
				ON tc.constraint_name = kcu.constraint_name
			WHERE tc.table_name = $1 
				AND tc.constraint_type = 'PRIMARY KEY'
		) pk ON c.column_name = pk.column_name
		WHERE c.table_name = $1
		ORDER BY c.ordinal_position;
	`

	rows, err := dm.currentDB.Query(query, tableName)
	if err != nil {
		return nil, fmt.Errorf("failed to get schema: %v", err)
	}
	defer rows.Close()

	schema := &TableSchema{
		Columns: make([]ColumnSchema, 0),
	}

	for rows.Next() {
		var col ColumnSchema
		if err := rows.Scan(&col.Name, &col.DataType, &col.IsNullable, &col.IsPrimary); err != nil {
			return nil, fmt.Errorf("failed to scan column: %v", err)
		}
		schema.Columns = append(schema.Columns, col)
	}

	return schema, nil
}

// GetTableDataPaginated returns paginated data with proper type conversions
func (dm *DatabaseManager) GetTableDataPaginated(tableName string, page, pageSize int) ([]map[string]interface{}, error) {
	schema, err := dm.GetTableSchema(tableName)
	if err != nil {
		return nil, fmt.Errorf("failed to get schema: %v", err)
	}

	offset := page * pageSize
	query := fmt.Sprintf("SELECT * FROM %s LIMIT %d OFFSET %d",
		pq.QuoteIdentifier(tableName),
		pageSize,
		offset,
	)

	rows, err := dm.currentDB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get data: %v", err)
	}
	defer rows.Close()

	// Create a map of column name to its schema
	columnSchemas := make(map[string]ColumnSchema)
	for _, col := range schema.Columns {
		columnSchemas[col.Name] = col
	}

	var results []map[string]interface{}
	columns, _ := rows.Columns()

	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range columns {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		row := make(map[string]interface{})

		// Convert values based on schema
		for i, col := range columns {
			val := values[i]
			colSchema := columnSchemas[col]

			if val == nil {
				if !colSchema.IsNullable {
					// Handle non-nullable fields with default values
					row[col] = getDefaultValue(colSchema.DataType)
				} else {
					row[col] = nil
				}
				continue
			}

			// Convert value based on data type
			convertedVal, err := convertValue(val, colSchema.DataType)
			if err != nil {
				return nil, fmt.Errorf("failed to convert value: %v", err)
			}
			row[col] = convertedVal
		}

		// Generate ID for the row if no primary key
		if _, hasID := row["id"]; !hasID {
			hasPrimary := false
			for _, col := range schema.Columns {
				if col.IsPrimary {
					hasPrimary = true
					break
				}
			}
			if !hasPrimary {
				row["id"] = len(results)
			}
		}

		results = append(results, row)
	}

	return results, nil
}

// Helper functions for value conversion
func convertValue(val interface{}, dataType string) (interface{}, error) {
	switch v := val.(type) {
	case []byte:
		return convertBytes(v, dataType)
	default:
		return v, nil
	}
}

func convertBytes(b []byte, dataType string) (interface{}, error) {
	switch strings.ToLower(dataType) {
	case "timestamp", "timestamp without time zone", "timestamp with time zone", "date":
		return string(b), nil // Return ISO string for dates
	case "numeric", "decimal":
		return strconv.ParseFloat(string(b), 64)
	case "integer", "bigint", "smallint":
		return strconv.Atoi(string(b))
	default:
		return string(b), nil
	}
}

func getDefaultValue(dataType string) interface{} {
	switch strings.ToLower(dataType) {
	case "integer", "bigint", "smallint":
		return 0
	case "numeric", "decimal":
		return 0.0
	case "boolean":
		return false
	default:
		return ""
	}
}

// ConnectDirect establishes a direct connection to the specified database
func (dm *DatabaseManager) ConnectDirect(config DirectConnectionConfig) error {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host,
		config.Port,
		config.User,
		config.Password,
		config.DBName,
		config.SSLMode,
	)

	// Try to connect
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("Failed to open database: %v", err)
		return fmt.Errorf("failed to open database: %v", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(dm.resources.MaxConnections)
	db.SetMaxIdleConns(dm.resources.MaxIdleConnections)
	db.SetConnMaxLifetime(15 * time.Minute)

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return fmt.Errorf("failed to verify database connection: %v", err)
	}

	// Close existing connection if any
	if dm.currentDB != nil {
		if err := dm.currentDB.Close(); err != nil {
			log.Printf("Warning: failed to close previous connection: %v", err)
		}
	}

	dm.currentDB = db
	return nil
}
