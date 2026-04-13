import { FileVideo, LogOut, User, ChevronDown, Compass, Home, Users, Sparkles } from 'lucide-react'
import React from 'react'
import { Link, useNavigate, NavLink } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getData } from '@/context/UserContext'
import axios from 'axios'
import { toast } from 'sonner'

const Navbar = () => {
    const { user, setUser } = getData()

    const navigate = useNavigate()

    const logoutHandler = async () => {
        const token = localStorage.getItem("accessToken")
        try {
            await axios.post(`http://localhost:3000/user/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
        } catch (error) { console.log(error) }
        finally {
            setUser(null)
            localStorage.removeItem('accessToken')
            toast.success("Identity Disconnected")
            navigate('/login')
        }
    }

    const getDashboardLink = () => {
        if (!user) return "/";
        if (user.role === 'admin') return "/admin-dashboard";
        if (user.role === 'editor') return "/editor-dashboard";
        return "/freelancer-dashboard";
    }

    const linkStyles = ({ isActive }) => `
        flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500
        ${isActive
            ? "bg-slate-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] scale-105"
            : "text-green-700 hover:bg-white hover:text-slate-900 hover:shadow-sm"}
    `;

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-2xl border-b border-slate-100/50">
            <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">

                {/* --- THE BRAND: EDIT STUDIO --- */}
                <Link to={getDashboardLink()} className="flex items-center gap-4 group">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-12 w-12 flex items-center justify-center bg-slate-900 rounded-[16px] shadow-2xl group-hover:rotate-[10deg] group-hover:scale-110 transition-all duration-500 border border-white/10">
                            <FileVideo className='h-6 w-6 text-green-400 group-hover:text-white transition-colors' strokeWidth={2.5} />
                            <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="flex items-center">
                            <h1 className='font-black text-2xl tracking-tighter text-slate-900 group-hover:tracking-normal transition-all duration-500 flex items-center gap-1'>
                                EDIT
                                <span className="bg-gradient-to-br from-green-400 to-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-md shadow-[0_4px_10px_rgba(34,197,94,0.3)] font-black uppercase tracking-tighter">
                                    OS
                                </span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className='text-[10px] font-black text-slate-400 uppercase tracking-[0.45em] group-hover:text-green-600 group-hover:tracking-[0.6em] transition-all duration-500 leading-none mt-1'>
                                STUDIO
                            </span>
                            <div className="h-[1px] w-4 bg-slate-200 group-hover:w-8 group-hover:bg-green-300 transition-all duration-500 mt-1"></div>
                        </div>
                    </div>
                </Link>

                {/* --- ROLE-BASED NAVIGATION --- */}
                <div className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center gap-1">
                        {/* Always visible when logged in */}
                        <NavLink to={getDashboardLink()} className={linkStyles}>
                            <Home size={15} strokeWidth={2.5} />
                            Dashboard
                        </NavLink>

                        {/* Editor Specific: Information Form Only */}
                        {user?.role === 'editor' && (
                            <NavLink to={'/editor-info'} className={linkStyles}>
                                <Sparkles size={15} strokeWidth={2.5} />
                                Information Form
                            </NavLink>
                        )}

                        {/* Admin Specific: Clients Section
                        {user?.role === 'admin' && (
                            <NavLink to={'/clients'} className={linkStyles}>
                                <Users size={15} strokeWidth={2.5} />
                                Clients
                            </NavLink>
                        )} */}

                        {/* Admin and Client/Freelancer: Explore Section */}
                        {(user?.role === 'admin' || user?.role === 'client' || user?.role === 'freelancer') && (
                            <NavLink to={'/editorprofile'} className={linkStyles}>
                                <Compass size={15} strokeWidth={2.5} />
                                Editors
                            </NavLink>
                        )}
                    </div>
                </div>

                {/* --- USER INTERFACE SECTION --- */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none group">
                                <div className="flex items-center gap-3 pl-1 pr-4 py-1.5 bg-white border border-slate-200 rounded-2xl group-hover:border-green-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm rounded-xl overflow-hidden bg-slate-100">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.username}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.username}` }}
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-slate-900 text-white font-black text-xs uppercase">
                                                {user?.username?.[0] || "U"}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-[10px] font-black text-slate-900 leading-none uppercase tracking-widest">{user?.username}</p>
                                        <p className="text-[9px] text-green-600 font-black uppercase mt-1 tracking-tighter">{user?.role}</p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-slate-300 group-hover:text-green-600 group-hover:rotate-180 transition-all duration-300" />
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-64 mt-4 p-3 rounded-[2rem] border-slate-100 shadow-2xl bg-white/95 backdrop-blur-xl">
                                <DropdownMenuLabel className="px-4 py-4 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Active Session</span>
                                    <p className="text-sm font-bold text-slate-900 mt-1 truncate">{user?.username}</p>
                                    <p className="text-[8px] font-bold text-green-600 mt-1 truncate uppercase">{user?.role} NODE</p>
                                </DropdownMenuLabel>

                                <Link to={'/update-profile'}>
                                    <DropdownMenuItem className="cursor-pointer rounded-xl py-4 group focus:bg-slate-900 focus:text-white transition-all mb-1">
                                        <User className="mr-3 h-4 w-4 opacity-50 group-focus:text-green-400" />
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm uppercase tracking-tight">Identity Hub</span>
                                            <span className="text-[9px] font-bold text-green-600 group-focus:text-white/50">Settings & Security</span>
                                        </div>
                                    </DropdownMenuItem>
                                </Link>

                                <DropdownMenuSeparator className="bg-slate-50" />

                                <DropdownMenuItem onClick={logoutHandler} className="cursor-pointer rounded-xl py-4 text-red-500 focus:bg-red-50 focus:text-red-600 transition-all mt-1">
                                    <LogOut className="mr-3 h-4 w-4 opacity-50" />
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm uppercase tracking-tight">Disconnect</span>
                                        <span className="text-[9px] font-bold opacity-60 uppercase">Terminate Access</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to={'/login'} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">Login</Link>
                            <Link to={'/signup'}>
                                <button className='bg-slate-900 text-white px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95'>
                                    Initialize
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar