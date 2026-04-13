import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';
import { Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setIsLoading(true);
      const res = await axios.post(`http://localhost:3000/user/forgot-password`, { email });
      if (res.data.success) {
        setIsSubmit(true);
        toast.success(res.data.message);
        // Optional: Navigate after a delay if you want them to see the success state
        // setTimeout(() => navigate(`/verify-otp/${email}`), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not find an account with that email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 font-['Montserrat'] relative overflow-hidden">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-green-100/40 blur-3xl"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-100/30 blur-3xl"></div>
      </div>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot Password?</h1>
          <p className="text-gray-500 mt-2">No worries, we'll send you reset instructions.</p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[24px] bg-white overflow-hidden">
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-100 text-red-600 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSubmit ? (
              <div className="text-center space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-center">
                  <div className="bg-green-50 p-3 rounded-full">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-800">Check your email</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    We've sent a password reset link to <br />
                    <span className="font-semibold text-gray-700">{email}</span>
                  </p>
                </div>
                <Button 
                  onClick={() => navigate(`/verify-otp/${email}`)}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl text-white font-bold"
                >
                  Enter OTP Code
                </Button>
                <button
                  onClick={() => setIsSubmit(false)}
                  className="text-sm text-gray-400 hover:text-green-600 transition-colors"
                >
                  Didn't receive the email? Try again
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 pl-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-green-500 transition-all shadow-none"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl text-white font-bold tracking-wide shadow-lg shadow-green-200 active:scale-[0.98] transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending Link...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send Reset Link
                    </span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;