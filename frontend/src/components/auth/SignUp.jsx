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

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedUniversityId = universityId.trim();

    if (!trimmedUsername || !trimmedPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Username and Password are required.'
      });
      setLoading(false);
      return;
    }

    if (isStudent && !trimmedUniversityId) {
      Swal.fire({
        icon: 'error',
        title: 'Missing University ID',
        text: 'Please enter your University ID.'
      });
      setLoading(false);
      return;
    }

    const userData = {
      username: trimmedUsername,
      password: trimmedPassword,
      role: isStudent ? 'student' : 'admin',
      ...(isStudent && { universityId: trimmedUniversityId })
    };

    try {
      await register(userData);
      Swal.fire({
        icon: 'success',
        title: 'Account Created',
        text: 'You can now sign in!',
        confirmButtonText: 'Continue'
      }).then(() => navigate('/signin'));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Sign Up Failed',
        text: err.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="mb-8 text-4xl font-bold text-white text-center">Sign Up</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block mb-2 text-xl text-white">Username</label>
            <input
              id="username"
              type="text"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-xl text-white">Password</label>
            <input
              id="password"
              type="password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-6 flex items-center">
            <input
              id="isStudent"
              type="checkbox"
              className="w-5 h-5 mr-2"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
            />
            <label htmlFor="isStudent" className="text-white">I am a student</label>
          </div>

          {isStudent && (
            <div className="mb-6">
              <label htmlFor="universityId" className="block mb-2 text-xl text-white">University ID</label>
              <input
                id="universityId"
                type="text"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 text-white rounded font-semibold transition duration-200 
              ${loading ? 'bg-green-800 opacity-70 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
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
