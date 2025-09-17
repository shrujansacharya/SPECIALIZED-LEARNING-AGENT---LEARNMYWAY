import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DailyQuizData {
  date: string;
  grade: string;
  questions: QuizQuestion[];
}

export const DailyQuiz = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [quiz, setQuiz] = useState<DailyQuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Fallback profile
  const fallbackProfile = {
    user_id: 'test-user-id',
    username: 'Student',
    grade: '4-6'
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
        loadOrGenerateQuiz(fetchedProfile.grade || '4-6');
      } else {
        setProfile(fallbackProfile);
        loadOrGenerateQuiz('4-6');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(fallbackProfile);
      loadOrGenerateQuiz('4-6');
    }
  };

  const loadOrGenerateQuiz = async (grade: string) => {
    const today = new Date().toDateString();
    const quizKey = `daily-quiz-${grade}-${today}`;
    const storedQuiz = localStorage.getItem(quizKey);

    if (storedQuiz) {
      const parsedQuiz = JSON.parse(storedQuiz);
      setQuiz(parsedQuiz);
      setLoading(false);
    } else {
      await generateDailyQuiz(grade, today, quizKey);
    }
  };

  const generateDailyQuiz = async (grade: string, date: string, key: string) => {
    setGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const gradeMap = {
        '4-6': 'elementary school (grades 4-6)',
        '7-9': 'middle school (grades 7-9)',
        '10-12': 'high school (grades 10-12)'
      };

      const prompt = `Generate 5 multiple choice questions for a ${gradeMap[grade as keyof typeof gradeMap] || 'general'} student. The questions should cover various subjects like math, science, history, literature, or geography. Each question should have 4 options (A, B, C, D) and one correct answer.

Format the response as a JSON array with this structure for each question:
{
  "id": "unique-id",
  "question": "The question text",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correctAnswer": "A",
  "difficulty": "medium"
}

Make sure the questions are educational and appropriate for the grade level.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse quiz data');
      }

      const questions = JSON.parse(jsonMatch[0]);
      const quizData: DailyQuizData = {
        date,
        grade,
        questions
      };

      localStorage.setItem(key, JSON.stringify(quizData));
      setQuiz(quizData);
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Fallback quiz
      const fallbackQuiz: DailyQuizData = {
        date,
        grade,
        questions: [
          {
            id: '1',
            question: 'What is 2 + 2?',
            options: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
            correctAnswer: 'B',
            difficulty: 'easy'
          },
          {
            id: '2',
            question: 'What is the capital of France?',
            options: ['A) London', 'B) Berlin', 'C) Paris', 'D) Rome'],
            correctAnswer: 'C',
            difficulty: 'easy'
          },
          {
            id: '3',
            question: 'What is H2O?',
            options: ['A) Oxygen', 'B) Hydrogen', 'C) Water', 'D) Carbon Dioxide'],
            correctAnswer: 'C',
            difficulty: 'easy'
          },
          {
            id: '4',
            question: 'What is 10 x 10?',
            options: ['A) 100', 'B) 1000', 'C) 10', 'D) 20'],
            correctAnswer: 'A',
            difficulty: 'easy'
          },
          {
            id: '5',
            question: 'What color is the sky on a clear day?',
            options: ['A) Green', 'B) Blue', 'C) Red', 'D) Yellow'],
            correctAnswer: 'B',
            difficulty: 'easy'
          }
        ]
      };
      localStorage.setItem(key, JSON.stringify(fallbackQuiz));
      setQuiz(fallbackQuiz);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed - trigger celebration
      const finalScore = calculateScore();
      const totalQuestions = quiz?.questions.length || 0;

      // Trigger confetti animation
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'],
        shapes: ['circle', 'square'],
        scalar: 1.2
      });

      // Award badge based on performance
      const badgeEarned = finalScore === totalQuestions ? 'Perfect Score!' :
                          finalScore >= totalQuestions * 0.8 ? 'Excellent!' :
                          finalScore >= totalQuestions * 0.6 ? 'Good Job!' : 'Keep Trying!';

      // Show congratulation alert
      setTimeout(() => {
        alert(`🎉 Daily Quiz Completed! ${badgeEarned}\nYou earned ${finalScore * 10} XP!`);
      }, 500);

      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your daily quiz...</p>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Generating your personalized quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Failed to load quiz. Please try again.</p>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const score = calculateScore();
  const totalQuestions = quiz.questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            onClick={() => navigate('/menu')}
            className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            Back to Menu
          </motion.button>
          <div className="text-white text-right">
            <p className="text-sm opacity-80">Grade Level: {quiz.grade}</p>
            <p className="text-sm opacity-80">Date: {quiz.date}</p>
          </div>
        </div>

        {!showResults ? (
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-4">
                <Trophy className="text-yellow-400" size={40} />
                Daily Quiz
              </h1>
              <div className="flex justify-center items-center gap-4 text-white">
                <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">{currentQ.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(option.charAt(0))}
                    className={`p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedAnswers[currentQuestion] === option.charAt(0)
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={nextQuestion}
                disabled={!selectedAnswers[currentQuestion]}
                className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
              >
                {currentQuestion === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <Trophy className="text-yellow-400 mx-auto mb-4" size={60} />
              <h1 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h1>
              <p className="text-xl text-white/80 mb-6">
                You scored {score} out of {totalQuestions}
              </p>
              <div className="flex justify-center items-center gap-2 mb-6">
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedAnswers[i] === quiz.questions[i].correctAnswer
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {selectedAnswers[i] === quiz.questions[i].correctAnswer ? (
                      <CheckCircle size={16} className="text-white" />
                    ) : (
                      <XCircle size={16} className="text-white" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Review Your Answers</h2>
              <div className="space-y-4 text-left">
                {quiz.questions.map((q, index) => (
                  <div key={q.id} className="bg-white/5 p-4 rounded-xl">
                    <p className="text-white font-medium mb-2">{q.question}</p>
                    <p className="text-green-400 text-sm">
                      Correct: {q.options.find(opt => opt.startsWith(q.correctAnswer))}
                    </p>
                    <p className={`text-sm ${
                      selectedAnswers[index] === q.correctAnswer ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Your answer: {selectedAnswers[index] ? q.options.find(opt => opt.startsWith(selectedAnswers[index])) : 'Not answered'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={resetQuiz}
                className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
              <motion.button
                onClick={() => navigate('/menu')}
                className="px-8 py-4 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Menu
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DailyQuiz;
