import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/theme';

const subjects = {
  math: {
    name: 'Mathematics',
    title: 'Interactive Mathematics',
    examples: [
      { title: 'Cricket Math', description: 'Calculate batting averages and run rates from real match data!', problem: 'If a batsman scores 85 runs in 50 balls, what is their strike rate?' },
      { title: 'Shopping Smart', description: 'Learn percentages through discount calculations', problem: 'A toy costs ₹500 with a 20% discount. What’s the final price?' }
    ]
  },
  science: {
    name: 'Science',
    title: 'Hands-on Science',
    examples: [
      { title: 'Kitchen Chemistry', description: 'Explore chemical reactions with common ingredients', problem: 'What happens when you mix vinegar and baking soda?' },
      { title: 'Plant Growth', description: 'Track and measure plant growth over time', problem: 'Design an experiment to test what affects plant growth' }
    ]
  },
  social: {
    name: 'Social Studies',
    title: 'Exploring Social Studies',
    examples: [
      { title: 'World Geography', description: 'Learn about continents and countries', problem: 'Name the 7 continents.' },
      { title: 'Historical Events', description: 'Understand key moments in history', problem: 'What year did India gain independence?' }
    ]
  },
  english: {
    name: 'English',
    title: 'Mastering English',
    examples: [
      { title: 'Story Writing', description: 'Craft a short story', problem: 'Write a 100-word story about a lost dog.' },
      { title: 'Grammar Practice', description: 'Improve sentence structure', problem: 'Correct this sentence: She don’t like to read.' }
    ]
  },
  kannada: {
    name: 'Kannada',
    title: 'Learning Kannada',
    examples: [
      { title: 'Basic Words', description: 'Learn common Kannada vocabulary', problem: 'What does "ನೀರು" (nīru) mean?' },
      { title: 'Sentence Building', description: 'Form simple sentences', problem: 'Translate: I am going to school.' }
    ]
  },
  physics: {
    name: 'Physics',
    title: 'Understanding Physics',
    examples: [
      { title: 'Motion Basics', description: 'Explore speed and velocity', problem: 'A car travels 100 km in 2 hours. What is its speed?' },
      { title: 'Forces', description: 'Learn about push and pull', problem: 'What force causes an apple to fall from a tree?' }
    ]
  }
};

export const SubjectDetailsPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { getThemeStyles, setDynamicBackgrounds } = useThemeStore();
  const theme = getThemeStyles();
  const currentBackground = theme.backgrounds?.[0] || theme.background;
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = React.useState(0);

  const subject = subjects[subjectId as keyof typeof subjects];

  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  if (!subject) {
    return <div className="p-6 text-center text-gray-600">Subject not found!</div>;
  }

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8 relative font-poppins text-gray-900 antialiased"
      style={{
        backgroundImage: `url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-6 md:mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/subjects')}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 text-gray-800 rounded-lg shadow-md hover:bg-white hover:shadow-lg transition-all"
            aria-label="Back to Subjects"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </motion.button>
          <h1 className="text-3xl md:text-4xl font-bold text-white bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
            {subject.title}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sticky Sidebar for Larger Screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 bg-white/90 rounded-2xl p-4 md:p-5 shadow-lg sticky top-6 h-fit hidden lg:block"
          >
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Subject Overview</h3>
            <p className="text-gray-600 text-sm md:text-base">{subject.name} is designed to provide interactive and engaging learning experiences.</p>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 bg-white/95 rounded-2xl p-4 md:p-6 lg:p-8 shadow-2xl border border-gray-100"
          >
            <div className="space-y-6">
              <div className="grid gap-5 md:gap-6">
                {subject.examples.map((example, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="bg-gray-50 rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{example.title}</h3>
                    <p className="text-gray-600 mb-3 text-sm md:text-base">{example.description}</p>
                    <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="font-medium text-gray-800 text-sm md:text-base">{example.problem}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};