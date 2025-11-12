# HetChat Server

Real-time messaging server powered by Node.js, Express, and Socket.io.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Firebase Admin SDK credentials
   - Get credentials from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key

3. Run the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:3000)

## Features

- ✅ WebSocket connections with Socket.io
- ✅ Firebase Auth token verification
- ✅ Real-time message broadcasting
- ✅ Typing indicators
- ✅ Room management (join/leave)
- ✅ Message persistence to Firestore
- ✅ User presence tracking

## API Endpoints

- `GET /` - Server status
- `GET /health` - Health check

## Socket Events

### Client → Server
- `joinRoom(roomId)` - Join a chat room
- `leaveRoom(roomId)` - Leave a chat room
- `sendMessage({ roomId, content })` - Send a message
- `typing({ roomId, isTyping })` - Typing indicator

### Server → Client
- `newMessage(message)` - New message received
- `userTyping({ userId, userName, isTyping })` - User typing status
- `userJoined({ userId, userName })` - User joined room
- `userLeft({ userId, userName })` - User left room
- `error({ message })` - Error notification

## Deployment

### Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

### Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set env vars: `heroku config:set VAR=value`
5. Deploy: `git push heroku main`

## Notes

- Firebase Admin SDK is used for authentication
- All socket connections must provide a valid Firebase ID token
- Messages are stored in Firestore for persistence
- Development mode allows connections without valid tokens (not recommended for production)

