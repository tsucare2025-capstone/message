import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Messages from './pages/Messages';  
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore'; 
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast'; 

const App = () => { 
  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  console.log({onlineUsers});
  
  useEffect(() => {
    checkAuth().finally(() => setHasCheckedAuth(true));
  }, [checkAuth]);

  console.log({authUser, isCheckingAuth, hasCheckedAuth});

  // Show loading until we've completed the initial auth check
  if(!hasCheckedAuth || isCheckingAuth) return (
    <div className='flex justify-center items-center h-screen bg-gray-900'>
      <div className='text-white text-center'>
        <Loader className='w-10 h-10 animate-spin mx-auto mb-4'/>
        <p>Loading...</p>
      </div>
    </div>
  )

  return (
    <div data-theme="light">
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={
          <>
            <Navbar />
            <Login />
          </>
        } />
        <Route path="/register" element={
          <>
            <Navbar />
            <Register />
          </>
        } />
        <Route path="/messages" element={authUser ? <Messages /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  )
}

export default App;