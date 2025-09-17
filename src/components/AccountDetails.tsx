import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const AccountDetails: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            console.error("Failed to fetch user data.");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading account details...</div>;
  }

  if (!userData) {
    return <div className="text-center p-8 text-red-500">Could not load account data.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <User className="h-12 w-12 text-blue-500 mr-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Account</h1>
        </div>

        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Name:</span>
            <span className="text-gray-800 dark:text-white">{userData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Age:</span>
            <span className="text-gray-800 dark:text-white">{userData.age}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Class:</span>
            <span className="text-gray-800 dark:text-white">{userData.class}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Email:</span>
            <span className="text-gray-800 dark:text-white">{userData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Learning Style:</span>
            <span className="text-gray-800 dark:text-white">{userData.learningStyle || 'Not set'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default AccountDetails;