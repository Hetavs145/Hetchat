# 🚀 HetChat - Real-time Messaging Application

A modern, full-stack real-time chat application built with React, Node.js, Firebase, and Socket.io. Features beautiful UI with light/dark mode, real-time messaging, typing indicators, and user presence tracking.

![HetChat Banner](https://img.shields.io/badge/HetChat-Real--time%20Messaging-blue)
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
