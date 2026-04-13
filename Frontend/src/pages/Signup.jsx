import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, ArrowLeft, Upload, FileCheck, X, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const Signup = ({ selectedRole, onBack }) => {
  const navigate = useNavigate()
  const [showPassword, setshowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setformData] = useState({ username: "", email: "", password: "" })
  const [file, setFile] = useState(null)

  const HandleChange = (e) => {
    setformData({ ...formData, [e.target.name]: e.target.value })
  }

  // --- Client-Side Validation Logic ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 1. Check File Type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload a PDF, PNG, or JPG.");
      e.target.value = ""; // Clear input
      return;
    }

    // 2. Check File Size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error("File is too large. Max size is 5MB.");
      e.target.value = ""; // Clear input
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('role', selectedRole);

      if (selectedRole === 'editor' && file) {
        data.append('document', file);
      }

      const res = await axios.post('http://localhost:3000/user/register', data)

      if (res.data.success) {
        toast.success(res.data.message)
        navigate('/verify')
      }
    } catch (error) {
      console.log('E', error);
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-10 relative bg-white">
      <button onClick={onBack} className="absolute top-6 left-6 flex items-center text-xs text-gray-400 hover:text-green-600 transition-colors">
        <ArrowLeft className="w-3 h-3 mr-1" /> Change Role
      </button>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="text-center mb-4">
          <h1 className='text-2xl font-bold text-green-600 capitalize'>{selectedRole} Registration</h1>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Full Name</Label>
          <Input name="username" value={formData.username} onChange={HandleChange} required className="h-10 bg-gray-50 border-none shadow-none" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Email Address</Label>
          <Input name="email" type="email" value={formData.email} onChange={HandleChange} required className="h-10 bg-gray-50 border-none shadow-none" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Password</Label>
          <div className="relative">
            <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={HandleChange} required className="h-10 bg-gray-50 border-none shadow-none" />
            <div onClick={() => setshowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer opacity-50">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>
        </div>

        {selectedRole === 'editor' && (
          <div className="space-y-2">
            <Label className="text-xs">Verification Document</Label>
            <div className={`relative group transition-all duration-300 rounded-xl border-2 border-dashed 
              ${file ? 'border-green-500 bg-green-50/30' : 'border-gray-200 hover:border-green-400 bg-gray-50'}`}>
              
              <input 
                type="file" 
                id="file-upload"
                onChange={handleFileChange} 
                required={!file}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                accept=".pdf,.jpg,.jpeg,.png"
              />

              <div className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                {!file ? (
                  <>
                    <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Upload size={18} className="text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-gray-700">Upload your CV</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">PDF, PNG, JPG (Max 5MB)</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center w-full justify-between bg-white p-2 rounded-lg border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded-md">
                        <FileCheck size={16} className="text-green-600" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] font-bold text-gray-800 truncate max-w-[150px]">{file.name}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-medium">Ready to upload</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors z-20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-4 h-11 font-bold shadow-lg" disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin h-4 w-4' /> : "SIGN UP"}
        </Button>
      </form>
    </div>
  )
}

export default Signup;