# Database Viewer SaaS

A modern web-based PostgreSQL database browser that allows you to connect to and browse any PostgreSQL database, either directly or through ngrok TCP tunnels.

![Database Viewer SaaS](/placeholder-for-screenshot.png)

## Features

- Connect to PostgreSQL databases via multiple methods:
  - Direct connection with database URL
  - ngrok TCP tunnel for accessing localhost databases remotely
- Browse and explore database tables
- View, edit, and delete table data
- Examine table schema and column details
- Docker-ready deployment
- Modern, responsive user interface

## Project Architecture

The application consists of two main components:

1. **Backend Server (Go)**
   - RESTful API for database operations
   - PostgreSQL connection management
   - URL sanitization for ngrok connections
   - Table data retrieval and manipulation

2. **Frontend Client (Next.js)**
   - User-friendly web interface
   - Connection management UI
   - Table browser and data grid
   - Responsive design with Tailwind CSS

### System Design

```
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│               │           │               │           │               │
│  Next.js      │─────────▶│  Go Server    │─────────▶│  PostgreSQL   │
│  Client       │◀─────────│  API          │◀─────────│  Database     │
│               │           │               │           │               │
└───────────────┘           └───────────────┘           └───────────────┘
                                    │                           ▲
                                    │                           │
                                    ▼                           │
                             ┌───────────────┐                  │
                             │               │                  │
                             │  ngrok        │──────────────────┘
                             │  TCP Tunnel   │
                             │               │
                             └───────────────┘
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- ngrok account (for remote database access)
- PostgreSQL database (local or remote)

### Running with Docker Compose

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/database-viewer-saas.git
   cd database-viewer-saas
   ```

2. Configure environment variables:
   ```
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. Start the application with Docker Compose:
   ```
   docker-compose up -d
   ```

4. Access the application at http://localhost:3000

### Manual Installation

#### Server Setup

1. Navigate to the server directory:
   ```
   cd database-viewer-saas/server
   ```

2. Install dependencies:
   ```
   go mod download
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```

4. Start the server:
   ```
   go run main.go
   ```

#### Client Setup

1. Navigate to the client directory:
   ```
   cd database-viewer-saas/client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Access the application at http://localhost:3000

## Setting Up ngrok for PostgreSQL Access

ngrok allows you to expose your local PostgreSQL database to the internet securely. Here's how to set it up:

### Step 1: Install ngrok

#### macOS
```
brew install ngrok
```

#### Linux
```
sudo snap install ngrok
```

#### Windows
```
choco install ngrok
```

Or download directly from [ngrok.com](https://ngrok.com/download)

### Step 2: Sign up and Get Auth Token

1. Create a free account at [ngrok.com](https://ngrok.com)
2. Navigate to the [Auth page](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your auth token

### Step 3: Configure ngrok

```
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 4: Start a TCP Tunnel to PostgreSQL

```
ngrok tcp 5432
```

This will display output similar to:

```
Session Status                online
Account                       Your Account
Version                       3.3.1
Region                        United States (us)
Latency                       24ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    tcp://0.tcp.in.ngrok.io:12345 -> localhost:5432
```

### Step 5: Connect Using the Database Viewer SaaS

1. Open the Database Viewer SaaS application
2. Select "Connect via ngrok URL"
3. Enter the following details:
   - URL: The forwarding URL (e.g., `tcp://0.tcp.in.ngrok.io:12345`)
   - Username: Your PostgreSQL username
   - Password: Your PostgreSQL password
   - Database: Your database name
4. Click "Connect"

### Important ngrok Notes

- Free tier limits:
  - 1 online ngrok agent
  - 4 hours session length
  - 40 connections/minute
- The URL changes each time you restart ngrok
- For persistent URLs, consider a paid ngrok plan

## How It Works

### Connection Flow

1. **User Enters Connection Details**
   - Database URL/Host
   - Credentials
   - Database name

2. **Server Processes Connection Request**
   - Sanitizes URL (removes protocol prefixes)
   - Builds PostgreSQL connection string
   - Attempts connection with timeout handling

3. **Connection Established**
   - Server maintains connection pool
   - Connection parameters are logged
   - Success/failure response sent to client

### URL Sanitization Process

The server automatically handles different URL formats:

```go
// Example sanitizeHostURL function
func sanitizeHostURL(inputURL string) string {
    prefixes := []string{"http://", "https://", "tcp://", "postgres://", "postgresql://"}
    url := inputURL
    
    for _, prefix := range prefixes {
        if strings.HasPrefix(strings.ToLower(url), prefix) {
            url = strings.TrimPrefix(url, prefix)
            break
        }
    }
    
    return url
}
```

### Table Data Retrieval

1. Server queries PostgreSQL for table list
2. Client displays tables in sidebar
3. When a table is selected:
   - Schema is retrieved
   - Pagination parameters are set
   - Data query is executed with limits
   - Results are formatted and sent to client

## Troubleshooting

### Common Connection Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running locally
   - Check if firewall is blocking connections

2. **Authentication Failed**
   - Verify username and password
   - Check PostgreSQL authentication settings

3. **ngrok URL Not Working**
   - Confirm ngrok is still running
   - Check if the URL has changed (happens on restart)
   - Verify the TCP tunnel is pointing to port 5432

4. **Docker Network Issues**
   - Ensure containers can communicate
   - Check if PostgreSQL is accessible from the server container

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Go](https://golang.org/) - The programming language used for the backend
- [Next.js](https://nextjs.org/) - The React framework used for the frontend
- [ngrok](https://ngrok.com/) - For secure tunneling capabilities
- [PostgreSQL](https://www.postgresql.org/) - The database system supported 