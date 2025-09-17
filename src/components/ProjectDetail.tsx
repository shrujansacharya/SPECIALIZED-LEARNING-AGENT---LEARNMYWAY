// ProjectDetail.tsx
import React from 'react';
import { ArrowLeft, MessageCircle, History, Package, Video, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProjectTemplate } from './project-templates';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProjectDetailProps {
  selectedProject: ProjectTemplate;
  previousView: 'landing' | 'software' | 'science';
  setView: (view: 'landing' | 'software' | 'science' | 'project-detail') => void;
  darkMode: boolean;
  sidebarTab: 'chat' | 'history' | 'files' | 'video' | 'ideas' | 'code' | 'quiz' | 'notes' | 'planner';
  setSidebarTab: (tab: 'chat' | 'history' | 'files' | 'video' | 'ideas' | 'code' | 'quiz' | 'notes' | 'planner') => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  chatbotLoading: boolean;
  chatHistory: ChatMessage[][];
  setChatHistory: (history: ChatMessage[][]) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  projectIdeas: string[];
  setProjectIdeas: (ideas: string[]) => void;
  codeSnippet: string;
  setCodeSnippet: (snippet: string) => void;
  generatedQuiz: any;
  setGeneratedQuiz: (quiz: any) => void;
  projectNotes: string;
  setProjectNotes: (notes: string) => void;
  projectPlan: string[];
  setProjectPlan: (plan: string[]) => void;
  aiLoading: boolean;
  setAiLoading: (loading: boolean) => void;
  ideasInput: string;
  setIdeasInput: (input: string) => void;
  codeInput: string;
  setCodeInput: (input: string) => void;
  notesInput: string;
  setNotesInput: (input: string) => void;
  planInput: string;
  setPlanInput: (input: string) => void;
  handleChatSubmit: (e?: React.FormEvent) => void;
  saveChatToHistory: (clearCurrent?: boolean) => void;
  loadChatFromHistory: (index: number) => void;
  deleteChatFromHistory: (index: number) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleWatchVideos: () => void;
  generateAiFeature: (feature: 'ideas' | 'code' | 'quiz' | 'notes' | 'plan', input?: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  selectedProject,
  previousView,
  setView,
  darkMode,
  sidebarTab,
  setSidebarTab,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  chatbotLoading,
  chatHistory,
  setChatHistory,
  uploadedFiles,
  setUploadedFiles,
  projectIdeas,
  setProjectIdeas,
  codeSnippet,
  setCodeSnippet,
  generatedQuiz,
  setGeneratedQuiz,
  projectNotes,
  setProjectNotes,
  projectPlan,
  setProjectPlan,
  aiLoading,
  setAiLoading,
  ideasInput,
  setIdeasInput,
  codeInput,
  setCodeInput,
  notesInput,
  setNotesInput,
  planInput,
  setPlanInput,
  handleChatSubmit,
  saveChatToHistory,
  loadChatFromHistory,
  deleteChatFromHistory,
  handleFileUpload,
  handleWatchVideos,
  generateAiFeature,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              saveChatToHistory(true);
              setView(previousView);
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedProject.title}
          </h1>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-64 object-cover rounded-lg mb-6" />
              <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedProject.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Difficulty</h3>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    selectedProject.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                    selectedProject.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {selectedProject.difficulty}
                  </span>
                </div>
              </div>

              {selectedProject.content.tutorials && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tutorials</h3>
                  <div className="space-y-2">
                    {selectedProject.content.tutorials.map(tutorial => (
                      <div key={tutorial.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={tutorial.completed} readOnly className="rounded" />
                        <span className={tutorial.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}>{tutorial.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progress: {selectedProject.progress}%
                </label>
                <progress
                  value={selectedProject.progress}
                  max={100}
                  className="w-full h-4 rounded-lg bg-gray-200 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="w-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSidebarTab('chat')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'chat'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <MessageCircle size={16} className="inline mr-2" />
                Chat
              </button>
              <button
                onClick={() => setSidebarTab('history')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'history'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <History size={16} className="inline mr-2" />
                History
              </button>
              <button
                onClick={() => setSidebarTab('files')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'files'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Package size={16} className="inline mr-2" />
                Files
              </button>
              <button
                onClick={() => setSidebarTab('video')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'video'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Video size={16} className="inline mr-2" />
                Video
              </button>
              <button
                onClick={() => setSidebarTab('ideas')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'ideas'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                💡 Ideas
              </button>
              <button
                onClick={() => setSidebarTab('code')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'code'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                🖥️ Code Helper
              </button>
              <button
                onClick={() => setSidebarTab('quiz')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'quiz'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                📝 Quiz
              </button>
              <button
                onClick={() => setSidebarTab('notes')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'notes'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                📒 Notes
              </button>
              <button
                onClick={() => setSidebarTab('planner')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  sidebarTab === 'planner'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                📅 Planner
              </button>
            </div>

            <div className="h-[600px] overflow-hidden">
              {sidebarTab === 'chat' && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {chatMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-60 mt-1 text-right">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {chatbotLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg rounded-bl-none">
                          <motion.div className="flex space-x-1">
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full"></motion.div>
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full"></motion.div>
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full"></motion.div>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about this project..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                        disabled={chatbotLoading}
                        onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit(e)}
                      />
                      <button
                        onClick={() => saveChatToHistory(false)}
                        className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                        title="Save chat to history"
                      >
                        <Save size={14} />
                      </button>
                    </div>
                    <button
                      onClick={handleChatSubmit}
                      disabled={chatbotLoading || !chatInput.trim()}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              )}
              {sidebarTab === 'history' && (
                <div className="h-full overflow-y-auto p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Chat History</h3>
                  {chatHistory.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No saved chats yet</p>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((chat, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Chat {index + 1} ({chat.length} messages)
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => loadChatFromHistory(index)}
                                className="text-blue-500 hover:text-blue-600 text-sm"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => deleteChatFromHistory(index)}
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {chat[0]?.content || 'Empty chat'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {sidebarTab === 'files' && (
                <div className="h-full p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload Files</h3>
                  <div className="mb-4">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                    >
                      <div className="text-center">
                        <Package className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload files</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PDF, DOC, Images, etc.</p>
                      </div>
                    </label>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Uploaded Files</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white truncate">{file.name}</span>
                            </div>
                            <button
                              onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {sidebarTab === 'video' && (
                <div className="h-full p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Video Tutorials</h3>
                  <button
                    onClick={handleWatchVideos}
                    className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Video size={16} />
                    Watch Tutorials
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Opens video modal with relevant tutorials
                  </p>
                </div>
              )}
              {sidebarTab === 'ideas' && (
                <div className="h-full p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Project Idea Generator</h3>
                  <textarea
                    value={ideasInput}
                    onChange={(e) => setIdeasInput(e.target.value)}
                    placeholder="Enter interests or keywords (e.g., space, animals, robots)"
                    className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                    rows={3}
                    disabled={aiLoading}
                  />
                  <button
                    onClick={() => generateAiFeature('ideas', ideasInput)}
                    disabled={aiLoading || !ideasInput.trim()}
                    className="w-full py-2 mb-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Ideas
                  </button>
                  {aiLoading && <p className="text-gray-600 dark:text-gray-300 mb-4">Generating ideas...</p>}
                  {projectIdeas.length > 0 && (
                    <ul className="list-disc list-inside space-y-2 text-gray-900 dark:text-white">
                      {projectIdeas.map((idea, index) => (
                        <li key={index}>{idea}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {sidebarTab === 'code' && (
                <div className="h-full p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Code Helper</h3>
                  <textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Describe the coding help or debugging you need"
                    className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                    rows={4}
                    disabled={aiLoading}
                  />
                  <button
                    onClick={() => generateAiFeature('code', codeInput)}
                    disabled={aiLoading || !codeInput.trim()}
                    className="w-full py-2 mb-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Get Code Help
                  </button>
                  {aiLoading && <p className="text-gray-600 dark:text-gray-300 mb-4">Generating code snippet...</p>}
                  {codeSnippet && (
                    <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                      {codeSnippet}
                    </pre>
                  )}
                </div>
              )}
              {sidebarTab === 'quiz' && (
                <div className="h-full p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Quiz Generator</h3>
                  <button
                    onClick={() => generateAiFeature('quiz')}
                    disabled={aiLoading || !selectedProject}
                    className="w-full py-2 mb-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Quiz
                  </button>
                  {aiLoading && <p className="text-gray-600 dark:text-gray-300 mb-4">Generating quiz...</p>}
                  {generatedQuiz && !generatedQuiz.error && (
                    <div>
                      {generatedQuiz.questions && generatedQuiz.questions.length > 0 ? (
                        <ol className="list-decimal list-inside space-y-4 text-gray-900 dark:text-white">
                          {generatedQuiz.questions.map((q: any, idx: number) => (
                            <li key={idx}>
                              <p className="font-semibold">{q.question}</p>
                              <p className="italic text-sm">Answer: {q.answer}</p>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p>No quiz questions generated.</p>
                      )}
                    </div>
                  )}
                  {generatedQuiz && generatedQuiz.error && (
                    <p className="text-red-500">{generatedQuiz.error}</p>
                  )}
                </div>
              )}
              {sidebarTab === 'notes' && (
                <div className="h-full p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Notes Summarizer</h3>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Paste project content or notes to summarize"
                    className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                    rows={5}
                    disabled={aiLoading}
                  />
                  <button
                    onClick={() => generateAiFeature('notes', notesInput)}
                    disabled={aiLoading || !notesInput.trim()}
                    className="w-full py-2 mb-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Summary
                  </button>
                  {aiLoading && <p className="text-gray-600 dark:text-gray-300 mb-4">Generating summary...</p>}
                  {projectNotes && (
                    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap text-gray-900 dark:text-white">
                      {projectNotes}
                    </div>
                  )}
                </div>
              )}
              {sidebarTab === 'planner' && (
                <div className="h-full p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Project Planner</h3>
                  <textarea
                    value={planInput}
                    onChange={(e) => setPlanInput(e.target.value)}
                    placeholder="Describe your project to get a step-by-step plan"
                    className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                    rows={5}
                    disabled={aiLoading}
                  />
                  <button
                    onClick={() => generateAiFeature('plan', planInput)}
                    disabled={aiLoading || !planInput.trim()}
                    className="w-full py-2 mb-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Plan
                  </button>
                  {aiLoading && <p className="text-gray-600 dark:text-gray-300 mb-4">Generating project plan...</p>}
                  {projectPlan.length > 0 && (
                    <ol className="list-decimal list-inside space-y-2 text-gray-900 dark:text-white">
                      {projectPlan.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;