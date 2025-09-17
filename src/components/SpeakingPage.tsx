import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, BookOpen, Mic, Coffee, Sparkles, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const SpeakingPage = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState('Beginner');

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLevel(e.target.value);
  };

  // Background animation variants
  const backgroundVariants = {
    animate: {
      background: [
        'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #581c87 50%, #7c3aed 75%, #1e3a8a 100%)',
        'linear-gradient(135deg, #7c3aed 0%, #581c87 25%, #3730a3 50%, #1e3a8a 75%, #7c3aed 100%)',
        'linear-gradient(135deg, #3730a3 0%, #1e3a8a 25%, #7c3aed 50%, #581c87 75%, #3730a3 100%)',
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  const floatingShapeVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const particleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.8, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      variants={backgroundVariants}
      animate="animate"
    >
      {/* Background Animations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Shapes */}
        <motion.div
          className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-full blur-sm"
          variants={floatingShapeVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-40 right-32 w-12 h-12 bg-blue-400/20 rounded-lg rotate-45"
          variants={floatingShapeVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-20 h-20 bg-purple-400/15 rounded-full"
          variants={floatingShapeVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
        />

        {/* Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            variants={particleVariants}
            animate="animate"
            transition={{ delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Enhanced Sidebar */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Sparkles className="text-blue-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Practice Options</h2>
                </div>

                {/* Level Selector */}
                <div className="mb-6">
                  <label className="text-white/80 text-sm mb-2 block flex items-center gap-2">
                    <Star size={14} className="text-yellow-400" />
                    Select Your Level
                  </label>
                  <select
                    value={currentLevel}
                    onChange={handleLevelChange}
                    className="w-full bg-white/15 text-white border border-white/30 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  >
                    <option value="Beginner" className="bg-gray-800">Beginner</option>
                    <option value="Intermediate" className="bg-gray-800">Intermediate</option>
                    <option value="Advanced" className="bg-gray-800">Advanced</option>
                  </select>
                </div>

                {/* Mode Buttons */}
                <div className="space-y-3">
                  <div className="text-white/80 text-sm mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-green-400" />
                    Choose Practice Mode
                  </div>

                  <motion.button
                    onClick={() => navigate('/guided-practice', { state: { level: currentLevel } })}
                    className="w-full p-4 rounded-xl text-left text-white bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/30 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <div className="font-semibold">Guided Practice</div>
                        <div className="text-sm text-white/70">Step-by-step learning</div>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => navigate('/sentence-practice', { state: { level: currentLevel } })}
                    className="w-full p-4 rounded-xl text-left text-white bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/30 rounded-lg group-hover:bg-green-500/40 transition-colors">
                        <Mic size={18} />
                      </div>
                      <div>
                        <div className="font-semibold">Speak the Sentence</div>
                        <div className="text-sm text-white/70">Practice pronunciation</div>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => navigate('/casual', { state: { level: currentLevel } })}
                    className="w-full p-4 rounded-xl text-left text-white bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/30 rounded-lg group-hover:bg-purple-500/40 transition-colors">
                        <Coffee size={18} />
                      </div>
                      <div>
                        <div className="font-semibold">Casual Conversation</div>
                        <div className="text-sm text-white/70">Real-world scenarios</div>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
                <div className="relative mb-8">
                  <motion.button
                    onClick={() => navigate('/what-if')}
                    className="absolute left-0 top-0 text-white hover:text-yellow-400 transition-colors p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft size={24} />
                  </motion.button>

                  <div className="text-center">
                    <motion.div
                      className="inline-flex items-center justify-center gap-4 mb-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <div className="p-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg">
                        <MessageSquare className="text-white" size={48} />
                      </div>
                    </motion.div>

                    <motion.h1
                      className="text-4xl md:text-6xl font-extrabold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      Learn English Speaking
                    </motion.h1>

                    <motion.p
                      className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1 }}
                    >
                      Master English conversation with AI-powered feedback. Choose your level and practice mode to begin your journey to fluency!
                    </motion.p>
                  </div>
                </div>

                {/* Feature Highlights */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Mic className="text-blue-400" size={24} />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Voice Recognition</h3>
                    <p className="text-white/70 text-sm">Advanced AI analyzes your pronunciation</p>
                  </div>

                  <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="text-green-400" size={24} />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Personalized Learning</h3>
                    <p className="text-white/70 text-sm">Adaptive content based on your level</p>
                  </div>

                  <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Star className="text-purple-400" size={24} />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Instant Feedback</h3>
                    <p className="text-white/70 text-sm">Real-time corrections and suggestions</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpeakingPage;
