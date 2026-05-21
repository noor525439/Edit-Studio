import { FileVideo, LogOut, User, ChevronDown, Compass, Home, Sparkles, FolderKanban, ListTodo, Upload, Users, MessageSquare, CreditCard } from 'lucide-react'
import React, { useEffect } from 'react'
import { Link, useNavigate, NavLink } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getData } from '@/context/userContext'
import axios from 'axios'
import { toast } from 'sonner'
import NotificationBell from '@/components/NotificationBell'
import { dashboardPath, isClient } from '@/lib/roles'
import { connectSocket } from '@/lib/socket'

const Navbar = () => {
    const { user, setUser } = getData()
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (token && user) connectSocket(token)
    }, [user])

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

    const linkStyles = ({ isActive }) => `
        flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500
        ${isActive
            ? "bg-slate-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] scale-105"
            : "text-green-700 hover:bg-white hover:text-slate-900 hover:shadow-sm"}
    `;

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-2xl border-b border-slate-100/50">
            <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">

                {/* ── Logo ── */}
                <Link to={user ? dashboardPath(user.role) : '/'} className="flex items-center gap-4 group">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-12 w-12 flex items-center justify-center bg-slate-900 rounded-[16px] shadow-2xl group-hover:rotate-[10deg] group-hover:scale-110 transition-all duration-500 border border-white/10">
                            <FileVideo className='h-6 w-6 text-green-400 group-hover:text-white transition-colors' strokeWidth={2.5} />
                            <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className='font-bold text-2xl tracking-tighter text-slate-900 flex items-center gap-1'>
                            EDIT
                            <span className="bg-gradient-to-br from-green-400 to-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase">OS</span>
                        </h1>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-[0.45em]'>STUDIO</span>
                    </div>
                </Link>

                {/* ── Nav Links ── */}
                <div className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center gap-1">

                        {/* Dashboard - 'end' lagaya hai taake sirf exact path pe active ho */}
                        <NavLink to={user ? dashboardPath(user.role) : '/'} className={linkStyles} end>
                            <Home size={15} strokeWidth={2.5} />
                            Dashboard
                        </NavLink>

                        {/* Client Links */}
                        {isClient(user?.role) && (
                            <>
                                <NavLink to="/client/projects" className={linkStyles} end>
                                    <FolderKanban size={15} strokeWidth={2.5} />
                                    Projects
                                </NavLink>
                                <NavLink to="/checkout" className={linkStyles} end>
                                    <CreditCard size={15} strokeWidth={2.5} />
                                    Payments
                                </NavLink>
                                <NavLink to="/client/editors" className={linkStyles} end>
                                    <Compass size={15} strokeWidth={2.5} />
                                    Editors
                                </NavLink>
                            </>
                        )}

                        {/* Editor Links */}
                        {user?.role === 'editor' && (
                            <>
                                <NavLink to="/editor/tasks" className={linkStyles} end>
                                    <ListTodo size={15} strokeWidth={2.5} />
                                    Tasks
                                </NavLink>
                                <NavLink to="/editor/submissions" className={linkStyles} end>
                                    <Upload size={15} strokeWidth={2.5} />
                                    Submissions
                                </NavLink>
                                <NavLink to="/editor-info" className={linkStyles} end>
                                    <Sparkles size={15} strokeWidth={2.5} />
                                    Profile
                                </NavLink>
                            </>
                        )}

                        {/* Gigs - editor aur client dono ke liye */}
                        {(user?.role === 'editor' || isClient(user?.role)) && (
                            <NavLink to="/editor/gigs" className={linkStyles} end>
                                <Compass size={15} strokeWidth={2.5} />
                                Gigs
                            </NavLink>
                        )}

                        {/* Admin Links */}
                        {user?.role === 'admin' && (
                            <>
                                <NavLink to="/admin/projects" className={linkStyles} end>
                                    <FolderKanban size={15} strokeWidth={2.5} />
                                    Projects
                                </NavLink>
                                <NavLink to="/admin/messages" className={linkStyles} end>
                                    <MessageSquare size={15} strokeWidth={2.5} />
                                    Messages
                                </NavLink>
                            </>
                        )}

                    </div>
                </div>

                {/* ── Right Side: Bell + User Dropdown ── */}
                <div className="flex items-center gap-4">
                    {user && <NotificationBell />}

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none group">
                                <div className="flex items-center gap-3 pl-1 pr-4 py-1.5 bg-white border border-slate-200 rounded-2xl group-hover:border-green-500/30 transition-all shadow-sm">
                                    {/* FIX: AvatarImage add kiya profile pic ke liye */}
                                    <Avatar className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100">
                                        <AvatarImage
                                            src={user?.profilePic || user?.avatar || user?.image}
                                            alt={user?.username}
                                            className="object-cover w-full h-full"
                                        />
                                        <AvatarFallback className="bg-slate-900 text-white font-bold text-xs uppercase">
                                            {user?.username?.[0] || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{user?.username}</p>
                                        <p className="text-[9px] text-green-600 font-bold uppercase">{user?.role}</p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-slate-300 group-hover:text-green-600 transition-all" />
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl">
                                <DropdownMenuLabel className="text-[9px] font-bold uppercase text-slate-400">Active Session</DropdownMenuLabel>
                                <p className="px-2 text-sm font-bold truncate">{user?.username}</p>
                                <DropdownMenuSeparator />

                                <Link to="/update-profile">
                                    <DropdownMenuItem className="cursor-pointer rounded-xl py-3">
                                        <User className="mr-2 h-4 w-4" />
                                        Identity Hub
                                    </DropdownMenuItem>
                                </Link>

                                {/* FIX: Admin ko Contact Support nahi dikhega */}
                                {user?.role !== 'admin' && (
                                    <Link to="/contact-admin">
                                        <DropdownMenuItem className="cursor-pointer rounded-xl py-3">
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Contact Support
                                        </DropdownMenuItem>
                                    </Link>
                                )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logoutHandler} className="cursor-pointer rounded-xl py-3 text-red-500">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Disconnect
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-[11px] font-bold uppercase text-slate-400 hover:text-slate-600">Login</Link>
                            <Link to="/signup">
                                <button className="bg-slate-900 text-white px-8 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-green-600 transition-all">
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