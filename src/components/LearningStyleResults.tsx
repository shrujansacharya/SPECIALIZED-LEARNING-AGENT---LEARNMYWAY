import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/theme';
import { auth } from '../lib/firebase'; // Assuming auth is imported

const LearningStyleResults: React.FC = () => {
  const navigate = useNavigate();
  const [learningStyle, setLearningStyle] = useState<string>('');
  const [interest, setInterest] = useState<string>('');
  const { setTheme, getThemeStyles } = useThemeStore();
  const theme = getThemeStyles();

  useEffect(() => {
    async function fetchResults() {
      const user = auth.currentUser;
      if (user) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setLearningStyle(data?.learningStyle || 'Unknown');
            setInterest(data?.interests || 'None'); // Corrected to get interests as a string
            setTheme(data?.interests);
          }
        } catch (error) {
          console.error("Failed to fetch user results:", error);
        }
      }
    }
    fetchResults();
  }, [setTheme]);

  type LearningStyle = 'visual' | 'auditory' | 'kinesthetic';

  const getStyleDescription = (style: string): string => {
    const descriptions: Record<LearningStyle, string> = {
      visual:
        "You’re a Visual Star! You shine with images, videos, and colorful visuals. Your journey will be packed with vibrant content! 🌠",
      auditory:
        "You’re an Auditory Ace! You excel by listening to stories, discussions, and sounds. Get ready for an immersive audio adventure! 🎧",
      kinesthetic:
        "You’re a Kinesthetic Champion! You learn best by doing, touching, and moving. Your path will be full of hands-on action! 🚀",
    };
    const key = style.toLowerCase() as LearningStyle;
    return descriptions[key] || "We couldn’t determine your learning style.";
  };

  return (
    <div
      className="min-h-screen p-8 flex items-center justify-center relative overflow-hidden font-poppins"
      style={{
        backgroundImage: `url(${theme.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/95 backdrop-blur-lg rounded-3xl p-10 shadow-2xl max-w-4xl w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Your Learning Profile</h2>
          <p className={`text-2xl font-medium ${theme.accent}`}>
            Explore your {interest} learning path!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mb-8 border-2 border-gray-200">
          <h3 className="text-3xl font-semibold mb-4 text-gray-900 flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            Your Learning Superpower
          </h3>
          <p className="text-xl text-gray-700">{getStyleDescription(learningStyle)}</p>
        </div>

        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/menu')}
            className={`px-8 py-4 bg-gradient-to-r ${theme.primary} text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-lg flex items-center gap-3`}
          >
            <Rocket className="w-6 h-6" />
            Start Exploring
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningStyleResults;