import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, MessageCircle, Users, LogOut, UserPlus } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, arrayRemove, deleteDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Message from './Message';
import MessageInput from './MessageInput';
import AddMembersModal from './AddMembersModal';
import HexagonLogo from '../Logo';

const ChatWindow = ({ selectedChat, onLeaveGroup }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const getRoomId = () => {
    if (!selectedChat || !currentUser) return null;
    
    if (selectedChat.isGroup) {
      return `group_${selectedChat.id}`;
    } else {
      const ids = [currentUser.uid, selectedChat.id].sort();
      return `dm_${ids[0]}_${ids[1]}`;
    }
  };

  const roomId = getRoomId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleLeaveGroup = async () => {
    if (!selectedChat.isGroup || !currentUser) return;

    const confirmLeave = window.confirm(`Are you sure you want to leave "${selectedChat.name}"?`);
    if (!confirmLeave) return;

    try {
      const groupRef = doc(db, 'groups', selectedChat.id);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }
      
      const groupData = groupSnap.data();
      const isAdmin = groupData.createdBy === currentUser.uid;
      const currentMembers = groupData.members || [];
      const remainingMembers = currentMembers.filter(id => id !== currentUser.uid);

      const updateData = {
        members: arrayRemove(currentUser.uid)
      };

      if (isAdmin && remainingMembers.length > 0) {
        const newAdmin = remainingMembers[0];
        updateData.createdBy = newAdmin;
        console.log(`👑 Promoting ${newAdmin} to admin`);
      }
      if (remainingMembers.length === 0) {
        console.log('⚠️ Last member leaving, group will be empty');
      }
      try {
        const userName = currentUser.displayName || currentUser.email || 'User';
        await addDoc(collection(db, `groups/${selectedChat.id}/messages`), {
          content: `${userName} left the group`,
          isSystem: true,
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        console.log('✅ Leave notification saved to Firestore');
      } catch (msgError) {
        console.warn('⚠️ Failed to save leave notification:', msgError.message);
        
      }

      await updateDoc(groupRef, updateData);

      if (socket) {
        socket.emit('leaveRoom', `group_${selectedChat.id}`);
      }

      console.log(`✅ Left group: ${selectedChat.name}`);
      
      if (isAdmin && remainingMembers.length > 0) {
        alert(`You have left "${selectedChat.name}". Admin role transferred to the next member.`);
      } else {
        alert(`You have left "${selectedChat.name}"`);
      }
      
      if (onLeaveGroup) {
        onLeaveGroup();
      }

      setShowMenu(false);
    } catch (error) {
      console.error('❌ Error leaving group:', error);
      alert(`Failed to leave group: ${error.message || 'Please try again.'}`);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    const collectionPath = selectedChat.isGroup 
      ? `groups/${selectedChat.id}/messages`
      : `rooms/${roomId}/messages`;

    const messagesQuery = query(
      collection(db, collectionPath),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      messagesQuery, 
      (snapshot) => {
        const messagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const systemMessages = messagesList.filter(m => m.isSystem);
        console.log(`📥 Loaded ${messagesList.length} messages from Firestore (${systemMessages.length} system messages)`);
        
        if (systemMessages.length > 0) {
          console.log('💬 System messages:', systemMessages.map(m => m.content));
        }
        
        setMessages(messagesList);
        setTimeout(scrollToBottom, 100);
      },
      (error) => {
        console.warn('⚠️ Firestore listener error (continuing with real-time only):', error.message);
      }
    );

    return unsubscribe;
  }, [roomId, selectedChat]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('joinRoom', roomId);

    const handleNewMessage = (message) => {
      console.log('📨 Real-time message received:', message.content, 'ID:', message.id);
      setMessages(prev => {
        const isDuplicate = prev.some(m => 
          m.id === message.id || 
          (m.content === message.content && 
           m.senderId === message.senderId && 
           Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 2000)
        );
        
        if (isDuplicate) {
          console.log('⚠️ Duplicate message detected, skipping');
          return prev;
        }
        console.log('✅ New message added to chat');
        return [...prev, message];
      });
      setTimeout(scrollToBottom, 100);
    };

    const handleTyping = ({ userId, userName, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          if (!prev.find(u => u.userId === userId)) {
            return [...prev, { userId, userName }];
          }
          return prev;
        } else {
          return prev.filter(u => u.userId !== userId);
        }
      });
    };

    const handleUserJoined = ({ userId, userName }) => {
      console.log(`👤 ${userName} joined the chat`);
      const systemMessage = {
        id: `system_join_${Date.now()}_${userId}`,
        content: `${userName} joined the chat`,
        isSystem: true,
        timestamp: new Date(),
        createdAt: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
      setTimeout(scrollToBottom, 100);
    };

    const handleUserLeft = ({ userId, userName }) => {
      console.log(`👋 ${userName} left the chat`);
      // Add system message for user leaving
      const systemMessage = {
        id: `system_leave_${Date.now()}_${userId}`,
        content: `${userName} left the group`,
        isSystem: true,
        timestamp: new Date(),
        createdAt: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
      setTimeout(scrollToBottom, 100);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      setTypingUsers([]);
    };
  }, [socket, roomId]);

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
  const getAvatarColor = (id) => {
    if (!id) return 'from-gray-400 to-gray-600';
    
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
    
    // Generate a consistent index based on ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <div className="flex justify-center mb-6">
            <HexagonLogo size={96} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to HetChat!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a chat or create a group to start messaging
          </p>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-sm text-left">
            <p className="font-medium mb-3 text-gray-900 dark:text-white">💡 Getting Started:</p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-600">•</span>
                <span><strong>Direct Messages:</strong> Click on any user to chat privately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600">•</span>
                <span><strong>Group Chats:</strong> Create groups with multiple members</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600">•</span>
                <span><strong>Search:</strong> Find users by name or email address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600">•</span>
                <span><strong>Real-time:</strong> See typing indicators and instant delivery</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {selectedChat.isGroup ? (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(selectedChat.id)} rounded-full flex items-center justify-center text-white text-lg font-semibold`}>
                    {getInitials(selectedChat.displayName || selectedChat.email)}
                  </div>
                  {selectedChat.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 pulse-ring"></div>
                  )}
                </>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedChat.isGroup ? selectedChat.name : (selectedChat.displayName || selectedChat.email)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedChat.isGroup ? (
                  `${selectedChat.members?.length || 0} members`
                ) : selectedChat.status === 'online' ? (
                  <span className="text-green-600 dark:text-green-400">● Online</span>
                ) : (
                  selectedChat.email
                )}
              </p>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
              >
                {selectedChat.isGroup ? (
                  <>
                    <button
                      onClick={() => {
                        setShowAddMembers(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-sm font-medium">Add Members</span>
                    </button>
                    <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                    <button
                      onClick={handleLeaveGroup}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Leave Group</span>
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No options available
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              {selectedChat.isGroup ? (
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className={`w-16 h-16 bg-gradient-to-br ${getAvatarColor(selectedChat.id)} rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4`}>
                  {getInitials(selectedChat.displayName || selectedChat.email)}
                </div>
              )}
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {selectedChat.isGroup 
                  ? `Welcome to ${selectedChat.name}!`
                  : `Start a conversation with ${selectedChat.displayName || selectedChat.email}`
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send a message to get started!
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>
              {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput 
        currentRoom={{ 
          id: roomId, 
          name: selectedChat.isGroup ? selectedChat.name : (selectedChat.displayName || selectedChat.email),
          isGroup: selectedChat.isGroup,
          groupId: selectedChat.isGroup ? selectedChat.id : null
        }} 
      />

      {/* Add Members Modal */}
      <AddMembersModal 
        isOpen={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        group={selectedChat}
      />
    </div>
  );
};

export default ChatWindow;
