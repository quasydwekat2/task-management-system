// import { useState } from 'react';

// function ProjectCard({ project, onClick }) {
//   const getProgressBarColor = () => {
//     if (project.progress >= 100) return 'bg-green-500';
//     if (project.progress >= 75) return 'bg-blue-500';
//     if (project.progress >= 50) return 'bg-yellow-500';
//     return 'bg-red-500';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
//   };

//   return (
//     <div 
//       onClick={onClick}
//       className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition duration-200"
//     >
//       <h2 className="text-xl text-blue-400 font-semibold mb-3">{project.title}</h2>
      
//       <div className="mb-3">
//         <div className="text-sm text-gray-400">Description:</div>
//         <div className="text-white">{project.description}</div>
//       </div>
      
//       <div className="mb-3">
//         <div className="text-sm text-gray-400">Students:</div>
//         <div className="text-white">{project.students.map(student => student.username || student).join(', ')}</div>
//       </div>
      
//       <div className="mb-3">
//         <div className="text-sm text-gray-400">Category:</div>
//         <div className="text-white">{project.category}</div>
//       </div>
      
//       <div className="mb-2">
//         <div className="w-full bg-gray-700 rounded-full h-4">
//           <div 
//             className={`${getProgressBarColor()} h-4 rounded-full`} 
//             style={{ width: `${project.progress}%` }}
//           ></div>
//         </div>
//         <div className="text-right text-sm text-gray-400">{project.progress}%</div>
//       </div>
      
//       <div className="flex justify-between text-sm text-gray-400">
//         <div>{formatDate(project.startDate)}</div>
//         <div>{formatDate(project.endDate)}</div>
//       </div>
//     </div>
//   );
// }

// export default ProjectCard;

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import StatusBadge from '../common/StatusBadge';

function ProjectCard({ project, onClick }) {
  const { isDarkMode } = useTheme();

  const getProgressBarColor = () => {
    if (project.progress >= 100) return 'bg-green-500 dark:bg-green-400';
    if (project.progress >= 75) return 'bg-blue-500 dark:bg-blue-400';
    if (project.progress >= 50) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 cursor-pointer hover:shadow-md dark:hover:bg-gray-750 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-all duration-300">
          {project.title}
        </h3>
        <StatusBadge status={project.status} />
      </div>
      
      <div className="mb-3 line-clamp-2">
        <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Description:</div>
        <div className="text-gray-800 dark:text-gray-200 transition-all duration-300">{project.description}</div>
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Students:</div>
        <div className="text-gray-800 dark:text-gray-200 transition-all duration-300">
          {project.students.map(student => student.username || student).join(', ')}
        </div>
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Category:</div>
        <div className="text-gray-800 dark:text-gray-200 transition-all duration-300">{project.category}</div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Progress:</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300">{project.progress}%</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 transition-all duration-300">
          <div
            className={`${getProgressBarColor()} h-2.5 rounded-full transition-all duration-300`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 transition-all duration-300 border-t border-gray-200 dark:border-gray-700 pt-3">
        <div>
          <span className="font-medium">Start:</span> {formatDate(project.startDate)}
        </div>
        <div>
          <span className="font-medium">End:</span> {formatDate(project.endDate)}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;