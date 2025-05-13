import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter both username and password.',
        background: '#1e1e2f',
        color: '#ffffff',
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
        background: '#1e1e2f',
        color: '#ffffff',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] px-4">
      <div className="w-full max-w-md p-8 bg-[#1e293b] rounded-lg shadow-lg border border-[#334155]">
        <h1 className="mb-8 text-4xl font-bold text-white text-center">Sign In</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block mb-2 text-xl text-white">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 bg-[#0f172a] border border-[#334155] rounded focus:outline-none focus:border-[#38bdf8] text-white"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-xl text-white">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 pr-10 bg-[#0f172a] border border-[#334155] rounded focus:outline-none focus:border-[#38bdf8] text-white"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <input
              id="staySignedIn"
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
              className="w-5 h-5 mr-2 accent-[#38bdf8]"
            />
            <label htmlFor="staySignedIn" className="text-white">
              Stay Signed In
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded text-white font-semibold transition-all duration-200 
              ${loading ? 'bg-[#0ea5e9] opacity-70 cursor-not-allowed' : 'bg-[#38bdf8] hover:bg-[#0ea5e9]'}`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/signup" className="text-[#38bdf8] hover:text-[#0ea5e9]">
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
