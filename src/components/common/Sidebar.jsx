import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="w-64 bg-gray-800 min-h-screen">
      <div className="py-6 px-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            {currentUser?.role === 'admin' ? (
              <div className="font-bold text-xl">Admin {currentUser.username}</div>
            ) : (
              <div className="font-bold text-xl">{currentUser?.username}</div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <nav className="mt-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            isActive 
              ? "block py-3 px-4 bg-blue-600 text-white" 
              : "block py-3 px-4 hover:bg-gray-700"
          }
        >
          Home
        </NavLink>
        <NavLink 
          to="/projects" 
          className={({ isActive }) => 
            isActive 
              ? "block py-3 px-4 bg-blue-600 text-white" 
              : "block py-3 px-4 hover:bg-gray-700"
          }
        >
          Projects
        </NavLink>
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => 
            isActive 
              ? "block py-3 px-4 bg-blue-600 text-white" 
              : "block py-3 px-4 hover:bg-gray-700"
          }
        >
          Tasks
        </NavLink>
        <NavLink 
          to="/chat" 
          className={({ isActive }) => 
            isActive 
              ? "block py-3 px-4 bg-blue-600 text-white" 
              : "block py-3 px-4 hover:bg-gray-700"
          }
        >
          Chat
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;