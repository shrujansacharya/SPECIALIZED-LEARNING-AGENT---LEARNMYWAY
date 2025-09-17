
// Updated WhatIfPage.tsx to pass selectedGrade to SpeakingPage via navigation state
import React, { useState, useEffect } from 'react';
import { Brain, BookOpen, MessageSquare, Mic, Award, Star, Trophy, Rotate3D, ArrowLeft, Volume2, PenSquare, Globe, Type, Layers, Target, Flame, Zap, Sparkles, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const WhatIfPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState('4-6');
  const [lockedChallenges, setLockedChallenges] = useState<{[key: string]: boolean}>({});
  const [currentLevel, setCurrentLevel] = useState('Beginner');

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
    checkLockedChallenges();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(fallbackProfile);
        } else {
          const fetchedProfile = profileData || fallbackProfile;
          setProfile(fetchedProfile);
        }
      } else {
        setProfile(fallbackProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(fallbackProfile);
    }
  };

  const checkLockedChallenges = () => {
    const today = new Date().toDateString();
    const locked: {[key: string]: boolean} = {};

    // Check each challenge type
    const challengeTypes = ['grammar', 'reading', 'writing', 'pronunciation'];
    challengeTypes.forEach(type => {
      const completionKey = `${type}-completed-${today}`;
      const attemptKey = `${type}-attempts-${today}`;
      const completed = localStorage.getItem(completionKey) === 'true';
      const attempts = localStorage.getItem(attemptKey);
      const attemptCount = attempts ? JSON.parse(attempts).attempts : 0;
      locked[type] = completed || attemptCount >= 2;
    });

    setLockedChallenges(locked);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLevel(e.target.value);
  };

  // Challenge definitions with navigation
  const challengeDefinitions = [
    {
      id: 'grammar',
      title: 'Grammar Challenge',
      description: 'Learn grammar rules through engaging exercises and explanations.',
      icon: BookOpen,
      color: 'text-purple-400',
      bgColor: 'from-purple-500 to-indigo-500',
      route: '/grammar',
      progress: profile?.progress?.grammar || 0
    },
    {
      id: 'reading',
      title: 'Reading Challenge',
      description: 'Improve comprehension with passages and interactive questions.',
      icon: BookOpen,
      color: 'text-green-400',
      bgColor: 'from-green-500 to-teal-500',
      route: '/reading',
      progress: profile?.progress?.reading || 0
    },
    {
      id: 'writing',
      title: 'Writing Challenge',
      description: 'Enhance writing skills with AI feedback and creative prompts.',
      icon: PenSquare,
      color: 'text-orange-400',
      bgColor: 'from-orange-500 to-red-500',
      route: '/writing',
      progress: profile?.progress?.writing || 0
    },
    {
      id: 'pronunciation',
      title: 'Pronunciation Challenge',
      description: 'Perfect your pronunciation with AI-powered speech analysis.',
      icon: Mic,
      color: 'text-red-400',
      bgColor: 'from-red-500 to-pink-500',
      route: '/pronunciation',
      progress: profile?.progress?.pronunciation || 0
    },

    
  ];

  // Check if all challenges are completed
  const allCompleted = Object.values(lockedChallenges).every(locked => locked);

  // Calculate completion stats
  const completedCount = Object.values(lockedChallenges).filter(locked => locked).length;
  const totalChallenges = challengeDefinitions.length;

  // Map selectedGrade to level name
  const getLevelName = (grade: string) => {
    switch (grade) {
      case '4-5':
        return 'Beginner';
      case '6-8':
        return 'Intermediate';
      case '9-10':
        return 'Advanced';
      default:
        return 'Beginner';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-zinc-900 p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Background Animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob bg-slate-500/10 top-20 left-10 w-64 h-64"></div>
        <div className="blob bg-gray-500/10 top-40 right-10 w-80 h-80"></div>
        <div className="blob bg-zinc-500/10 bottom-20 left-20 w-72 h-72"></div>
        <div className="blob bg-slate-400/10 bottom-40 right-20 w-56 h-56"></div>
        <div className="blob bg-gray-400/10 top-1/2 left-1/2 w-40 h-40"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative mb-6">
            <motion.button
              onClick={() => navigate('/explore-menu')}
              className="absolute left-0 top-0 text-white hover:text-yellow-400 transition-colors p-2 rounded-lg bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={24} />
            </motion.button>
            <h1 className="text-5xl font-extrabold text-white flex items-center justify-center gap-4">
              <Brain className="text-yellow-400" size={48} />
              Daily Challenges
            </h1>
          </div>
          <p className="text-lg text-white/80 mb-8">Complete daily challenges and earn rewards and badges!</p>

          {/* Grade Level Selector */}
          <div className="flex items-center gap-4">
            <label className="text-white font-medium text-xl">Grade Level:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-yellow-400"
            >
              <option value="4-6">4-6 (Beginner)</option>
              <option value="7-9">7-9 (Intermediate)</option>
              <option value="10-12">10-12 (Advanced)</option>
            </select>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="text-yellow-400" size={28} />
              Today's Progress
            </h2>
            <div className="flex items-center gap-2 text-white/80">
              <Flame className="text-orange-400" size={20} />
              <span className="font-medium">Streak: 5 days</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalChallenges) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <span className="text-white font-medium text-lg">
              {completedCount}/{totalChallenges} Completed
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-yellow-400" size={28} />
              Daily Challenges
            </h2>
            {/* Challenge Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challengeDefinitions.map((challenge, index) => {
                const isLocked = lockedChallenges[challenge.id];
                return (
                  <motion.div
                    key={challenge.id}
                    className={`backdrop-blur-md rounded-3xl p-6 shadow-2xl border relative overflow-hidden ${
                      isLocked
                        ? 'bg-gray-500/20 border-gray-400/30'
                        : 'bg-white/10 border-white/20'
                    }`}
                    style={{ perspective: '1000px' }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
                  >
                    {/* Progress indicator */}
                    {!isLocked && (
                      <div className="absolute top-4 right-4 w-12 h-12">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="2"
                            strokeDasharray={`${challenge.progress * 100}, 100`}
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#fbbf24" />
                              <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{Math.round(challenge.progress * 100)}%</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center space-y-4">
                      <motion.div
                        className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${
                          isLocked ? 'from-gray-500 to-gray-600' : challenge.bgColor
                        }`}
                        whileHover={isLocked ? {} : { rotateY: 180, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <challenge.icon
                          className={isLocked ? 'text-gray-400' : challenge.color}
                          size={40}
                        />
                      </motion.div>

                      <div>
                        <h3 className={`text-xl font-bold mb-2 ${
                          isLocked ? 'text-gray-400' : 'text-white'
                        }`}>
                          {challenge.title}
                        </h3>
                        <p className={`text-sm leading-relaxed ${
                          isLocked ? 'text-gray-500' : 'text-white/70'
                        }`}>
                          {isLocked
                            ? 'Come back tomorrow for new challenges!'
                            : challenge.description
                          }
                        </p>
                      </div>

                      {isLocked ? (
                        <div className="w-full py-3 px-4 rounded-2xl font-semibold text-gray-400 bg-gray-600/20 border border-gray-500/30 flex items-center justify-center gap-2">
                          <Trophy className="text-gray-400" size={16} />
                          Challenge Locked
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => navigate(challenge.route, { state: { grade: selectedGrade, level: getLevelName(selectedGrade) } })}
                          className={`w-full py-3 px-4 rounded-2xl font-semibold text-white shadow-lg bg-gradient-to-r ${challenge.bgColor} hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2`}
                          whileHover={{ scale: 1.05, rotateX: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="text-white" size={16} />
                          Start Challenge
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div>
            {/* Speaking Practice Section */}
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Sparkles className="text-blue-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="text-blue-400" size={28} />
                  Speaking Practice
                </h2>
              </div>

              {/* Level Selector */}
              <div className="mb-6">
                <label className="text-white/80 text-sm mb-2 block flex items-center gap-2">
                  <Star size={14} className="text-yellow-400" />
                  Select Your Level
                </label>
                <select
                  value={currentLevel}
                  onChange={handleLevelChange}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Practice Mode Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <motion.button
                  onClick={() => navigate('/speaking', { state: { level: currentLevel } })}
                  className="p-4 rounded-xl text-left text-white bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/30 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <div className="font-semibold">Guided Practice</div>
                      <div className="text-sm text-white/70">Step-by-step learning</div>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/sentence-practice', { state: { level: currentLevel } })}
                  className="p-4 rounded-xl text-left text-white bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/30 rounded-lg group-hover:bg-green-500/40 transition-colors">
                      <Mic size={18} />
                    </div>
                    <div>
                      <div className="font-semibold">Speak the Sentence</div>
                      <div className="text-sm text-white/70">Practice pronunciation</div>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/casual', { state: { level: currentLevel } })}
                  className="p-4 rounded-xl text-left text-white bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/30 rounded-lg group-hover:bg-purple-500/40 transition-colors">
                      <Coffee size={18} />
                    </div>
                    <div>
                      <div className="font-semibold">Casual Conversation</div>
                      <div className="text-sm text-white/70">Real-world scenarios</div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Achievement Section */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.div
            className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 mb-4"
            whileHover={{ rotateY: 180, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Award className="text-yellow-400" size={48} />
          </motion.div>

          <h3 className="text-3xl font-bold mb-4 text-white">Complete All Challenges!</h3>
          <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto">
            Finish all daily challenges to unlock special rewards, earn badges, and track your learning streak. Keep up the great work!
          </p>

          <div className="flex items-center justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400" size={20} />
              <span>Earn Points</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="text-purple-400" size={20} />
              <span>Unlock Badges</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="text-orange-400" size={20} />
              <span>Build Streaks</span>
            </div>
          </div>
        </motion.div>


      </div>
    </div>
  );
};

export default WhatIfPage;