import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, Star, Sparkles } from 'lucide-react';
import { GeminiService } from '../lib/gemini-service';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const prompt = `Generate 5 unique daily general knowledge quiz questions. Each question should have 4 options and one correct answer. Format as JSON array of objects with keys: question, options (array), correctAnswer. Make questions educational and varied.`;
      const response = await GeminiService.generateText(prompt);

      // Parse the JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const quiz = JSON.parse(jsonMatch[0]);
        setQuestions(quiz);
        setUserAnswers(new Array(quiz.length).fill(''));
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // Fallback questions
      const fallbackQuiz: QuizQuestion[] = [
        {
          question: 'What is the capital of Japan?',
          options: ['Tokyo', 'Kyoto', 'Osaka', 'Seoul'],
          correctAnswer: 'Tokyo',
        },
        {
          question: 'Who wrote Romeo and Juliet?',
          options: ['Shakespeare', 'Dickens', 'Austen', 'Tolkien'],
          correctAnswer: 'Shakespeare',
        },
      ];
      setQuestions(fallbackQuiz);
      setUserAnswers(new Array(fallbackQuiz.length).fill(''));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    if (isAnswered) return;

    const newAnswers = [...userAnswers];
    newAnswers[index] = answer;
    setUserAnswers(newAnswers);

    // Check if answer is correct
    const correct = questions[index].correctAnswer === answer;
    setIsCorrect(correct);
    setIsAnswered(true);

    // Show celebration for correct answers
    if (correct) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  };

  const submitQuiz = async () => {
    try {
      let correctCount = 0;
      questions.forEach((q, i) => {
        if (q.correctAnswer === userAnswers[i]) correctCount++;
      });

      const percentage = Math.round((correctCount / questions.length) * 100);
      const validation = `Score: ${correctCount}/${questions.length} (${percentage}%). ${
        percentage >= 80 ? 'Excellent work! 🌟' :
        percentage >= 60 ? 'Good job! Keep practicing! 📚' :
        'Keep learning! You\'ll get better! 💪'
      }`;

      setScore(correctCount);
      setValidationMessage(validation);

      // Show final celebration if score is high
      if (percentage >= 80) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }
    } catch (error) {
      console.error('Error validating quiz:', error);
      setValidationMessage('Error validating answers.');
    }
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-xl">Generating your daily quiz...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = userAnswers.every(answer => answer !== '');

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col items-center relative overflow-hidden">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="text-center animate-bounce">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">Congratulations! 🎉</h2>
            <p className="text-xl text-white">Amazing work! You're a star! ⭐</p>
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating sparkles for celebration */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute w-6 h-6 text-yellow-400 animate-ping"
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

      <h1 className="text-5xl font-bold mb-8 text-center">Daily Quiz Challenge</h1>

      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-center">{currentQuestion.question}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, j) => {
              const isSelected = userAnswers[currentQuestionIndex] === opt;
              const isCorrectOption = opt === currentQuestion.correctAnswer;
              const showResult = isAnswered;

              return (
                <button
                  key={j}
                  onClick={() => handleAnswerChange(currentQuestionIndex, opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                    showResult && isCorrectOption
                      ? 'bg-green-500 text-white shadow-lg'
                      : showResult && isSelected && !isCorrectOption
                      ? 'bg-red-500 text-white shadow-lg'
                      : isSelected
                      ? 'bg-yellow-400 text-black shadow-lg'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{opt}</span>
                    {showResult && isCorrectOption && <CheckCircle className="w-6 h-6 text-white" />}
                    {showResult && isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold transition-colors"
          >
            Back to Tasks
          </button>

          <div className="flex gap-4">
            {currentQuestionIndex < questions.length - 1 && isAnswered && (
              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors"
              >
                Next Question
              </button>
            )}

            {allAnswered && (
              <button
                onClick={submitQuiz}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {score !== null && (
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">Quiz Complete!</h3>
            <p className="text-xl mb-4">{validationMessage}</p>
            <div className="flex justify-center gap-2">
              {Array.from({ length: questions.length }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < score ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
