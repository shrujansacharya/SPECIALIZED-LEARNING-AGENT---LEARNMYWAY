import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Sparkles } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';

const WelcomeBack: React.FC = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/explore-menu'); // Corrected navigation path
    }, 5000); // Auto-redirect after 5 seconds

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  const handleContinue = () => {
    navigate('/explore-menu');
  };

  const particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  // Animation variants for the card
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.15,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 flex items-center justify-center overflow-hidden font-sans">
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 60, density: { enable: true, value_area: 1000 } },
            color: { value: ['#ffffff', '#93c5fd', '#c4b5fd', '#fef08a'] },
            shape: { type: ['circle', 'star'], polygon: { nb_sides: 5 } },
            opacity: { value: 0.4, random: true },
            size: { value: 2, random: { enable: true, minimumValue: 1 } },
            move: {
              enable: true,
              speed: 1.5,
              direction: 'none',
              random: true,
              out_mode: 'out',
            },
          },
          interactivity: {
            events: {
              onhover: { enable: true, mode: 'repulse' },
              onclick: { enable: true, mode: 'push' },
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
              push: { particles_nb: 4 },
            },
          },
          retina_detect: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Main Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md mx-4 bg-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-xl border border-white/10"
      >
        {/* Sparkles Icon */}
        <motion.div variants={childVariants} className="flex justify-center mb-6">
          <Sparkles className="w-14 h-14 text-yellow-300 animate-pulse" />
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={childVariants}
          className="text-3xl md:text-4xl font-extrabold text-white text-center mb-3 tracking-tight"
        >
          Welcome Back, Star Voyager!
        </motion.h2>

        {/* Motivational Subtitle */}
        <motion.p
          variants={childVariants}
          className="text-lg text-gray-100 text-center mb-4 leading-relaxed"
        >
          Your cosmic journey of knowledge continues! Unleash your curiosity and soar to new heights.
        </motion.p>

        {/* Additional Motivational Text */}
        <motion.p
          variants={childVariants}
          className="text-base text-gray-300 text-center mb-6 italic"
        >
          "Every step you take brings you closer to mastering the universe of learning."
        </motion.p>

        {/* Progress Bar */}
        <motion.div
          variants={childVariants}
          className="w-full bg-gray-700/50 rounded-full h-2 mb-6 overflow-hidden"
        >
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </motion.div>

        {/* Continue Button */}
        <motion.button
          variants={childVariants}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 30px rgba(147, 197, 253, 0.6)',
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Rocket className="w-6 h-6 group-hover:animate-bounce" />
            Embark on Your Adventure
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
          <div className="absolute inset-0 sparkle-effect" />
        </motion.button>
      </motion.div>

      {/* Custom CSS for Sparkle Effect */}
      <style>{`
        .sparkle-effect {
          background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
          opacity: 0;
          animation: sparkle 2s infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeBack;