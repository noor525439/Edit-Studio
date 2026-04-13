import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { getData } from '@/context/UserContext'

const Login = ({ selectedRole, onBack }) => {
  const { setUser } = getData()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })

  // const ADMIN_EMAIL = "waseeqniaz@gmail.com";
  // const EDITOR_EMAIL = "waseeqeditor@gmail.com";
  // const CLIENT_EMAIL = "editstudioclient@gmail.com";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault()
  //   try {
  //     setIsLoading(true)
  //     const res = await axios.post(`http://localhost:3000/user/login`, formData)

  //     if (res.data.success) {
  //       const user = res.data?.user;
  //       const userEmail = user?.email?.toLowerCase().trim();

  //       let actualRole = 'freelancer';
  //       if (userEmail === ADMIN_EMAIL.toLowerCase()) actualRole = 'admin';
  //       else if (userEmail === EDITOR_EMAIL.toLowerCase()) actualRole = 'editor';
  //       else if (userEmail === CLIENT_EMAIL.toLowerCase()) actualRole = 'freelancer';

  //       if (selectedRole !== actualRole && actualRole !== 'admin') {
  //         toast.error(`Access Denied: You are not an ${selectedRole}.`);
  //         return;
  //       }

  //       localStorage.setItem('accessToken', res.data.token)
  //       setUser(user)
  //       toast.success(`Welcome back, ${selectedRole}!`)
  //       navigate(`/${selectedRole}-dashboard`);
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Login failed.');
  //   } finally { setIsLoading(false) }
  // }
 const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    setIsLoading(true)
    const res = await axios.post(`http://localhost:3000/user/login`, formData)

    if (res.data.success) {
      const user = res.data?.user;

      if (selectedRole !== user.role && user.role !== 'admin') {
        toast.error(`This account is registered as a ${user.role}.`);
        return;
      }

      const token = res.data.accessToken || res.data.token || res.data.acessToken;
      localStorage.setItem('accessToken', token);

      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      toast.success(`Welcome back ${user?.username}!`);
      navigate(`/${user?.role}-dashboard`);
    }
  } catch (error) {
    console.error("Login Error:", error);
    toast.error(error.response?.data?.message || 'Login failed.');
  } finally {
    setIsLoading(false);
  }
}
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-10 relative bg-white">
      <button onClick={onBack} className="absolute top-6 left-6 flex items-center text-xs text-gray-400 hover:text-green-600 transition-colors">
        <ArrowLeft className="w-3 h-3 mr-1" /> Change Role
      </button>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-600 capitalize">{selectedRole} Login</h1>
          <p className="text-xs text-gray-500">Sign in to access your dashboard</p>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required className="bg-gray-50 border-none shadow-none h-10" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Password</Label>
            <Link to='/forgot-password' size="xs" className="text-[11px] text-blue-600 hover:underline">Forgot Password?</Link>
          </div>
          <div className="relative">
            <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="••••••••" required className="bg-gray-50 border-none shadow-none h-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 opacity-50">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white h-11 font-bold tracking-wide shadow-lg" disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' size={18} /> : "SIGN IN"}
        </Button>
      </form>
    </div>
  )
}

export default Login;