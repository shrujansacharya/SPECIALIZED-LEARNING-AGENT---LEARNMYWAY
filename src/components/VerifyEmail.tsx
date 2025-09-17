import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { auth } from '../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (user) {
            intervalId = setInterval(async () => {
                await user.reload();
                if (user.emailVerified) {
                    clearInterval(intervalId);
                    navigate('/about', { replace: true });
                }
            }, 3000); // Check every 3 seconds

            // Cleanup function to clear the interval
            return () => clearInterval(intervalId);
        }
    }, [user, navigate]);

    const resendVerificationEmail = async () => {
        if (user) {
            try {
                await sendEmailVerification(user);
                alert("Verification email has been re-sent! Check your inbox.");
            } catch (error) {
                console.error("Error re-sending verification email:", error);
                alert("Failed to re-send verification email. Please try again later.");
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-6 text-white">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg p-10 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center"
            >
                <Mail className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                <h1 className="text-4xl font-extrabold tracking-tight drop-shadow mb-4">
                    Verify Your Email
                </h1>
                <p className="text-lg text-gray-300 mb-6">
                    We've sent a verification link to **{user?.email || 'your email'}**.
                    Please click the link in your inbox to complete the registration.
                </p>
                <p className="text-sm text-gray-400 mb-8">
                    You will be automatically redirected once your email is verified.
                </p>
                <div className="flex flex-col gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resendVerificationEmail}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg rounded-xl shadow-lg"
                    >
                        Resend Verification Email
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="w-full py-4 text-gray-400 font-semibold text-lg rounded-xl"
                    >
                        <ArrowLeft size={20} className="inline mr-2" />
                        Back to Login
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;