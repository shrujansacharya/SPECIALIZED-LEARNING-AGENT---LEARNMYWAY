import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Users, 
  Trophy, 
  Award, 
  PenTool, 
  ArrowLeft,
  Brain,
  UserCircle,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, themeConfig } from '../store/theme';
import AccountModal from './modals/AccountModal';
import { auth } from '../lib/firebase';

export const ExploreMenu = () => {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.getThemeStyles());
  const setTheme = useThemeStore((state) => state.setTheme);
  const setDynamicBackgrounds = useThemeStore((state) => state.setDynamicBackgrounds);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Get the token first
        const token = await user.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileImageUrl(data.profileImage || '');
          if (data.interests) {
            setTheme(data.interests as keyof typeof themeConfig);
          }
          if (data.generatedThemeImages && data.generatedThemeImages.length > 0) {
            setDynamicBackgrounds(data.generatedThemeImages);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile for menu icon:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  const handleProfileUpdate = () => {
    fetchUserProfile();
  };

  const menuItems = [
    {
      title: 'Subjects',
      description: 'Explore various subjects and expand your knowledge',
      icon: Brain,
      path: '/subjects',
      color: 'from-indigo-400 to-indigo-600'
    },
    {
      title: 'Daily Challenges',
      description: 'Ask curious questions and explore amazing possibilities',
      icon: Star,
      path: '/what-if',
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Study Groups',
      description: 'Learn together with friends in collaborative spaces',
      icon: Users,
      path: '/groups',
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Progress Adventure',
      description: 'Track your learning journey on an interactive map',
      icon: Trophy,
      path: '/progress',
      color: 'from-purple-400 to-purple-600'
    },
    {
      title: 'Career Hub',
      description: 'Discover exciting future careers and opportunities',
      icon: Award,
      path: '/careers',
      color: 'from-red-400 to-red-600'
    },
    {
      title: 'Project Builder',
      description: 'Create your own amazing learning projects',
      icon: PenTool,
      path: '/create',
      color: 'from-orange-400 to-orange-600'
    }
  ];

  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || '';

  const handleChangeTheme = useCallback(async (newTheme: string) => {
    setIsThemeSelectorOpen(false);
    setIsGenerating(true);
    
    try {
      const generateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-theme-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
      const data = await generateResponse.json();
      
      if (generateResponse.ok) {
        setTheme(newTheme as keyof typeof themeConfig);
        setDynamicBackgrounds(data.backgrounds);

        const user = auth.currentUser;
        if (user) {
          // Get token for the save request
          const token = await user.getIdToken();
          const saveResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}/learning-style`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Add token here
            },
            body: JSON.stringify({
              learningStyle: 'visual', // You may want to fetch the current learning style instead of hardcoding
              interests: newTheme,
              generatedThemeImages: data.backgrounds,
            }),
          });
          if (!saveResponse.ok) {
            console.error('Failed to save theme to database.');
          }
        }
      } else {
        console.error('Failed to generate new theme images:', data.error);
        alert('Failed to generate new theme images.');
      }
    } catch (error) {
      console.error('Network or API error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [setTheme, setDynamicBackgrounds]);

  const LoadingSpinner = () => (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Star className="w-16 h-16 text-yellow-500" />
      </motion.div>
    </div>
  );

  return (
    <div 
      className="min-h-screen p-8 relative overflow-hidden"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      
      {isGenerating && <LoadingSpinner />}
      
      <div className="relative max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 relative">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/90 backdrop-blur text-purple-600 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/tasks')}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 px-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              title="Tasks"
            >
              <Star size={20} />
              Tasks
            </motion.button>
            <button
              onClick={() => setIsThemeSelectorOpen(true)}
              className="bg-white/90 backdrop-blur text-purple-600 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white transition-colors"
            >
              <Palette size={20} />
              Change Theme
            </button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAccountModalOpen(true)}
              className="bg-indigo-600 text-white rounded-full p-2 shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
              title="My Account"
            >
              {profileImageUrl ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${profileImageUrl}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <UserCircle size={28} />
              )}
            </motion.button>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Learning Adventure
          </h1>
          <p className="text-xl text-white text-opacity-90">
            Explore different ways to learn and grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 group-hover:from-black/70 group-hover:to-black/50 transition-all duration-300"></div>
              <div className="relative p-8">
                <div className="bg-white/20 backdrop-blur rounded-full p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white text-opacity-90">{item.description}</p>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur rounded-full p-2">
                    <ArrowLeft className="w-6 h-6 text-white transform rotate-180" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Account Modal */}
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onProfileUpdate={handleProfileUpdate} />

      {/* Theme Selector Modal */}
      <AnimatePresence>
        {isThemeSelectorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setIsThemeSelectorOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 rounded-2xl p-8 shadow-2xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">Change Theme</h3>
              <p className="text-gray-600 text-center mb-6">Select a new interest to explore new worlds!</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.keys(themeConfig).map((themeName, index) => {
                  const isActive = themeName === theme.name;
                  const gradients = [
                    "from-indigo-500 via-purple-500 to-pink-500",
                    "from-green-400 via-emerald-500 to-teal-500",
                    "from-blue-400 via-cyan-500 to-sky-500",
                    "from-red-500 via-pink-500 to-orange-500",
                    "from-yellow-400 via-amber-500 to-orange-400",
                    "from-fuchsia-500 via-purple-500 to-indigo-500"
                  ];
                  const gradient = gradients[index % gradients.length];
                  return (
                    <motion.button
                      key={themeName}
                      whileHover={{ scale: 1.08, rotate: 1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChangeTheme(themeName)}
                      className={`relative p-6 rounded-2xl font-bold text-center text-white transition-all duration-300
                        bg-gradient-to-br ${gradient}
                        shadow-lg hover:shadow-xl hover:shadow-purple-500/40
                        ${isActive ? "ring-4 ring-yellow-400" : ""}`}
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl opacity-0 hover:opacity-100 transition-all"></div>
                      <span className="relative text-lg">
                        {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                      </span>
                      {isActive && (
                        <span className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                          Active
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="text-center mt-6">
                <button
                  onClick={() => setIsThemeSelectorOpen(false)}
                  className="text-gray-500 font-semibold hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreMenu;