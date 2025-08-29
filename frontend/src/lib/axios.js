import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? 'https://message-production-785f.up.railway.app/api' : '/api',
    withCredentials: true,
});

export default axiosInstance;