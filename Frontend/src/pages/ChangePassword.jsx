import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Eye, EyeOff, Loader2, LockKeyhole, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ChangePassword = () => {
  const { email } = useParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmpass, setconfirmpass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [conShowPassword, setConShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!newPassword || !confirmpass) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmpass) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(`http://localhost:3000/user/change-password/${email}`, {
        newPassword,
        confirmpass
      });

      setSuccess(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 font-['Montserrat']">
      {/* Background Decorative Circles */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-green-100/50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-100/50 blur-3xl"></div>
      </div>

      <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[24px] p-8 max-w-md w-full border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 border border-green-100">
            <LockKeyhole className="text-green-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">New Password</h2>
          <p className="text-sm text-gray-500 text-center mt-2 px-4">
            Secure your account for <span className="text-green-600 font-medium">{email}</span>
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-xl text-sm mb-6 border border-green-100 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* New Password Field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 ml-1">New Password</Label>
            <div className="relative group">
              <Input
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-green-500 transition-all px-4"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 ml-1">Confirm New Password</Label>
            <div className="relative group">
              <Input
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-green-500 transition-all px-4"
                placeholder="••••••••"
                type={conShowPassword ? "text" : "password"}
                value={confirmpass}
                onChange={(e) => setconfirmpass(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                onClick={() => setConShowPassword(!conShowPassword)}
              >
                {conShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-green-200 transition-all active:scale-[0.98] mt-2"
            disabled={isLoading || success}
            onClick={handleChangePassword}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Updating...
              </span>
            ) : "Update Password"}
          </Button>

          <button 
            onClick={() => navigate('/login')}
            className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;