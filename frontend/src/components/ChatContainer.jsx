import useChatStore from '../store/useChatStore'
import {useEffect, useRef} from 'react'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './MessageSkeleton'
import useAuthStore from '../store/useAuthStore'
import { formatTimestamp } from '../lib/utils'

const ChatContainer = () => {
  const {messages, getMessages, isMessagesLoading, selectedUser, user, subscribeToNewMessages, unsubscribeFromNewMessages} = useChatStore()
  const {authUser} = useAuthStore()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser)
      subscribeToNewMessages()
    }
    return () => {
      unsubscribeFromNewMessages()
    }
  }, [selectedUser, getMessages, subscribeToNewMessages, unsubscribeFromNewMessages])

  // Helper function to determine if current user sent the message
  const isMessageFromCurrentUser = (message) => {
    // If current user is a counselor and sent the message
    if (authUser?.counselorID && message.counselorID === authUser.counselorID) {
      return true;
    }
    // If current user is a student and sent the message (you might need to add studentID to authUser)
    if (authUser?.studentID && message.studentID === authUser.studentID) {
      return true;
    }
    return false;
  };

  // Helper function to get the correct avatar
  const getMessageAvatar = (message) => {
    const isFromCurrentUser = isMessageFromCurrentUser(message);
    
    if (isFromCurrentUser) {
      // Current user's avatar
      return authUser?.profilePicture || '/counsel-prof.png';
    } else {
      // Other user's avatar - selectedUser is just an ID, so we need to find the user object
      const otherUser = user.find(u => u._id === selectedUser);
      return otherUser?.profilePicture || '/user-stud.png';
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Smart auto-scroll - only scroll if user is near bottom
  const smartScrollToBottom = () => {
    const messagesContainer = document.querySelector('.overflow-y-auto');
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // Within 100px of bottom
      
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }

  useEffect(() => {
    smartScrollToBottom()
  }, [messages])

  if(isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden" style={{margin: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'}}>
        <ChatHeader />
        <div className="flex-1 overflow-y-auto p-4">
          <MessageSkeleton />
        </div>
        <div className="border-t border-gray-200 p-4 bg-white">
          <MessageInput />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden" style={{margin: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'}}>
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isFromCurrentUser = isMessageFromCurrentUser(message);
          
          // Debug logging
          console.log('Message debug:', {
            messageID: message.messageID,
            text: message.text,
            counselorID: message.counselorID,
            studentID: message.studentID,
            authUserID: authUser?.counselorID,
            isFromCurrentUser,
            selectedUser: selectedUser,
            fullMessage: message,
            fullAuthUser: authUser
          });
          
          return (
            <div key={message.messageID} className={`chat ${isFromCurrentUser ? 'chat-end' : 'chat-start'}`}>
              <div className='chat-image avatar'>
                <div className='w-10 rounded-full'>
                  <img src={getMessageAvatar(message)} alt='user' />
                </div>
              </div>
              
              <div className='chat-header mb-1'>
                <time className='text-xs opacity-50'>{formatTimestamp(message.timestamp)}</time> 
              </div>
              
              <div className='chat-bubble'>{message.text}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatContainer