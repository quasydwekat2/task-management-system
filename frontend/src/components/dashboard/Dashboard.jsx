import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Swal from 'sweetalert2';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    projects: 0,
    students: 0,
    tasks: 0,
    finishedProjects: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch dashboard statistics',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Update the current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format date to show day, date and time with seconds
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    };
    
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    
    const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    
    return `${formattedDate} at ${formattedTime}`;
  };

  // Chart data
  const chartData = {
    labels: ['Projects', 'Students', 'Tasks', 'Completed Projects'],
    datasets: [
      {
        label: 'Count',
        data: [stats.projects, stats.students, stats.tasks, stats.finishedProjects],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue for Projects
          'rgba(234, 179, 8, 0.8)',    // Yellow for Students
          'rgba(249, 115, 22, 0.8)',   // Orange for Tasks
          'rgba(132, 90, 223, 0.8)',   // Purple for Completed Projects
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(132, 90, 223, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options - dynamically set based on theme
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#4b5563',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Dashboard Overview',
        color: isDarkMode ? '#e5e7eb' : '#4b5563',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? '#e5e7eb' : '#1f2937',
        bodyColor: isDarkMode ? '#e5e7eb' : '#1f2937',
        borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)',
        borderWidth: 1
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#4b5563',
          precision: 0
        },
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)'
        }
      },
      x: {
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#4b5563'
        },
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)'
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8 mt-14 lg:mt-0"> {/* Added top margin for mobile header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl text-blue-600 dark:text-blue-500 font-bold mb-4 md:mb-0">
            Task Management Dashboard
          </h1>
          <div className="text-gray-600 dark:text-gray-300 text-lg md:text-xl">
            {formatDate(currentTime)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md transition-colors duration-200">
            <h2 className="text-center text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Projects
            </h2>
            <p className="text-center text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-500">
              {stats.projects}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md transition-colors duration-200">
            <h2 className="text-center text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Students
            </h2>
            <p className="text-center text-3xl md:text-4xl font-bold text-yellow-600 dark:text-yellow-500">
              {stats.students}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md transition-colors duration-200">
            <h2 className="text-center text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Tasks
            </h2>
            <p className="text-center text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-500">
              {stats.tasks}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md transition-colors duration-200">
            <h2 className="text-center text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Completed Projects
            </h2>
            <p className="text-center text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-500">
              {stats.finishedProjects}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-md transition-colors duration-200">
          <div className="h-52 md:h-64 lg:h-72">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;