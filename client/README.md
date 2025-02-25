# Database Viewer SaaS - Client

This is the frontend client for the Database Viewer SaaS application. It provides a user-friendly web interface for connecting to and browsing PostgreSQL databases.

## Features

- Connect to PostgreSQL databases through various methods:
  - Direct connection with connection string
  - ngrok URL connection
- Browse database tables
- View and edit table data with pagination
- Visualize table structure
- Modern, responsive UI built with Next.js and Tailwind CSS

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Material-UI components
- Axios for API communication

## Prerequisites

- Node.js 18.x or newer
- npm or yarn package manager
- Access to the Database Viewer SaaS server

## Installation

### Local Development

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd database-viewer-saas/client
   ```
3. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```
4. Set up environment variables by copying the example file:
   ```
   cp .env.example .env
   ```
5. Update the values in .env to match your environment
6. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```
7. Open your browser and navigate to `http://localhost:3000`

### Production Build

1. Build the application:
   ```
   npm run build
   # or
   yarn build
   ```
2. Start the production server:
   ```
   npm run start
   # or
   yarn start
   ```

### Docker Deployment

1. Build the Docker image:
   ```
   docker build -t dbviewer-client .
   ```
2. Run the container:
   ```
   docker run -p 3000:3000 --env-file .env dbviewer-client
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | URL of the backend API server | http://localhost:8080 |
| NEXT_PUBLIC_APP_TITLE | Application title | Database Viewer |

## Client-Server Communication

The client communicates with the server through a REST API. Here's how the communication flow works:

### Database Connection Flow

1. User enters database connection details in the UI form
2. Client validates input for required fields
3. Client sends a POST request to the server's connection endpoint
4. Server processes the connection and responds with success or error
5. Client displays connection status and updates UI accordingly

### API Integration

The client handles API requests using Axios. Here's a typical request flow:

```typescript
// Example API call to connect to a database via ngrok
const connectToDatabase = async (connectionDetails) => {
  try {
    const response = await axios.post('/api/connect', {
      url: connectionDetails.url,
      username: connectionDetails.username,
      password: connectionDetails.password,
      database: connectionDetails.database
    });
    
    // Handle successful connection
    if (response.status === 200) {
      setConnected(true);
      loadTables();
    }
  } catch (error) {
    // Handle connection error
    setError(error.response?.data || 'Connection failed');
  }
};
```

## Using ngrok with the Client

To connect to a PostgreSQL database through ngrok:

1. Ensure ngrok is running with a TCP tunnel to your PostgreSQL instance (see server README for setup)
2. In the connection form, select "Connect via ngrok URL"
3. Enter the forwarding URL provided by ngrok (e.g., `tcp://0.tcp.in.ngrok.io:12345`)
4. Enter your PostgreSQL credentials and database name
5. Click "Connect"

## UI Components

The client is built with the following key UI components:

- **Connection Form**: For entering database connection details
- **Table Browser**: For navigating available tables
- **Data Grid**: For viewing and editing table data
- **Schema Viewer**: For inspecting table structure

## Troubleshooting

### Common Issues

1. **Cannot connect to server**
   - Check if the server is running
   - Verify that NEXT_PUBLIC_API_URL is set correctly
   - Check for CORS issues in browser console

2. **UI not updating after connection**
   - Check console for errors
   - Verify that you're receiving a successful response from the server

3. **Cannot edit data**
   - Ensure you have proper permissions on the PostgreSQL database
   - Check if the table has a primary key defined

## Behind the Scenes

The client application is built with React and Next.js, providing a fast, server-rendered experience. Here's what happens behind the scenes:

1. Next.js handles routing and server-side rendering
2. React components manage UI state and rendering
3. Axios interceptors handle API requests, errors, and authentication
4. Context API manages global state for database connection and tables

The UI is designed to be responsive and user-friendly, with real-time validation and feedback.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
