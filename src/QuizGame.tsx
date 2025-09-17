
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizGameProps {
  subject: string;
  onClose: () => void;
  awardBrainBucks: (amount: number) => void;
}

const quizData: { [key: string]: QuizQuestion[] } = {
  Mathematics: [
    {
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
    },
    // Add more questions
  ],
  Science: [
    {
      question: 'What gas do plants use for photosynthesis?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
      correctAnswer: 'Carbon Dioxide',
    },
    // Add more questions
  ],
  // Add questions for other subjects
};

const QuizGame: React.FC<QuizGameProps> = ({ subject, onClose, awardBrainBucks }) => {
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    setQuestions(quizData[subject] || quizData['Science']);
  }, [subject]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
      awardBrainBucks(10);
    }
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        onClose();
      }
    }, 1000);
  };

  if (!questions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white bg-opacity-90 rounded-2xl p-6 w-full max-w-md shadow-lg"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-600">{t('quiz.title')}</h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.2 }}
            className="p-2 bg-red-600 text-white rounded-full"
          >
            <X size={24} />
          </motion.button>
        </div>
        <p className="text-lg mt-4">{questions[currentQuestion].question}</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {questions[currentQuestion].options.map((option, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleAnswer(option)}
              whileHover={{ scale: 1.05 }}
              className={`p-3 rounded-lg text-lg ${
                selectedAnswer
                  ? option === questions[currentQuestion].correctAnswer
                    ? 'bg-green-600 text-white'
                    : selectedAnswer === option
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200'
                  : 'bg-blue-100 hover:bg-blue-200'
              }`}
              disabled={!!selectedAnswer}
            >
              {option}
            </motion.button>
          ))}
        </div>
        <p className="text-lg mt-4">{t('quiz.score', { score, total: questions.length })}</p>
      </motion.div>
    </motion.div>
  );
};

export default QuizGame;