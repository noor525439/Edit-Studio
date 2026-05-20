import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Pehle wale import { UserContext } ko hata kar yeh likhein
import { getData } from '../context/userContext';
import axios from 'axios';

const ContactAdmin = () => {
  const navigate = useNavigate();
  const { user } = getData() || {};
  const fileInputRef = useRef();
  const [status, setStatus] = useState('idle');
  const [formData, setFormData] = useState({ 
    senderName: '', 
    senderEmail: '', 
    subject: '',
    message: '' 
  });
  const [attachments, setAttachments] = useState([]);
  const [userRole, setUserRole] = useState('client');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        senderName: user.firstName + ' ' + user.lastName || '',
        senderEmail: user.email || ''
      }));
      setUserRole(user.role || 'client');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size
    }));
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const submitData = {
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        senderRole: userRole,
        subject: formData.subject,
        message: formData.message,
        attachments: []
      };

      // Handle file uploads
      if (attachments.length > 0) {
        const formDataWithFiles = new FormData();
        formDataWithFiles.append('senderName', submitData.senderName);
        formDataWithFiles.append('senderEmail', submitData.senderEmail);
        formDataWithFiles.append('senderRole', submitData.senderRole);
        formDataWithFiles.append('subject', submitData.subject);
        formDataWithFiles.append('message', submitData.message);
        
        attachments.forEach(att => {
          formDataWithFiles.append('files', att.file);
        });

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/support/create,
        }`,  
          formDataWithFiles,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );

        setStatus('success');
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/support/create`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );

        setStatus('success');
      }

      setFormData({ 
        senderName: user?.firstName + ' ' + user?.lastName || '', 
        senderEmail: user?.email || '',
        subject: '',
        message: '' 
      });
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting support message:', error);
      setStatus('error');
    }
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center p-6 relative bg-[#0f172a] overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Aesthetic Back Navigation */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 z-20 group flex items-center gap-3 py-2 px-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-slate-300 hover:text-white transition-all duration-300"
      >
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-black group-hover:bg-indigo-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-wide">Return Home</span>
      </button>

      {/* The Glass Card */}
      <div className="relative z-10 w-full max-w-xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-[1px]">
        <div className="bg-[#0f172a]/80 rounded-[39px] p-8 md:p-14">
          
          {status === 'success' ? (
            <div className="py-10 text-center animate-in zoom-in-95 duration-500">
              <div className="relative w-24 h-24 mx-auto mb-8">
                 <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-40 animate-pulse"></div>
                 <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">Transmission Received</h3>
              <p className="text-slate-400 mt-4 leading-relaxed">Your message has been safely delivered to our admin team. We'll be in touch soon.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-10 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative">
              <header className="mb-12">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                  Support System
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                  Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Support.</span>
                </h2>
                <p className="text-slate-400 mt-4">Your role: <span className="text-indigo-400 font-semibold capitalize">{userRole}</span></p>
              </header>

              <div className="space-y-6">
                {/* Name Field */}
                <div className="relative group">
                  <input
                    type="text"
                    id="senderName"
                    placeholder=" "
                    value={formData.senderName}
                    onChange={handleInputChange}
                    disabled
                    className="peer w-full bg-transparent border-b border-white/10 py-3 text-white outline-none disabled:text-slate-400 transition-all duration-500"
                    required
                  />
                  <label className="absolute left-0 top-3 text-slate-500 uppercase text-[10px] font-bold tracking-widest transition-all duration-500 peer-focus:-top-6 peer-focus:text-indigo-400">
                    Full Name
                  </label>
                </div>

                {/* Email Field */}
                <div className="relative group">
                  <input
                    type="email"
                    id="senderEmail"
                    placeholder=" "
                    value={formData.senderEmail}
                    onChange={handleInputChange}
                    disabled
                    className="peer w-full bg-transparent border-b border-white/10 py-3 text-white outline-none disabled:text-slate-400 transition-all duration-500"
                    required
                  />
                  <label className="absolute left-0 top-3 text-slate-500 uppercase text-[10px] font-bold tracking-widest transition-all duration-500 peer-focus:-top-6 peer-focus:text-indigo-400">
                    Email Address
                  </label>
                </div>

                {/* Subject Field */}
                <div className="relative group">
                  <input
                    type="text"
                    id="subject"
                    placeholder=" "
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="peer w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-indigo-400 transition-all duration-500"
                    required
                  />
                  <label className="absolute left-0 top-3 text-slate-500 uppercase text-[10px] font-bold tracking-widest transition-all duration-500 peer-focus:-top-6 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:-top-6">
                    Subject
                  </label>
                </div>

                {/* Message Field */}
                <div className="relative group">
                  <textarea
                    id="message"
                    rows="4"
                    placeholder=" "
                    value={formData.message}
                    onChange={handleInputChange}
                    className="peer w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-indigo-400 transition-all duration-500 resize-none"
                    required
                  ></textarea>
                  <label className="absolute left-0 top-3 text-slate-500 uppercase text-[10px] font-bold tracking-widest transition-all duration-500 peer-focus:-top-6 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:-top-6">
                    Your Message
                  </label>
                </div>

                {/* File Upload */}
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-lg text-indigo-300 hover:bg-indigo-500/30 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Attach Files (Images, Videos, Docs)
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                  />

                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((att, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-white">{att.name}</span>
                            <span className="text-xs text-slate-400">({(att.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12">
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full group relative flex items-center justify-center gap-3 h-14 bg-white text-[#0f172a] rounded-xl font-bold text-base overflow-hidden transition-all duration-500 hover:gap-4 active:scale-95 disabled:bg-slate-700"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 group-hover:text-white transition-colors">
                    {status === 'loading' ? 'Sending...' : 'Send Support Request'}
                  </span>
                  {status !== 'loading' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactAdmin;