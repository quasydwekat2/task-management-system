// src/components/common/LiveProgressBar.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

function LiveProgressBar({ value, max = 100, colorClass = null }) {
  const { isDarkMode } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  
  // Determine color based on progress percentage
  const getColorClass = () => {
    if (colorClass) return colorClass;
    
    const percentage = (value / max) * 100;
    if (percentage >= 100) return 'bg-green-500 dark:bg-green-400';
    if (percentage >= 75) return 'bg-blue-500 dark:bg-blue-400';
    if (percentage >= 50) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  };
  
  useEffect(() => {
    // Animate progress change
    let start = displayValue;
    const end = value;
    const duration = 800; // ms
    
    let startTime = null;
    
    const easeOut = t => 1 - Math.pow(1 - t, 3); // Cubic ease-out
    
    const animate = timestamp => {
      if (!startTime) startTime = timestamp;
      const runtime = timestamp - startTime;
      const relativeProgress = runtime / duration;
      const easedProgress = easeOut(Math.min(relativeProgress, 1));
      
      const newValue = Math.round(start + (end - start) * easedProgress);
      setDisplayValue(newValue);
      
      if (runtime < duration) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, max]);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Progress:</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300">
          {displayValue}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 transition-all duration-300">
        <div 
          className={`${getColorClass()} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${displayValue}%` }}
        ></div>
      </div>
    </div>
  );
}

export default LiveProgressBar;