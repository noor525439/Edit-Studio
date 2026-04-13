import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import { ShieldCheck, PenTool, User } from 'lucide-react';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const isActive = location.pathname === '/signup';

  if (!selectedRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 px-4 animate-in fade-in duration-300">
        <h1 className="text-4xl font-bold text-green-700 mb-2">Choose Your Portal</h1>
        <p className="text-gray-600 mb-12 text-center"></p>
        <div className="flex flex-wrap justify-center gap-6">
          <RoleCard title="Admin" role="admin" icon={<ShieldCheck size={40} />} color="bg-green-100 text-green-600" onClick={(r) => setSelectedRole(r)} />
          <RoleCard title="Editor" role="editor" icon={<PenTool size={40} />} color="bg-blue-100 text-blue-600" onClick={(r) => setSelectedRole(r)} />
          <RoleCard title="Client" role="freelancer" icon={<User size={40} />} color="bg-orange-100 text-orange-600" onClick={(r) => setSelectedRole(r)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-gray-200 to-green-100 font-['Montserrat'] animate-in fade-in duration-500">
      <div className="relative overflow-hidden bg-white rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.35)] w-[768px] max-w-full min-h-[550px]">
        
        <div className={`absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 opacity-0 z-[1] 
          ${isActive ? 'translate-x-full opacity-100 z-[5] animate-move' : ''}`}>
          <Signup selectedRole={selectedRole} onBack={() => setSelectedRole(null)} />
        </div>

        <div className={`absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-[2] 
          ${isActive ? 'translate-x-full' : ''}`}>
          <Login selectedRole={selectedRole} onBack={() => setSelectedRole(null)} />
        </div>

        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out z-[1000] rounded-l-[150px]
          ${isActive ? '-translate-x-full rounded-r-[150px] rounded-l-none' : ''}`}>
          
          <div className={`bg-green-600 bg-gradient-to-r from-green-600 to-green-700 text-white relative -left-full h-full w-[200%] transition-all duration-600 ease-in-out
            ${isActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
            
            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-8 text-center top-0 transition-all duration-600 ease-in-out 
              ${isActive ? 'translate-x-0' : '-translate-x-[200%]'}`}>
              <h1 className="text-2xl font-bold">Welcome Back!</h1>
              <p className="text-sm my-5">Enter your details and start your session</p>
              <button className="cursor-pointer border border-white text-white text-xs py-2 px-10 rounded-lg font-bold uppercase tracking-widest bg-transparent"
                onClick={() => navigate('/login')}>Sign In</button>
            </div>

            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-8 text-center top-0 right-0 transition-all duration-600 ease-in-out 
              ${isActive ? 'translate-x-[200%]' : 'translate-x-0'}`}>
              <h1 className="text-2xl font-bold">New Here?</h1>
              <p className="text-sm my-5">Sign up and join our team today</p>
              <button className="cursor-pointer border border-white text-white text-xs py-2 px-10 rounded-lg font-bold uppercase tracking-widest bg-transparent"
                onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleCard = ({ title, role, icon, color, onClick }) => (
  <div onClick={() => onClick(role)} className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm border hover:border-green-500 hover:shadow-xl transition-all flex flex-col items-center w-52 group">
    <div className={`p-4 rounded-full ${color} group-hover:bg-green-600 group-hover:text-white transition-colors mb-4`}>{icon}</div>
    <span className="font-bold text-lg">{title}</span>
  </div>
);

export default AuthPage;