import React, { useState, useEffect } from 'react';
import { Book, ArrowLeft, Star, Trophy, Rotate3D } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDLXMuqZCaMYhf4pWbIoo9_YlRF7zOfHKo');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const ReadingChallenge = () => {
  const navigate = useNavigate();
  const [readingPassage, setReadingPassage] = useState<any>(null);
  const [readingAnswers, setReadingAnswers] = useState<{ [key: number]: string }>({});
  const [readingSubmitted, setReadingSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('4-6');
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [canReattempt, setCanReattempt] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null);

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
    generateReadingChallenge();
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
        setProgress(fetchedProfile.progress?.reading || 0);
      } else {
        setProfile(fallbackProfile);
        setProgress(fallbackProfile.progress.reading);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(fallbackProfile);
      setProgress(fallbackProfile.progress.reading);
    }
  };

  const checkAttempts = () => {
    const today = new Date().toDateString();
    const attemptKey = `reading-attempts-${today}`;
    const stored = localStorage.getItem(attemptKey);

    if (stored) {
      const attemptData = JSON.parse(stored);
      setAttempts(attemptData.attempts || 0);
      setIsLocked(attemptData.attempts >= 2);
    } else {
      // Reset attempts for new day
      localStorage.removeItem('reading-attempts-' + new Date(Date.now() - 86400000).toDateString());
      setAttempts(0);
      setIsLocked(false);
    }
  };

  const saveAttempt = () => {
    const today = new Date().toDateString();
    const attemptKey = `reading-attempts-${today}`;
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

  const resetChallenge = () => {
    setReadingPassage(null);
    setReadingAnswers({});
    setReadingSubmitted(false);
    setShowCompletion(false);
    setCanReattempt(false);
    setFeedback('');
    generateReadingChallenge();
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

  const awardBadgeAndPoints = async (score: number) => {
    if (!profile || profile.user_id === 'test-user-id') return;

    let badgeToAward: string | null = null;
    let pointsToAward = 0;

    // Define badge awarding logic based on score thresholds
    if (score >= 90) {
      badgeToAward = 'Reading Master';
      pointsToAward = 20;
    } else if (score >= 75) {
      badgeToAward = 'Reading Pro';
      pointsToAward = 15;
    } else if (score >= 50) {
      badgeToAward = 'Reading Beginner';
      pointsToAward = 10;
    }

    if (badgeToAward) {
      // Avoid duplicate badges
      const hasBadge = profile.badges.includes(badgeToAward);
      if (!hasBadge) {
        const updatedBadges = [...profile.badges, badgeToAward];
        const updatedPoints = (profile.points || 0) + pointsToAward;

        // Update profile locally
        setProfile(prev => ({
          ...prev,
          badges: updatedBadges,
          points: updatedPoints
        }));

        setEarnedBadge(badgeToAward);
        setEarnedPoints(pointsToAward);

        // Update profile in supabase
        await supabase
          .from('profiles')
          .update({ badges: updatedBadges, points: updatedPoints })
          .eq('user_id', profile.user_id);
      } else {
        // Already has badge, just award points
        const updatedPoints = (profile.points || 0) + pointsToAward;
        setProfile(prev => ({
          ...prev,
          points: updatedPoints
        }));
        setEarnedPoints(pointsToAward);
        await supabase
          .from('profiles')
          .update({ points: updatedPoints })
          .eq('user_id', profile.user_id);
      }
    }
  };

  const generateReadingChallenge = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a reading comprehension passage for grades ${selectedGrade}. Include: passage (200-300 words), 5 comprehension questions with multiple choice answers (A, B, C, D). Make the passage engaging and appropriate for the grade level. Format as JSON: { "passage": "string", "questions": [{ "id": number, "question": "string", "options": ["A", "B", "C", "D"], "correctAnswer": "A|B|C|D" }] }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(text);
      setReadingPassage(data);
    } catch (error) {
      console.error('Error generating reading passage:', error);
      // Fallback data
      const fallbackData = {
        passage: "The Amazon Rainforest is the largest rainforest in the world. It covers about 5.5 million square kilometers and spans nine countries in South America. The Amazon is home to millions of different species of plants and animals, many of which are found nowhere else on Earth. The rainforest plays a crucial role in regulating the Earth's climate by absorbing carbon dioxide and producing oxygen. However, the Amazon is under threat from deforestation, which destroys habitats and contributes to climate change. Conservation efforts are underway to protect this vital ecosystem.",
        questions: [
          { id: 1, question: "What is the Amazon Rainforest?", options: ["A: The largest desert in the world", "B: The largest rainforest in the world", "C: The largest ocean in the world", "D: The largest mountain range in the world"], correctAnswer: "B" },
          { id: 2, question: "How many countries does the Amazon span?", options: ["A: 5", "B: 7", "C: 9", "D: 11"], correctAnswer: "C" },
          { id: 3, question: "What role does the Amazon play in regulating Earth's climate?", options: ["A: Absorbing carbon dioxide and producing oxygen", "B: Creating deserts", "C: Causing earthquakes", "D: Melting ice caps"], correctAnswer: "A" },
          { id: 4, question: "What is threatening the Amazon?", options: ["A: Too much rain", "B: Deforestation", "C: Too many animals", "D: Too many plants"], correctAnswer: "B" },
          { id: 5, question: "What are conservation efforts trying to do?", options: ["A: Destroy the rainforest", "B: Protect the ecosystem", "C: Build cities in the rainforest", "D: Create more deserts"], correctAnswer: "B" }
        ]
      };
      setReadingPassage(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setReadingAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitReading = async () => {
    if (!readingPassage) return;

    setReadingSubmitted(true);
    let totalScore = 0;
    let correctAnswers = 0;

    // AI evaluation for each answer using keyword matching and probability
    try {
      for (const q of readingPassage.questions) {
        const studentAnswer = readingAnswers[q.id];
        if (!studentAnswer) continue;

        const prompt = `Evaluate the student's answer for this reading comprehension question using keyword matching and probability assessment. Question: "${q.question}". Options: ${q.options.join(', ')}. Correct answer: "${q.correctAnswer}". Student selected: "${studentAnswer}". Passage context: "${readingPassage.passage.substring(0, 200)}...". Analyze if the student's answer matches key concepts and provide a probability score (0-1) of correctness. Consider synonyms, related terms, and understanding of the passage. Format as JSON: { "correct": boolean, "probability": number, "feedback": "string", "keyMatches": "string" }`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();
        const evaluation = JSON.parse(text);

        totalScore += evaluation.probability;
        if (evaluation.correct) {
          correctAnswers++;
        }
      }

      const averageScore = (totalScore / readingPassage.questions.length) * 10; // Convert to 0-10 scale
      const percentageScore = (totalScore / readingPassage.questions.length) * 100;

      // Overall AI evaluation of reading comprehension
      const overallPrompt = `Evaluate overall reading comprehension for grades ${selectedGrade}. Student achieved ${percentageScore.toFixed(1)}% correctness based on keyword matching and probability assessment. Passage was about: "${readingPassage.passage.substring(0, 100)}...". Provide detailed feedback on reading comprehension skills, areas of strength, and suggestions for improvement. Format as JSON: { "score": number, "feedback": "string", "strengths": "string", "improvements": "string" }`;
      const overallResult = await model.generateContent(overallPrompt);
      const overallResponse = await overallResult.response;
      const overallText = overallResponse.text().replace(/```json|```/g, '').trim();
      const overallEvaluation = JSON.parse(overallText);

      const pointsEarned = overallEvaluation.score * 2; // Convert to 0-20 points
      const newProgress = Math.min(progress + pointsEarned, 100);
      setProgress(newProgress);

      // Enhanced confetti based on performance
      if (overallEvaluation.score >= 9) {
        // Excellent performance
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'],
          shapes: ['circle', 'square'],
          scalar: 1.2,
          gravity: 0.3
        });
      } else if (overallEvaluation.score >= 7) {
        // Good performance
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00BFFF'],
          shapes: ['circle', 'square'],
          scalar: 1.1
        });
      } else if (overallEvaluation.score >= 5) {
        // Satisfactory performance
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF69B4'],
          shapes: ['circle']
        });
      }

      // Update profile
      if (profile.user_id !== 'test-user-id') {
        const newProfileProgress = { ...profile.progress, reading: newProgress };
        await supabase
          .from('profiles')
          .update({ progress: newProfileProgress })
          .eq('user_id', profile.user_id);
      }

      setFeedback(`📖 **Reading Comprehension Results:**\n\nKeyword Match Score: ${percentageScore.toFixed(1)}%\nCorrect Answers: ${correctAnswers}/${readingPassage.questions.length}\n\n💬 ${overallEvaluation.feedback}\n\n✅ **Strengths:** ${overallEvaluation.strengths}\n\n💡 **Improvements:** ${overallEvaluation.improvements}`);

      // Show completion screen after a delay
      setTimeout(() => {
        setCanReattempt(attempts < 2);
        handleCompleteChallenge();
      }, 3000);
    } catch (error) {
      // Fallback scoring using exact matching
      readingPassage.questions.forEach((q: any) => {
        if (readingAnswers[q.id] === q.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / readingPassage.questions.length) * 100;
      const newProgress = Math.min(progress + (score / 5), 100);
      setProgress(newProgress);

      // Basic confetti for fallback
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700']
      });

      setFeedback(`Score: ${correctAnswers}/${readingPassage.questions.length} (${score.toFixed(1)}%)\n\nGreat effort! Keep practicing your reading comprehension skills.`);

      // Show completion screen after a delay
      setTimeout(() => {
        setCanReattempt(attempts < 2);
        handleCompleteChallenge();
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-blue-700 flex items-center justify-center">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Rotate3D className="text-green-400 mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Generating Reading Challenge...</p>
        </motion.div>
      </div>
    );
  }

  // Locked Screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-blue-700 flex items-center justify-center p-8">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Challenge Locked</h2>
          <p className="text-white/80 mb-6">
            You've reached the maximum attempts (2) for today. Come back tomorrow for a fresh challenge!
          </p>
          <button
            onClick={() => navigate('/what-if')}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300"
          >
            Back to Challenges
          </button>
        </motion.div>
      </div>
    );
  }

  // Completion Screen
  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-blue-700 flex items-center justify-center p-8">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-4">Reading Challenge Completed!</h2>
          <p className="text-white/80 mb-6">
            Great job! You've successfully completed the Reading Challenge.
          </p>

          {/* Feedback Display */}
          {feedback && (
            <motion.div
              className="bg-white/5 p-4 rounded-2xl mb-6 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-white whitespace-pre-line text-sm">{feedback}</p>
            </motion.div>
          )}

          <div className="flex gap-4 justify-center">
            {canReattempt && (
              <motion.button
                onClick={handleReattempt}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again ({2 - attempts} left)
              </motion.button>
            )}
            <motion.button
              onClick={() => navigate('/what-if')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Challenges
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-blue-700 p-8">
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
            <Book className="text-green-400" size={48} />
            Reading Challenge
          </h1>
          <p className="text-lg text-white/80 mb-6">Test your reading comprehension skills!</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Status</span>
              <span>{readingSubmitted ? 'Completed' : 'In Progress'}</span>
            </div>
            <div className="bg-white/10 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: readingSubmitted ? '100%' : '50%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Reading Content */}
        <AnimatePresence mode="wait">
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
            style={{ perspective: '1000px' }}
            initial={{ opacity: 0, rotateX: -20 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {readingPassage && (
              <div className="space-y-8">
                {/* Passage */}
                <motion.div
                  className="bg-white/5 p-6 rounded-2xl"
                  whileHover={{ rotateY: 2, rotateX: 1 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Reading Passage</h2>
                  <p className="text-white/90 leading-relaxed">{readingPassage.passage}</p>
                </motion.div>

                {/* Questions */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Comprehension Questions</h2>
                  {readingPassage.questions.map((q: any, index: number) => (
                    <motion.div
                      key={q.id}
                      className="bg-white/5 p-6 rounded-2xl"
                      whileHover={{ rotateY: 2, rotateX: 1 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-4">{q.question}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((option: string) => (
                          <label key={option} className="flex items-center gap-3 text-white/80">
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={option.charAt(0)}
                              checked={readingAnswers[q.id] === option.charAt(0)}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              disabled={readingSubmitted}
                              className="accent-green-400"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Submit Button */}
                {!readingSubmitted && (
                  <div className="flex justify-center">
                    <motion.button
                      onClick={submitReading}
                      className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Submit Answers
                    </motion.button>
                  </div>
                )}

                {/* Feedback */}
                {readingSubmitted && feedback && (
                  <motion.div
                    className="bg-white/5 p-6 rounded-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-white whitespace-pre-line">{feedback}</p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReadingChallenge;
