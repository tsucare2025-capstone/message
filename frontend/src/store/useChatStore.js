import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import axiosInstance from '../lib/axios';
import useAuthStore from './useAuthStore';

const useChatStore = create((set, get) => ({
    messages: [],
    user: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({isUsersLoading: true});
        try {
            const response = await axiosInstance.get('/messages/users');
            console.log('Users fetched:', response.data);
            set({user: response.data});
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            set({isUsersLoading: false});
        }
    },

    getMessages: async (userId) => {
        set({isMessagesLoading: true});
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({messages: response.data});
        } catch (error) {
            toast.error('Failed to fetch messages');
        } finally {
            set({isMessagesLoading: false});
        }

    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get();
        if (!selectedUser) {
            toast.error('No user selected');
            return;
        }
        try {
            // Extract text from messageData and send only what backend expects
            // selectedUser can be either a co-counselor or student ID
            const { text } = messageData;
            const response = await axiosInstance.post(`/messages/send/${selectedUser}`, {
                text
            });
            set({messages: [...messages, response.data]})
        } catch (error) {
            console.error('Send message error:', error.response?.data || error.message);
            toast.error('Failed to send message');
        }
    }, 

    subscribeToNewMessages: () => {
        const {selectedUser} = get();

        if(!selectedUser) return;
        const socket = useAuthStore.getState().socket;
    
        socket.on('newMessage', (newMessage) => {
            //if the new message is not for the selected user, don't update the messages
            if(newMessage.studentID !== selectedUser) return;
            set({messages: [...get().messages, newMessage]});
        });
    },

    unsubscribeFromNewMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off('newMessage');
    },


    setSelectedUser: (selectedUser) => set({selectedUser}),
}));

export default useChatStore;