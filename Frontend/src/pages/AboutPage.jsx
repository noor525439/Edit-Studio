import React from 'react';
import { ArrowLeft, Code2, Layout, BookOpen, Fingerprint, ExternalLink, Sparkles } from 'lucide-react';

const AboutPage = () => {
  const team = [
    { 
      name: "WASEEQ NIAZ", 
      role: "Project Leader", 
      specialty: "Full-Stack Management",
      color: "from-cyan-500",
      bio: "The central architect managing both frontend and backend systems, ensuring seamless integration and project delivery." 
    },
    { 
      name: "ZAKA HAIDER", 
      role: "Lead Frontend Developer", 
      specialty: "UI Architecture",
      color: "from-blue-500",
      bio: "Dedicated to the frontend experience, focusing on crafting responsive, high-performance interfaces." 
    },
    { 
      name: "SAAD MEHMOOD", 
      role: "Documentation Specialist", 
      specialty: "System Research",
      color: "from-indigo-500",
      bio: "Leading the research and documentation efforts to ensure the project meets University of Punjab's high academic standards." 
    }
  ];

  return (
    <div className="bg-[#030712] text-slate-300 min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full animate-bounce duration-[10s]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center">
        <button 
          onClick={() => window.location.href = '/'}
          className="group flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full hover:bg-white/10 transition-all duration-300 shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Return</span>
        </button>
        <div className="text-white font-black tracking-tighter text-xl">ES<span className="text-cyan-500">.</span></div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8 animate-fade-in">
            <Sparkles size={12} /> University of the Punjab FYP
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-black mb-12 tracking-tighter text-white leading-[0.75]">
            EDIT<br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 animate-gradient-x">
              STUDIO
            </span>
          </h1>

          <div className="grid md:grid-cols-2 gap-12 items-end">
            <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed">
              We are a collective of developers pushing the boundaries of <span className="text-white font-normal underline decoration-cyan-500 underline-offset-4">Cloud Media Management</span> using the MERN stack.
            </p>
            <div className="flex flex-col items-start md:items-end">
              <span className="text-slate-600 font-mono text-sm uppercase tracking-widest mb-2 font-bold">Project Status</span>
              <span className="text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                Active Development
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Team Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
            <h2 className="text-5xl font-bold text-white tracking-tight">The Organizers</h2>
            <p className="text-slate-500 font-mono tracking-tighter">03 Individuals / Infinite Vision</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="group relative bg-white/[0.03] border border-white/5 p-8 rounded-3xl overflow-hidden transition-all duration-700 hover:border-white/20 hover:bg-white/[0.05]"
              >
                {/* Spotlight effect */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-20 blur-[50px] transition-opacity duration-700`}></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                      {member.name === "WASEEQ NIAZ" && <Fingerprint className="text-cyan-400" />}
                      {member.name === "ZAKA HAIDER" && <Layout className="text-blue-400" />}
                      {member.name === "SAAD MEHMOOD" && <BookOpen className="text-indigo-400" />}
                    </div>
                    <ExternalLink size={16} className="text-slate-700 group-hover:text-white transition-colors" />
                  </div>

                  <h3 className="text-[10px] font-black text-cyan-500 tracking-[0.4em] uppercase mb-4">
                    {member.role}
                  </h3>
                  <h2 className="text-3xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform duration-500">
                    {member.name}
                  </h2>
                  <p className="text-xs font-mono text-slate-500 mb-6 uppercase tracking-widest">{member.specialty}</p>
                  
                  <p className="text-slate-400 leading-relaxed text-sm font-light leading-7">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Horizontal Scroll */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <h3 className="text-sm font-black tracking-[0.5em] text-slate-600 uppercase whitespace-nowrap">Technologies We Use</h3>
            <div className="h-[1px] w-full bg-white/5"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {["MongoDB", "Express.js", "React.js", "Node.js", "Cloudinary", "TailwindCSS"].map((tech) => (
              <div key={tech} className="flex flex-col group cursor-default">
                <span className="text-xl font-bold text-slate-500 group-hover:text-white transition-colors duration-300 italic tracking-tighter italic">
                  {tech}
                </span>
                <div className="h-[2px] w-0 bg-cyan-500 group-hover:w-full transition-all duration-500 mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-left">
            <div className="text-white font-black tracking-tighter text-2xl mb-2">EDIT STUDIO.</div>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Department of IT &bull; Punjab University</p>
          </div>
          <div className="flex gap-12 text-[10px] font-bold tracking-widest uppercase text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Github</a>
            <a href="/contact-admin" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Add Custom CSS to your globals.css or Tailwind config */}
      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;