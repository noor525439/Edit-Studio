import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getData } from '@/context/userContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUS_MAP = {
  open:         { label: 'Open',        cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  'in-progress':{ label: 'In Progress', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  resolved:     { label: 'Resolved',    cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
  closed:       { label: 'Closed',      cls: 'text-slate-400 bg-white/5 border-white/10' },
};

const PRIORITY_MAP = {
  low:    'text-slate-400 bg-white/5 border-white/10',
  medium: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  high:   'text-orange-400 bg-orange-500/10 border-orange-500/30',
  urgent: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
};

const fmt = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const getSenderInfo = ({ reply, message, currentUser }) => {
  const currentUserId = String(currentUser?._id || '').trim();
  const replyById = String(reply?.replyBy?._id || reply?.replyBy || '').trim();
  const replyRole = String(reply?.replyByRole || reply?.senderRole || message?.senderRole || 'support')
    .trim()
    .toLowerCase();
  const isOwnMessage = currentUserId !== '' && replyById !== '' && currentUserId === replyById;
  return { isOwnMessage, replyRole };
};

const getMessageHeader = ({ reply, message, currentUser }) => {
  const { isOwnMessage, replyRole } = getSenderInfo({ reply, message, currentUser });
  if (isOwnMessage) return 'You';
  const roleLabel = replyRole
    ? replyRole.charAt(0).toUpperCase() + replyRole.slice(1)
    : 'Support';
  return `${roleLabel}`;
};

const getBubbleClasses = (isOwnMessage) => ({
  wrapper: isOwnMessage ? 'flex justify-end pl-8' : 'flex justify-start pr-8',
  bubble: isOwnMessage
    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-md'
    : 'bg-white/5 text-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 border border-white/10',
  header: isOwnMessage
    ? 'text-[10px] font-semibold text-indigo-300 uppercase tracking-wide mb-1'
    : 'text-[10px] font-semibold text-emerald-400 uppercase tracking-wide mb-1',
});

const EmptyState = ({ onNew }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/3 border border-white/10 rounded-2xl shadow-xl">
    <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
      <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl" />
      <div className="relative w-full h-full bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    </div>
    <h3 className="text-white font-semibold text-base mb-1">No support requests yet</h3>
    <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6 leading-relaxed">Submit a ticket and our technical team will review your queries shortly.</p>
    <button onClick={onNew} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all active:scale-95">Create Support Ticket</button>
  </div>
);

const MessageDetail = ({ msg, onClose, onReplySubmitted }) => {
  const { user: currentUser } = getData();
  const repliesEndRef = useRef(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState('');

  useEffect(() => { repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msg.replies]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setSending(true); setReplyError('');
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/api/support/my-messages/${msg._id}/reply`, { message: replyText }, { headers: { Authorization: `Bearer ${token}` } });
      setReplyText('');
      if (onReplySubmitted) onReplySubmitted();
    } catch (error) {
      setReplyError('Failed to send message. Please try again.');
      console.error(error);
    } finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex-1 min-w-0 pr-4">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5 block">Subject Topic</span>
          <h3 className="text-base font-bold text-white truncate leading-snug">{msg.subject}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusBadge status={msg.status} />
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_MAP[msg.priority] || 'text-slate-400 border-white/10'}`}>
              {msg.priority} Priority
            </span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all shrink-0">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scroll pb-2">
        
        <div className="flex justify-end pl-8">
          <div className="max-w-full">
            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-md">
              <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.message}</p>
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-1.5">
              <span className="text-[10px] font-semibold text-indigo-400">You</span>
              <span className="text-slate-600 text-[10px]">•</span>
              <span className="text-slate-500 text-[10px]">{fmt(msg.createdAt)}</span>
            </div>
            {msg.attachments?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 justify-end">
                {msg.attachments.map((att, i) => (
                  <a key={i} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-400 hover:text-indigo-300 hover:bg-white/10 text-[11px] font-medium transition-colors">📎 {att.filename}</a>
                ))}
              </div>
            )}
          </div>
        </div>

        {msg.replies?.length > 0 ? (
          msg.replies.map((reply, i) => {
            const { isOwnMessage } = getSenderInfo({
              reply,
              message: msg,
              currentUser,
            });
            const header = getMessageHeader({
              reply,
              message: msg,
              currentUser,
            });
            const classes = getBubbleClasses(isOwnMessage);

            return (
              <div key={i} className={classes.wrapper}>
                <div className="max-w-full">
                  <p className={classes.header}>{header}</p>
                  <div className={classes.bubble}>
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">
                      {reply.replyMessage}
                    </p>
                  </div>
                  <div className={`mt-1.5 flex items-center gap-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isOwnMessage && <span className="text-[10px] text-emerald-300">•</span>}
                    <span className="text-slate-500 text-[10px]">
                      {fmt(reply.replyedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
              <p className="text-slate-400 text-xs italic">Awaiting admin response…</p>
            </div>
          </div>
        )}
        <div ref={repliesEndRef} />
      </div>

      <div className="mt-2 pt-3 border-t border-white/10">
        {replyError && <p className="text-red-400 text-[11px] font-medium mb-1.5">{replyError}</p>}
        <form onSubmit={handleSendReply} className="flex gap-2 items-end relative">
          <textarea
            value={replyText} onChange={(e) => setReplyText(e.target.value)}
            placeholder={msg.status === 'closed' ? "Ticket is closed" : "Type your message here..."}
            disabled={msg.status === 'closed'} rows={2}
            className="flex-1 text-xs bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:bg-indigo-500/5 rounded-xl px-3 py-2 resize-none outline-none text-white disabled:bg-white/2 disabled:text-slate-600 transition-all custom-scroll"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e); } }}
          />
          <button type="submit" disabled={sending || !replyText.trim() || msg.status === 'closed'} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl text-xs font-semibold h-9 flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-md">
            {sending ? <span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

const MessageCard = ({ msg, isActive, onClick }) => {
  const hasUnread = msg.replies?.some(r => !r.isRead);
  return (
    <button onClick={onClick} className={`w-full text-left p-4 rounded-xl border transition-all relative group outline-none ${isActive ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-black/20' : 'bg-white/2 border-white/10 hover:bg-white/5 hover:border-white/20'}`}>
      {hasUnread && <span className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-indigo-400" />}
      <div className={`flex items-start justify-between gap-3 mb-1.5 ${hasUnread ? 'pl-2' : ''}`}>
        <p className={`text-xs font-bold truncate flex-1 group-hover:text-indigo-400 transition-colors ${isActive ? 'text-white' : 'text-slate-200'}`}>{msg.subject}</p>
        <div className="shrink-0 scale-90 origin-right -mt-0.5"><StatusBadge status={msg.status} /></div>
      </div>
      <p className={`text-slate-400 text-[11px] truncate mb-3 ${hasUnread ? 'pl-2' : ''}`}>{msg.message}</p>
      <div className={`flex items-center justify-between border-t border-white/5 pt-2.5 ${hasUnread ? 'pl-2' : ''}`}>
        <span className="text-[10px] font-semibold text-slate-500">{fmt(msg.createdAt)}</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
          {msg.replies?.length || 0} {msg.replies?.length === 1 ? 'reply' : 'replies'}
        </span>
      </div>
    </button>
  );
};


const MySupport = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const token = localStorage.getItem('accessToken');

  const fetchMessages = React.useCallback(async (isRefreshed = false) => {
    try {
      if (!isRefreshed) setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/api/support/my-messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || [];
      setMessages(data);
      if (data.length > 0) {
        setSelected((prevSelected) =>
          prevSelected
            ? data.find((m) => m._id === prevSelected._id) || data[0]
            : data[0],
        );
      }
    } catch (error) {

      console.error(error);
      setError('Failed to load your messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMessages();
  }, [fetchMessages, navigate, token]);

  return (
    <section className="min-h-screen w-full bg-[#080c14] text-slate-300 p-4 relative overflow-hidden antialiased flex flex-col items-center justify-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

    <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg> Back</button>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
   
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Support Desk</h1>
            <p className="text-slate-500 text-xs mt-0.5">Track active conversations and response history</p>
          </div>
          <button onClick={() => navigate('/contact-admin')} className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95">+ Open New Ticket</button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-400 text-xs font-semibold flex-1">{error}</p>
            <button onClick={() => fetchMessages()} className="text-red-400 hover:text-red-300 text-xs font-bold underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-3.5">{[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-white/2 border border-white/10 animate-pulse" />)}</div>
            <div className="lg:col-span-2 h-[65vh] rounded-xl bg-white/2 border border-white/10 animate-pulse" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState onNew={() => navigate('/contact-admin')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
            <div className={`lg:block ${showDetail ? 'hidden' : 'block'}`}>
              <div className="bg-white/3 border border-white/10 rounded-2xl p-3 space-y-2 max-h-[68vh] overflow-y-auto custom-scroll shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between px-1.5 py-1 mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tickets Inbox</span>
                  <span className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-300">{messages.length} Total</span>
                </div>
                <div className="space-y-2">
                  {messages.map(msg => <MessageCard key={msg._id} msg={msg} isActive={selected?._id === msg._id} onClick={() => { setSelected(msg); setShowDetail(true); }} />)}
                </div>
              </div>
            </div>

           
            <div className={`lg:col-span-2 lg:block ${showDetail ? 'block' : 'hidden'}`}>
              {selected ? (
                <div className="bg-white/3 border border-white/10 rounded-2xl p-5 sm:p-6 h-[68vh] flex flex-col shadow-2xl shadow-black/50 relative">
                  <button onClick={() => setShowDetail(false)} className="lg:hidden flex items-center gap-1.5 text-slate-400 hover:text-white text-[11px] font-bold mb-4 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors w-fit">← Back to Inbox</button>
                  <MessageDetail msg={selected} onClose={() => setShowDetail(false)} onReplySubmitted={() => fetchMessages(true)} />
                </div>
              ) : (
                <div className="bg-white/3 border border-white/10 rounded-2xl flex flex-col items-center justify-center h-[68vh] text-center p-6">
                  <p className="text-slate-500 text-xs">Select a conversation thread from the list to display contents</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </section>
  );
};

export default MySupport;