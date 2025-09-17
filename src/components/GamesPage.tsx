import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, Star, Sparkles, Puzzle, Lightbulb } from 'lucide-react';
import { GeminiService } from '../lib/gemini-service';

interface Game {
  title: string;
  instructions: string;
  riddle: string;
  answer: string;
  hint?: string;
}

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    fetchGame();
  }, []);

  const fetchGame = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a unique daily mini game challenge in the form of a riddle. Provide:
      1. A title
      2. Instructions
      3. The riddle
      4. The correct answer
      5. An optional hint
      Format as JSON: {"title": "string", "instructions": "string", "riddle": "string", "answer": "string", "hint": "string"}`;

      const response = await GeminiService.generateText(prompt);

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generatedGame = JSON.parse(jsonMatch[0]);
        setGame(generatedGame);
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      // Fallback game
      const fallbackGame: Game = {
        title: 'Riddle Game',
        instructions: 'Solve the riddle.',
        riddle: 'What has keys but can\'t open locks?',
        answer: 'Piano',
        hint: 'It is a musical instrument.',
      };
      setGame(fallbackGame);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!game) return;

    setAttempts(prev => prev + 1);

    try {
      const userAns = userAnswer.trim().toLowerCase();
      const correctAns = game.answer.toLowerCase();
      const correct = userAns === correctAns;

      setIsCorrect(correct);

      if (correct) {
        setValidationMessage('🎉 Correct! You solved the riddle! 🧩');
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      } else {
        const feedback = attempts >= 2
          ? 'Not quite right. Try using the hint! 💡'
          : 'Keep trying! You can do it! 🤔';
        setValidationMessage(feedback);
      }
    } catch (error) {
      console.error('Error validating game:', error);
      setValidationMessage('Error validating answer.');
    }
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (loading || !game) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-xl">Preparing your mini game...</p>
        <Puzzle className="w-16 h-16 mt-4 text-yellow-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center relative overflow-hidden">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="text-center animate-bounce">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">Riddle Master! 🧩</h2>
            <p className="text-xl text-white">You cracked the riddle! Amazing job! ⭐</p>
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
          {[...Array(15)].map((_, i) => (
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

      <h1 className="text-5xl font-bold mb-8 text-center">Mini Game Challenge</h1>

      <div className="w-full max-w-4xl">
        {/* Game Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">{game.title}</h2>
            <Puzzle className="w-16 h-16 mx-auto text-blue-400 mb-4" />
          </div>

          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <p className="text-xl text-center font-medium">{game.instructions}</p>
            <p className="text-xl text-center font-semibold mt-4">{game.riddle}</p>
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3 text-center">Your Answer:</label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full bg-white/20 border-2 border-white/30 rounded-xl p-4 text-white text-center text-xl font-bold placeholder-white/50 focus:border-yellow-400 focus:outline-none transition-colors"
              placeholder="Enter your answer..."
              disabled={isCorrect}
            />
          </div>

          {/* Hint Section */}
          {game.hint && (
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
                  <p className="text-blue-200 italic">💡 {game.hint}</p>
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
              {isCorrect ? '✅ Solved!' : 'Submit Answer'}
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
            onClick={handleBack}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
