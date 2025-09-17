import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  X, 
  Plus, 
  LogIn, 
  Search,
  Filter,
  Copy, 
  Check,
  Crown,
  Clock,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Star,
  Target,
  Rocket,
} from "lucide-react";
import { BaseComponentProps } from "../types";

// Removed the hardcoded StudySession interface to allow for dynamic data.
interface StudySession {
  id: string;
  name: string;
  description: string;
  hostName: string;
  participantCount: number;
  maxParticipants: number;
  isPrivate: boolean;
  password?: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  createdAt: Date;
  tags: string[];
  isActive: boolean;
  tools: string[];
}

interface CreateSessionData {
  name: string;
  description: string;
  subject: string;
  difficulty: 'intermediate' | 'beginner' | 'advanced';
  maxParticipants: number;
  duration: number;
  isPrivate: boolean;
  password: string;
  tags: string[];
  scheduledTime?: Date;
  tools: string[];
}

const SessionLobby: React.FC<BaseComponentProps & {
  onJoinSession: (sessionId: string, password?: string) => void;
  onCreateSession: (sessionData: CreateSessionData) => void;
}> = ({ onClose, onJoinSession, onCreateSession }) => {
  const [view, setView] = useState<'lobby' | 'create' | 'join'>('lobby');
  const [sessions, setSessions] = useState<StudySession[]>([]); // Starts empty now
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showPrivateSessions, setShowPrivateSessions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [createForm, setCreateForm] = useState<CreateSessionData>({
    name: '',
    description: '',
    subject: '',
    difficulty: 'intermediate',
    maxParticipants: 10,
    duration: 60,
    isPrivate: false,
    password: '',
    tags: [],
    tools: []
  });

  const [joinSessionId, setJoinSessionId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const subjects = [
    'Mathematics', 'Science', 'History', 'Literature', 'Computer Science',
    'Physics', 'Chemistry', 'Biology', 'Economics', 'Psychology',
    'Philosophy', 'Art', 'Music', 'Languages', 'Engineering'
  ];

  const availableTools = [
    'Calculator', 'Study Timer', 'Whiteboard', 'Smart Notes', 
    'Flashcards', 'AI Quiz Generator', 'AI Summarizer', 'Smart Recorder'
  ];

  const popularTags = [
    'exam-prep', 'homework-help', 'project-work', 'discussion', 'review',
    'practice', 'study-group', 'tutoring', 'collaboration', 'research'
  ];

  // Removed useEffect with sample data
  
  const filteredSessions = useCallback(() => {
    return sessions.filter(session => {
      const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubject = subjectFilter === 'all' || session.subject === subjectFilter;
      const matchesDifficulty = difficultyFilter === 'all' || session.difficulty === difficultyFilter;
      const matchesPrivacy = showPrivateSessions || !session.isPrivate;
      return matchesSearch && matchesSubject && matchesDifficulty && matchesPrivacy && session.isActive;
    });
  }, [sessions, searchQuery, subjectFilter, difficultyFilter, showPrivateSessions]);

  const handleCreateSession = useCallback(() => {
    if (!createForm.name.trim() || !createForm.subject) return;
    onCreateSession(createForm);
    setView('lobby');
    setCreateForm({
      name: '',
      description: '',
      subject: '',
      difficulty: 'intermediate',
      maxParticipants: 10,
      duration: 60,
      isPrivate: false,
      password: '',
      tags: [],
      tools: []
    });
  }, [createForm, onCreateSession]);

  const handleJoinSession = useCallback((session: StudySession) => {
    if (session.isPrivate) {
      setSelectedSession(session);
      setView('join');
    } else {
      onJoinSession(session.id);
    }
  }, [onJoinSession]);

  const handleJoinWithPassword = useCallback(() => {
    if (selectedSession) {
      onJoinSession(selectedSession.id, joinPassword);
      setJoinPassword('');
      setSelectedSession(null);
      setView('lobby');
    }
  }, [selectedSession, joinPassword, onJoinSession]);

  const copySessionId = useCallback(async (sessionId: string) => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const addTag = useCallback((tag: string) => {
    if (!createForm.tags.includes(tag)) {
      setCreateForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  }, [createForm.tags]);

  const removeTag = useCallback((tag: string) => {
    setCreateForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  }, []);

  const toggleTool = useCallback((tool: string) => {
    setCreateForm(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  }, []);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600 text-white';
      case 'intermediate': return 'bg-yellow-600 text-white';
      case 'advanced': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  }, []);

  const getDifficultyIcon = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Star;
      case 'intermediate': return Target;
      case 'advanced': return Rocket;
      default: return Star;
    }
  }, []);

  const SessionCard: React.FC<{ session: StudySession }> = ({ session }) => {
    const DifficultyIcon = getDifficultyIcon(session.difficulty);
    
    return (
      <motion.div
        className="bg-gray-800 rounded-2xl border border-gray-700 p-6 hover:shadow-2xl transition-all cursor-pointer shadow-lg text-gray-200"
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleJoinSession(session)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-white text-lg">{session.name}</h3>
              {session.isPrivate && <Lock size={18} className="text-gray-400" />}
            </div>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{session.description}</p>
            <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Crown size={16} className="text-yellow-400" />
                <span>{session.hostName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-blue-400" />
                <span>{session.participantCount}/{session.maxParticipants}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-purple-400" />
                <span>{session.duration}min</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${getDifficultyColor(session.difficulty)}`}>
              <DifficultyIcon size={14} className="inline" />
              {session.difficulty}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-700 text-blue-100 rounded-full text-xs font-medium">
              {session.subject}
            </span>
            {session.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                #{tag}
              </span>
            ))}
            {session.tags.length > 2 && (
              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                +{session.tags.length - 2}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Tool icons placeholder */}
            {session.tools.slice(0, 3).map(tool => (
              <div key={tool} className="w-7 h-7 bg-purple-700 rounded-full flex items-center justify-center text-purple-200 text-sm">
                <span>🔧</span>
              </div>
            ))}
            {session.tools.length > 3 && (
              <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-300">+{session.tools.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-950/80 to-gray-850/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-gray-900 rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white p-5 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Users size={28} className="text-blue-100" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Study Groups</h2>
                <p className="text-blue-100 text-sm mt-1 opacity-80">
                  {view === 'lobby' ? 'Join or create a study session' :
                   view === 'create' ? 'Create a new study session' :
                   'Join a session'}
                </p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-colors text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={24} />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {view === 'lobby' && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                {/* Action Bar */}
                <div className="p-6 border-b border-gray-700 bg-gray-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <motion.button
                        onClick={() => setView('create')}
                        className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2 font-semibold w-full sm:w-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus size={22} />
                        Create Session
                      </motion.button>
                      <motion.button
                        onClick={() => setView('join')}
                        className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2 font-semibold w-full sm:w-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <LogIn size={22} />
                        Join with ID
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>{filteredSessions().length} active sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search sessions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 placeholder-gray-500 bg-gray-700/50 shadow-sm transition-colors"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 bg-gray-700/50 shadow-sm min-w-[150px] transition-colors"
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>

                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 bg-gray-700/50 shadow-sm min-w-[150px] transition-colors"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                      <input
                        type="checkbox"
                        checked={showPrivateSessions}
                        onChange={(e) => setShowPrivateSessions(e.target.checked)}
                        className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-gray-700/50"
                      />
                      <span className="text-sm font-medium">Show Private</span>
                    </label>
                  </div>
                </div>

                {/* Sessions Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSessions().map(session => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>

                  {filteredSessions().length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <Users size={72} className="mx-auto mb-4 text-gray-700" />
                      <h3 className="text-xl font-bold text-gray-300 mb-2">No Sessions Found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchQuery || subjectFilter !== 'all' || difficultyFilter !== 'all'
                          ? 'Try adjusting your filters or search terms.'
                          : 'Be the first to create a study session!'}
                      </p>
                      <motion.button
                        onClick={() => setView('create')}
                        className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Create First Session
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {view === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto p-6 sm:p-8 bg-gray-900 text-gray-200"
              >
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Create Study Session</h3>
                    <motion.button
                      onClick={() => setView('lobby')}
                      className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Session Name *</label>
                        <input
                          type="text"
                          value={createForm.name}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Calculus Study Group"
                          className="w-full px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 placeholder-gray-500 bg-gray-700/50 shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject *</label>
                        <select
                          value={createForm.subject}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 bg-gray-700/50 shadow-sm"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                      <textarea
                        value={createForm.description}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what you'll be studying..."
                        className="w-full px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-200 placeholder-gray-500 bg-gray-700/50 shadow-sm"
                        rows={4}
                      />
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty Level</label>
                        <select
                          value={createForm.difficulty}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          className="w-full px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 bg-gray-700/50 shadow-sm"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Max Participants</label>
                        <input
                          type="number"
                          value={createForm.maxParticipants}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 10 }))}
                          min="2"
                          max="50"
                          className="w-full px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 bg-gray-700/50 shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          value={createForm.duration}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                          min="15"
                          max="480"
                          step="15"
                          className="w-full px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 bg-gray-700/50 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="p-5 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Lock size={22} className="text-gray-400" />
                          <span className="font-semibold text-gray-200">Privacy Settings</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                          <input
                            type="checkbox"
                            checked={createForm.isPrivate}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                            className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-gray-700/50"
                          />
                          <span className="text-sm font-medium">Private Session</span>
                        </label>
                      </div>

                      {createForm.isPrivate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Session Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={createForm.password}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="Enter password"
                              className="w-full px-4 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200 placeholder-gray-500 bg-gray-700/50 shadow-sm pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {createForm.tags.map(tag => (
                          <motion.span
                            key={tag}
                            className="px-3 py-1.5 bg-indigo-700 text-indigo-100 rounded-full text-sm font-medium flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                          >
                            #{tag}
                            <motion.button
                              onClick={() => removeTag(tag)}
                              className="hover:bg-indigo-600 rounded-full p-1 transition-colors"
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X size={14} />
                            </motion.button>
                          </motion.span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.filter(tag => !createForm.tags.includes(tag)).map(tag => (
                          <motion.button
                            key={tag}
                            onClick={() => addTag(tag)}
                            className="px-4 py-1.5 bg-gray-700 text-gray-200 rounded-full text-sm hover:bg-gray-600 transition-colors font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus size={14} className="inline mr-1.5" />
                            {tag}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Tools */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-3">Available Tools</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {availableTools.map(tool => (
                          <motion.button
                            key={tool}
                            onClick={() => toggleTool(tool)}
                            className={`p-4 rounded-xl border-2 transition-all text-sm font-semibold flex flex-col items-center justify-center gap-2 ${
                              createForm.tools.includes(tool)
                                ? "border-indigo-500 bg-indigo-900/50 text-indigo-300 shadow-md"
                                : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-indigo-400 hover:text-indigo-300"
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <span>🔧</span>
                            {tool}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Create Button */}
                    <div className="flex gap-4 pt-6">
                      <motion.button
                        onClick={handleCreateSession}
                        disabled={!createForm.name.trim() || !createForm.subject}
                        className="flex-1 py-3.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Create Session
                      </motion.button>
                      <motion.button
                        onClick={() => setView('lobby')}
                        className="px-8 py-3.5 bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex items-center justify-center p-6 sm:p-8 bg-gray-900"
              >
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 sm:p-10 w-full max-w-md shadow-xl text-gray-200">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-700">
                      <LogIn size={40} className="text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedSession ? `Join "${selectedSession.name}"` : "Join Session"}
                    </h3>
                    <p className="text-gray-400 text-base">
                      {selectedSession ? "This session is private. Please enter the password." : "Enter the Session ID to join."}
                    </p>
                  </div>

                  <div className="space-y-5">
                    {!selectedSession && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Session ID</label>
                        <div className="relative">
                          <Copy size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            value={joinSessionId}
                            onChange={(e) => setJoinSessionId(e.target.value)}
                            placeholder="Enter session ID"
                            className="w-full pl-11 pr-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-200 placeholder-gray-500 bg-gray-700/50 shadow-sm"
                          />
                        </div>
                      </div>
                    )}

                    {(selectedSession?.isPrivate || (joinSessionId && !selectedSession)) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={joinPassword}
                            onChange={(e) => setJoinPassword(e.target.value)}
                            placeholder="Enter session password"
                            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-200 placeholder-gray-500 bg-gray-700/50 shadow-sm pr-12"
                          />
                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-2">
                      <motion.button
                        onClick={selectedSession ? handleJoinWithPassword : () => onJoinSession(joinSessionId, joinPassword)}
                        disabled={selectedSession ? !joinPassword : !joinSessionId}
                        className="flex-1 py-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Join Now
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setView('lobby');
                          setSelectedSession(null);
                          setJoinSessionId('');
                          setJoinPassword('');
                        }}
                        className="px-8 py-3.5 bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionLobby;