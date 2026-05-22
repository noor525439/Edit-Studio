import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData } from '../../context/userContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const spamRegex = /(asdf+|qwerty|zxcvb+|qazwsx|keyboard mash|dwww+|swww+|fwww+|aaaa+|dddd+|ffff+|qqqq+)/i;

const looksLikeSpam = (t) => {
  if (!t) return false;
  const n = t.trim().toLowerCase();
  return spamRegex.test(n) || /([a-zA-Z])\1{4,}/.test(n) || ((n.match(/[a-zA-Z]/g) || []).length / Math.max(n.length, 1)) < 0.35;
};

const validateSupportInput = (data) => {
  const fields = [
    { test: !data.senderName?.trim() || data.senderName.trim().length < 3, msg: 'Name should be at least 3 characters long.' },
    { test: !data.senderEmail?.trim() || !emailRegex.test(data.senderEmail.trim()), msg: 'Please enter a valid email address.' },
    { test: !data.subject?.trim() || data.subject.trim().length < 10, msg: 'Subject should be at least 10 characters.' },
    { test: !data.message?.trim() || data.message.trim().length < 20, msg: 'Message should be at least 20 characters.' },
    { test: looksLikeSpam(data.subject), msg: 'Subject appears to be spam. Please enter a real subject.' },
    { test: looksLikeSpam(data.message), msg: 'Message appears to be spam. Please provide more detail.' }
  ];
  const error = fields.find(f => f.test);
  return error ? { valid: false, message: error.msg } : { valid: true };
};

const ContactAdmin = () => {
  const navigate = useNavigate();
  const { user } = getData() || {};
  const fileInputRef = useRef();
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({ senderName: '', senderEmail: '', subject: '', message: '' });

  const resetForm = () => {
    setFormData({
      senderName: user?.username || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
      senderEmail: user?.email || '', subject: '', message: ''
    });
    setAttachments([]);
  };

  useEffect(() => { if (user) resetForm(); }, [user]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) return (setErrorMsg('Please attach up to 5 files only.'), setStatus('error'));
    if (files.some(f => f.size > 100 * 1024 * 1024)) return (setErrorMsg('File too large. Max size is 100MB.'), setStatus('error'));
    setAttachments(prev => [...prev, ...files.map(f => ({ file: f, name: f.name, size: f.size }))]);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading'); setErrorMsg('');
    const validation = validateSupportInput(formData);
    if (!validation.valid) return (setErrorMsg(validation.message), setStatus('error'));

    const token = localStorage.getItem('accessToken');
    if (!token) return (setErrorMsg('Session expired. Please login again.'), setStatus('error'));

    try {
      const payload = {
        senderName: formData.senderName.trim(), senderEmail: formData.senderEmail.trim(),
        senderRole: user?.role || 'client', subject: formData.subject.trim(), message: formData.message.trim()
      };
      const headers = { Authorization: `Bearer ${token}` };

      if (attachments.length > 0) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
        attachments.forEach(att => fd.append('files', att.file));
        await axios.post(`${API_URL}/api/support/create`, fd, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(`${API_URL}/api/support/create`, payload, { headers });
      }
      setStatus('success'); resetForm();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Unable to submit request.');
      setStatus('error');
    }
  };

  const roleColors = { admin: 'text-red-400 bg-red-400/10 border-red-400/30', editor: 'text-amber-400 bg-amber-400/10 border-amber-400/30', freelancer: 'text-blue-400 bg-blue-400/10 border-blue-400/30', client: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };

  return (
    <section className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#080c14] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg> Back</button>

      <div className="relative z-10 w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8">
          {status === 'success' ? (
            <div className="py-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-slate-400 text-sm mb-8">Your support request has been delivered.</p>
              <button onClick={() => setStatus('idle')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm transition-all">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Contact Admin</h2>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold capitalize ${roleColors[user?.role] || roleColors.client}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />{user?.role || 'client'}
                </div>
              </div>

              {[
                { label: 'Full Name', id: 'senderName', type: 'text', grid: true },
                { label: 'Email', id: 'senderEmail', type: 'email', grid: true },
                { label: 'Subject', id: 'subject', type: 'text', placeholder: 'Brief description...' },
                { label: 'Message', id: 'message', type: 'textarea', placeholder: 'Describe your issue...' }
              ].reduce((acc, input, _, arr) => {
                const el = (
                  <div key={input.id} className={input.grid ? "w-full" : "space-y-2"}>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{input.label}</label>
                    {input.type === 'textarea' ? (
                      <textarea id={input.id} rows={4} value={formData[input.id]} onChange={e => setFormData(p => ({...p, [input.id]: e.target.value}))} placeholder={input.placeholder} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none" />
                    ) : (
                      <input type={input.type} id={input.id} value={formData[input.id]} onChange={e => setFormData(p => ({...p, [input.id]: e.target.value}))} placeholder={input.placeholder} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none" />
                    )}
                  </div>
                );
                if (input.grid) {
                  if (input.id === 'senderName') acc.temp = el;
                  else { acc.rows.push(<div key="row" className="grid grid-cols-1 sm:grid-cols-2 gap-4">{acc.temp}{el}</div>); acc.temp = null; }
                } else acc.rows.push(el);
                return acc;
              }, { rows: [], temp: null }).rows}

              <div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-sm hover:text-white transition-all">📎 Attach files</button>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} className="hidden" />
                <div className="mt-2 space-y-1">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex justify-between bg-white/5 rounded-xl px-4 py-2 text-sm text-white">
                      <span className="truncate">{att.name}</span>
                      <button type="button" onClick={() => setAttachments(p => p.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400 ml-2">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {status === 'error' && errorMsg && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{errorMsg}</p>}
              <button type="submit" disabled={status === 'loading'} className="w-full h-12 bg-indigo-600 disabled:bg-slate-700 text-white rounded-xl font-semibold text-sm transition-all">{status === 'loading' ? 'Sending...' : 'Send Message'}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactAdmin;