import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Star, Rocket, Sparkles, Heart, ArrowLeft, CheckCircle, Headphones, Airplay, Download } from 'lucide-react';
import { themeConfig, useThemeStore } from '../store/theme';
import { useQuizStore } from '../store/quiz';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { auth } from '../lib/firebase';

interface Option {
  text: string;
  type: string;
  emoji: string;
}

interface Question {
  id: number;
  question: string;
  icon: React.ReactElement;
  isInterest?: boolean;
  options: Option[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "You’re learning to code a game. How do you start?",
    icon: <Rocket className="w-14 h-14 text-cyan-300 mb-6" />,
    options: [
      { text: "Watch a coding tutorial video", type: "visual", emoji: "🌠" },
      { text: "Listen to a teacher explain the code", type: "auditory", emoji: "🎧" },
      { text: "Try coding and experiment", type: "kinesthetic", emoji: "🛸" },
    ],
  },
  {
    id: 2,
    question: "You’re studying for a science test. What’s your plan?",
    icon: <Star className="w-14 h-14 text-yellow-300 mb-6" />,
    options: [
      { text: "Make colorful diagrams and charts", type: "visual", emoji: "✨" },
      { text: "Discuss the topics with friends", type: "auditory", emoji: "📡" },
      { text: "Do hands-on experiments", type: "kinesthetic", emoji: "🚀" },
    ],
  },
  {
    id: 3,
    question: "You’re exploring a new city. What’s most exciting?",
    icon: <Sparkles className="w-14 h-14 text-pink-300 mb-6" />,
    options: [
      { text: "Take photos of cool places", type: "visual", emoji: "🌌" },
      { text: "Listen to a tour guide’s stories", type: "auditory", emoji: "🎙️" },
      { text: "Walk around and touch everything", type: "kinesthetic", emoji: "👾" },
    ],
  },
  {
    id: 4,
    question: "You’re learning a new dance. How do you practice?",
    icon: <Heart className="w-14 h-14 text-red-300 mb-6" />,
    options: [
      { text: "Watch dance videos to copy moves", type: "visual", emoji: "📸" },
      { text: "Listen to the music and rhythm", type: "auditory", emoji: "📖" },
      { text: "Practice the moves hands-on", type: "kinesthetic", emoji: "🌟" },
    ],
  },
  {
    id: 5,
    question: "What’s your favorite topic to explore?",
    icon: <Brain className="w-14 h-14 text-purple-300 mb-6" />,
    isInterest: true,
    options: [
      { text: "Cricket - Rule the field!", type: "cricket", emoji: "🏏" },
      { text: "Space - Explore the stars!", type: "space", emoji: "🚀" },
      { text: "Nature - Discover wildlife!", type: "nature", emoji: "🌿" },
      { text: "Science - Solve mysteries!", type: "science", emoji: "🧪" },
      { text: "Art - Create masterpieces!", type: "art", emoji: "🎨" },
      { text: "History - Uncover the past!", type: "history", emoji: "🏛️" },
    ],
  },
];

interface OptionButtonProps {
  option: Option;
  onClick: (type: string) => void;
  isInterest?: boolean;
}

const OptionButton = memo(({ option, onClick, isInterest }: OptionButtonProps) => {
  const [selected, setSelected] = useState<boolean>(false);

  const handleClick = () => {
    setSelected(true);
    onClick(option.type);
    setTimeout(() => setSelected(false), 600);
  };

  return (
    <motion.div
      className="mb-4"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ willChange: 'transform' }}
    >
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
        whileTap={{
          scale: 0.98,
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.7)',
        }}
        onClick={handleClick}
        className={`w-full p-6 rounded-lg text-white font-semibold text-lg transition-all duration-200 relative overflow-hidden shadow-md border-2 border-white/30 ${
          isInterest ? 'text-center' : 'text-left'
        }`}
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
          willChange: 'transform, box-shadow',
        }}
      >
        <div className={`flex ${isInterest ? 'flex-col items-center' : 'items-center'} gap-4 z-10 relative`}>
          <motion.span
            className="text-3xl"
            animate={selected ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {option.emoji}
          </motion.span>
          <span className="leading-tight">{option.text}</span>
        </div>
        {selected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  );
});

const LearningStyleQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const { setTheme, setDynamicBackgrounds, getThemeStyles } = useThemeStore();
  const { setAnswer } = useQuizStore();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveResults = async (style: string, selectedInterest: string, generatedThemeImages: string[]) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}/learning-style`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            learningStyle: style,
            interests: selectedInterest,
            generatedThemeImages: generatedThemeImages,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to save learning style results.');
        }
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const generateAndSetBackgrounds = async (selectedTheme: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-theme-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: selectedTheme }),
      });
      const data = await response.json();
      if (response.ok) {
        setDynamicBackgrounds(data.backgrounds);
        return data.backgrounds;
      } else {
        console.error('API Error:', data.error);
        setDynamicBackgrounds([]);
        return [];
      }
    } catch (error) {
      console.error('Network Error:', error);
      setDynamicBackgrounds([]);
      return [];
    }
  };

  const handleQuizCompletion = useCallback(async (finalAnswers: string[]) => {
    const learningAnswers = finalAnswers.slice(0, questions.length - 1);
    const counts = learningAnswers.reduce(
      (acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const dominantStyle = Object.entries(counts).reduce(
      (a, b) => (counts[a[0]] > counts[b[0]] ? a : b),
      ['visual', 0]
    )[0];

    const selectedInterest = finalAnswers[finalAnswers.length - 1] || 'space';

    setAnswer('learningStyle', dominantStyle);
    setAnswer('interests', selectedInterest);
    setTheme(selectedInterest as keyof typeof themeConfig);

    setIsLoading(true);
    const generatedImages = await generateAndSetBackgrounds(selectedInterest);
    setIsLoading(false);
    
    saveResults(dominantStyle, selectedInterest, generatedImages).then(() => {
      setShowResult(true);
    });
  }, [setTheme, setAnswer]);

  const handleAnswer = useCallback(
    (type: string) => {
      const newAnswers = [...answers, type];
      setAnswers(newAnswers);

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          handleQuizCompletion(newAnswers);
        }
      }, 600);
    },
    [answers, currentQuestion, handleQuizCompletion]
  );
  
  const getStyleDescription = (style: string) => {
    const descriptions = {
      visual: {
        title: "Visual Star",
        description: "You learn best with images, videos, and colorful visuals. Your journey will be packed with vibrant content!",
        icon: <Airplay className="w-16 h-16 text-cyan-400" />,
        tips: [
          "Use images, videos, and diagrams to understand concepts.",
          "Create colorful mind maps and charts.",
          "Watch tutorials and animations for better retention."
        ]
      },
      auditory: {
        title: "Auditory Ace",
        description: "You excel by listening to stories, discussions, and sounds. Get ready for an immersive audio adventure!",
        icon: <Headphones className="w-16 h-16 text-pink-400" />,
        tips: [
          "Listen to podcasts and audio explanations.",
          "Discuss topics with friends or in groups.",
          "Repeat information aloud or use rhymes."
        ]
      },
      kinesthetic: {
        title: "Kinesthetic Champion",
        description: "You learn best by doing, touching, and moving. Your path will be full of hands-on action!",
        icon: <Rocket className="w-16 h-16 text-yellow-400" />,
        tips: [
          "Engage in hands-on experiments and activities.",
          "Use physical objects or role-playing.",
          "Incorporate movement, like walking while studying."
        ]
      },
    };
    return (style in descriptions ? descriptions[style as keyof typeof descriptions] : {
      title: "Unknown Learner",
      description: "We couldn't determine your learning style.",
      icon: <Brain className="w-16 h-16 text-purple-400" />,
      tips: []
    });
  };

  const downloadBadge = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 400);
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 24px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText('Learning Style Badge', 150, 50);
      ctx.font = 'bold 32px Poppins';
      ctx.fillText(`${useQuizStore.getState().answers.learningStyle?.toUpperCase() || 'UNKNOWN'}`, 150, 100);
      ctx.font = '20px Poppins';
      ctx.fillText(`Interest: ${useQuizStore.getState().answers.interests || 'None'}`, 150, 140);
      ctx.beginPath();
      ctx.arc(150, 220, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '40px Poppins';
      ctx.fillText('🌟', 150, 235);
    }
    const link = document.createElement('a');
    link.download = 'learning-style-badge.png';
    link.href = canvas.toDataURL();
    link.click();
  };
  
  const handleBack = useCallback(() => {
    if (showResult) {
      setShowResult(false);
      setCurrentQuestion(questions.length - 1);
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    } else if (currentQuestion === 0) {
      setCurrentQuestion(-1);
      setAnswers([]);
    }
  }, [currentQuestion, answers, showResult, setAnswers]);

  const { answers: quizAnswers } = useQuizStore();
  const learningStyle = quizAnswers.learningStyle;
  const interest = quizAnswers.interests;
  const styleDescription = getStyleDescription(learningStyle || '');

  const theme = useThemeStore((state) => state.getThemeStyles());
  useEffect(() => {
    const backgroundsToUse = theme.backgrounds;
    if (showResult && backgroundsToUse && Array.isArray(backgroundsToUse) && backgroundsToUse.length > 0) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgroundsToUse.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showResult, theme.backgrounds]);

  if (currentQuestion === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8 flex flex-col items-center justify-center relative overflow-hidden font-poppins">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/assets/images/students-holding-books.png')" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-4xl bg-white/95 backdrop-blur-lg rounded-2xl p-10 shadow-2xl text-center relative border border-white/20"
          style={{ willChange: 'opacity, transform' }}
        >
          <Rocket className="w-20 h-20 text-cyan-300 mb-6 mx-auto" />
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Your <span className="text-purple-600">Cosmic</span> Mission! 🚀
          </h2>
          <div className="mb-6">
            <p className="text-xl text-gray-600 mb-4 leading-relaxed">
              Before we start, try this quick Learning Style Lab:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="text-3xl mb-2">📺</div>
                <p className="text-sm font-medium text-blue-800">Watch a video</p>
              </motion.div>
              <motion.div
                className="bg-green-50 p-4 rounded-lg border-2 border-green-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="text-3xl mb-2">🎧</div>
                <p className="text-sm font-medium text-green-800">Listen to a story</p>
              </motion.div>
              <motion.div
                className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="text-3xl mb-2">🔨</div>
                <p className="text-sm font-medium text-orange-800">Build something</p>
              </motion.div>
            </div>
            <p className="text-lg text-gray-700 font-medium">
              Think about which one you enjoyed most! 🤔
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentQuestion(0)}
            className="px-16 py-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-2xl shadow-lg flex items-center gap-4 mx-auto border-2 border-white/30"
            style={{ willChange: 'transform, box-shadow' }}
          >
            <Rocket className="w-10 h-10" />
            Start Quiz!
          </motion.button>
        </motion.div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8 flex flex-col items-center justify-center relative font-poppins">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-4xl bg-white/95 backdrop-blur-lg rounded-2xl p-10 shadow-2xl text-center relative"
          style={{ willChange: 'opacity, transform' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ willChange: 'transform' }}
          >
            <Star className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Generating Your Cosmic World...
          </h2>
          <p className="text-xl text-gray-600">
            This might take a moment. We're creating unique visuals just for you!
          </p>
        </motion.div>
      </div>
    );
  }

  if (showResult && learningStyle && interest) {
    const theme = getThemeStyles();
    const backgroundsToUse = theme.backgrounds;
    const currentBackground = backgroundsToUse?.[currentBackgroundIndex];

    return (
      <div className="min-h-screen p-8 flex items-center justify-center relative overflow-hidden">
        <motion.div
          key={currentBackgroundIndex}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            backgroundImage: `url(${currentBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'opacity',
          }}
        />
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00']}
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative bg-white/95 backdrop-blur-lg rounded-3xl p-10 shadow-2xl max-w-4xl w-full font-poppins z-20"
          style={{ willChange: 'opacity, transform' }}
        >
          <div className="absolute top-4 left-4 z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow-lg"
              style={{ willChange: 'transform' }}
            >
              <ArrowLeft className="inline w-5 h-5 mr-2" />
              Back
            </motion.button>
          </div>
          <div className="text-center">
            <div className="absolute top-0 right-4">
              {styleDescription.icon}
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-5xl font-bold text-gray-900 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              You are a {styleDescription.title}!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-xl text-gray-600 mt-4 leading-relaxed"
            >
              {styleDescription.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-purple-200"
            >
              <p className="text-lg text-gray-700">
                🎯 Your chosen interest is: <span className="font-bold text-purple-700 text-xl">*{interest.charAt(0).toUpperCase() + interest.slice(1)}*</span>
              </p>
            </motion.div>
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🌟 Your Learning Superpowers:</h3>
              <ul className="max-w-2xl mx-auto space-y-4 text-left">
                {styleDescription.tips.map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                    className="flex items-start gap-4 text-gray-700 bg-white/70 p-4 rounded-lg shadow-sm border border-gray-200"
                  >
                    <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0 mt-1" />
                    <span className="leading-relaxed">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <div className="grid grid-cols-2 gap-6 mb-8 mt-8">
              {Array.isArray(theme?.patterns) && theme.patterns.length > 0 ? (
                theme.patterns.map((url: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                    className="aspect-video rounded-xl overflow-hidden border-2 border-white/30 shadow-lg"
                    style={{
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="col-span-2 flex flex-col items-center justify-center h-40 bg-gray-100/50 rounded-xl border-2 border-dashed border-gray-300"
                >
                  <Sparkles className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="text-gray-600 text-center font-semibold">No patterns available for this theme yet!</p>
                  <p className="text-sm text-gray-500">Enjoy the dynamic backgrounds instead.</p>
                </motion.div>
              )}
            </div>
            <motion.div
              className="flex justify-center gap-8 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadBadge}
                className="px-10 py-5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center gap-3"
                style={{ willChange: 'transform, box-shadow' }}
              >
                <Download className="w-6 h-6" />
                <span>🏆 Download Badge</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/explore-menu')}
                className="px-10 py-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center gap-3"
                style={{ willChange: 'transform, box-shadow' }}
              >
                <Rocket className="w-6 h-6" />
                <span>🚀 Start Learning</span>
              </motion.button>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
              className="text-lg text-gray-600 font-medium mt-8"
            >
              🎉 Congratulations! You're ready to embark on an amazing learning journey! 🌟
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8 flex flex-col items-center justify-center relative font-poppins">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl p-6 relative z-10"
          style={{ willChange: 'opacity, transform' }}
        >
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span className="font-medium">
                {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ willChange: 'width' }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl shadow-lg"
              style={{ willChange: 'transform' }}
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </motion.button>
          </div>
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-5xl mb-4"
            >
              {question.icon}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="text-3xl font-bold text-white mb-6 leading-tight px-4"
            >
              {question.question}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="text-base text-gray-800 font-medium"
            >
              Choose what feels right for you! ✨
            </motion.p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option, index) => (
              <motion.div
                key={option.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
              >
                <OptionButton
                  option={option}
                  onClick={handleAnswer}
                  isInterest={question.isInterest}
                />
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            className="text-lg text-gray-600 font-medium text-center mt-8"
          >
            Every choice brings you closer to your perfect learning adventure! ✨
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LearningStyleQuiz;