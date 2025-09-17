import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft, Star, Trophy, Rotate3D } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/theme'; // ADDED: Import theme store

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDLXMuqZCaMYhf4pWbIoo9_YlRF7zOfHKo');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const ListeningComprehensionChallenge = () => {
  const navigate = useNavigate();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [listeningData, setListeningData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('4-6');
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [canReattempt, setCanReattempt] = useState(false);

  // ADDED: Theme state from the store
  const { getThemeStyles } = useThemeStore();
  const theme = getThemeStyles();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || theme.background;

  // Fallback profile data
  const fallbackProfile = {
    user_id: 'test-user-id',
    username: 'Student',
    points: 0,
    time_spent: {},
    completed_activities: [],
    progress: { listening: 0, vocabulary: 0, grammar: 0, conversation: 0, pronunciation: 0, reading: 0, writing: 0 },
    badges: []
  };

  useEffect(() => {
    fetchProfile();
    checkAttempts();
    generateListeningChallenge();
    // ADDED: Effect to cycle through dynamic backgrounds
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGrade, theme.backgrounds]);

  const checkAttempts = () => {
    const today = new Date().toDateString();
    const attemptKey = `listening-attempts-${today}`;
    const completionKey = `listening-completed-${today}`;
    const stored = localStorage.getItem(attemptKey);
    const storedCompletion = localStorage.getItem(completionKey);

    if (stored) {
      const attemptData = JSON.parse(stored);
      setAttempts(attemptData.attempts || 0);
      setIsLocked(attemptData.attempts >= 2 || storedCompletion === 'true');
    } else {
      localStorage.removeItem('listening-attempts-' + new Date(Date.now() - 86400000).toDateString());
      localStorage.removeItem('listening-completed-' + new Date(Date.now() - 86400000).toDateString());
      setAttempts(0);
      setIsLocked(storedCompletion === 'true');
    }
  };

  const saveAttempt = () => {
    const today = new Date().toDateString();
    const attemptKey = `listening-attempts-${today}`;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const attemptData = {
      attempts: newAttempts,
      date: today
    };
    localStorage.setItem(attemptKey, JSON.stringify(attemptData));

    if (newAttempts >= 2) {
      setIsLocked(true);
    }
  };

  const saveCompletion = () => {
    const today = new Date().toDateString();
    const completionKey = `listening-completed-${today}`;
    localStorage.setItem(completionKey, 'true');
    setIsLocked(true);
  };

  const resetChallenge = () => {
    setCurrentPromptIndex(0);
    setShowAnswer(false);
    setShowCompletion(false);
    setCanReattempt(false);
    generateListeningChallenge();
  };

  const handleReattempt = () => {
    if (attempts < 2) {
      saveAttempt();
      resetChallenge();
    }
  };

  const handleCompleteChallenge = () => {
    setShowCompletion(true);
    saveAttempt();
    saveCompletion();
    confetti({
      particleCount: 300,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'],
      shapes: ['circle', 'square'],
      scalar: 1.5,
      gravity: 0.3
    });
  };

  const fetchProfile = async () => {
    // Removed Supabase logic and replaced with a local fallback
    setTimeout(() => {
      setProfile(fallbackProfile);
      setProgress(fallbackProfile.progress.listening);
    }, 500);
  };

  const generateListeningChallenge = async () => {
    setLoading(true);
    try {
      const prompt = `Generate 10 unique listening comprehension prompts for grades ${selectedGrade}. Each prompt should include: id, grade, prompt (a short audio transcript or text to be read aloud), answer (correct response or key points), context (background or scenario). Format as JSON array.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(text);
      setListeningData(data || []);
    } catch (error) {
      console.error('Error generating listening prompts:', error);
      const fallbackData = [
        { id: 1, grade: selectedGrade, prompt: 'Listen: The bird flies to the tall tree.', answer: 'The bird lands on a tall tree.', context: 'A nature scene where a bird is observed.' },
        { id: 2, grade: selectedGrade, prompt: 'Listen: She buys apples at the market.', answer: 'She purchases apples.', context: 'A busy market setting.' },
      ];
      setListeningData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const nextPrompt = async () => {
    if (isLocked) return;

    const currentPrompt = listeningData[currentPromptIndex];
    if (currentPrompt && showAnswer) {
      try {
        const promptText = `Evaluate learning for grades ${selectedGrade}. Listening prompt: "${currentPrompt.prompt}". Answer: "${currentPrompt.answer}". Context: "${currentPrompt.context}". The student has reviewed this prompt. Provide a score from 0-10 based on learning effectiveness. Format as JSON: { "score": number, "feedback": "string" }`;
        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();
        const evaluation = JSON.parse(text);

        const pointsEarned = evaluation.score * 2;
        const newProgress = Math.min(progress + pointsEarned, 100);
        setProgress(newProgress);

        if (evaluation.score >= 9) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#00BFFF'],
            shapes: ['star', 'circle'],
            scalar: 1.2
          });
        }
      } catch (error) {
        console.error('Error evaluating prompt:', error);
      }
    }

    if (currentPromptIndex < listeningData.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setShowAnswer(false);
    } else {
      handleCompleteChallenge();
      setCanReattempt(attempts < 1);
    }
  };

  const toggleAnswer = () => {
    if (isLocked) return;
    setShowAnswer(!showAnswer);
  };

  const currentPrompt = listeningData[currentPromptIndex];

  if (loading) {
    return (
      <div 
        className="min-h-screen p-8 flex items-center justify-center"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
        <motion.div
          className="bg-black/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Rotate3D className="text-blue-400 mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Generating Listening Challenge...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          className="bg-black/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/what-if')}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
            >
              <ArrowLeft size={20} />
              Back to Challenges
            </button>
            <div className="flex items-center gap-4">
              <label className="text-white font-medium">Grade Level:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20"
              >
                <option value="4-6">4-6 (Beginner)</option>
                <option value="7-9">7-9 (Intermediate)</option>
                <option value="10-12">10-12 (Advanced)</option>
              </select>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center gap-4">
            <Brain className="text-yellow-400" size={48} />
            Listening Comprehension Challenge
          </h1>
          <p className="text-lg text-white/80 mb-6">Sharpen your listening skills with these prompts!</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Progress</span>
              <span>{currentPromptIndex + 1} / {listeningData.length}</span>
            </div>
            <div className="bg-white/10 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentPromptIndex + 1) / listeningData.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Prompt Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPromptIndex}
            className="bg-black/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
            style={{ perspective: '1000px' }}
            initial={{ opacity: 0, rotateX: -20 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 20 }}
            transition={{ duration: 0.8 }}
          >
            {currentPrompt && (
              <div className="text-center space-y-6">
                <motion.div
                  className="bg-white/5 p-8 rounded-2xl transform-gpu"
                  whileHover={{ rotateY: 5, rotateX: 3 }}
                >
                  <h2 className="text-4xl font-bold text-white mb-2">{currentPrompt.prompt}</h2>
                </motion.div>

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-white/5 p-6 rounded-2xl">
                      <h3 className="text-xl font-semibold text-white mb-2">Answer</h3>
                      <p className="text-white/80">{currentPrompt.answer}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl">
                      <h3 className="text-xl font-semibold text-white mb-2">Context</h3>
                      <p className="text-white/80 italic">"{currentPrompt.context}"</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={toggleAnswer}
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                  </motion.button>
                  <motion.button
                    onClick={nextPrompt}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-green-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentPromptIndex < listeningData.length - 1 ? 'Next Prompt' : 'Complete Challenge'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Completion Screen */}
        {showCompletion && (
          <motion.div
            className="bg-black/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Challenge Completed!</h2>
              <p className="text-white/80 text-lg mb-6">
                Great job! You've successfully completed the Listening Comprehension Challenge.
              </p>

              <div className="bg-white/5 p-6 rounded-2xl mb-6">
                <div className="text-white/70 text-sm mb-2">Today's Attempts</div>
                <div className="text-2xl font-bold text-white">{attempts}/2</div>
              </div>

              <div className="flex gap-4 justify-center">
                {canReattempt && (
                  <motion.button
                    onClick={handleReattempt}
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again ({2 - attempts} attempts left)
                  </motion.button>
                )}

                <motion.button
                  onClick={() => navigate('/what-if')}
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-green-600 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  >
                    Back to Challenges
                  </motion.button>
                </div>

                {attempts >= 2 && (
                  <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl mt-6">
                    <p className="text-red-300 text-sm">
                      🔒 Challenge locked for today. Come back tomorrow for a fresh challenge!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

export default ListeningComprehensionChallenge;