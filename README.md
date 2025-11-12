# 🚀 HetChat - Real-time Messaging Application

A modern, full-stack real-time chat application built with React, Node.js, Firebase, and Socket.io. Features beautiful UI with light/dark mode, real-time messaging, typing indicators, and user presence tracking.

![HetChat Banner](https://img.shields.io/badge/NetChat-Real--time%20Messaging-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-black)

## ✨ Features

### 🔐 Authentication
- Email/Password authentication
- Google Sign-In
- Persistent sessions
- Secure token-based Socket.io connections

### 💬 Real-time Messaging
- Instant message delivery via Socket.io
- Message persistence in Firestore
- Typing indicators
- Online/offline status
- Multiple chat rooms

### 🎨 Modern UI
- Beautiful, responsive design
- Light/Dark mode toggle
- Smooth animations with Framer Motion
- TailwindCSS styling
- Mobile-friendly layout

### 🏗️ Architecture
- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express + Socket.io
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Real-time**: Socket.io WebSockets

## 📁 Project Structure

```
netchat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Auth/     # Login/Signup components
│   │   │   └── Chat/     # Chat UI components
│   │   ├── context/      # React Context providers
│   │   ├── config/       # Firebase configuration
│   │   ├── pages/        # Page components
│   │   └── App.jsx       # Root component
│   ├── public/
│   └── package.json
│
├── server/                # Node.js backend
│   ├── index.js          # Express + Socket.io server
│   └── package.json
│
├── firestore.rules       # Firestore security rules
├── firebase.json         # Firebase config
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd netchat
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing: `hetchat-bc3ea`)
3. Enable Authentication:
   - Enable Email/Password
   - Enable Google Sign-In
4. Create Firestore Database:
   - Start in production mode
   - Choose a location
5. Get Firebase Config:
   - Project Settings → General → Your apps → Web app
   - Copy the config object
6. Get Service Account Key (for server):
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

### 3. Install Dependencies

#### Client
```bash
cd client
npm install
```

#### Server
```bash
cd ../server
npm install
```

### 4. Environment Configuration

#### Client `.env` (or use the provided one)
Create `client/.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSyDSBCIVqMTqU8o4xCsTyVaMbpsnevpzVlg
VITE_FIREBASE_AUTH_DOMAIN=hetchat-bc3ea.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hetchat-bc3ea
VITE_FIREBASE_STORAGE_BUCKET=hetchat-bc3ea.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=371455166331
VITE_FIREBASE_APP_ID=1:371455166331:web:5da5e1d62954a679f55fde
VITE_FIREBASE_MEASUREMENT_ID=G-V6C64K2MJF
VITE_SOCKET_URL=http://localhost:5000
```

#### Server `.env`
Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=hetchat-bc3ea
FIREBASE_CLIENT_EMAIL=your-service-account-email@project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
CLIENT_URL=http://localhost:3000
```

**Important**: Get the service account credentials from the JSON file you downloaded.

### 5. Deploy Firestore Rules

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if needed)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### 6. Run the Application

#### Terminal 1 - Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 - Client
```bash
cd client
npm run dev
# Client runs on http://localhost:3000
```

### 7. Test the Application

1. Open http://localhost:3000 in your browser
2. Sign up with email/password or Google
3. Create a new chat room
4. Open another browser window (incognito mode) and sign in with a different account
5. Join the same room and start chatting!

<!-- ## 🌐 Deployment

### Frontend - Firebase Hosting

```bash
cd client
npm run build
firebase deploy --only hosting
```

### Frontend - Vercel (Alternative)

```bash
cd client
npm run build
# Install Vercel CLI: npm i -g vercel
vercel --prod
```

### Backend - Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**: Add all from `server/.env`
5. Deploy!

### Backend - Heroku (Alternative)

```bash
cd server
heroku create your-app-name
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_CLIENT_EMAIL=your-email
heroku config:set FIREBASE_PRIVATE_KEY="your-private-key"
heroku config:set CLIENT_URL=https://your-frontend-url.com
git subtree push --prefix server heroku main
```

### Update Client with Production URLs

After deploying the server, update `client/.env`:
```env
VITE_SOCKET_URL=https://your-server-url.com
```

Then rebuild and redeploy the client.

## 🔒 Security

- ✅ Firebase Auth for user authentication
- ✅ Firestore security rules for data access
- ✅ Socket.io token verification
- ✅ CORS protection
- ✅ Environment variables for sensitive data

## 🎯 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express, Socket.io |
| Authentication | Firebase Auth |
| Database | Cloud Firestore |
| Real-time | Socket.io WebSockets |
| UI Icons | Lucide React |
| Deployment | Firebase Hosting / Vercel (client), Render / Heroku (server) |

## 📝 Key Features Implementation

### Real-time Messaging Flow

1. User types a message
2. Message sent via Socket.io to server
3. Server validates user authentication
4. Message saved to Firestore (persistence)
5. Server broadcasts message to all users in room
6. All clients receive message instantly via WebSocket
7. Message appears in chat window with animation

### Authentication Flow

1. User signs up/logs in via Firebase Auth
2. Firebase returns ID token
3. Token sent with Socket.io connection
4. Server verifies token using Firebase Admin SDK
5. Connection established if valid
6. User can now send/receive messages

### Typing Indicators

1. User types in input field
2. `typing` event emitted after 1 second of typing
3. Server broadcasts to other users in room
4. Typing indicator appears below messages
5. Automatically removed after 1 second of inactivity

## 🐛 Troubleshooting

### Client won't connect to server
- Check that server is running on correct port
- Verify `VITE_SOCKET_URL` in client `.env`
- Check CORS settings in server

### Authentication errors
- Verify Firebase config is correct
- Check that Auth providers are enabled in Firebase Console
- Ensure service account key is properly formatted

### Messages not persisting
- Deploy Firestore security rules
- Check Firestore console for errors
- Verify server has proper Firebase Admin credentials

### Build errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Check Node.js version: `node -v` (should be v18+)

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Demo

To test the app with 2 users:

1. Open the app in Chrome: http://localhost:3000
2. Sign up with user 1
3. Create a room (e.g., "general")
4. Open the app in Incognito mode
5. Sign up with user 2
6. Join the "general" room
7. Start chatting in real-time!

You should see:
- ✅ Messages appear instantly on both screens
- ✅ Typing indicators when someone is typing
- ✅ Online users in the sidebar
- ✅ Smooth animations
- ✅ Light/dark mode toggle


 -->
