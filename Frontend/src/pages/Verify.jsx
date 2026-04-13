import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, MailCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Verify = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your email address...");
  const navigate = useNavigate();

  useEffect(() => {
    const VerifyEmail = async () => {
      try {
        // Adding a slight delay so the user can actually see the "Verifying" state (better UX)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const res = await axios.post('http://localhost:3000/user/verify', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.success) {
          setStatus("success");
          setMessage("Email Verified Successfully!");
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus("error");
          setMessage("Verification Failed. The link may be invalid or expired.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Something went wrong. Please try again or contact support.");
      }
    };

    if (token) {
      VerifyEmail();
    } else {
      setStatus("error");
      setMessage("No verification token found.");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 font-['Montserrat'] relative overflow-hidden">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-green-100/40 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-blue-100/30 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[32px] p-10 border border-gray-50 text-center">
          
          {/* Dynamic Icon Section */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${
              status === "loading" ? "bg-blue-50 rotate-12" : 
              status === "success" ? "bg-green-50 scale-110" : "bg-red-50"
            }`}>
              {status === "loading" && <MailCheck className="w-10 h-10 text-blue-500 animate-pulse" />}
              {status === "success" && <CheckCircle2 className="w-10 h-10 text-green-600 animate-in zoom-in" />}
              {status === "error" && <XCircle className="w-10 h-10 text-red-500 animate-in shake" />}
            </div>
          </div>

          {/* Text Content */}
          <h2 className={`text-2xl font-bold mb-3 transition-colors duration-500 ${
            status === "error" ? "text-red-600" : "text-gray-800"
          }`}>
            {status === "loading" ? "Almost There!" : 
             status === "success" ? "Account Verified" : "Verification Failed"}
          </h2>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {message}
          </p>

          {/* Action Footer */}
          <div className="pt-4 border-t border-gray-50">
            {status === "loading" && (
              <div className="flex items-center justify-center gap-2 text-blue-500 font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Request</span>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Redirecting you to login in a few seconds...</p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 font-bold transition-all shadow-lg shadow-green-100"
                >
                  Go to Login <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {status === "error" && (
              <Button 
                onClick={() => navigate('/signup')}
                variant="outline"
                className="w-full border-gray-200 text-gray-600 rounded-xl h-12 font-bold hover:bg-gray-50 transition-all"
              >
                Back to Signup
              </Button>
            )}
          </div>
        </div>

        {/* Brand Footer */}
        <p className="text-center mt-8 text-gray-400 text-xs font-medium tracking-widest uppercase">
          EditStudio Secure Verification
        </p>
      </div>
    </div>
  );
};

export default Verify;