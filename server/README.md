# Database Viewer SaaS - Server

This is the backend server for the Database Viewer SaaS application. It provides a REST API for connecting to PostgreSQL databases and browsing their contents.

## Features

- Connect to PostgreSQL databases via direct connection
- Connect to PostgreSQL databases via ngrok tunnels
- Browse tables in connected databases
- View and edit table contents
- Query table data with pagination
- Table schema inspection

## Technology Stack

- Go (Golang)
- gorilla/mux for routing
- PostgreSQL client (lib/pq)
- Docker support

## Prerequisites

- Go 1.18 or higher
- PostgreSQL (for local testing)
- Docker (optional, for containerized deployment)

## Installation

### Local Development

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd database-viewer-saas/server
   ```
3. Install dependencies:
   ```
   go mod download
   ```
4. Set up environment variables by copying the example file:
   ```
   cp .env.example .env
   ```
5. Update the values in .env to match your environment
6. Run the server:
   ```
   go run main.go
   ```

### Docker Deployment

1. Build the Docker image:
   ```
   docker build -t dbviewer-server .
   ```
2. Run the container:
   ```
   docker run -p 8080:8080 --env-file .env dbviewer-server
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to run the server on | 8080 |
| ALLOW_ORIGINS | CORS allowed origins | * |
| MAX_CONNECTIONS | Maximum number of DB connections | 10 |
| MAX_IDLE_CONNECTIONS | Maximum number of idle DB connections | 5 |

## API Endpoints

### Database Connection

- `POST /api/connect` - Connect to a database via ngrok URL
- `POST /api/connect-direct` - Connect to a database via direct connection string

### Database Operations

- `GET /api/tables` - List all tables in the connected database
- `GET /api/tables/{table}` - Get table schema
- `GET /api/data/{table}` - Get table data with pagination
- `POST /api/data/{table}` - Create a new row
- `PUT /api/data/{table}/{id}` - Update a row
- `DELETE /api/data/{table}/{id}` - Delete a row
- `PATCH /api/data/{table}/{id}/{column}` - Update a specific cell

## PostgreSQL Connection with ngrok

The server handles PostgreSQL connections through two main methods:

### 1. Direct Connection

Uses the standard PostgreSQL connection string:
```host={hostname} port={port} user={username} password={password} dbname={database} sslmode={sslmode}
```

### 2. ngrok Connection

Handles connections via ngrok TCP tunnels, which requires special URL parsing to handle the ngrok URL format.

The connection flow works as follows:

1. Client sends connection request with ngrok URL, username, password, and database name
2. Server sanitizes the ngrok URL by removing protocol prefixes (`tcp://`, `http://`, etc.)
3. Server constructs a PostgreSQL connection string with the sanitized URL
4. Server attempts to connect with timeout handling and validation
5. Connection status is returned to the client

### URL Sanitization

The server implements robust URL sanitization to handle various URL formats:

```go
func sanitizeHostURL(inputURL string) string {
    // Remove common protocol prefixes
    prefixes := []string{"http://", "https://", "tcp://", "postgres://", "postgresql://"}
    url := inputURL
    
    for _, prefix := range prefixes {
        if strings.HasPrefix(strings.ToLower(url), prefix) {
            url = strings.TrimPrefix(url, prefix)
            break // Only remove one prefix
        }
    }
    
    return url
}
```

## Setting Up ngrok for PostgreSQL

To connect to a PostgreSQL database via ngrok:

1. Install ngrok:
   ```
   # On macOS
   brew install ngrok
   
   # On Linux
   sudo snap install ngrok
   
   # On Windows
   choco install ngrok
   ```

2. Set up ngrok authentication:
   ```
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

3. Start a TCP tunnel on PostgreSQL's default port:
   ```
   ngrok tcp 5432
   ```

4. You'll receive a forwarding URL, like:
   ```
   Forwarding tcp://0.tcp.in.ngrok.io:12345 -> localhost:5432
   ```

5. Use this URL in the application's connection form:
   - URL: `tcp://0.tcp.in.ngrok.io:12345`
   - Username: Your PostgreSQL username
   - Password: Your PostgreSQL password
   - Database: Your database name

## Troubleshooting

### Common Connection Issues

1. **Connection Refused**
   - Check if PostgreSQL is running on your local machine
   - Verify that PostgreSQL is configured to listen on localhost:5432

2. **Authentication Failed**
   - Verify username and password
   - Check PostgreSQL's pg_hba.conf for authentication settings

3. **No Such Host**
   - Check if the ngrok tunnel is still running
   - Try restarting the ngrok tunnel

4. **Protocol Prefix Issues**
   - The application automatically handles protocol prefixes, but ensure the ngrok URL format is correct

### Logging

The server implements detailed logging for connection attempts. Check the server logs for information about:
- Connection attempts
- URL sanitization
- Authentication failures
- Successful connections

## License

This project is licensed under the MIT License - see the LICENSE file for details. 