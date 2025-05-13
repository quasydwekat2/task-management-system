import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
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

    // Update the current time every second instead of every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Changed from 60000 to 1000 for 1-second updates

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
    
    // Get the formatted date
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    // Get time with seconds for live updating time
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert hours to 12-hour format
    const formattedHours = hours % 12 || 12;
    
    // Add leading zeros to minutes and seconds
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    
    // Combine time components
    const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    
    return `${formattedDate} at ${formattedTime}`;
  };

  // Chart configuration
  const chartData = {
    labels: ['Number of Projects', 'Number of Students', 'Number of Tasks', 'Number of Finished Projects'],
    datasets: [
      {
        label: 'Count',
        data: [stats.projects, stats.students, stats.tasks, stats.finishedProjects],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',   // Blue for Projects
          'rgba(153, 102, 0, 0.8)',    // Dark yellow for Students
          'rgba(153, 51, 0, 0.8)',     // Brown for Tasks
          'rgba(153, 0, 153, 0.8)',    // Purple for Finished Projects
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 0, 1)',
          'rgba(153, 51, 0, 1)',
          'rgba(153, 0, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff'
        }
      },
      title: {
        display: true,
        text: 'Admin Dashboard Overview',
        color: '#fff',
        font: {
          size: 18
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff',
          precision: 0 // Only show whole numbers
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl text-blue-500 font-bold mb-4 md:mb-0">Welcome to the Task Management System</h1>
          <div className="text-gray-300 text-3xl">{formatDate(currentTime)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-center text-xl font-semibold mb-2">Number of Projects</h2>
            <p className="text-center text-5xl font-bold">{stats.projects}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-center text-xl font-semibold mb-2">Number of Students</h2>
            <p className="text-center text-5xl font-bold">{stats.students}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-center text-xl font-semibold mb-2">Number of Tasks</h2>
            <p className="text-center text-5xl font-bold">{stats.tasks}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-center text-xl font-semibold mb-2">Number of Finished Projects</h2>
            <p className="text-center text-5xl font-bold">{stats.finishedProjects}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {/* <h2 className="text-xl font-semibold mb-4">Admin Dashboard Overview</h2> */}
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;