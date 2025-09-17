import { useState, useEffect } from 'react';
import { MapPin, Trophy, Star, X, Target, Award, RefreshCw, CheckCircle, Circle, Code, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/theme';

interface Area {
  id: string;
  name: string;
  description: string;
  icon: string;
  career_ids: string[];
  position: { top: string; left: string };
}

interface Quiz {
  id: string;
  area_id: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  questions: { id: number; question: string; options: string[]; correct: string }[];
}

const fallbackProfile = {
  user_id: 'test-user-id',
  points: 100,
  username: 'TestStudent',
  completed_activities: ['daily-quiz', 'project-software-1'],
  badges: [
    { id: '1', badge_name: 'Daily Challenger', badge_icon: '/badges/daily-challenger.png' },
    { id: '2', badge_name: 'Project Builder', badge_icon: '/badges/project-builder.png' }
  ],
  daily_challenges_progress: {
    'sentence-builder': 75,
    'vocabulary': 60,
    'grammar': 45,
    'conversation': 80,
    'pronunciation': 30,
    'reading': 65,
    'writing': 50,
    'spelling-bee': 90,
    'culture-quest': 40,
    'flashcard-frenzy': 70
  },
  project_builder_progress: {
    'software-1': 25,
    'software-2': 0,
    'science-1': 100,
    'science-2': 15
  }
};

const fallbackCareers = [
  { id: '1', title: 'Sports Analyst' },
  { id: '18', title: 'Aerospace Engineer' },
];

const fallbackChallenges = [
  {
    id: '1',
    title: 'Math Puzzle',
    description: 'Solve 5 math problems in Cricket Kingdom',
    area_id: 'cricket-kingdom',
    reward_points: 50,
  },
];

const fallbackQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    area_id: 'cricket-kingdom',
    difficulty: 'Beginner',
    title: 'Cricket Math Basics',
    questions: [
      { id: 1, question: 'What is 2 + 3?', options: ['4', '5', '6', '7'], correct: '5' },
      { id: 2, question: 'If a team scores 10 runs in 2 overs, how many runs per over?', options: ['4', '5', '6', '7'], correct: '5' },
    ],
  },
  {
    id: 'english-quiz-4-6-1',
    area_id: 'english-empire',
    difficulty: 'Beginner',
    title: 'Basic Grades 4-6 English Quiz',
    questions: [
      { id: 1, question: 'What does "happy" mean?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correct: 'Joyful' },
      { id: 2, question: 'What is a synonym for "quick"?', options: ['Slow', 'Fast', 'Big', 'Small'], correct: 'Fast' },
    ],
  },
];

