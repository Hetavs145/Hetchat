import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'hetchat-bc3ea',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};


try {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.warn('⚠️  Firebase Admin credentials not provided. Running in dev mode.');
    admin.initializeApp({
      projectId: serviceAccount.projectId
    });
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
}

const db = getFirestore();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'HetChat Server is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const explicitUserId = socket.handshake.auth.userId;
    const explicitUserName = socket.handshake.auth.userName;
    const explicitUserEmail = socket.handshake.auth.userEmail;
    
    console.log('📝 Auth data received:', {
      hasToken: !!token,
      userId: explicitUserId,
      userName: explicitUserName,
      userEmail: explicitUserEmail
    });
    
    if (!token) {
      return next(new Error('Authentication token missing'));
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      socket.userId = decodedToken.uid;
      socket.userEmail = decodedToken.email;
      
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        socket.userName = userDoc.data().displayName || decodedToken.name || decodedToken.email;
      } else {
        socket.userName = decodedToken.name || decodedToken.email;
      }
      next();
    } catch (authError) {
      console.error('Token verification error:', authError.message);
      // if firebase fetch fails
      if (explicitUserId && (explicitUserName || explicitUserEmail)) {
        socket.userId = explicitUserId;
        socket.userEmail = explicitUserEmail;
        socket.userName = explicitUserName || explicitUserEmail;
        
        console.log(`⚠️  Dev mode: ${socket.userName} connected (using client data)`);
        next();
      } else {
        // decoding of JWT token 
        try {
          const base64Payload = token.split('.')[1];
          const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
          
          socket.userId = payload.user_id || payload.sub;
          socket.userEmail = payload.email;
          socket.userName = payload.name || payload.email || 'User';
          
          console.log(`⚠️  Dev mode: ${socket.userName} connected (decoded token)`);
          next();
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError.message);
          next(new Error('Invalid authentication token'));
        }
      }
    }
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);
  
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    socket.currentRoom = roomId;
    console.log(`👤 ${socket.userName} joined room: ${roomId}`);
    
    socket.to(roomId).emit('userJoined', {
      userId: socket.userId,
      userName: socket.userName
    });
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`👋 ${socket.userName} left room: ${roomId}`);
    
    socket.to(roomId).emit('userLeft', {
      userId: socket.userId,
      userName: socket.userName
    });
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('userTyping', {
      userId: socket.userId,
      userName: socket.userName,
      isTyping
    });
  });

  // Message sending 
  socket.on('sendMessage', async ({ roomId, content, messageId }) => {
    try {
      const timestamp = new Date();
      const msgId = messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Message data for broadcasting
      const messageData = {
        id: msgId,
        content,
        senderId: socket.userId,
        senderName: socket.userName,
        roomId,
        timestamp,
        createdAt: timestamp
      };
      io.to(roomId).emit('newMessage', messageData);
      console.log(`💬 Broadcast message from ${socket.userName} in ${roomId.startsWith('group_') ? 'group' : 'room'} ${roomId} (ID: ${msgId})`);
    } catch (error) {
      console.error('Error broadcasting message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userName}`);
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit('userLeft', {
        userId: socket.userId,
        userName: socket.userName
      });
    }
  });
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
  // console.log(` Socket ready for connections`);
});

