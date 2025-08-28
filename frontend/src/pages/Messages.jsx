import React, { useState } from 'react';
import { Search, Video, Send, Grid3X3, Trophy, Mail, Calendar, Bell, History, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const {logout} = useAuthStore();
  const {selectedUser} = useChatStore();

  // Debug logging
  console.log('Messages component - selectedUser:', selectedUser);

  return (
    <div className="messages-page-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <img src="/logo-counsel.png" alt="TSU Logo" />
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/">
              <Grid3X3 size={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/student-profiles">
              <Trophy size={20} />
              Student Profiles
            </Link>
          </li>
          <li className="active">
            <Link to="/messages">
              <Mail size={20} />
              Messages
            </Link>
          </li>
          <li>
            <Link to="/calendar">
              <Calendar size={20} />
              Calendar
            </Link>
          </li>
          <li>
            <Link to="/notifications">
              <Bell size={20} />
              Notifications
            </Link>
          </li>
          <li>
            <Link to="/session-history">
              <History size={20} />
              Session History
            </Link>
          </li>
          <li className="sign-out">
            <Link to="/login" onClick={logout}>
              <LogOut size={20} />
              Sign out
            </Link>
          </li>
        </ul>
      </div>

      {/* Messages List Section */}
      <div className="messages-list">
        <div className="messages-header">
          <h2>MESSAGES</h2>
          <div className="search-messages">
            <input 
              type="text" 
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="chat-list">
          <Sidebar />
        </div>
      </div>

      {/* Chat Container Section */}
      {selectedUser ? (
        <ChatContainer />
      ) : (
        <div className="chat-container">
          <NoChatSelected />
        </div>
      )}
    </div>
  );
};

export default Messages;
