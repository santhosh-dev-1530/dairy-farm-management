# Dairy Farm Management System

A comprehensive dairy farm management system built with React Native for mobile and Node.js for the backend.

## Project Structure

```
dairy-farm/
├── mobile/          # React Native mobile application
├── backend/         # Node.js backend API
├── package.json     # Root package.json with workspaces
└── README.md        # This file
```

## Features

### Mobile App (React Native)

- Cow management and tracking
- Milk production monitoring
- Health records
- Feeding schedules
- Offline capability
- Real-time notifications

### Backend API (Node.js)

- RESTful API endpoints
- Database management
- Authentication & authorization
- File upload handling
- Real-time updates via WebSocket

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd dairy-farm
```

2. Install dependencies:

```bash
npm run install:all
```

## Development

### Start both backend and mobile development servers:

```bash
npm run dev
```

### Start only backend:

```bash
npm run dev:backend
```

### Start only mobile:

```bash
npm run dev:mobile
```

## Building

### Build both applications:

```bash
npm run build
```

### Build only backend:

```bash
npm run build:backend
```

### Build only mobile:

```bash
npm run build:mobile
```

## Testing

### Run all tests:

```bash
npm test
```

### Run only backend tests:

```bash
npm run test:backend
```

### Run only mobile tests:

```bash
npm run test:mobile
```

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dairy-farm
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

### Mobile Environment Variables

Create a `.env` file in the `mobile` directory:

```
API_BASE_URL=http://localhost:3000/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
