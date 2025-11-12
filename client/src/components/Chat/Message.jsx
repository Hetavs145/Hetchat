import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Message = ({ message }) => {
  const { currentUser } = useAuth();
  const isOwn = message.senderId === currentUser?.uid;

  // Handle system messages (user joined/left) - WhatsApp style
  if (message.isSystem) {
    console.log('🔔 Rendering system message:', message.content);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center my-3"
      >
        <div className="px-3 py-1.5 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg text-xs text-gray-700 dark:text-gray-300 font-medium shadow-sm">
          {message.content}
        </div>
      </motion.div>
    );
  }

  // Get user initials (e.g., "Hetav Shah" → "HS", "Alice" → "A")
  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Generate consistent color for each user based on their ID
  const getUserColor = (userId) => {
    if (!userId) return 'from-gray-400 to-gray-600';
    
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
      'from-cyan-400 to-cyan-600',
    ];
    
    // Generate a consistent index based on userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    let date;
    
    // Handle Firestore Timestamp
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } 
    // Handle JavaScript Date object
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle timestamp string
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    // Handle timestamp number (milliseconds)
    else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    }
    // Fallback
    else {
      date = new Date();
    }
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm shadow-md bg-gradient-to-br ${
          isOwn 
            ? 'from-primary-500 to-primary-700' 
            : getUserColor(message.senderId)
        }`}
        title={message.senderName || 'User'}
      >
        {getInitials(message.senderName)}
      </div>

      <div className={`flex-1 max-w-lg ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {isOwn ? 'You' : message.senderName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className={`px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-primary-600 text-white rounded-tr-sm' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Message;

