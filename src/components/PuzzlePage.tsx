import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, Star, Sparkles, Brain, Lightbulb } from 'lucide-react';
import { GeminiService } from '../lib/gemini-service';

interface Puzzle {
  title: string;
  description: string;
  solution: string;
  hint?: string;
}

const PuzzlePage: React.FC = () => {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userSolution, setUserSolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    fetchPuzzle();
  }, []);

  const fetchPuzzle = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a unique daily word puzzle challenge. Create a creative puzzle with:
      1. An engaging title
      2. A clear puzzle description/challenge
      3. The correct solution
      4. An optional helpful hint
      Format as JSON: {"title": "string", "description": "string", "solution": "string", "hint": "string"}`;

      const response = await GeminiService.generateText(prompt);

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generatedPuzzle = JSON.parse(jsonMatch[0]);
        setPuzzle(generatedPuzzle);
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      // Fallback puzzle
      const fallbackPuzzle: Puzzle = {
        title: 'Word Scramble Challenge',
        description: 'Unscramble the letters to form a fruit: P P L E A',
        solution: 'APPLE',
        hint: 'This fruit is often red or green and grows on trees.'
      };
      setPuzzle(fallbackPuzzle);
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async () => {
    if (!puzzle) return;

    setAttempts(prev => prev + 1);

    try {
      const userAnswer = userSolution.trim().toUpperCase();
      const correctAnswer = puzzle.solution.toUpperCase();
      const correct = userAnswer === correctAnswer;

      setIsCorrect(correct);

      if (correct) {
        setValidationMessage('🎉 Brilliant! You solved the puzzle! 🧠');
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      } else {
        const feedback = attempts >= 2
          ? 'Not quite right. Try using the hint! 💡'
          : 'Keep thinking! You\'ve got this! 🤔';
        setValidationMessage(feedback);
      }
    } catch (error) {
      console.error('Error validating puzzle:', error);
      setValidationMessage('Error validating solution.');
    }
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (loading || !puzzle) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-xl">Crafting your daily puzzle...</p>
        <Brain className="w-16 h-16 mt-4 text-yellow-400 animate-pulse" />
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
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">Puzzle Master! 🧠</h2>
            <p className="text-xl text-white">You cracked the code! Amazing work! ⭐</p>
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

      <h1 className="text-5xl font-bold mb-8 text-center">Word Puzzle Challenge</h1>

      <div className="w-full max-w-4xl">
        {/* Puzzle Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">{puzzle.title}</h2>
            <Brain className="w-16 h-16 mx-auto text-blue-400 mb-4" />
          </div>

          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <p className="text-xl text-center font-medium">{puzzle.description}</p>
          </div>

          {/* Solution Input */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3 text-center">Your Solution:</label>
            <input
              type="text"
              value={userSolution}
              onChange={(e) => setUserSolution(e.target.value)}
              className="w-full bg-white/20 border-2 border-white/30 rounded-xl p-4 text-white text-center text-xl font-bold placeholder-white/50 focus:border-yellow-400 focus:outline-none transition-colors"
              placeholder="Enter your answer..."
              disabled={isCorrect}
            />
          </div>

          {/* Hint Section */}
          {puzzle.hint && (
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
                  <p className="text-blue-200 italic">💡 {puzzle.hint}</p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={submitSolution}
              disabled={!userSolution.trim() || isCorrect}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCorrect ? '✅ Solved!' : 'Submit Solution'}
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

export default PuzzlePage;
