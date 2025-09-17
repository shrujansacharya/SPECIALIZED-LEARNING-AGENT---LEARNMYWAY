// src/components/modals/AccountModal.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { X, User, LogOut, Upload } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onProfileUpdate }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      setLoading(true);
      try {
        // 1. Get the authentication token
        const token = await user.getIdToken();

        // 2. Add the token to the fetch request
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

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

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const user = auth.currentUser;
    if (!user) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', selectedImage);

    try {
      // 3. Get the token for the upload request
      const token = await user.getIdToken();

      // 4. Add the token to the upload request headers
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}/upload-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({ ...userData, profileImage: data.profileImage });
        onProfileUpdate(); // Notify parent component to update
        alert("Profile image uploaded successfully!");
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
      setSelectedImage(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="relative w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl text-gray-800 dark:bg-gray-800 dark:text-white"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <X size={24} />
            </button>
            <div className="flex flex-col items-center">
              {userData?.profileImage ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${userData.profileImage}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-purple-600"
                />
              ) : (
                <User size={64} className="text-purple-600 mb-4" />
              )}
              <h2 className="text-3xl font-bold mb-2 text-center">{userData?.name || 'Explorer'}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">Your Profile</p>

              <div className="mb-6 w-full">
                <label className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                  <Upload size={20} className="mr-2" />
                  {selectedImage ? selectedImage.name : "Choose a new image"}
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
                {selectedImage && (
                  <button
                    onClick={handleImageUpload}
                    disabled={uploading}
                    className="mt-2 w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Uploading...' : 'Confirm Upload'}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center">Loading your information...</div>
              ) : userData ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Date of Birth:</span>
                    <span>{userData.dob || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Class:</span>
                    <span>{userData.class || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Email:</span>
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Learning Style:</span>
                    <span>{userData.learningStyle || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Interests:</span>
                    <span>{userData.interests || 'Not set'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500">Failed to load user data.</div>
              )}

              <button
                onClick={handleLogout}
                className="mt-6 w-full py-3 px-6 bg-red-500 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountModal;