import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowLeft, Calendar, GraduationCap } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [userClass, setUserClass] = useState('');
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert("Please verify your email address to continue. Check your inbox for a verification link.");
        await signOut(auth); // Log out the user
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`);
      if (!response.ok) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUid: user.uid,
            name: email.split('@')[0],
            email: user.email,
            dob: null,
            class: null,
          }),
        });
      }
      navigate('/welcome-back');
    } catch (error: any) {
      alert(`Login failed. ${error.message}`);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user); // Send verification email
      
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          name: username,
          dob,
          class: userClass,
          email,
        }),
      });

      // Navigate to a dedicated page for email verification
      navigate('/verify-email');
    } catch (error: any) {
      alert(`Failed to create account. ${error.message}`);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
      setIsForgotPasswordModalOpen(false);
    } catch (error: any) {
      alert(`Password reset failed: ${error.message}`);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg p-10 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow">
            {isLogin ? "Welcome Back 👋" : "Create Account ✨"}
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            {isLogin ? "Login to continue your journey" : "Sign up and explore new learning paths"}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
          {!isLogin && (
            <>
              <FloatingInput
                icon={<User size={18} />}
                label="Username"
                type="text"
                value={username}
                onChange={(e: any) => setUsername(e.target.value)}
              />

              <FloatingInput
                icon={<Calendar size={18} />}
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e: any) => setDob(e.target.value)}
              />

              <FloatingSelect
                icon={<GraduationCap size={18} />}
                label="Select Class"
                value={userClass}
                onChange={(e: any) => setUserClass(e.target.value)}
                options={["4th std", "5th std", "6th std", "7th std", "8th std", "9th std", "10th std"]}
              />
            </>
          )}

          <FloatingInput
            icon={<Mail size={18} />}
            label="Email"
            type="email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />

          <FloatingInput
            icon={<Lock size={18} />}
            label="Password"
            type="password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            isPassword
          />

          {isLogin && (
            <div className="text-right text-sm">
              <span
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="cursor-pointer text-purple-400 hover:text-purple-200"
              >
                Forgot Password?
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:scale-105 transform transition duration-300"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="cursor-pointer text-purple-300 hover:text-white underline underline-offset-2 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </span>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-gray-400/30 text-white"
            >
              <button
                onClick={() => setIsForgotPasswordModalOpen(false)}
                className="absolute top-4 right-4 text-gray-300 hover:text-white"
              >
                <ArrowLeft size={22} />
              </button>
              <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <FloatingInput
                  icon={<Mail size={18} />}
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
                >
                  Send Reset Link
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Floating Input Component --- */
const FloatingInput = ({ icon, label, type, value, onChange, isPassword }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">{icon}</div>}
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        required
        className="peer w-full px-12 py-4 rounded-xl bg-transparent text-white 
                   border-2 border-gray-500 focus:border-pink-500 
                   focus:ring-0 outline-none placeholder-transparent"
        placeholder=" " // keep placeholder hidden for floating label
      />
      <label className="absolute left-12 text-gray-400 transition-all 
                         peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                         peer-placeholder-shown:text-base
                         peer-focus:top-2 peer-focus:text-xs peer-focus:text-pink-400">
        {label}
      </label>

      {isPassword && (
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer hover:text-white"
        >
          {showPassword ? "🙈" : "👁️"}
        </span>
      )}
    </div>
  );
};

/* --- Floating Select Component --- */
const FloatingSelect = ({ icon, label, value, onChange, options }: any) => {
  return (
    <div className="relative w-full">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">{icon}</div>}
      <select
        value={value}
        onChange={onChange}
        required
        className="peer w-full px-12 py-4 rounded-xl bg-transparent text-white 
                   border-2 border-gray-500 focus:border-pink-500 
                   focus:ring-0 outline-none appearance-none"
      >
        <option value="" disabled hidden></option>
        {options.map((opt: string, idx: number) => (
          <option key={idx} value={opt} className="text-gray-900">
            {opt}
          </option>
        ))}
      </select>
      <label className={`absolute left-12 text-gray-400 transition-all
                         ${value ? "top-2 text-xs text-pink-400" : "top-1/2 -translate-y-1/2 text-base"}
                         peer-focus:top-2 peer-focus:text-xs peer-focus:text-pink-400`}>
        {label}
      </label>
    </div>
  );
};

export default AuthPage;