export const ProgressMap = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const { getThemeStyles } = useThemeStore();
  const theme = getThemeStyles();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || theme.background;

  useEffect(() => {
    // Replaced Supabase calls with a local data fetch
    fetchData();
    // Removed Supabase-based periodic refresh
    const interval = setInterval(refreshProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  // Updated to use fallback data directly
  const refreshProgress = () => {
    if (refreshing) return;
    setRefreshing(true);
    // Simulate a network request with a delay
    setTimeout(() => {
      setProfile(fallbackProfile);
      setRefreshing(false);
    }, 1000);
  };

  const fetchData = () => {
    // Simulate data fetching with a delay
    setTimeout(() => {
      setProfile(fallbackProfile);
      setLoading(false);
    }, 1500);
  };

  const dailyChallenges = [
    { id: 'sentence-builder', name: 'Sentence Builder', icon: '📝' },
    { id: 'vocabulary', name: 'Vocabulary Challenge', icon: '📚' },
    { id: 'grammar', name: 'Grammar Challenge', icon: '✏️' },
    { id: 'conversation', name: 'Conversation Challenge', icon: '💬' },
    { id: 'pronunciation', name: 'Pronunciation Challenge', icon: '🎤' },
    { id: 'reading', name: 'Reading Challenge', icon: '📖' },
    { id: 'writing', name: 'Writing Challenge', icon: '✍️' },
    { id: 'spelling-bee', name: 'Spelling Bee', icon: '🐝' },
    { id: 'culture-quest', name: 'Culture Quest', icon: '🌍' },
    { id: 'flashcard-frenzy', name: 'Flashcard Frenzy', icon: '⚡' }
  ];

  const projectCategories = [
    { id: 'software-1', name: 'Software Development Basics', icon: '💻' },
    { id: 'software-2', name: 'Advanced Programming', icon: '🚀' },
    { id: 'science-1', name: 'Science Experiments', icon: '🔬' },
    { id: 'science-2', name: 'Research Projects', icon: '📊' }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 60) return 'from-blue-500 to-cyan-500';
    if (progress >= 40) return 'from-yellow-500 to-orange-500';
    if (progress >= 20) return 'from-orange-500 to-red-500';
    return 'from-gray-500 to-gray-600';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return 'Completed';
    if (progress >= 80) return 'Advanced';
    if (progress >= 60) return 'Intermediate';
    if (progress >= 40) return 'Beginner';
    return 'Starting';
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-4 border-t-white border-l-white border-b-blue-600 border-r-blue-600"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div 
        className="min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        <div className="text-white text-lg">Unable to load profile. Please try again.</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8 relative overflow-hidden"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          // Changed to full transparency as requested
          className="rounded-2xl p-4 sm:p-6 md:p-8" 
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
              <Target className="text-purple-300 w-6 h-6 sm:w-8 sm:h-8" />
              Progress Dashboard
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <span className="font-bold text-sm sm:text-base text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>{profile.username || 'Student'}</span>
              <motion.div
                className="bg-purple-600/70 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{profile.points || 0} Points</span>
              </motion.div>
              <motion.div
                className="bg-yellow-500/70 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                <span className="font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Level {Math.floor((profile.points || 0) / 100) + 1}</span>
              </motion.div>
              <motion.button
                onClick={refreshProgress}
                disabled={refreshing}
                className="bg-blue-500/70 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
            </div>
          </div>

          {/* Daily Challenges Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
              <BookOpen className="text-blue-300 w-6 h-6" />
              Daily Challenges Progress
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dailyChallenges.map((challenge, idx) => {
                const progress = profile.daily_challenges_progress?.[challenge.id] || 0;
                return (
                  <motion.div
                    key={challenge.id}
                    className="bg-black/70 p-6 rounded-xl shadow-lg border border-white/20 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getProgressColor(progress)} text-white text-xl`}>
                        {challenge.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{challenge.name}</h3>
                        <p className="text-sm text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{progress}% Complete</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white/30 rounded-full h-4 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progress)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut', delay: idx * 0.1 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        <span>Starting</span>
                        <span>Advanced</span>
                        <span>Master</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex gap-1">
                        {[25, 50, 75, 100].map((milestone) => (
                          <div
                            key={milestone}
                            className={`w-2 h-2 rounded-full ${
                              progress >= milestone ? 'bg-green-300' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        {getProgressStatus(progress)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Project Builder Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
              <Code className="text-green-300 w-6 h-6" />
              Project Builder Progress
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {projectCategories.map((project, idx) => {
                const progress = profile.project_builder_progress?.[project.id] || 0;
                return (
                  <motion.div
                    key={project.id}
                    className="bg-black/70 p-6 rounded-xl shadow-lg border border-white/20 backdrop-blur-sm" 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getProgressColor(progress)} text-white text-xl`}>
                        {project.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{project.name}</h3>
                        <p className="text-sm text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{progress}% Complete</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white/30 rounded-full h-4 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progress)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut', delay: idx * 0.1 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        <span>Planning</span>
                        <span>Building</span>
                        <span>Testing</span>
                        <span>Complete</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex gap-1">
                        {[25, 50, 75, 100].map((milestone) => (
                          <div
                            key={milestone}
                            className={`w-2 h-2 rounded-full ${
                              progress >= milestone ? 'bg-green-300' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        {getProgressStatus(progress)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Overall Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 rounded-xl border border-white/20 backdrop-blur-sm bg-black/70"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
              <Award className="text-indigo-300 w-6 h-6" />
              Overall Progress Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/70 p-4 rounded-lg shadow-sm backdrop-blur-sm border border-white/20"> 
                <div className="text-2xl font-bold text-blue-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  {Math.round((Object.values(profile.daily_challenges_progress || {}) as number[]).reduce((a, b) => a + b, 0) / dailyChallenges.length)}%
                </div>
                <div className="text-sm text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Daily Challenges Average</div>
              </div>
              <div className="bg-black/70 p-4 rounded-lg shadow-sm backdrop-blur-sm border border-white/20"> 
                <div className="text-2xl font-bold text-green-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  {Math.round((Object.values(profile.project_builder_progress || {}) as number[]).reduce((a, b) => a + b, 0) / projectCategories.length)}%
                </div>
                <div className="text-sm text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Project Builder Average</div>
              </div>
              <div className="bg-black/70 p-4 rounded-lg shadow-sm backdrop-blur-sm border border-white/20"> 
                <div className="text-2xl font-bold text-purple-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  {Math.round(((Object.values(profile.daily_challenges_progress || {}) as number[]).reduce((a, b) => a + b, 0) +
                              (Object.values(profile.project_builder_progress || {}) as number[]).reduce((a, b) => a + b, 0)) /
                             (dailyChallenges.length + projectCategories.length))}%
                </div>
                <div className="text-sm text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Overall Progress</div>
              </div>
            </div>
          </motion.div>

          {/* Badges Section */}
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
              <Award className="text-yellow-300 w-6 h-6" />
              Your Achievements & Badges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {profile.badges?.map((badge: any) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-black/70 p-3 sm:p-4 rounded-xl shadow-lg border border-white/20 flex flex-col items-center text-center backdrop-blur-sm" 
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                >
                  <img src={badge.badge_icon} alt={badge.badge_name} className="w-12 h-12 rounded-full mb-2" />
                  <span className="text-sm font-semibold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{badge.badge_name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressMap;