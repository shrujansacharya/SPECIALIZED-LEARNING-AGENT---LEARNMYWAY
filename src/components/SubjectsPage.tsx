import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Calculator, FlaskRound as Flask, Globe, MessageSquare, Languages, Atom, ArrowLeft, Search, Code, Laptop, Database, Beaker, Landmark, FileText, X, File, MessageCircle, Eye, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subjectDetails, categories } from '../utils/subjects';
import { useThemeStore } from '../store/theme';
import { useQuizStore } from '../store/quiz';
import { auth } from '../lib/firebase';

// Map string icon names to Lucide-React components
const iconMap: { [key: string]: React.ElementType } = {
  'Calculator': Calculator,
  'Flask': Flask,
  'Globe': Globe,
  'Book': Book,
  'Languages': Languages,
  'Atom': Atom,
  'Beaker': Beaker,
  'Landmark': Landmark,
  'Code': Code,
  'Laptop': Laptop,
  'Database': Database,
};

const isImage = (fileName: string) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && imageExtensions.includes(extension);
};

const isVideo = (fileName: string) => {
    const videoExtensions = ['mp4', 'avi', 'mov', 'webm'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension && videoExtensions.includes(extension);
};

export const SubjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<(typeof subjectDetails)[0] | null>(null);
  const [uploadedMaterials, setUploadedMaterials] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [actionableMaterial, setActionableMaterial] = useState<any | null>(null);
  const [analyzingMaterial, setAnalyzingMaterial] = useState<any | null>(null);
  const navigate = useNavigate();

  const { setTheme, getThemeStyles, setDynamicBackgrounds } = useThemeStore();
  const { answers, setAnswer } = useQuizStore();
  const theme = getThemeStyles();
  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || theme.background;

  const fetchUploadedMaterials = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedMaterials(data);
      } else {
        console.error('Failed to fetch uploaded materials:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching uploaded materials:', error);
    }
  };

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user && !answers.interests) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTheme(data?.interests);
          setAnswer('interests', data?.interests);
          setAnswer('learningStyle', data?.learningStyle);
          if (data?.generatedThemeImages) setDynamicBackgrounds(data.generatedThemeImages);
        }
      } catch (error) {
        console.error("Failed to fetch user data for theme:", error);
      }
    } else if (answers.interests) setTheme(answers.interests);
  };

  useEffect(() => {
    fetchUploadedMaterials();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const matches = subjectDetails
        .filter(subject => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(subject => subject.name)
        .slice(0, 3);
      setSuggestions(matches);
    } else setSuggestions([]);
  }, [searchTerm]);

  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 5000);
      return () => clearTimeout(interval);
    }
  }, [theme.backgrounds]);

  const filteredSubjects = subjectDetails.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || subject.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubjectClick = (subject: (typeof subjectDetails)[0]) => setSelectedSubject(subject);
  const handleBackToSubjects = () => setSelectedSubject(null);

  const subjectMaterials = selectedSubject ? uploadedMaterials.filter(material =>
    material.subject.toLowerCase() === selectedSubject.name.toLowerCase() ||
    (selectedSubject.name.toLowerCase() === 'mathematics' && material.subject.toLowerCase() === 'math')
  ) : [];

  const SubjectIcon = selectedSubject ? iconMap[selectedSubject.icon] : null;

  const handleAnalyzeAndChat = async (material: any) => {
    if (!selectedSubject || !material) return;

    setIsAnalyzing(true);
    setActionableMaterial(null);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");
      const token = await user.getIdToken();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // **MODIFIED LINE**: Now sending the comment along with the file path
        body: JSON.stringify({ 
          filePath: material.filePath, 
          comment: material.comment || '' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze material.');
      }

      const { context } = await response.json();

      navigate(`/subjects/${selectedSubject.id}/chat`, { state: { context } });

    } catch (error) {
      console.error("Analysis failed:", error);
      alert(`Sorry, we couldn't analyze that material. Please try again later. Error: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className="subjects-page-container min-h-screen p-6 md:p-10 relative font-poppins text-gray-800"
      style={{ backgroundImage: `url(${currentBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-image 1s ease-in-out' }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {!selectedSubject && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (selectedSubject ? handleBackToSubjects() : navigate(-1))}
                className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all"
              >
                <ArrowLeft size={20} />
              </motion.button>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-600">
                Learn Smarter
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4 w-full md:w-auto">
              {answers.learningStyle && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-white/30 text-white rounded-full font-semibold flex items-center justify-center gap-2"
                >
                  <span>Learning Style:</span>
                  <span className="capitalize font-bold">{answers.learningStyle}</span>
                </motion.div>
              )}
              <div className="relative w-full sm:w-72">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Find a subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-md transition-all bg-white/80"
                />
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute w-full mt-2 bg-white/90 rounded-lg shadow-lg z-20 backdrop-blur-sm"
                  >
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSearchTerm(suggestion)}
                        className="px-4 py-2 text-gray-700 hover:bg-teal-100 cursor-pointer"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/subjects/chat')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-teal-600 hover:to-indigo-700 transition-all"
              >
                <MessageSquare size={20} />
                Chat
              </motion.button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {!selectedSubject ? (
            <motion.div
              key="subject-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className=""
            >
              <div className="flex flex-wrap gap-3 mb-8">
                {categories.map(category => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full shadow-md text-sm font-medium transition-all ${selectedCategory === category ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-teal-100'}`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject, idx) => {
                    const IconComponent = iconMap[subject.icon];
                    return (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className={`relative p-6 rounded-3xl bg-white/80 text-gray-800 shadow-xl overflow-hidden cursor-pointer group backdrop-blur-md border border-teal-500/20`}
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <div className="flex items-center gap-5">
                          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }} className={`p-3 rounded-full bg-gradient-to-br ${subject.color} text-white shadow-md`}>
                            {IconComponent && <IconComponent size={40} />}
                          </motion.div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold">{subject.name}</h3>
                            <p className="text-sm text-gray-600">{subject.description}</p>
                            <p className="text-xs mt-1 text-gray-500">{subject.category}</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/subjects/${subject.id}/chat`);
                          }}
                          className="absolute bottom-4 right-4 p-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-full shadow-md hover:from-teal-600 hover:to-indigo-700 transition-all"
                        >
                          <MessageSquare size={20} />
                        </motion.button>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white col-span-full text-center text-lg font-medium"
                  >
                    No subjects found. Try something else!
                  </motion.p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="subject-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center z-20"
            >
              <div className="relative w-screen h-screen p-6 md:p-8">
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-none shadow-2xl"></div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 text-white p-6 md:p-8 rounded-none"
                >
                  <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-teal-900/80 p-4 rounded-lg shadow-lg backdrop-blur-md border-b-2 border-gold-500/30">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBackToSubjects}
                      className="p-2 bg-white/20 text-white rounded-full shadow-md hover:bg-teal-100/20 transition-all"
                    >
                      <ArrowLeft size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate(`/subjects/${selectedSubject.id}/chat`)}
                      className="w-16 h-16 bg-gradient-to-br from-teal-600 via-indigo-700 to-purple-800 text-white rounded-full shadow-xl hover:from-teal-700 hover:via-indigo-800 hover:to-purple-900 transition-all duration-300 flex items-center justify-center"
                      animate={{ rotate: 360, transition: { duration: 20, repeat: Infinity, ease: "linear" } }}
                    >
                      <MessageCircle size={28} className="mx-auto" />
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="p-6 bg-white/20 rounded-full shadow-xl backdrop-blur-md border-2 border-gold-500/20">
                      {SubjectIcon && <SubjectIcon size={64} />}
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug text-gold-300">{selectedSubject.name}</h2>
                      <p className="text-base md:text-lg text-gray-200 mt-1 font-medium">{selectedSubject.description}</p>
                    </div>
                  </div>

                  <div className="space-y-8 h-[calc(100%-200px)] overflow-y-auto pb-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white/10 p-6 rounded-xl shadow-2xl border border-teal-500/30 backdrop-blur-md"
                    >
                      <h3 className="text-2xl font-semibold flex items-center gap-3 text-white">
                        <FileText size={28} className="text-gold-400" />
                        Teacher's Uploads
                      </h3>
                      {subjectMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                          {subjectMaterials.map((material, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(59, 130, 246, 0.5)" }}
                              onClick={() => setActionableMaterial(material)}
                              className="bg-white/20 p-5 rounded-xl shadow-lg border border-gold-500/20 transition-all duration-300 hover:bg-teal-900/20 cursor-pointer"
                            >
                              {material.comment && (
                                <div className="bg-purple-900/20 text-purple-200 p-4 rounded-lg mb-4 border-l-4 border-gold-400 shadow-inner">
                                  <h4 className="font-bold text-lg">Task:</h4>
                                  <p className="text-sm">{material.comment}</p>
                                </div>
                              )}
                              <div className="flex flex-col items-center w-full text-center p-4">
                                {isImage(material.fileName) ? (
                                  <img src={`${import.meta.env.VITE_BACKEND_URL}${material.filePath}`} alt={material.fileName} className="w-full h-40 object-contain rounded-lg shadow-md" />
                                ) : isVideo(material.fileName) ? (
                                  <div className="relative w-full h-40">
                                    <video src={`${import.meta.env.VITE_BACKEND_URL}${material.filePath}`} className="w-full h-40 object-contain rounded-lg shadow-md" controls={false} />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white"><p>Video</p></div>
                                  </div>
                                ) : (
                                  <File size={48} className="text-gold-300 mx-auto mb-3" />
                                )}
                                <p className="text-base font-medium text-white mt-2 truncate w-full">{material.fileName}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <FileText size={60} className="mb-3" />
                          <p className="text-lg font-medium">No materials uploaded yet.</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {actionableMaterial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
              onClick={() => setActionableMaterial(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md relative border border-teal-500/30 text-white p-6 text-center"
              >
                <h3 className="font-bold text-xl mb-2 text-gold-300">Choose an Action</h3>
                <p className="text-sm text-gray-300 mb-6 truncate" title={actionableMaterial.fileName}>
                  For file: <strong>{actionableMaterial.fileName}</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      setSelectedFile(actionableMaterial);
                      setActionableMaterial(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg font-semibold"
                  >
                    <Eye size={20} />
                    View File
                  </button>
                  <button
                    onClick={() => handleAnalyzeAndChat(actionableMaterial)}
                    disabled={isAnalyzing}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 transition-all rounded-lg font-semibold disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isAnalyzing ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <Bot size={20} />
                        Analyze with Chatbot
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setActionableMaterial(null)}
                  className="absolute top-3 right-3 text-gray-400 bg-gray-900/50 rounded-full p-2 hover:bg-red-500/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden relative border border-teal-500/30 backdrop-blur-md"
            >
              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-4 right-4 text-gray-300 bg-black/20 rounded-full p-2 hover:bg-teal-600/20 transition-colors z-10"
              >
                <X size={28} />
              </button>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gold-300">{selectedFile.fileName}</h3>
                {selectedFile.comment && (
                  <div className="bg-purple-900/20 text-purple-200 p-4 rounded-lg w-full text-base font-medium mb-4 border-l-4 border-gold-400 shadow-inner">
                    <p><strong>Task:</strong> {selectedFile.comment}</p>
                  </div>
                )}

                <div className="flex items-center justify-center max-h-[70vh] w-full bg-black/30 rounded-xl p-5 shadow-lg">
                  {isImage(selectedFile.fileName) ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${selectedFile.filePath}`}
                      alt={selectedFile.fileName}
                      className="max-h-[70vh] object-contain shadow-md rounded-lg"
                    />
                  ) : isVideo(selectedFile.fileName) ? (
                    <video
                      src={`${import.meta.env.VITE_BACKEND_URL}${selectedFile.filePath}`}
                      className="max-h-[70vh] object-contain shadow-md rounded-lg"
                      controls
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <File size={72} className="text-gold-300 mb-4" />
                      <p className="text-base text-gray-300 font-medium">File preview not available.</p>
                      <a
                        href={`${import.meta.env.VITE_BACKEND_URL}${selectedFile.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 px-5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-lg hover:from-teal-600 hover:to-indigo-700 transition-colors shadow-md text-base"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAnalyzing && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50">
            <Bot size={48} className="text-teal-400 animate-pulse" />
            <p className="text-white text-lg font-medium mt-4">Analyzing material, please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
};