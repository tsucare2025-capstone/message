import { VideoIcon, X } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, user } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // Find the selected user's data from the users array
  const selectedUserData = user?.find(u => u._id === selectedUser);
  
  // Check if this user is online using _id (which contains the counselorID)
  const isOnline = selectedUserData && (
    onlineUsers.includes(selectedUserData._id?.toString()) || 
    onlineUsers.includes(selectedUserData._id)
  );

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img 
            src="/user-stud.png" 
            alt="User" 
            className="w-10 h-10 rounded-full"
          />
          {/* Refined Green Online Indicator */}
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {selectedUserData?.name || 'Selected User'}
          </h3>
          <p className={`text-sm ${isOnline ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <VideoIcon
            size={20}
            className="text-gray-600"
          />
        </button>
        <button 
          onClick={() => setSelectedUser(null)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;