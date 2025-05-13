import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

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

    // Optional trimming
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter both username and password.',
      });
      setLoading(false);
      return;
    }

    try {
      await login(trimmedUsername, trimmedPassword, staySignedIn);
      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message || 'Invalid credentials or server error.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="mb-8 text-4xl font-bold text-white text-center">Sign In</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block mb-2 text-xl text-white">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-xl text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-6 flex items-center">
            <input
              id="staySignedIn"
              type="checkbox"
              className="w-5 h-5 mr-2"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
            />
            <label htmlFor="staySignedIn" className="text-white">
              Stay Signed In
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded text-white font-semibold transition-all duration-200 
              ${loading ? 'bg-green-800 opacity-70 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
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
