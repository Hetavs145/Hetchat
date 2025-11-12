import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!isOpen) return;

    // Load all users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser?.uid);
      setAllUsers(usersList);
    });

    return unsubscribe;
  }, [isOpen, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const memberIds = [currentUser.uid, ...selectedUsers.map(u => u.id)];
      
      const groupDoc = await addDoc(collection(db, 'groups'), {
        name: groupName.trim(),
        members: memberIds,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add system message for group creation
      try {
        const creatorName = currentUser.displayName || currentUser.email || 'User';
        const msgContent = `${creatorName} created the group`;
        console.log(`💾 Saving group creation message: "${msgContent}" to groups/${groupDoc.id}/messages`);
        
        const docRef = await addDoc(collection(db, `groups/${groupDoc.id}/messages`), {
          content: msgContent,
          isSystem: true,
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        
        console.log(`✅ Group creation message saved with ID: ${docRef.id}`);
      } catch (msgError) {
        console.error('❌ Failed to save group creation message:', msgError);
        // Continue even if message save fails
      }

      setGroupName('');
      setSelectedUsers([]);
      setSearchQuery('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const filteredUsers = allUsers.filter(user =>
    (user.displayName || user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create Group
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add members to start a group chat
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="Enter group name"
                autoFocus
                required
              />
            </div>

            {/* Selected Users Count */}
            {selectedUsers.length > 0 && (
              <div className="mb-3 flex items-center gap-2 text-sm">
                <div className="flex -space-x-2">
                  {selectedUsers.slice(0, 3).map(user => (
                    <div
                      key={user.id}
                      className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(user.id)} rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-semibold`}
                    >
                      {getInitials(user.displayName || user.email)}
                    </div>
                  ))}
                  {selectedUsers.length > 3 && (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-semibold">
                      +{selectedUsers.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedUsers.length} {selectedUsers.length === 1 ? 'member' : 'members'} selected
                </span>
              </div>
            )}

            {/* Search Users */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Members
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder="Search by name or email..."
                />
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide border border-gray-200 dark:border-gray-700 rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No users found' : 'No users available'}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredUsers.map(user => {
                    const isSelected = selectedUsers.find(u => u.id === user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleUser(user)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-900/30'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(user.id)} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                          {getInitials(user.displayName || user.email)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {user.displayName || user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !groupName.trim() || selectedUsers.length === 0}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateGroupModal;

