import React, { useState } from 'react';
import Sidebar from '../components/Chat/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import CreateGroupModal from '../components/Chat/CreateGroupModal';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleLeaveGroup = () => {
    // Clear the selected chat when user leaves a group
    setSelectedChat(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        selectedChat={selectedChat}
        onChatSelect={setSelectedChat}
        onCreateGroup={() => setShowCreateGroup(true)}
      />
      <ChatWindow 
        selectedChat={selectedChat} 
        onLeaveGroup={handleLeaveGroup}
      />
      <CreateGroupModal 
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
    </div>
  );
};

export default ChatPage;
