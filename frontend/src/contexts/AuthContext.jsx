import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        setCurrentUser(res.data);
      })
      .catch(err => {
        localStorage.removeItem('token');
        console.error("Auth error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password, staySignedIn = false) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      
      const { token, user } = res.data;
      
      if (staySignedIn) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      setCurrentUser(user);
      
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back, ${user.username}!`,
        timer: 1500,
        showConfirmButton: false
      });
      
      return user;
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'An error occurred during login'
      });
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'You can now log in with your credentials',
        timer: 2000,
        showConfirmButton: false
      });
      
      return res.data;
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'An error occurred during registration'
      });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setCurrentUser(null);
    
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been successfully logged out',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}