import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';

const useAuthStore = create((set, get) => ({
  authUser: null,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/check-auth`, {
        withCredentials: true
      });
      
      if (response.data && response.data.user) {
        set({ authUser: response.data.user, isCheckingAuth: false });
        // Connect to socket after successful auth check
        get().connectToSocket();
      } else {
        console.error('Invalid response structure:', response.data);
        set({ authUser: null, isCheckingAuth: false });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, 
        data, { withCredentials: true });
      set({ authUser: response.data.user });
      toast.success('Login successful! Redirecting to homepage...');
      // Connect to Socket.IO server
      get().connectToSocket();
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  register: async (data) => {
    set({ isSigningUp: true });
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, 
        data, { withCredentials: true });
      
      set({ authUser: response.data.user });
      toast.success('Registration successful! Redirecting to homepage...');
      // Connect to Socket.IO server
      get().connectToSocket();
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
      set({ authUser: null });
      toast.success('Logged out successfully!');
      get().disconnectFromSocket();
    } catch (error) {
      toast.error('Logout failed. Please try again.');
      throw error;
    }
  },

  connectToSocket: () => {
    const { authUser } = get();
    
    if (!authUser || get().socket?.connected) return;
  
    // Use the correct user ID field
    const userId = authUser._id || authUser.id || authUser.counselorID;
  
    if (!userId) {
      console.error('No valid userId found in authUser:', authUser);
      return;
    }
  
    // Create new socket connection
    const newSocket = io(BASE_URL, {
      query: { userId: userId },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
  
    // Set up socket event listeners
    newSocket.on('connect', () => {
      set({ socket: newSocket });
    });
  
    newSocket.on('getOnlineUsers', (users) => {
      set({ onlineUsers: users });
    });
  
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  },

  disconnectFromSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));

export default useAuthStore;