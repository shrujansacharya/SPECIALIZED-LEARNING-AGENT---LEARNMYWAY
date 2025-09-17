import React, { useState, useEffect } from 'react';
import { PenTool, ArrowLeft, Star, Trophy, Rotate3D, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDLXMuqZCaMYhf4pWbIoo9_YlRF7zOfHKo');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const WritingChallenge = () => {
  const navigate = useNavigate();
  const [writingPrompt, setWritingPrompt] = useState('');
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('4-6');
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [canReattempt, setCanReattempt] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Fallback profile data
  const fallbackProfile = {
    user_id: 'test-user-id',
    username: 'Student',
    points: 0,
    time_spent: {},
    completed_activities: [],
    progress: { vocabulary: 0, grammar: 0, conversation: 0, pronunciation: 0, reading: 0, writing: 0 },
    badges: []
  };

  useEffect(() => {
    fetchProfile();
    checkAttempts();
    generateWritingPrompt();
  }, [selectedGrade]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        const fetchedProfile = profileData || fallbackProfile;
        setProfile(fetchedProfile);
        setProgress(fetchedProfile.progress?.writing || 0);
      } else {
        setProfile(fallbackProfile);
        setProgress(fallbackProfile.progress.writing);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(fallbackProfile);
      setProgress(fallbackProfile.progress.writing);
    }
  };

  const checkAttempts = () => {
    const today = new Date().toDateString();
    const attemptKey = `writing-attempts-${today}`;
    const stored = localStorage.getItem(attemptKey);
    const completionKey = `writing-completed-${today}`;
    const storedCompletion = localStorage.getItem(completionKey);

    if (stored) {
      const attemptData = JSON.parse(stored);
      setAttempts(attemptData.attempts || 0);
    } else {
      // Reset attempts for new day
      localStorage.removeItem('writing-attempts-' + new Date(Date.now() - 86400000).toDateString());
      setAttempts(0);
    }

    if (storedCompletion || (stored && JSON.parse(stored).attempts >= 2)) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  };

  const saveAttempt = () => {
    const today = new Date().toDateString();
    const attemptKey = `writing-attempts-${today}`;
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
    const completionKey = `writing-completed-${today}`;
    localStorage.setItem(completionKey, 'true');
    setIsLocked(true);
  };

  const resetChallenge = () => {
    setWritingInput('');
    setWritingFeedback('');
    setSubmitted(false);
    setShowCompletion(false);
    setCanReattempt(false);
    setShowCelebration(false);
    setNotification(null);
    generateWritingPrompt();
  };

  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000); // Auto-hide after 4 seconds
  };

  const handleReattempt = () => {
    if (attempts < 2) {
      saveAttempt();
      resetChallenge();
    }
  };

  const generateWritingPrompt = async () => {
    setLoading(true);
    const today = new Date().toDateString();
    const promptKey = `writing-prompt-${selectedGrade}-${today}`;
    const storedPrompt = localStorage.getItem(promptKey);

    if (storedPrompt) {
      setWritingPrompt(storedPrompt);
      setLoading(false);
      return;
    }

    try {
      const prompt = `Generate a creative writing prompt for grades ${selectedGrade}. For grades 4-6, keep it simple with basic vocabulary and short responses. For grades 7-9, include more complex ideas and vocabulary. For grades 10-12, use advanced themes and require detailed responses. Make it engaging and appropriate for the grade level. The prompt should encourage descriptive writing, storytelling, or opinion expression. Format as JSON: { "prompt": "string", "type": "creative|opinion|descriptive", "wordCount": number }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(text);
      setWritingPrompt(data.prompt);
      localStorage.setItem(promptKey, data.prompt);
    } catch (error) {
      console.error('Error generating writing prompt:', error);
      // Fallback prompt
      const fallbackPrompt = "Write a short story about a magical adventure in your favorite place. Describe what you see, hear, and feel during your adventure. Use at least 5 descriptive words.";
      setWritingPrompt(fallbackPrompt);
      localStorage.setItem(promptKey, fallbackPrompt);
    } finally {
      setLoading(false);
    }
  };

  const handleWritingSubmit = async () => {
    if (!writingInput.trim()) {
      showNotification('Please write something before submitting!', 'error');
      return;
    }

    setSubmitted(true);
    saveAttempt(); // Track the attempt
    showNotification('Evaluating your writing...', 'info');

    // AI evaluation of writing
    try {
      const prompt = `Evaluate writing for grades ${selectedGrade}. Prompt: "${writingPrompt}". Student response: "${writingInput}". Analyze grammar, vocabulary, creativity, structure, and coherence. Provide a score from 0-10 and detailed feedback. Format as JSON: { "score": number, "feedback": "string", "strengths": "string", "improvements": "string", "grammarScore": number, "vocabularyScore": number, "creativityScore": number }`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const evaluation = JSON.parse(text);

      const pointsEarned = evaluation.score * 2; // Convert to 0-20 points
      const newProgress = Math.min(progress + pointsEarned, 100);
      setProgress(newProgress);

      // Enhanced confetti animations based on score
      if (evaluation.score >= 9) {
        // Excellent performance
        confetti({
          particleCount: 300,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#00FF00', '#00FFFF', '#008080', '#32CD32', '#40E0D0'],
          shapes: ['circle', 'square'],
          scalar: 1.5,
          gravity: 0.3
        });
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#00FF00', '#00FFFF'],
            shapes: ['star'],
            scalar: 2
          });
        }, 500);
        showNotification(`Excellent work! Score: ${evaluation.score}/10`, 'success');
      } else if (evaluation.score >= 7) {
        // Good performance
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#00FF00', '#00FFFF', '#008080'],
          shapes: ['circle', 'square'],
          scalar: 1.2
        });
        showNotification(`Great job! Score: ${evaluation.score}/10`, 'success');
      } else if (evaluation.score >= 5) {
        // Satisfactory performance
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FF00', '#00FFFF']
        });
        showNotification(`Good effort! Score: ${evaluation.score}/10`, 'success');
      } else {
        showNotification('Your writing needs improvement. Please try again.', 'error');
      }

      // Update profile
      if (profile.user_id !== 'test-user-id') {
        const newProfileProgress = { ...profile.progress, writing: newProgress };
        await supabase
          .from('profiles')
          .update({ progress: newProfileProgress })
          .eq('user_id', profile.user_id);
      }

      setWritingFeedback(`📝 **Writing Evaluation Results:**\n\nOverall Score: ${evaluation.score}/10\n\n💬 ${evaluation.feedback}\n\n✅ **Strengths:** ${evaluation.strengths}\n\n💡 **Improvements:** ${evaluation.improvements}\n\n📊 **Detailed Scores:**\n- Grammar: ${evaluation.grammarScore}/10\n- Vocabulary: ${evaluation.vocabularyScore}/10\n- Creativity: ${evaluation.creativityScore}/10`);

      // Mark as completed
      saveCompletion();

      // Show feedback in completion screen only if score >= 5
      if (evaluation.score >= 5) {
        setShowCompletion(true);
        setShowCelebration(true);
      } else {
        setSubmitted(false);
        setShowCompletion(false);
        setShowCelebration(false);
      }
    } catch (error) {
      // Fallback evaluation
      const wordCount = writingInput.trim().split(/\s+/).length;
      const score = Math.min(wordCount / 10, 10); // Simple scoring based on word count
      const newProgress = Math.min(progress + (score / 2), 100);
      setProgress(newProgress);
      setWritingFeedback(`Word count: ${wordCount}\n\nGreat effort! Your writing shows creativity and thoughtfulness. Keep practicing to improve your writing skills.`);

      // Mark as completed
      saveCompletion();

      // Basic confetti for fallback
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF00', '#00FFFF']
      });

      showNotification('Evaluation complete! Check your feedback.', 'success');

      // Show feedback in completion screen
      setShowCompletion(true);
      setShowCelebration(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-700 flex items-center justify-center">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Rotate3D className="text-teal-400 mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Generating Writing Challenge...</p>
        </motion.div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-700 flex flex-col items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-lg">
          <h2 className="text-3xl font-bold text-white mb-4">Challenge Locked</h2>
          <p className="text-white mb-6">
            You have reached the maximum of 2 attempts for today. Please come back tomorrow to try again.
          </p>
          <button
            onClick={() => navigate('/what-if')}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-teal-600 transition"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-700 p-8 flex flex-col items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 max-w-4xl w-full text-white">
          <h2 className="text-4xl font-extrabold mb-6 flex items-center gap-4">
            <Trophy className="text-yellow-400" size={48} />
            Congratulations! Writing Challenge Completed!
          </h2>
          <div className="whitespace-pre-line mb-6">{writingFeedback}</div>
          <div className="flex justify-center gap-6">
            {attempts < 2 && (
              <button
                onClick={handleReattempt}
                className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-3 rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-teal-600 transition"
              >
                Reattempt Challenge
              </button>
            )}
            <button
              onClick={() => navigate('/what-if')}
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition"
            >
              Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-700 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
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
            <PenTool className="text-teal-400" size={48} />
            Writing Challenge
          </h1>
          <p className="text-lg text-white/80 mb-6">Express yourself through creative writing!</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Status</span>
              <span>{submitted ? 'Completed' : 'In Progress'}</span>
            </div>
            <div className="bg-white/10 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-teal-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: submitted ? '100%' : '50%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Writing Content */}
        <AnimatePresence mode="wait">
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
            style={{ perspective: '1000px' }}
            initial={{ opacity: 0, rotateX: -20 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-8">
              {/* Writing Prompt */}
              <motion.div
                className="bg-white/5 p-6 rounded-2xl"
                whileHover={{ rotateY: 2, rotateX: 1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Writing Prompt</h2>
                <p className="text-white/90 text-lg leading-relaxed">{writingPrompt}</p>
              </motion.div>

              {/* Writing Input */}
              <motion.div
                className="bg-white/5 p-6 rounded-2xl"
                whileHover={{ rotateY: 2, rotateX: 1 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">Your Response</h2>
                <textarea
                  value={writingInput}
                  onChange={(e) => setWritingInput(e.target.value)}
                  placeholder="Start writing your response here..."
                  className="w-full h-64 p-4 rounded-xl bg-white/5 text-white border border-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                  disabled={submitted}
                />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-white/70">
                    Word count: {writingInput.trim().split(/\s+/).filter(word => word.length > 0).length}
                  </p>
                  {!submitted && (
                    <motion.button
                      onClick={handleWritingSubmit}
                      className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Feedback
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Feedback */}
              {submitted && writingFeedback && (
                <motion.div
                  className="bg-white/5 p-6 rounded-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-white whitespace-pre-line">{writingFeedback}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
                notification.type === 'success'
                  ? 'bg-green-500/90 border-green-400 text-white'
                  : notification.type === 'error'
                  ? 'bg-red-500/90 border-red-400 text-white'
                  : 'bg-blue-500/90 border-blue-400 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === 'success' && <Sparkles className="text-yellow-300" size={20} />}
                {notification.type === 'error' && <Star className="text-red-300" size={20} />}
                {notification.type === 'info' && <Rotate3D className="text-blue-300" size={20} />}
                <p className="font-medium">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WritingChallenge;
