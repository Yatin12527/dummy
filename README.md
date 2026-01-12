# MERN Stack Application

A full-stack application built with MongoDB, Express, React, and Node.js.

## Project Structure

```
mern-project/
├── backend/          # Express server
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── server.js    # Server entry point
├── frontend/        # React application
│   ├── public/      # Static files
│   └── src/         # React components
└── package.json     # Root package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (connection string configured)

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install all dependencies (backend + frontend):
```bash
npm run install-all
```

Or install separately:
```bash
npm run install-server
npm run install-client
```

### Running the Application

1. Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run separately:

2. Start the backend server:
```bash
npm run server
```

3. Start the frontend (in a new terminal):
```bash
npm run client
```

### Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Test Route: http://localhost:5000/api/test

## Environment Variables

Backend environment variables are configured in `backend/.env`:
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode

## Technologies Used

- **MongoDB**: Database
- **Express**: Backend framework
- **React**: Frontend framework
- **Node.js**: Runtime environment
- **Mongoose**: MongoDB object modeling
- **Axios**: HTTP client
- **Concurrently**: Run multiple commands

