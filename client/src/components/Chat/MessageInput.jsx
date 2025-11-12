import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const MessageInput = ({ currentRoom }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const { socket } = useSocket();
  const { currentUser } = useAuth();
  const typingTimeoutRef = useRef(null);

  const handleTyping = (value) => {
    setMessage(value);

    if (!socket || !currentRoom) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { roomId: currentRoom.id, isTyping: true });
    }

   
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { roomId: currentRoom.id, isTyping: false });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !currentUser || !currentRoom || sending) return;

    const messageContent = message.trim();
    setMessage('');
    setIsTyping(false);
    setSending(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    try {
      // For direct messages 
      if (!currentRoom.isGroup) {
        const roomRef = doc(db, 'rooms', currentRoom.id);
        const roomSnap = await getDoc(roomRef);
        
        if (!roomSnap.exists()) {
          await setDoc(roomRef, {
            participants: [currentUser.uid, currentRoom.id.replace(`dm_${currentUser.uid}_`, '').replace(`_${currentUser.uid}`, '')],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: messageContent,
            lastMessageTime: serverTimestamp()
          });
          console.log('✅ Room created in Firestore');
        }
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const collectionPath = currentRoom.isGroup 
        ? `groups/${currentRoom.groupId}/messages`
        : `rooms/${currentRoom.id}/messages`;

      const messageData = {
        content: messageContent,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        roomId: currentRoom.id,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };

  
      await setDoc(doc(db, collectionPath, messageId), messageData);
      console.log(`✅ Message saved to Firestore with ID: ${messageId}`);

      if (socket) {
        socket.emit('sendMessage', {
          roomId: currentRoom.id,
          content: messageContent,
          messageId: messageId 
        });
        socket.emit('typing', { roomId: currentRoom.id, isTyping: false });
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      alert('Failed to save message. Please check your connection and try again.');
      // if Firestore fails
      if (socket) {
        socket.emit('sendMessage', {
          roomId: currentRoom.id,
          content: messageContent
        });
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!currentRoom) {
    return null;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={`Message #${currentRoom.name}`}
            className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition"
            rows="1"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            type="button"
            className="absolute right-3 bottom-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
          >
            <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={sending ? 'Sending...' : 'Send message'}
        >
          <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

