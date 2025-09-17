import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, Star, Sparkles, BookOpen, Lightbulb, Award, Zap, Heart } from 'lucide-react';
import { GeminiService } from '../lib/gemini-service';
import confetti from 'canvas-confetti';

interface ReadingChallenge {
  title: string;
  text: string;
  question: string;
  answer: string;
  hint?: string;
}

const ReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<ReadingChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('6-10');
  const [isLocked, setIsLocked] = useState(false);
  const [canReattempt, setCanReattempt] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    checkAttempts();
  }, [selectedGrade]);

  // Load saved state after initial setup
  useEffect(() => {
    loadSavedChallengeState();
  }, [selectedGrade]);

  // Save challenge state when component unmounts or key state changes
  useEffect(() => {
    const saveChallengeState = () => {
      if (challenge && !showCompletion && !isLocked) {
        const challengeState = {
          challenge,
          userAnswer,
          validationMessage,
          isCorrect,
          submitted,
          showHint,
          attempts,
          selectedGrade,
          timestamp: Date.now()
        };
        localStorage.setItem('reading-challenge-state', JSON.stringify(challengeState));
      }
    };

    // Save state on unmount
    return () => {
      saveChallengeState();
    };
  }, [challenge, userAnswer, validationMessage, isCorrect, submitted, showHint, attempts, selectedGrade, showCompletion, isLocked]);

  const loadSavedChallengeState = async () => {
    const savedState = localStorage.getItem('reading-challenge-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        // Check if the saved state is from today (within 24 hours)
        const isRecent = Date.now() - state.timestamp < 24 * 60 * 60 * 1000;

        if (isRecent && state.selectedGrade === selectedGrade) {
          setChallenge(state.challenge);
          setUserAnswer(state.userAnswer || '');
          setValidationMessage(state.validationMessage || '');
          setIsCorrect(state.isCorrect || false);
          setSubmitted(state.submitted || false);
          setShowHint(state.showHint || false);
          setAttempts(state.attempts || 0);
          setLoading(false);
          return; // Don't generate new challenges if we have saved state
        } else {
          // Clear old state
          localStorage.removeItem('reading-challenge-state');
        }
      } catch (error) {
        console.error('Error loading saved challenge state:', error);
        localStorage.removeItem('reading-challenge-state');
      }
    }

    // Generate new challenges if no valid saved state
    fetchChallenge();
  };

  const checkAttempts = () => {
    const today = new Date().toDateString();
    const attemptKey = `reading-attempts-${today}`;
    const stored = localStorage.getItem(attemptKey);
    const completionKey = `reading-completed-${today}`;
    const storedCompletion = localStorage.getItem(completionKey);

    if (stored) {
      const attemptData = JSON.parse(stored);
      setAttempts(attemptData.attempts || 0);
    } else {
      // Reset attempts for new day
      localStorage.removeItem('reading-attempts-' + new Date(Date.now() - 86400000).toDateString());
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

  const saveCompletion = () => {
    const today = new Date().toDateString();
    const completionKey = `reading-completed-${today}`;
    localStorage.setItem(completionKey, 'true');
    setIsLocked(true);
    // Clear saved challenge state when completed
    localStorage.removeItem('reading-challenge-state');
  };

  const resetChallenge = () => {
    setUserAnswer('');
    setValidationMessage('');
    setShowCelebration(false);
    setIsCorrect(false);
    setShowHint(false);
    setSubmitted(false);
    setShowCompletion(false);
    setCanReattempt(false);
    // Clear saved challenge state when resetting
    localStorage.removeItem('reading-challenge-state');
    fetchChallenge();
  };

  const handleReattempt = () => {
    if (attempts < 2) {
      saveAttempt();
      resetChallenge();
    }
  };

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a unique daily reading comprehension challenge for grades ${selectedGrade}. Create simple content suitable for students. Provide:
      1. A title
      2. A short reading passage (1-2 paragraphs, appropriate vocabulary)
      3. A comprehension question (clear and understandable)
      4. The correct answer
      5. An optional helpful hint
      Format as JSON: {"title": "string", "text": "string", "question": "string", "answer": "string", "hint": "string"}`;

      const response = await GeminiService.generateText(prompt);

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generatedChallenge = JSON.parse(jsonMatch[0]);
        setChallenge(generatedChallenge);
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
      // Fallback challenge
      const fallbackChallenge: ReadingChallenge = {
        title: 'Reading Comprehension',
        text: 'The quick brown fox jumps over the lazy dog. This is a pangram. A pangram is a sentence that contains every letter of the alphabet at least once.',
        question: 'What is the sentence an example of?',
        answer: 'Pangram',
        hint: 'It contains all letters of the alphabet.',
      };
      setChallenge(fallbackChallenge);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!challenge || isLocked) return;

    setSubmitted(true);
    saveAttempt();

    try {
      // Use Gemini API to validate answer
      const validationPrompt = `You are evaluating a student's reading comprehension answer for grades ${selectedGrade}.

Passage: "${challenge.text}"

Question: "${challenge.question}"

Correct Answer: "${challenge.answer}"

Student's Answer: "${userAnswer}"

Please evaluate if the student's answer is correct. Consider:
1. Does it match the correct answer in meaning?
2. Are there synonyms or equivalent expressions?
3. Does it demonstrate understanding of the passage?
4. Is it close enough to be considered correct?

Respond with JSON format: {"isCorrect": boolean, "feedback": "brief explanation of why it's correct/incorrect and encouragement"}

Be appropriate for the grade level but maintain accuracy.`;

      const validationResponse = await GeminiService.generateText(validationPrompt);
      const jsonMatch = validationResponse.match(/\{[\s\S]*\}/);
      let validation;

      if (jsonMatch) {
        validation = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to simple matching
        const userAns = userAnswer.trim().toLowerCase();
        const correctAns = challenge.answer.toLowerCase();
        const isCorrectFallback = userAns.includes(correctAns) || correctAns.includes(userAns);
        validation = {
          isCorrect: isCorrectFallback,
          feedback: isCorrectFallback ? 'Great job! You understood the passage correctly.' : 'Keep trying! Read the passage again carefully.'
        };
      }

      setIsCorrect(validation.isCorrect);
      setValidationMessage(validation.feedback);

      if (validation.isCorrect) {
        setShowCelebration(true);
        saveCompletion();
        setShowCompletion(true);

        // Enhanced multi-burst confetti celebration
        confetti({
          particleCount: 400,
          spread: 180,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500', '#FF1493', '#00FF7F', '#FFFF00'],
          shapes: ['circle', 'square', 'star'],
          scalar: 1.8,
          gravity: 0.3,
          drift: 0.1
        });

        // Side bursts
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { x: 0.1, y: 0.4 },
            colors: ['#FFD700', '#FF69B4', '#FFFF00'],
            shapes: ['star', 'circle'],
            scalar: 1.5
          });
        }, 600);

        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { x: 0.9, y: 0.4 },
            colors: ['#00BFFF', '#32CD32', '#FF1493'],
            shapes: ['star', 'circle'],
            scalar: 1.5
          });
        }, 900);

        // Top burst
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 200,
            origin: { y: 0.1 },
            colors: ['#FFD700', '#FF69B4', '#00BFFF'],
            shapes: ['star'],
            scalar: 1.2,
            gravity: 0.5
          });
        }, 1200);

        setTimeout(() => setShowCelebration(false), 6000);
      } else {
        const feedback = attempts >= 1
          ? 'Not quite right. Try using the hint! 💡'
          : 'Keep reading! You\'re getting there! 📚';
        setValidationMessage(feedback);
      }
    } catch (error) {
      console.error('Error validating reading:', error);
      setValidationMessage('Error validating answer.');
    }
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (loading || !challenge) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-xl">Preparing your reading challenge...</p>
        <BookOpen className="w-16 h-16 mt-4 text-yellow-400 animate-pulse" />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-lg">
          <h2 className="text-3xl font-bold text-white mb-4">Challenge Locked</h2>
          <p className="text-white mb-6">
            You have completed today's reading challenge. Please come back tomorrow for new challenges.
          </p>
          <button
            onClick={() => navigate('/what-if')}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 flex flex-col items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 max-w-4xl w-full text-white">
          <h2 className="text-4xl font-extrabold mb-6 flex items-center gap-4">
            <Trophy className="text-yellow-400" size={48} />
            Reading Challenge Completed!
          </h2>
          <div className="whitespace-pre-line mb-6">{validationMessage}</div>
          <div className="flex justify-center gap-6">
            {attempts < 2 && (
              <button
                onClick={handleReattempt}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 rounded-lg font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
              >
                Reattempt Challenge
              </button>
            )}
            <button
              onClick={() => navigate('/what-if')}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition"
            >
              Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center relative overflow-hidden">
      {/* Enhanced Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/80 via-purple-900/80 to-blue-900/80 backdrop-blur-md">
          <div className="text-center animate-bounce">
            {/* Glowing trophy with multiple effects */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-60 animate-pulse scale-150"></div>
              <div className="absolute inset-0 bg-pink-400 rounded-full blur-xl opacity-40 animate-ping scale-125"></div>
              <Trophy className="w-40 h-40 text-yellow-400 mx-auto relative z-10 animate-bounce drop-shadow-2xl" />
            </div>

            {/* Celebration title with emojis */}
            <div className="mb-6">
              <h2 className="text-6xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text animate-pulse mb-2">
                🎉 INCREDIBLE! 🎉
              </h2>
              <h3 className="text-4xl font-bold text-white mb-2 animate-bounce">Reading Champion! 📖</h3>
              <p className="text-2xl text-yellow-200 mb-4 animate-pulse">You mastered the comprehension! Brilliant work! ⭐</p>
            </div>

            {/* Animated achievement elements */}
            <div className="flex justify-center items-center mb-6 space-x-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="relative">
                  <Award
                    className="w-12 h-12 text-yellow-400 animate-spin"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '3s'
                    }}
                  />
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-50 animate-ping scale-150"></div>
                </div>
              ))}
            </div>

            {/* Motivational message with heart */}
            <div className="bg-gradient-to-r from-yellow-400/30 via-pink-400/30 to-purple-400/30 rounded-3xl p-6 mb-6 border-2 border-yellow-400/50">
              <div className="flex items-center justify-center mb-3">
                <Heart className="w-8 h-8 text-red-400 animate-pulse mr-2" />
                <span className="text-xl text-white font-bold">You're Amazing!</span>
                <Heart className="w-8 h-8 text-red-400 animate-pulse ml-2" />
              </div>
              <p className="text-lg text-white font-semibold">
                🌟 You're a reading superstar! Keep up the excellent work! 🌟
              </p>
            </div>

            {/* Achievement badge with lightning effect */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full blur-lg opacity-70 animate-pulse"></div>
              <div className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full px-8 py-4 relative z-10 border-2 border-white/30">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-yellow-200 animate-bounce" />
                  <span className="text-white font-bold text-xl">🏆 Comprehension Master 🏆</span>
                  <Zap className="w-6 h-6 text-yellow-200 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Floating celebration elements */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Sparkles */}
          {[...Array(30)].map((_, i) => (
            <Sparkles
              key={`sparkle-${i}`}
              className="absolute w-10 h-10 text-yellow-400 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: '5s'
              }}
            />
          ))}

          {/* Floating hearts */}
          {[...Array(15)].map((_, i) => (
            <Heart
              key={`heart-${i}`}
              className="absolute w-6 h-6 text-red-400 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: '4s'
              }}
            />
          ))}

          {/* Colorful celebration orbs */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute w-4 h-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: '4s'
              }}
            />
          ))}

          {/* Trophy miniatures */}
          {[...Array(8)].map((_, i) => (
            <Trophy
              key={`mini-trophy-${i}`}
              className="absolute w-6 h-6 text-yellow-400 animate-spin"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}

      <h1 className="text-5xl font-bold mb-8 text-center">Reading Challenge</h1>

      <div className="w-full max-w-4xl">
        {/* Challenge Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">{challenge.title}</h2>
            <BookOpen className="w-16 h-16 mx-auto text-blue-400 mb-4" />
          </div>

          {/* Reading Text */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-center">Reading Passage:</h3>
            <p className="text-lg leading-relaxed">{challenge.text}</p>
          </div>

          {/* Question */}
          <div className="bg-blue-900/30 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-center">Comprehension Question:</h3>
            <p className="text-lg text-center font-medium">{challenge.question}</p>
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3 text-center">Your Answer:</label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full bg-white/20 border-2 border-white/30 rounded-xl p-4 text-white text-center text-lg placeholder-white/50 focus:border-yellow-400 focus:outline-none transition-colors resize-none"
              placeholder="Write your answer here..."
              rows={3}
              disabled={isCorrect}
            />
          </div>

          {/* Hint Section */}
          {challenge.hint && (
            <div className="mb-6">
              <button
                onClick={toggleHint}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Lightbulb className="w-5 h-5" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              {showHint && (
                <div className="mt-3 bg-blue-900/50 rounded-lg p-4 text-center">
                  <p className="text-blue-200 italic">💡 {challenge.hint}</p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || isCorrect}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCorrect ? '✅ Completed!' : 'Submit Answer'}
            </button>
          </div>
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div className={`mb-8 p-6 rounded-xl text-center text-lg font-semibold ${
            isCorrect
              ? 'bg-green-500/20 border-2 border-green-400 text-green-200'
              : 'bg-red-500/20 border-2 border-red-400 text-red-200'
          }`}>
            <div className="flex items-center justify-center gap-3">
              {isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              <span>{validationMessage}</span>
            </div>
          </div>
        )}

        {/* Attempts Counter */}
        {attempts > 0 && !isCorrect && (
          <div className="text-center mb-6">
            <p className="text-yellow-300">Attempts: {attempts}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/what-if')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingPage;
