import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import logoCounsel from '/logo-counsel.png';  
import { Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';


const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { register, isSigningUp } = useAuthStore();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('All fields are required.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      // Wait 2 seconds for the toast to show, then redirect
      setTimeout(() => {
        console.log('Redirecting to homepage...'); 
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="logo-section">
          <img src={logoCounsel} alt="TSU Guidance and Counseling Unit Logo" />
          <p>TSU Guidance and Counseling Unit</p>
        </div>
        
        <h2 className="register-title">Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="form-input pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="form-group relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button 
            type="submit" 
            className="register-button"
            disabled={isSigningUp}
          >
            {isSigningUp ? 'Creating Account...' : 'Sign up'}
            {isSigningUp && <Loader className="w-4 h-4 animate-spin mx-auto mb-4" />}
          </button>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;