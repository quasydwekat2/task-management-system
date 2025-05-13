import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

function ChatPage() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to socket.io server
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token') || sessionStorage.getItem('token')
      }
    });
    
    setSocket(newSocket);
    
    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });
    
    newSocket.on('message', (message) => {
      if ((currentUser.role === 'admin' && message.recipientId === currentUser._id && message.senderId === selectedStudent?._id) ||
          (currentUser.role === 'student' && message.recipientId === currentUser._id) ||
          (message.senderId === currentUser._id && message.recipientId === selectedStudent?._id)) {
        setMessages(prev => [...prev, message]);
      }
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Failed to connect to the chat server. Please try again later.',
      });
    });
    
    // Fetch students or chat history based on role
    if (currentUser.role === 'admin') {
      fetchStudents();
    } else {
      fetchChatWithAdmin();
    }
    
    return () => {
      // Disconnect socket on component unmount
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when selected student changes
  useEffect(() => {
    if (selectedStudent) {
      fetchMessages(selectedStudent._id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/students', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load students. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChatWithAdmin = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Fetch admin user
      const res = await axios.get('http://localhost:5000/api/users/admin', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Set admin as the selected "student" for student users
      setSelectedStudent(res.data);
      setStudents([res.data]);
      
      // Fetch messages with admin
      fetchMessages(res.data._id);
    } catch (error) {
      console.error('Error fetching admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load chat. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (recipientId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/messages/${recipientId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load messages. Please try again.',
      });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedStudent) return;
    
    const messageData = {
      content: newMessage,
      recipientId: selectedStudent._id,
      senderId: currentUser._id,
      timestamp: new Date()
    };
    
    // Emit message via socket
    socket.emit('sendMessage', messageData);
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, messageData]);
    
    // Clear input
    setNewMessage('');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      <div className="flex-1 flex h-screen">
        {/* Students list (only for admin) */}
        {currentUser.role === 'admin' && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <h2 className="p-4 text-xl font-bold border-b border-gray-700">List of Students</h2>
            <div className="divide-y divide-gray-700">
              {students.length > 0 ? (
                students.map(student => (
                  <div 
                    key={student._id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 cursor-pointer hover:bg-gray-750 ${selectedStudent?._id === student._id ? 'bg-gray-750' : ''}`}
                  >
                    {student.username}
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-400">No students found</div>
              )}
            </div>
          </div>
        )}
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedStudent ? (
            <>
              <div className="p-4 bg-gray-800 border-b border-gray-700">
                <h2 className="text-xl font-bold">
                  Chatting with {selectedStudent.username}...
                </h2>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-gray-850">
                <div className="flex flex-col space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.senderId === currentUser._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === currentUser._id 
                              ? 'bg-green-600 text-white rounded-br-none' 
                              : 'bg-gray-700 text-white rounded-bl-none'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs text-gray-300 mt-1 text-right">
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <form onSubmit={sendMessage} className="p-4 bg-gray-800 border-t border-gray-700 flex">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l focus:outline-none focus:border-blue-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-400 text-xl">
                {currentUser.role === 'admin' 
                  ? 'Select a student to start chatting' 
                  : 'No admin available to chat with'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;