import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const ContactAdmin = () => {
  const navigate = useNavigate();
  const formRef = useRef();
  const [status, setStatus] = useState('idle');
  const [formData, setFormData] = useState({ name: '', email: '', other_message: '' });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    emailjs.sendForm('service_glfjnjs', 'template_3cisn0q', formRef.current, 'AZL2sk8_nnNeGQVt5')
      .then(() => {
        setStatus('success');
        setFormData({ name: '', email: '', other_message: '' });
      }, () => setStatus('error'));
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
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
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
            <form ref={formRef} onSubmit={handleSubmit} className="relative">
              <header className="mb-12">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                  Contact Studio
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                  Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Touch.</span>
                </h2>
              </header>

              <div className="space-y-10">
                {/* Field Group */}
                {[
                  { id: 'name', label: 'Full Name', type: 'text', name: 'from_name' },
                  { id: 'email', label: 'Email Address', type: 'email', name: 'reply_to' }
                ].map((field) => (
                  <div key={field.id} className="relative group">
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.name}
                      placeholder=" "
                      value={formData[field.id]}
                      onChange={handleInputChange}
                      className="peer w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-indigo-400 transition-all duration-500"
                      required
                    />
                    <label className="absolute left-0 top-3 text-slate-500 uppercase text-[10px] font-bold tracking-widest transition-all duration-500 peer-focus:-top-6 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:-top-6">
                      {field.label}
                    </label>
                  </div>
                ))}

                {/* Message Field */}
                <div className="relative group">
                  <textarea
                    id="other_message"
                    name="message"
                    rows="3"
                    placeholder=" "
                    value={formData.other_message}
                    onChange={handleInputChange}
                    className="peer w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-indigo-400 transition-all duration-500 resize-none"
                    required
                  ></textarea>
                  <label className="absolute left-0 top-3 text-slate-500 uppercase text-[10px] font-bold tracking-widest transition-all duration-500 peer-focus:-top-6 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:-top-6">
                    How can we help?
                  </label>
                </div>
              </div>

              <div className="mt-16">
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full group relative flex items-center justify-center gap-3 h-16 bg-white text-[#0f172a] rounded-2xl font-black text-lg overflow-hidden transition-all duration-500 hover:gap-6 active:scale-95 disabled:bg-slate-700"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 group-hover:text-white transition-colors">
                    {status === 'loading' ? 'Encrypting...' : 'Dispatch Message'}
                  </span>
                  {!status === 'loading' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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