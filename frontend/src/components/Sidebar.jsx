import React, { useEffect } from 'react'
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { ChevronRight, Users } from 'lucide-react';         

const Sidebar = () => {
    const {getUsers, user, selectedUser, setSelectedUser, isUsersLoading} = useChatStore();
    const { onlineUsers } = useAuthStore();
    
    useEffect(() => {
        getUsers();
    }, [getUsers]);

    // Show loading while users are being fetched
    if(isUsersLoading) return <div>Loading...</div>;
    
    // Show message if no users loaded yet
    if(!user || user.length === 0) return <div>No users available</div>;

    return (
        <div className="w-full">
            {user.map((userItem) => {
                // Check if this user is online using _id (which contains the actual counselorID)
                const isOnline = onlineUsers.includes(userItem._id?.toString()) || 
                               onlineUsers.includes(userItem._id);
                
                return (
                    <div 
                        key={userItem._id} 
                        className={`chat-item ${selectedUser === userItem._id ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedUser(userItem._id);
                        }}
                    >
                        <div className="relative">
                            <img src="/user-stud.png" alt={userItem.name} />

                        </div>
                        <div className="chat-info">
                            <h3>{userItem.name}</h3>
                            {/* Refined Green Online Indicator */}
                            {isOnline && (
                                <div className="absolute bottom-1.5 -left-0.5 size-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                            <p className={`${isOnline ? 'text-green-600 font-medium pl-3' : 'text-gray-500'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </p>
                            
                            <span className="time">
                                {userItem.lastMessage && userItem.lastMessage.createdAt}  
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default Sidebar