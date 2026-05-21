import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminMessages.css';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    searchTerm: ''
  });
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [messagePage, setMessagePage] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
 // Line 13 - change karo
const authToken = localStorage.getItem('accessToken'); // ✅

  // Fetch all support messages
  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
      params.append('page', page);
      params.append('limit', 10);

      const response = await axios.get(
        `${API_URL}/api/support?${params.toString()}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
              console.log(Object.keys(localStorage))
console.log(localStorage.getItem('authToken'))

      setMessages(response.data.data);
      setMessagePage(page);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/support/stats/dashboard`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filters]);

  // Handle reply submission
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      setReplyLoading(true);
      const response = await axios.put(
        `${API_URL}/api/support/${selectedMessage._id}/reply`,
        { replyMessage: replyText },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setSelectedMessage(response.data.data);
      setReplyText('');
      fetchMessages(messagePage);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  // Update message status
  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/support/${selectedMessage._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setSelectedMessage(response.data.data);
      fetchMessages(messagePage);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Update priority
  const handlePriorityChange = async (newPriority) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/support/${selectedMessage._id}/priority`, 
        { priority: newPriority },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setSelectedMessage(response.data.data);
      fetchMessages(messagePage);
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-blue-50 text-blue-600 border-blue-200',
      'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'resolved': 'bg-green-50 text-green-600 border-green-200',
      'closed': 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return colors[status] || colors['open'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-50 text-green-600',
      'medium': 'bg-blue-50 text-blue-600',
      'high': 'bg-orange-50 text-orange-600',
      'urgent': 'bg-red-50 text-red-600'
    };
    return colors[priority] || colors['medium'];
  };

  return (
    <div className="admin-messages-container min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Support Messages</h1>
          <p className="text-slate-500">Manage customer support requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="text-slate-500 text-sm">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total || 0}</p>
          </div>
          <div className=" border border-blue-200 rounded-lg p-4 shadow-sm">
            <p className="text-blue-600 text-sm">Open</p>
            <p className="text-2xl font-bold text-blue-700">{stats.open || 0}</p>
          </div>
          <div className=" border border-yellow-200 rounded-lg p-4 shadow-sm">
            <p className="text-yellow-700 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.inProgress || 0}</p>
          </div>
          <div className=" border border-green-200 rounded-lg p-4 shadow-sm">
            <p className="text-green-600 text-sm">Resolved</p>
            <p className="text-2xl font-bold text-green-700">{stats.resolved || 0}</p>
          </div>
          <div className="border border-red-200 rounded-lg p-4 shadow-sm">
            <p className="text-red-600 text-sm">Unread</p>
            <p className="text-2xl font-bold text-red-700">{stats.unread || 0}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            {/* Filters */}
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Search messages..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value, })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Messages */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <p className="text-slate-500 text-center py-8">Loading...</p>
              ) : messages.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No messages found</p>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg._id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-3 rounded cursor-pointer transition-all ${
                      selectedMessage?._id === msg._id
                        ? 'bg-indigo-50 border border-indigo-400'
                        : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{msg.senderName}</p>
                        <p className="text-slate-500 text-xs truncate">{msg.subject}</p>
                        <div className="mt-2 flex gap-1">
                          <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(msg.status)}`}>
                            {msg.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(msg.priority)}`}>
                            {msg.priority}
                          </span>
                        </div>
                      </div>
                      {!msg.isReadByAdmin && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedMessage.subject}</h2>
                      <p className="text-slate-700 font-medium">{selectedMessage.senderName}</p>
                      <p className="text-slate-500 text-sm">{selectedMessage.senderEmail}</p>
                      <p className="text-slate-500 text-sm capitalize">Role: {selectedMessage.senderRole}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded border ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={selectedMessage.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Original Message */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Original Message</h3>
                  <p className="text-slate-750 whitespace-pre-wrap text-slate-800">{selectedMessage.message}</p>
                  <p className="text-slate-400 text-sm mt-3">
                    Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>

                  {/* Attachments */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-slate-500 text-sm mb-2">Attachments:</p>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                          >
                            📎 {att.filename}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Replies */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-3">Replies</h3>
                    <div className="space-y-4">
                      {selectedMessage.replies.map((reply, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded p-4">
                          <p className="font-semibold text-slate-700 text-sm">Admin Reply</p>
                          <p className="text-slate-800 mt-2 whitespace-pre-wrap">{reply.replyMessage}</p>
                          <p className="text-slate-400 text-xs mt-2">
                            {new Date(reply.replyedAt).toLocaleString()}
                          </p>
                          {reply.attachments && reply.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {reply.attachments.map((att, attIdx) => (
                                <a
                                  key={attIdx}
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-indigo-600 text-xs font-medium"
                                >
                                  📎 {att.filename}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Send Reply</h3>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-slate-900 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows="4"
                  ></textarea>
                  <button
                    onClick={handleSendReply}
                    disabled={replyLoading || !replyText.trim()}
                    className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded font-semibold transition-colors"
                  >
                    {replyLoading ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center justify-center min-h-[400px] shadow-sm">
                <p className="text-slate-400">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;