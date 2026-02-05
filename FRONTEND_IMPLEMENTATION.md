# Frontend Implementation Guide

## Overview
This React Router v7 application provides a complete customer support chat interface with JWT authentication and WebSocket real-time messaging.

## Features Implemented

### ✅ Authentication
- **Login Page** (`/login`) - User authentication with email/password
- **Register Page** (`/register`) - New user registration with validation
- **JWT Token Management** - Automatic token refresh on expiry
- **Protected Routes** - Authentication guards for dashboard access
- **Secure Token Storage** - Tokens stored in localStorage

### ✅ WebSocket Integration
- **Real-time Chat** - WebSocket connection with JWT authentication
- **Connection Status** - Visual indicators for connection state
- **Message Handling** - Send/receive messages through WebSocket
- **Auto-reconnection** - Automatic reconnection on disconnect
- **Token Refresh** - WebSocket reconnects with new token on refresh

### ✅ User Interface
- **Responsive Design** - Mobile and desktop friendly
- **Modern UI** - Clean, professional design with Tailwind CSS
- **Loading States** - Visual feedback during operations
- **Error Handling** - User-friendly error messages
- **Chat Interface** - Real-time message display with timestamps

## Project Structure

```
app/
├── services/
│   ├── auth.service.ts          # Authentication API service
│   └── websocket.service.ts     # WebSocket connection service
├── contexts/
│   └── AuthContext.tsx          # Authentication context provider
├── components/
│   └── ProtectedRoute.tsx       # Route protection component
├── routes/
│   ├── home.tsx                 # Home page (redirects)
│   ├── login.tsx                # Login page
│   ├── register.tsx            # Registration page
│   └── dashboard.tsx           # Main chat dashboard
├── root.tsx                     # Root component with AuthProvider
└── routes.ts                    # Route configuration
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd Frontend/my-react-router-app
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

### 3. Backend Requirements
Ensure your backend servers are running:
- **Authentication API**: `http://localhost:4000`
- **WebSocket Server**: `http://localhost:3000`

## Usage Flow

### 1. User Registration/Login
- Navigate to `/login` or `/register`
- Enter credentials (email, password, name for registration)
- Upon successful authentication, user is redirected to `/dashboard`

### 2. Chat Dashboard
- After login, users are automatically connected to WebSocket
- Connection status is displayed in the header
- Users can send messages through the chat interface
- Messages are sent via WebSocket `sendMessage` event
- Responses are received via `chatbotResponse` or `newMessage` events

### 3. Token Management
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh on 403 errors
- WebSocket reconnects automatically with new token

## API Integration

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - User logout

### WebSocket Events

#### Client → Server
- `sendMessage` - Send chat message
- `joinRoom` - Join a room
- `leaveRoom` - Leave a room
- `ping` - Health check

#### Server → Client
- `authenticated` - Authentication confirmation
- `newMessage` - New message from other users
- `chatbotResponse` - Response from chatbot/AI
- `messageProcessing` - Message processing status
- `userCount` - Number of connected users
- `roomJoined` - Room join confirmation
- `messageError` - Message error
- `pong` - Health check response

## Configuration

### API URLs
Edit these in the service files if your backend uses different URLs:

**auth.service.ts:**
```typescript
const API_BASE_URL = 'http://localhost:4000';
```

**websocket.service.ts:**
```typescript
const WS_URL = 'http://localhost:3000';
```

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized** - Redirects to login
- **403 Forbidden** - Attempts token refresh
- **429 Too Many Requests** - Shows rate limit message
- **Network Errors** - Shows connection error
- **WebSocket Errors** - Attempts reconnection

## Security Features

- JWT token authentication
- Secure token storage (localStorage)
- Automatic token refresh
- Protected routes
- CORS handling
- Input validation

## Development

### Type Checking
```bash
npm run typecheck
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Next Steps

1. **Backend Integration**: Ensure your backend implements the chatbot response handling (see `Backend/WEBSOCKET_MESSAGE_HANDLING_PROMPT.md`)

2. **Customization**: 
   - Update styling in `app.css`
   - Modify chat interface in `dashboard.tsx`
   - Add additional features as needed

3. **Testing**: 
   - Test authentication flow
   - Test WebSocket connection
   - Test message sending/receiving
   - Test token refresh

## Troubleshooting

### WebSocket Connection Issues
- Verify backend WebSocket server is running on port 3000
- Check browser console for connection errors
- Ensure JWT token is valid

### Authentication Issues
- Verify backend API is running on port 4000
- Check token storage in browser localStorage
- Verify CORS settings on backend

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run typecheck`

## Notes

- The application uses React Router v7 with SSR enabled
- Tailwind CSS is used for styling
- TypeScript is used for type safety
- Socket.IO client is used for WebSocket connections










