import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { Eye, EyeOff, Loader, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logoCounsel from "/logo-counsel.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    const {login, isLoggingIn} = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData);
            // Wait 2 seconds for the toast to show, then redirect
            setTimeout(() => {
                console.log('Redirecting to homepage...'); 
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('Login error:', error);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-section">
                    <img src={logoCounsel} alt="TSU Guidance and Counseling Unit Logo" />
                    <p>TSU Guidance and Counseling Unit</p>
                </div>
                
                <h2 className="login-title">Log in</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-group relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="form-input pr-12"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    
                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password</Link>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin ml-2" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
                
                <div className="signup-link">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;