import { useState } from 'react';
import { registerUser } from '../../services/apiService';
import { useNotifications } from '../../hooks/useNotifications';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import AnimatedSnow from '../common/AnimatedSnow';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    notifyApiError,
    notifyRegistrationSuccess,
    showError
  } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await registerUser(name, email, password);

      // Validate the response data
      if (!data || !data.token || !data._id || !data.name) {
        showError('Registration failed: Invalid response from server');
        return;
      }

      // Store user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data._id);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);

      // Clear any guest ID
      localStorage.removeItem('guestUserId');
      sessionStorage.removeItem('guestUserId');

      // Dispatch custom event to notify navbar and other components
      window.dispatchEvent(new Event('authChange'));

      // Show success notification
      notifyRegistrationSuccess();

      // Redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      notifyApiError(error, 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <AnimatedSnow snowflakeCount={60} />
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
            Join Us Today
          </h1>
          <p className="text-cyan-200 text-base sm:text-lg">Create your account and start your journey</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md border border-white/20 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-white text-sm font-semibold mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-semibold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/70 hover:text-black transition-colors p-1"
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-white text-sm font-semibold mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/70 hover:text-black transition-colors p-1"
                >
                  {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
                !isLoading
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 shadow-lg hover:shadow-xl cursor-pointer'
                  : 'bg-gray-500 cursor-not-allowed opacity-70'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-white/80 text-sm sm:text-base">
              Already have an account?{' '}
              <a href="/login" className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-white/60 text-xs sm:text-sm">
            Secure • Fast • Reliable
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;