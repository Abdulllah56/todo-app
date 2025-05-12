"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, X, Edit, CheckCircle, Circle, Calendar, Clock } from 'lucide-react';

// Main component
export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [deletedTask, setDeletedTask] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    // Add fade-in effect
    setFadeIn(true);
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Auto-hide undo notification after 5 seconds
  useEffect(() => {
    let timer;
    if (showUndo) {
      timer = setTimeout(() => {
        setShowUndo(false);
        setDeletedTask(null);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showUndo]);

  // Separate active and completed tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  // Add new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newTaskObj = {
        id: Date.now(),
        text: newTask,
        completed: false,
        createdAt: new Date(),
        dueDate: dueDate || null
      };
      
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
      setDueDate('');
    }
  };

  // Toggle task completion status
  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete task
  const deleteTask = (id) => {
    const taskToDelete = tasks.find(task => task.id === id);
    setDeletedTask(taskToDelete);
    setTasks(tasks.filter(task => task.id !== id));
    setShowUndo(true);
  };

  // Undo delete
  const undoDelete = () => {
    if (deletedTask) {
      setTasks([...tasks, deletedTask]);
      setShowUndo(false);
      setDeletedTask(null);
    }
  };

  // Start editing task
  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  // Save edited task
  const saveEdit = () => {
    if (editText.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingTask ? { ...task, text: editText } : task
      ));
    }
    setEditingTask(null);
  };

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Determine if task is due soon (within next 2 days)
  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    
    const due = new Date(dueDate);
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    
    return due <= twoDaysFromNow && due >= now;
  };

  // Check if a task is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    
    const due = new Date(dueDate);
    const now = new Date();
    due.setHours(23, 59, 59, 999); // End of the due date
    
    return due < now;
  };

  return (
    <div className={`min-h-screen bg-navy-900 text-blue-50 font-sans transition-all duration-700 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto p-4 md:p-6 max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-blue-400">Task Manager</h1>
          <p className="text-blue-300">Organize your day, accomplish more</p>
        </header>

        {/* Task Input Form */}
        <form 
          onSubmit={handleAddTask} 
          className="bg-navy-800 p-4 rounded-lg shadow-lg mb-6 transition-all hover:shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full p-3 rounded-lg bg-navy-700 border border-blue-700 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-40 text-blue-50 placeholder-blue-400 transition-all outline-none"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="p-3 rounded-lg bg-navy-700 border border-blue-700 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-40 text-blue-50 outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 p-3 rounded-lg flex items-center justify-center min-w-16 hover:bg-blue-500 active:bg-blue-700 transition-all duration-200 text-white"
              >
                <PlusCircle size={20} className="mr-1" /> Add
              </button>
            </div>
          </div>
        </form>

        {/* Main Task Lists */}
        <div className="space-y-6">
          {/* Active Tasks */}
          <section className="bg-navy-800 rounded-lg p-4 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center">
              <Clock size={18} className="mr-2" /> Active Tasks
            </h2>
            
            {activeTasks.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-blue-300">
                <CheckCircle size={48} className="mb-3 opacity-50" />
                <p>No active tasks. Add something to get started!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {activeTasks.map(task => (
                  <li 
                    key={task.id} 
                    className="bg-navy-700 p-3 rounded-lg flex items-center justify-between group hover:bg-navy-600 transition-all duration-200"
                  >
                    {editingTask === task.id ? (
                      <div className="flex-grow flex items-center">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-grow p-2 rounded bg-navy-600 border border-blue-600 text-blue-50 outline-none"
                          autoFocus
                        />
                        <button 
                          onClick={saveEdit}
                          className="ml-2 text-blue-400 hover:text-blue-300"
                        >
                          <CheckCircle size={20} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center flex-grow">
                          <button 
                            onClick={() => toggleComplete(task.id)}
                            className="text-blue-400 hover:text-blue-300 mr-2 focus:outline-none"
                          >
                            <Circle size={20} />
                          </button>
                          <span className="flex-grow">{task.text}</span>
                          
                          {task.dueDate && (
                            <span 
                              className={`text-xs px-2 py-1 rounded-full ml-2 flex items-center whitespace-nowrap
                                ${isOverdue(task.dueDate) ? 'bg-red-900 text-red-100' : 
                                  isDueSoon(task.dueDate) ? 'bg-yellow-900 text-yellow-100' : 'bg-blue-900 text-blue-100'}`}
                            >
                              <Calendar size={12} className="mr-1" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(task)}
                            className="p-1 text-blue-400 hover:text-blue-300 focus:outline-none"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-blue-400 hover:text-red-400 focus:outline-none"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <section className="bg-navy-800 rounded-lg p-4 shadow-lg transition-all">
              <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center">
                <CheckCircle size={18} className="mr-2" /> Completed Tasks
              </h2>
              <ul className="space-y-2">
                {completedTasks.map(task => (
                  <li 
                    key={task.id} 
                    className="bg-navy-700 p-3 rounded-lg flex items-center justify-between group hover:bg-navy-600 transition-all duration-200 opacity-70"
                  >
                    <div className="flex items-center flex-grow">
                      <button 
                        onClick={() => toggleComplete(task.id)}
                        className="text-green-400 hover:text-green-300 mr-2 focus:outline-none"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <span className="line-through flex-grow">{task.text}</span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-blue-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Undo Delete Notification */}
        {showUndo && (
          <div className="fixed bottom-4 right-4 bg-blue-600 p-3 rounded-lg shadow-lg flex items-center animate-slide-up">
            <span>Task deleted</span>
            <button 
              onClick={undoDelete}
              className="ml-3 bg-blue-500 px-3 py-1 rounded hover:bg-blue-400 transition-colors"
            >
              Undo
            </button>
            <button 
              onClick={() => setShowUndo(false)}
              className="ml-2 text-blue-300 hover:text-blue-100"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      
      
       
      
    </div>
  );
}