import { useState } from 'react';

function ProjectCard({ project, onClick }) {
  const getProgressBarColor = () => {
    if (project.progress >= 100) return 'bg-green-500';
    if (project.progress >= 75) return 'bg-blue-500';
    if (project.progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition duration-200"
    >
      <h2 className="text-xl text-blue-400 font-semibold mb-3">{project.title}</h2>
      
      <div className="mb-3">
        <div className="text-sm text-gray-400">Description:</div>
        <div className="text-white">{project.description}</div>
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-gray-400">Students:</div>
        <div className="text-white">{project.students.map(student => student.username || student).join(', ')}</div>
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-gray-400">Category:</div>
        <div className="text-white">{project.category}</div>
      </div>
      
      <div className="mb-2">
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div 
            className={`${getProgressBarColor()} h-4 rounded-full`} 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-400">{project.progress}%</div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-400">
        <div>{formatDate(project.startDate)}</div>
        <div>{formatDate(project.endDate)}</div>
      </div>
    </div>
  );
}

export default ProjectCard;