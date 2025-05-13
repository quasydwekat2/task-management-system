import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(username, password, staySignedIn);
      navigate('/');
    } catch (err) {
      // Error handling in login function with SweetAlert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg">
        <h1 className="mb-8 text-4xl font-bold text-white text-center">Sign In</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-xl text-white">Username</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-xl text-white">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              className="w-5 h-5 mr-2"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
            />
            <label className="text-white">Stay Signed In</label>
          </div>
          
          <button
            type="submit"
            className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none disabled:bg-green-800 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/signup" className="text-blue-400 hover:text-blue-300">
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;