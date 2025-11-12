# HetChat Client

React frontend for HetChat real-time messaging application.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Firebase SDK** - Authentication and Firestore
- **Socket.io Client** - Real-time WebSocket communication
- **Lucide React** - Icon library
- **React Router** - Routing

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the client folder:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_SOCKET_URL=http://localhost:5000
```

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx          # Login form
│   │   └── Signup.jsx         # Signup form
│   └── Chat/
│       ├── ChatWindow.jsx     # Main chat interface
│       ├── Sidebar.jsx        # Rooms and users sidebar
│       ├── Message.jsx        # Individual message component
│       ├── MessageInput.jsx   # Message input with typing
│       └── NewRoomModal.jsx   # Create room modal
├── context/
│   ├── AuthContext.jsx        # Authentication state
│   ├── ThemeContext.jsx       # Light/dark mode
│   └── SocketContext.jsx      # Socket.io connection
├── pages/
│   ├── AuthPage.jsx           # Login/Signup page
│   └── ChatPage.jsx           # Main chat page
├── config/
│   └── firebase.js            # Firebase configuration
├── App.jsx                     # Root component
├── main.jsx                    # Entry point
└── index.css                   # Global styles
```

## Features

### Authentication
- Email/password signup and login
- Google OAuth sign-in
- Persistent sessions
- Auto token refresh

### Chat Interface
- Multiple chat rooms
- Real-time message delivery
- Typing indicators
- Online user list
- Smooth scroll to new messages

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Light and dark mode
- Smooth animations and transitions
- Loading states
- Error handling

## Key Components

### AuthContext
Manages user authentication state, provides login/signup/logout functions.

### SocketContext
Manages Socket.io connection with automatic reconnection and authentication.

### ThemeContext
Handles light/dark mode toggle with localStorage persistence.

### ChatWindow
Main chat interface with message list, typing indicators, and real-time updates.

### Sidebar
Shows available rooms and online users with status indicators.

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Vercel

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Animations
Framer Motion animations can be customized in each component's motion props.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React.lazy (can be added)
- Optimized bundle size with Vite
- Efficient re-renders with React Context
- WebSocket connection pooling

