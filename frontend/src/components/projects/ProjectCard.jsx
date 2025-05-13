// import { useState } from 'react';
// import { useTheme } from '../../contexts/ThemeContext';
// import { useAuth } from '../../contexts/AuthContext';
// import StatusBadge from '../common/StatusBadge';

// function ProjectCard({ project, onClick, onDelete }) {
//   const { isDarkMode } = useTheme();
//   const { currentUser } = useAuth();

//   const getProgressBarColor = () => {
//     if (project.progress >= 100) return 'bg-green-500 dark:bg-green-400';
//     if (project.progress >= 75) return 'bg-blue-500 dark:bg-blue-400';
//     if (project.progress >= 50) return 'bg-yellow-500 dark:bg-yellow-400';
//     return 'bg-red-500 dark:bg-red-400';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
//   };
  
//   const handleDelete = (e) => {
//     e.stopPropagation(); // Prevent card click when delete button is clicked
//     onDelete(project._id);
//   };

//   return (
//     <div 
//       onClick={onClick}
//       className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 cursor-pointer hover:shadow-md dark:hover:bg-gray-750 transition-all duration-300"
//     >
//       <div className="flex justify-between items-start mb-3">
//         <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-all duration-300">
//           {project.title}
//         </h3>
//         <div className="flex gap-2 items-center">
//           <StatusBadge status={project.status} />
//           {currentUser.role === 'admin' && (
//             <button
//               onClick={handleDelete}
//               className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-full p-1 transition-all duration-300"
//               title="Delete project"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>
      
//       <div className="mb-3 line-clamp-2">
//         <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Description:</div>
//         <div className="text-gray-800 dark:text-gray-200 transition-all duration-300">{project.description}</div>
//       </div>
      
//       <div className="mb-3">
//         <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Students:</div>
//         <div className="text-gray-800 dark:text-gray-200 transition-all duration-300">
//           {project.students.map(student => student.username || student).join(', ')}
//         </div>
//       </div>
      
//       <div className="mb-3">
//         <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Category:</div>
//         <div className="text-gray-800 dark:text-gray-200 transition-all duration-300">{project.category}</div>
//       </div>
      
//       <div className="mb-4">
//         <div className="flex justify-between items-center mb-1">
//           <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">Progress:</div>
//           <div className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300">{project.progress}%</div>
//         </div>
//         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 transition-all duration-300">
//           <div
//             className={`${getProgressBarColor()} h-2.5 rounded-full transition-all duration-300`}
//             style={{ width: `${project.progress}%` }}
//           ></div>
//         </div>
//       </div>
      
//       <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 transition-all duration-300 border-t border-gray-200 dark:border-gray-700 pt-3">
//         <div>
//           <span className="font-medium">Start:</span> {formatDate(project.startDate)}
//         </div>
//         <div>
//           <span className="font-medium">End:</span> {formatDate(project.endDate)}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProjectCard;

// src/components/projects/ProjectCard.jsx
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../common/StatusBadge';
import LiveProgressBar from '../common/LiveProgressBar';

function ProjectCard({ project, onClick, onDelete }) {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click when delete button is clicked
    onDelete(project._id);
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
        <div className="flex gap-2 items-center">
          <StatusBadge status={project.status} />
          {currentUser.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-full p-1 transition-all duration-300"
              title="Delete project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
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
        {/* Replace the static progress bar with LiveProgressBar */}
        <LiveProgressBar value={project.progress} />
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