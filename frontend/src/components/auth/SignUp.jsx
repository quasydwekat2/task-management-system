import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [universityId, setUniversityId] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isStudent && !universityId) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please enter your University ID'
      });
      setLoading(false);
      return;
    }
    
    const userData = {
      username,
      password,
      role: isStudent ? 'student' : 'admin',
      ...(isStudent && universityId && { universityId })
    };
    
    try {
      await register(userData);
      navigate('/signin');
    } catch (err) {
      // Error handling in register function with SweetAlert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg">
        <h1 className="mb-8 text-4xl font-bold text-white text-center">Sign Up</h1>
        
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
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
            />
            <label className="text-white">I am a student</label>
          </div>
          
          {isStudent && (
            <div className="mb-6">
              <label className="block mb-2 text-xl text-white">University ID</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none disabled:bg-green-800 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/signin" className="text-blue-400 hover:text-blue-300">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;