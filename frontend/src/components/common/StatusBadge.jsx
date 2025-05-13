// src/components/common/StatusBadge.jsx
import { useTheme } from '../../contexts/ThemeContext';

function StatusBadge({ status }) {
  const { isDarkMode } = useTheme();
  
  // Get styling based on status
  const getBadgeStyles = (status) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-center font-medium text-sm transition-all duration-300 w-full sm:w-auto";
    
    switch(status) {
      case 'In Progress':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800`;
      case 'Pending':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800`;
      case 'Completed':
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800`;
      case 'On Hold':
        return `${baseClasses} bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700`;
      case 'Cancelled':
        return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700`;
    }
  };

  return (
    <span className={getBadgeStyles(status)}>
      {status}
    </span>
  );
}

export default StatusBadge;