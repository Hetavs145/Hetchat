import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Moon, Sun, Search, Plus, Users, MessageCircle, X, UserPlus } from 'lucide-react';
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import HexagonLogo from '../Logo';

const Sidebar = ({ selectedChat, onChatSelect, onCreateGroup }) => {
  const [existingChats, setExistingChats] = useState([]); // Users with existing conversations
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // New users found by search
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'direct', 'groups'
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Load users with existing conversations (rooms)
  useEffect(() => {
    if (!currentUser) return;

    const roomsQuery = query(collection(db, 'rooms'));
    const unsubscribe = onSnapshot(
      roomsQuery,
      async (snapshot) => {
        const userChats = [];
        const userIds = new Set();

        // Find all rooms where current user is a participant
        snapshot.docs.forEach(doc => {
          const roomData = doc.data();
          const roomId = doc.id;
          
          // Check if current user is in this room
          if (roomId.includes(currentUser.uid)) {
            // Extract the other user's ID from room ID (format: dm_uid1_uid2)
            const parts = roomId.replace('dm_', '').split('_');
            const otherUserId = parts.find(id => id !== currentUser.uid);
            if (otherUserId) {
              userIds.add(otherUserId);
            }
          }
        });

        // Fetch user details for each user ID
        for (const userId of userIds) {
          try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              userChats.push({
                id: userId,
                ...userData
              });
            }
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }

        console.log(`💬 Loaded ${userChats.length} existing conversations`);
        setExistingChats(userChats);
      },
      (error) => {
        console.error('❌ Error loading conversations:', error.message);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Load groups
  useEffect(() => {
    if (!currentUser) return;
    
    const groupsQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
      const groupsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isGroup: true
      }));
      setGroups(groupsList);
    });

    return unsubscribe;
  }, [currentUser]);

  // Search for new users by email
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(usersQuery);
        
        const results = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => {
            // Exclude current user
            if (user.id === currentUser?.uid) return false;
            
            // Check if already in existing chats
            const alreadyInChats = existingChats.some(chat => chat.id === user.id);
            
            // Only show if matches search and NOT already in existing chats
            const matchesSearch = 
              user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesSearch && !alreadyInChats;
          });
        
        setSearchResults(results);
      } catch (error) {
        console.error('❌ Error searching users:', error);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUser, existingChats]);

  // Filter existing chats by search
  const filteredExistingChats = existingChats.filter(user =>
    !searchQuery.trim() || 
    (user.displayName || user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    !searchQuery.trim() || 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Determine what to show based on active tab
  const displayedChats = activeTab === 'all' 
    ? [...filteredGroups, ...filteredExistingChats]
    : activeTab === 'direct'
    ? filteredExistingChats
    : filteredGroups;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <HexagonLogo size={40} />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">HetChat</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Current User Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
          <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(currentUser?.uid || '')} rounded-full flex items-center justify-center text-white font-semibold`}>
            {getInitials(currentUser?.displayName || 'User')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {currentUser?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentUser?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'all'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All ({displayedChats.length})
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'direct'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Direct ({filteredExistingChats.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'groups'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Groups ({filteredGroups.length})
          </button>
        </div>
      </div>

      {/* Create Group Button */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onCreateGroup}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      {/* Chats/Users/Groups List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-2">
          {/* Existing Chats Section */}
          {displayedChats.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              {activeTab === 'groups' ? (
                <>
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No groups yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Create a group to start chatting
                  </p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No conversations yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Search for users by email to start chatting!
                  </p>
                </>
              )}
            </div>
          )}
          
          {/* Display existing chats */}
          {displayedChats.length > 0 && (
            <div className="space-y-1">
              {displayedChats.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => onChatSelect(item)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                    selectedChat?.id === item.id
                      ? 'bg-primary-50 dark:bg-primary-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="relative">
                    {item.isGroup ? (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <>
                        <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(item.id)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                          {(() => {
                            const name = item.displayName || item.email || 'User';
                            console.log('👤 Sidebar user:', { id: item.id, displayName: item.displayName, email: item.email, initials: getInitials(name) });
                            return getInitials(name);
                          })()}
                        </div>
                        {item.status === 'online' && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`font-medium truncate ${
                      selectedChat?.id === item.id
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.isGroup ? item.name : (item.displayName || item.email)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.isGroup ? (
                        `${item.members?.length || 0} members`
                      ) : item.status === 'online' ? (
                        <span className="text-green-600 dark:text-green-400">● Online</span>
                      ) : (
                        item.email
                      )}
                    </p>
                  </div>
                  {selectedChat?.id === item.id && (
                    <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {/* New Users Search Results Section */}
          {searchQuery && searchResults.length > 0 && activeTab !== 'groups' && (
            <div className="mt-4">
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <UserPlus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  New Contacts ({searchResults.length})
                </p>
              </div>
              <div className="space-y-1">
                {searchResults.map((user) => (
                  <motion.button
                    key={user.id}
                    onClick={() => onChatSelect(user)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(user.id)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                        {getInitials(user.displayName || user.email)}
                      </div>
                      {user.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium truncate text-gray-900 dark:text-white">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <UserPlus className="w-5 h-5 text-primary-500" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* No search results */}
          {searchQuery && searchResults.length === 0 && displayedChats.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No users found
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try searching by email address
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          {searchQuery ? 'Click on a user to start chatting' : 'Search by email to find new contacts'}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
