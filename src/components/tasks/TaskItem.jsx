// File: src/components/tasks/TaskItem.jsx
import { useState } from 'react';
import Swal from 'sweetalert2';

function TaskItem({ task, projectTitle, isAdmin, onStatusChange, showProjectTitle = false }) {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-green-400';
      case 'In Progress':
        return 'text-blue-400';
      case 'Pending':
        return 'text-yellow-400';
      case 'On Hold':
        return 'text-gray-400';
      case 'Cancelled':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleStatusChange = (newStatus) => {
    Swal.fire({
      title: 'Change Task Status',
      text: `Are you sure you want to change this task's status to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!'
    }).then((result) => {
      if (result.isConfirmed) {
        onStatusChange(task._id, newStatus);
        setStatusDropdownOpen(false);
      }
    });
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-750">
      <td className="px-4 py-3">{task.taskId || task._id?.substring(0, 6) || 'N/A'}</td>
      {showProjectTitle && <td className="px-4 py-3">{projectTitle}</td>}
      <td className="px-4 py-3">{task.name}</td>
      <td className="px-4 py-3">{task.description}</td>
      <td className="px-4 py-3">{task.assignedTo?.username || 'Unassigned'}</td>
      <td className="px-4 py-3">
        <span className={`${getStatusColor(task.status)} font-medium`}>{task.status}</span>
      </td>
      <td className="px-4 py-3">{formatDate(task.dueDate)}</td>
      {isAdmin && (
        <td className="px-4 py-3 relative">
          <button 
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
          >
            Change Status
          </button>
          
          {statusDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button 
                  onClick={() => handleStatusChange('Pending')}
                  className="block w-full text-left px-4 py-2 text-yellow-400 hover:bg-gray-700"
                >
                  Pending
                </button>
                <button 
                  onClick={() => handleStatusChange('In Progress')}
                  className="block w-full text-left px-4 py-2 text-blue-400 hover:bg-gray-700"
                >
                  In Progress
                </button>
                <button 
                  onClick={() => handleStatusChange('Completed')}
                  className="block w-full text-left px-4 py-2 text-green-400 hover:bg-gray-700"
                >
                  Completed
                </button>
                <button 
                  onClick={() => handleStatusChange('On Hold')}
                  className="block w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-700"
                >
                  On Hold
                </button>
                <button 
                  onClick={() => handleStatusChange('Cancelled')}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700"
                >
                  Cancelled
                </button>
              </div>
            </div>
          )}
        </td>
      )}
    </tr>
  );
}

export default TaskItem;