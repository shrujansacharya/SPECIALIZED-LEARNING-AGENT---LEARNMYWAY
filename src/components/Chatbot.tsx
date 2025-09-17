import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from "react";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// The generatePDF function remains the same as it correctly handles the direct answer.
const generatePDF = (directAnswerText: string, extractedMath?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const lineHeight = 10;
  const maxLineWidth = pageWidth - margin * 2;

  let y = margin;
  const addPageIfNeeded = () => {
    if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  if (directAnswerText && directAnswerText.trim()) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Direct Notes & Key Answers", margin, y);
    y += lineHeight + 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(directAnswerText, maxLineWidth);
    notesLines.forEach((line: string) => {
      addPageIfNeeded();
      doc.text(line, margin, y);
      y += lineHeight;
    });
  }

  if (extractedMath && extractedMath.trim()) {
    y += 20; 
    addPageIfNeeded();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Mathematical Content:", margin, y);
    y += lineHeight + 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const mathLines = doc.splitTextToSize(extractedMath, maxLineWidth);
    mathLines.forEach((line: string) => {
      addPageIfNeeded();
      doc.text(line, margin, y);
      y += lineHeight;
    });
  }
  
  doc.save("direct_notes.pdf");
};

import {
  Loader2,
  Send,
  PlusCircle,
  RotateCcw,
  Pencil,
  X,
  User,
  Search,
  Image as ImageIcon,
  Newspaper,
  Speech,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Paperclip,
  History as HistoryIcon,
  FolderOpen,
  List,
  Folder,
  Plus,
  SlidersHorizontal,
  Mic,
  ChevronsLeft,
  Pause,
  Play,
  Download,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../lib/firebase";
import { useParams, useLocation } from "react-router-dom";
import { useThemeStore } from '../store/theme';
import chatbotimage from '../styles/chatbotimage.png';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Subject {
  id: string;
  name: string;
  category: string;
}

const subjects: Subject[] = [
  { id: "english", name: "English", category: "Academics" },
  { id: "kannada", name: "Kannada", category: "Academics" },
  { id: "mathematics", name: "Mathematics", category: "Academics" },
  { id: "science", name: "Science", category: "Academics" },
  { id: "social_science", name: "Social Studies", category: "Academics" },
  { id: "physics", name: "Physics", category: "Academics" },
  { id: "chemistry", name: "Chemistry", category: "Academics" },
  { id: "biology", name: "Biology", category: "Academics" },
  { id: "history", name: "History", category: "Academics" },
  { id: "python", name: "Python Programming", category: "Programming" },
  { id: "javascript", name: "JavaScript Basics", category: "Programming" },
  { id: "web_dev", name: "Web Development", category: "Programming" },
  { id: "data_science", name: "Data Science", category: "Programming" },
];

interface RelatedVideo {
  videoUrl: string;
  thumbnailUrl: string;
}

interface Message {
  text: string;
  isBot: boolean;
  timestamp: string;
  attachmentUrl?: string;
  videoList?: RelatedVideo[];
  title?: string;
  extractedMath?: string;
}

interface ChatSession {
  id: string;
  name: string;
  weekday: string;
  createdAt: string;
  messages: Message[];
}

interface Project {
  id: string;
  name: string;
  subjectId: string;
  messages: Message[];
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type SessionsBySubject = Record<string, ChatSession[]>;
type ProjectsBySubject = Record<string, Project[]>;

const STORAGE_KEY = "eduChat:sessions:v1";
const PROJECTS_STORAGE_KEY = "eduChat:projects:v1";
const TASKS_STORAGE_KEY = "eduChat:tasks:v1";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function loadSessions(): SessionsBySubject {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionsBySubject) : {};
  } catch {
    return {};
  }
}

function saveSessions(data: SessionsBySubject) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadProjects(): ProjectsBySubject {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProjectsBySubject) : {};
  } catch {
    return {};
  }
}

function saveProjects(data: ProjectsBySubject) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function saveTasks(data: Task[]) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function weekdayOfNow() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function newWelcome(subjectName: string): Message {
  return {
    text: `Welcome to ${subjectName}! I am your personal AI assistant for this subject. Feel free to ask me anything related to ${subjectName}.`,
    isBot: true,
    timestamp: new Date().toISOString(),
  };
}

const findInitialSubject = (subjectId: string | undefined): Subject | null => {
  if (subjectId) {
    const normalizedId = subjectId.toLowerCase();
    if (normalizedId === 'math') {
      return subjects.find(s => s.id === 'mathematics') || null;
    }
    return subjects.find(s => s.id === normalizedId) || null;
  }
  return null;
};

const fetchYouTubeVideos = async (query: string, maxResults = 2): Promise<RelatedVideo[] | null> => {
  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API key is missing.");
    return null;
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=${maxResults}&safeSearch=strict`;
  try {
    const response = await axios.get(url);
    const videoResults: RelatedVideo[] = [];
    response.data.items.forEach((item: any) => {
      if (item.id.videoId) {
        videoResults.push({
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          thumbnailUrl: item.snippet.thumbnails.high.url,
        });
      }
    });
    return videoResults.length > 0 ? videoResults : null;
  } catch (error) {
    console.error("Failed to fetch YouTube videos:", error);
    return null;
  }
};

const subjectThematicInstructions: Record<string, Record<string, string>> = {
  english: {
    cricket: "Explain the concepts of plot, character, and theme using a cricket match as a metaphor. For example, a character's conflict is like a batsman's struggle against a bowler.",
    space: "Re-explain the literary devices in the poem using space exploration. The sun's light on Earth is like the first light on a newly discovered planet. The feeling of 'new beginnings' is like an astronaut starting a new mission.",
  },
  kannada: {
    space: "Translate and explain the passage using a space theme. The journey from village to city is like a journey from Earth to a new planet. The challenges and feelings of discovery are the same.",
  },
  social_science: {
    science: "Explain the Industrial Revolution by comparing it to a scientific experiment. The invention of the steam engine is a breakthrough discovery, and the social changes are the 'results' or 'side effects' of the experiment.",
    history: "Explain the historical context of a document as if it were a chapter in an ongoing epic saga. For example, the reasons for a war are the 'conflicts' or 'plot twists' in the story.",
  },
  science: {
    cricket: "Explain the physics of a cricket ball's trajectory (a parabola) and the force of the bat's impact. Use terms like 'kinetic energy' and 'momentum' in the context of a player's swing.",
    nature: "Explain a concept like a food chain using a rainforest ecosystem. Describe each animal's role and how they interact to maintain a 'natural balance'.",
  },
  history: {
    art: "Explain a historical period by looking at its art. For example, the Renaissance can be explained through the masterpieces of Leonardo da Vinci, linking the art to the scientific and cultural movements of the time.",
    space: "Reframe historical exploration (like the voyages of Columbus) as a form of space exploration. The new lands are 'new worlds' and the motivations are 'cosmic curiosity' and 'resource gathering'.",
  },
  physics: {
    space: "Explain concepts like gravity and orbital mechanics by using examples of planets orbiting stars and satellites orbiting Earth.",
  },
  chemistry: {
    history: "Explain chemical bonds by using an analogy of historical alliances or power struggles. Ionic bonds are like 'power transfers' between empires, and covalent bonds are like two countries 'sharing' resources to become stronger together.",
  },
  mathematics: {
    cricket: "Explain a math problem (e.g., probability or statistics) using a cricket game. 'What is the probability of a batsman scoring a century?' or 'How do you calculate a player's average run rate?'",
    space: "Explain a geometry problem by using the shapes of planets, orbits, and spaceships. Calculate the volume of a spherical planet or the distance between two celestial bodies.",
  },
};

const cleanTextForTTS = (text: string): string => {
  let cleaned = text
    .replace(/\*{1,2}/g, '')
    .replace(/#{1,6}/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
    .replace(/[-_=+~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
};

const ChatInterface: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const location = useLocation();
  const initialContext = location.state?.context as string | undefined;

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(() => findInitialSubject(subjectId));
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<
    "none" | "deepSearch" | "createImage" | "latestNews"
  >("none");
  const [inputToolValue, setInputToolValue] = useState("");
  const [userLearningStyle, setUserLearningStyle] = useState<string>('read/write');
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [sessionsBySubject, setSessionsBySubject] = useState<SessionsBySubject>({});
  const [projectsBySubject, setProjectsBySubject] = useState<ProjectsBySubject>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatContext, setChatContext] = useState<string | null>(initialContext || null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showProjects, setShowProjects] = useState<boolean>(false);
  const [showTasks, setShowTasks] = useState<boolean>(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  
  const [userData, setUserData] = useState<any>(null);
  const [sidebarView, setSidebarView] = useState<'main' | 'account'>('main');
  const [recommendedMessages, setRecommendedMessages] = useState<string[]>([]);
  const [directAnswer, setDirectAnswer] = useState<string>('');
  
  const [hasReceivedInitialExplanation, setHasReceivedInitialExplanation] = useState<boolean>(false);
  const [lastExplainedConcept, setLastExplainedConcept] = useState<string | null>(null);

  const { getThemeStyles } = useThemeStore();
  const theme = getThemeStyles();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const currentBackground = theme.backgrounds?.[currentBackgroundIndex];

  const groupedByWeekday = selectedSubject
    ? (sessionsBySubject[selectedSubject.id] || []).reduce((acc, session) => {
        const weekday = session.weekday || weekdayOfNow();
        acc[weekday] = acc[weekday] || [];
        acc[weekday].push(session);
        return acc;
      }, {} as Record<string, ChatSession[]>)
    : {};

  const synthesizeSpeech = async (text: string) => {
    if (!GOOGLE_TTS_API_KEY) {
      console.error("Google TTS API key is missing.");
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't play the audio response. Please try again.",
        isBot: true,
        timestamp: new Date().toISOString(),
      }]);
      return;
    }

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;
    const cleanedText = cleanTextForTTS(text);
    const requestBody = {
      input: { text: cleanedText },
      voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    try {
      const response = await axios.post(url, requestBody);
      const audioContent = response.data.audioContent;
      const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioRef.current = audio;
      setIsAudioPaused(false);
      audio.play();
    } catch (error) {
      console.error("Failed to synthesize speech:", error);
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't play the audio response. Please try again.",
        isBot: true,
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPaused) {
        audioRef.current.play();
        setIsAudioPaused(false);
      } else {
        audioRef.current.pause();
        setIsAudioPaused(true);
      }
    }
  };

  const startTypingAnimation = (fullText: string, videoList?: RelatedVideo[]) => {
    if (userLearningStyle === 'auditory') {
      synthesizeSpeech(fullText);
    }

    let index = 0;
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

    animationIntervalRef.current = setInterval(() => {
      setMessages(prev => {
        if (index >= fullText.length) {
          if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
          setLoading(false);
          setRecommendedMessages(getRecommendations(fullText));
          
          if (videoList && videoList.length > 0) {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.isBot) {
              lastMessage.videoList = videoList;
            }
            return newMessages;
          }

          return prev;
        }

        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.isBot) {
          lastMessage.text = fullText.substring(0, index + 1);
          index++;
        }
        return newMessages;
      });
    }, 30);
  };

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setUserLearningStyle(data?.learningStyle?.toLowerCase() || 'read/write');
        } else {
          console.error("Failed to fetch user data for chatbot sidebar.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  const getRecommendations = (botReply: string): string[] => {
    const lowerReply = botReply.toLowerCase();
    const recommendations: string[] = [];

    if (!hasReceivedInitialExplanation) {
      recommendations.push("Can you explain it with my theme?");
    }
    if (lowerReply.includes("like to start")) {
      recommendations.push("Start with the first problem", "Explain the concept first", "Give me a summary of the topic");
    }
    if (lowerReply.includes("how can i help") || lowerReply.includes("what can i help")) {
      recommendations.push("Explain this concept", "Help me with my homework", "Can you quiz me?");
    }
    if (lowerReply.includes("explain the concept")) {
      recommendations.push("Give me an example", "What's the next step?", "Provide a simpler explanation");
    }
    if (lowerReply.includes("what is") || lowerReply.includes("tell me about")) {
      recommendations.push("Give me a real-world example", "Can you simplify that?", "What's the history behind it?");
    }
    if (selectedSubject?.id === 'mathematics' && lowerReply.includes("problem")) {
      recommendations.push("Solve the first problem", "Show me a similar example", "Explain the formula again");
    }
    
    if (recommendations.length === 0) {
      if (lowerReply.includes('i don\'t get it') || lowerReply.includes('still not clear')) {
        recommendations.push("Try a different explanation");
      } else {
        recommendations.push("Tell me more", "Can you give me an example?", "Quiz me on this");
      }
    }

    return recommendations.slice(0, 3);
  };

  const handleRecommendationClick = (message: string) => {
    setNewMessage(message);
    handleSend({ preventDefault: () => {} } as FormEvent, message);
  };

  const handleBackToSubjectSelect = () => {
    window.history.back();
  };

  const startNewChatSameSubject = () => {
    if (selectedSubject) {
      setMessages([newWelcome(selectedSubject.name)]);
      setCurrentSessionId(null);
      setChatContext(null);
      setRecommendedMessages([]);
      setHasReceivedInitialExplanation(false);
      setLastExplainedConcept(null);
      setDirectAnswer('');
    }
  };

  const beginRename = (session: ChatSession) => {
    setRenamingId(session.id);
    setRenameValue(session.name);
  };

  const commitRename = (session: ChatSession) => {
    if (!selectedSubject || !renameValue.trim()) {
      setRenamingId(null);
      setRenameValue("");
      return;
    }

    const sessions = sessionsBySubject[selectedSubject.id] || [];
    const updatedSessions = sessions.map(s =>
      s.id === session.id ? { ...s, name: renameValue.trim() } : s
    );

    const newSessionsBySubject = {
      ...sessionsBySubject,
      [selectedSubject.id]: updatedSessions,
    };

    setSessionsBySubject(newSessionsBySubject);
    saveSessions(newSessionsBySubject);
    setRenamingId(null);
    setRenameValue("");
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setChatContext(null);
    setRecommendedMessages([]);
    setHasReceivedInitialExplanation(true);
    setLastExplainedConcept(null);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setNewMessage(transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        console.error("SpeechRecognition API not supported in this browser.");
      }
    }
  };

  const renderActiveToolPanel = () => {
    return (
      <div className="bg-black/70 p-4 rounded-t-xl border-b border-white/20">
        <p className="text-white text-sm">Tool panel placeholder for {activeTool}</p>
      </div>
    );
  };

  useEffect(() => {
    fetchUserData();
    setSessionsBySubject(loadSessions());
    setProjectsBySubject(loadProjects());
    setTasks(loadTasks());
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

  useEffect(() => {
    const initializeChat = async () => {
      if (selectedSubject) {
        const welcomeMsg = newWelcome(selectedSubject.name);
        setMessages([welcomeMsg]);
        setRecommendedMessages([]);
        setHasReceivedInitialExplanation(false);
        setLastExplainedConcept(null);
        setDirectAnswer('');
        
        if (initialContext) {
          if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
          setChatContext(initialContext);

          const thinkingMsg: Message = { text: "Analyzing your teacher's material and instructions...", isBot: true, timestamp: new Date().toISOString() };
          setMessages(prev => [...prev, thinkingMsg]);
          setLoading(true);

          try {
            const userInterests = userData?.interests?.toLowerCase() || 'general topics';
            const performanceEntry = userData?.performance?.find((p: any) => p.subjects.includes(selectedSubject.name));
            const performanceLevel = performanceEntry?.level || 'average';
            const userTheme = userData?.interests || 'none';

            const learningStyleInstructions: Record<string, string> = {
              visual: `
                - This is a VISUAL learner. Explain concepts using rich, descriptive language that creates a mental image.
                - Use visual analogies and metaphors.
                - At the end of your response, on new lines, suggest 2-3 specific YouTube search queries for related educational videos. Use this exact format for each: Suggested YouTube search: "query here" (brief description).
                - Example: Suggested YouTube search: "BODMAS explained for kids" (Fun animations for beginners).
              `,
              auditory: `
                - This is an AUDITORY learner. Write in a clear, conversational, and rhythmic tone, as if you were speaking.
                - Use rhetorical questions to engage the user's "inner voice."
                - Use mnemonics, acronyms, or even rhymes.
                - At the end of an explanation, suggest the student read your response aloud to reinforce the concept.
              `,
              kinesthetic: `
                - This is a KINESTHETIC learner. Focus on action and practical application.
                - Provide concrete, step-by-step instructions or small, interactive tasks. Use action verbs like "build," "create," "try," and "do."
                - Relate concepts to real-world examples and physical activities.
              `,
            };

            const defaultInstruction = `
              - This is a READ/WRITE learner. Provide clear, well-structured text.
              - Use numbered lists and bolded keywords to organize information.
              - Summarize key definitions and provide concise explanations.
            `;

            const styleInstruction = learningStyleInstructions[userLearningStyle] || defaultInstruction;

            let thematicInstruction = '';
            if (userTheme !== 'none') {
              const subjectThemeInstruction = subjectThematicInstructions[selectedSubject.id]?.[userTheme.toLowerCase()];
              if (subjectThemeInstruction) {
                thematicInstruction = `\n\nTo make your explanations even better, personalize them using the student's theme: ${userTheme}. Follow these specific instructions: ${subjectThemeInstruction}`;
              }
            }
            
            const isMathOrPhysicsSubject = selectedSubject?.id === 'mathematics' || selectedSubject?.id === 'physics' || selectedSubject?.id === 'chemistry';

            const mainResponseSystemInstruction = `You are an expert AI tutor for the subject: ${selectedSubject.name}. Your persona is a fun, friendly, and very patient teacher for a young student. Your goal is to make learning simple and engaging for kids.

IMPORTANT: You must ONLY answer questions related to the subject: ${selectedSubject.name}. If the question is outside this subject, politely refuse to answer and remind the user to ask questions related to the subject.

A student has provided the following teacher-uploaded material for analysis: ${initialContext}.

${isMathOrPhysicsSubject ? 
  `For problems involving calculations, use **chain-of-thought** reasoning. Show your work step-by-step using numbered lists and use LaTeX for all mathematical expressions. For example, use $\\sqrt{}$ for square roots and $\\frac{}{}$ for fractions.
  Example:
  **1.** Find a common denominator.
  $\\frac{1}{2}$ becomes $\\frac{2}{4}$
  **2.** Add the fractions.
  $\\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$
  **3.** Final Answer: **$\\frac{3}{4}$**`
  :
  `Your task is to:
  1. Perform a deep analysis of the material, identifying key concepts, main topics, and any important details or instructions.
  2. Provide a comprehensive summary that breaks down the material into understandable parts.
  3. Identify potential areas where the student might need help or clarification.
  4. Generate 2-3 specific questions or discussion points related to the material to engage the student.
  5. If applicable, suggest practical applications or examples related to the material.`
}

IMPORTANT: You must follow these teaching instructions precisely for this student:
${styleInstruction}

The student's performance level is ${performanceLevel}. Adjust your difficulty accordingly.
The student is interested in ${userInterests}. Whenever possible, create analogies or examples related to their interests.${thematicInstruction}

After your analysis, ask how you can help them with this material and encourage them to ask specific questions.`;

            const initialApiHistory = [{ role: 'user', parts: [{ text: initialContext }] }];

            const mainResponsePromise = axios.post(
                GEMINI_API_URL,
                {
                    contents: [...initialApiHistory],
                    systemInstruction: { parts: [{ text: mainResponseSystemInstruction }] },
                    generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    params: { key: GEMINI_API_KEY },
                }
            );

            const directAnswerSystemInstruction = `You are a concise, direct assistant. Given a block of teacher's notes, your task is to extract the key questions or problems and provide a direct, simple answer for each, as if creating notes for a student. Do not use conversational language, analogies, or explanations. Just provide the facts and answers. For problems, provide the final answer immediately. Use bullet points or numbered lists for each answer.

Material to analyze: ${initialContext}

Provide a direct, factual answer to the core question(s) in the material.`;

            const directAnswerPromise = axios.post(
                GEMINI_API_URL,
                {
                    contents: [...initialApiHistory],
                    systemInstruction: { parts: [{ text: directAnswerSystemInstruction }] },
                    generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    params: { key: GEMINI_API_KEY },
                }
            );

            const [mainResponse, directAnswerResponse] = await Promise.allSettled([
                mainResponsePromise,
                directAnswerPromise,
            ]);

            let proactiveReply = "I've reviewed the material. How can I help you with it?";
            let directAnswerText = '';

            if (mainResponse.status === 'fulfilled') {
                proactiveReply = mainResponse.value.data.candidates?.[0]?.content?.parts?.[0]?.text || proactiveReply;
            } else {
                proactiveReply = "Sorry, I'm having trouble providing a complete response. You can still ask me questions about the material.";
            }

            if (directAnswerResponse.status === 'fulfilled') {
                directAnswerText = directAnswerResponse.value.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            }

            setDirectAnswer(directAnswerText);

            let videoList: RelatedVideo[] | undefined = undefined;
            if (userLearningStyle === 'visual' && mainResponse.status === 'fulfilled') {
              try {
                const queryPrompt = `From the text "${proactiveReply}", identify the core topic in 3-5 words. Respond with only the topic and no other words. Examples: "BODMAS order of operations", "Photosynthesis process".`;

                const queryResponse = await axios.post(
                  GEMINI_API_URL,
                  {
                    contents: [{ role: 'user', parts: [{ text: queryPrompt }] }],
                    generationConfig: { temperature: 0.2, maxOutputTokens: 20 },
                    systemInstruction: { parts: [{ text: "You are an AI trained to generate concise topics for video searches." }] },
                  },
                  {
                    headers: { 'Content-Type': 'application/json' },
                    params: { key: GEMINI_API_KEY },
                  }
                );

                const coreTopic = queryResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || `${selectedSubject?.name} tutorial`;

                const youtubeSearchQueries = [
                  `"${coreTopic}" explained for kids`,
                  `${selectedSubject?.name} "${coreTopic}" basics`,
                  `${coreTopic} fun tutorial`,
                ];

                const videoPromises = youtubeSearchQueries.map((query: string) => fetchYouTubeVideos(query, 1));
                const results = await Promise.all(videoPromises);
                videoList = results.flatMap(list => list || []).filter(v => v.videoUrl);
              } catch (error) {
                console.error("Failed to fetch videos for teacher material:", error);
              }
            }

            const proactiveBotMessage: Message = { text: '', isBot: true, timestamp: new Date().toISOString(), videoList };
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = proactiveBotMessage;
              return updated;
            });

            startTypingAnimation(proactiveReply);
            
          } catch (error) {
            console.error("Proactive analysis failed:", error);
            const errorMsg: Message = { text: "Sorry, I had trouble analyzing that material. You can still ask me questions about it.", isBot: true, timestamp: new Date().toISOString() };
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = errorMsg;
              return updated;
            });
          } finally {
            setLoading(false);
          }
        }
        
        setCurrentSessionId(null);
        window.history.replaceState({}, document.title);
      }
    };

    initializeChat();
    
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsAudioPaused(false);
      }
    };
  }, [selectedSubject, initialContext, userLearningStyle, userData]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  useEffect(() => {
    const saveCurrentSession = () => {
      if (!messages.length || !selectedSubject || messages.length <= 2) return;

      const firstUserMessage = messages.find(m => !m.isBot);
      const chatName = firstUserMessage?.text?.substring(0, 30) || "Chat Session";

      const sessions = sessionsBySubject[selectedSubject.id] || [];
      const sessionIndex = sessions.findIndex((s) => s.id === currentSessionId);
      const newSession: ChatSession = {
        id: currentSessionId || uuidv4(),
        name: chatName,
        weekday: weekdayOfNow(),
        createdAt: new Date().toISOString(),
        messages,
      };

      const updatedSessions = [...sessions];
      if (sessionIndex > -1) {
        updatedSessions[sessionIndex] = newSession;
      } else {
        updatedSessions.unshift(newSession);
      }

      const newSessionsBySubject = {
        ...sessionsBySubject,
        [selectedSubject.id]: updatedSessions,
      };
      setSessionsBySubject(newSessionsBySubject);
      saveSessions(newSessionsBySubject);
      setCurrentSessionId(newSession.id);
    };

    const debounceSave = setTimeout(saveCurrentSession, 1500);
    return () => clearTimeout(debounceSave);
  }, [messages, selectedSubject, currentSessionId, sessionsBySubject]);

  const handleGenerateImage = async (botMessage: string) => {
    const lastUserMessage = messages.filter(m => !m.isBot).pop()?.text || '';
    const topic = lastUserMessage || botMessage.substring(0, 100);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/generate-topic-image`, { topic });
      const imageUrl = response.data.imageUrl;
      const imageMessage: Message = {
        text: 'Here is a visual representation:',
        isBot: true,
        timestamp: new Date().toISOString(),
        attachmentUrl: imageUrl,
      };
      setMessages(prev => [...prev, imageMessage]);
    } catch (error) {
      console.error('Failed to generate image:', error);
      const errorMessage: Message = { text: "Sorry, I couldn't generate an image right now. Please try again.", isBot: true, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSend = async (e: FormEvent, recommendedMessage?: string) => {
    e.preventDefault();
    const messageToSend = recommendedMessage || newMessage;
    if (!messageToSend.trim() || !selectedSubject) return;

    const sensitiveKeywords = [
      "sex", "sexual", "porn", "nude", "naked", "erotic", "xxx", "adult", "nsfw", "explicit", "fetish", "bdsm", "rape", "incest", "violence", "drugs", "suicide"
    ];

    const lowerMessage = messageToSend.toLowerCase();
    const containsSensitive = sensitiveKeywords.some(keyword => lowerMessage.includes(keyword));

    if (containsSensitive) {
      const refusalMessage: Message = {
        text: "I'm sorry, but I cannot provide responses to that type of content. Please ask questions related to the subject.",
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, refusalMessage]);
      setNewMessage('');
      return;
    }

    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsAudioPaused(false);
    }
    if (messages.length === 1) setIsSidebarCollapsed(true);

    const userMessage: Message = { text: messageToSend, isBot: false, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);
    setRecommendedMessages([]);
    setDirectAnswer('');

    const userInterests = userData?.interests?.toLowerCase() || 'general topics';
    const performanceEntry = userData?.performance?.find((p: any) => p.subjects.includes(selectedSubject.name));
    const performanceLevel = performanceEntry?.level || 'average';
    const userTheme = userData?.interests || 'none';

    let systemInstructionText = `
      You are an expert AI tutor for the subject: ${selectedSubject.name}. Your persona is a fun, friendly, and very patient teacher for a young student. Your goal is to make learning simple and engaging for kids. Use clear, simple language and relatable analogies.
      IMPORTANT: You must ONLY answer questions related to the subject: ${selectedSubject.name}. If the question is outside this subject, politely refuse to answer and remind the user to ask questions related to the subject.
    `;

    const isThematicRequest = messageToSend.toLowerCase().includes("explain it with my theme");
    const isFrustrationResponse = messageToSend.toLowerCase().includes("i don't get it") || messageToSend.toLowerCase().includes("still not clear");

    let isThematicResponse = false;
    let videoList: RelatedVideo[] | null = null;

    if (isThematicRequest && userTheme !== 'none' && lastExplainedConcept) {
      const thematicInstruction = subjectThematicInstructions[selectedSubject.id]?.[userTheme.toLowerCase()];
      if (thematicInstruction) {
        isThematicResponse = true;
        systemInstructionText += `\n\n[Thematic Explanation Mode] The student wants a detailed explanation of '${lastExplainedConcept}' using a '${userTheme}' theme. Do not provide a generic answer. Focus on the thematic explanation.`;
        systemInstructionText += `\n\nFollow these specific instructions for the '${userTheme}' theme: ${thematicInstruction}`;
      }
    } else if (isFrustrationResponse && userTheme !== 'none' && lastExplainedConcept) {
      const thematicInstruction = subjectThematicInstructions[selectedSubject.id]?.[userTheme.toLowerCase()];
      if (thematicInstruction) {
        isThematicResponse = true;
        systemInstructionText += `\n\n[Deeper Thematic Explanation Mode] The student is struggling to understand '${lastExplainedConcept}'. Your last response was not clear enough. Re-explain this concept from a different angle, using a deeper and more elaborate analogy based on the '${userTheme}' theme. Provide a detailed, step-by-step example.`;
        systemInstructionText += `\n\nFollow these specific instructions for the '${userTheme}' theme: ${thematicInstruction}`;
      }
    } else {
      const learningStyleInstructions: Record<string, string> = {
        visual: `
          - This is a VISUAL learner. Explain concepts using rich, descriptive language that creates a mental image.
          - Use visual analogies and metaphors.
          - At the end of your response, on new lines, suggest 2-3 specific YouTube search queries for related educational videos. Use this exact format for each: Suggested YouTube search: "query here" (brief description).
          - Example: Suggested YouTube search: "BODMAS explained for kids" (Fun animations for beginners).
        `,
        auditory: `
          - This is an AUDITORY learner. Write in a clear, conversational, and rhythmic tone, as if you were speaking.
          - Use rhetorical questions to engage the user's "inner voice."
          - Use mnemonics, acronyms, or even rhymes.
          - At the end of an explanation, suggest the student read your response aloud to reinforce the concept.
        `,
        kinesthetic: `
          - This is a KINESTHETIC learner. Focus on action and practical application.
          - Provide concrete, step-by-step instructions or small, interactive tasks. Use action verbs like "build," "create," "try," and "do."
          - Relate concepts to real-world examples and physical activities.
        `,
      };

      const defaultInstruction = `
        - This is a READ/WRITE learner. Provide clear, well-structured text.
        - Use numbered lists and bolded keywords to organize information.
        - Summarize key definitions and provide concise explanations.
      `;

      const styleInstruction = learningStyleInstructions[userLearningStyle] || defaultInstruction;

      systemInstructionText += `
        IMPORTANT: You must follow these teaching instructions precisely for this student:
        ${styleInstruction}

        To make your explanations even better, personalize them. The student is interested in ${userInterests}.
        Whenever possible, create analogies or examples related to their interests.

        The student's performance level is ${performanceLevel}. Adjust your difficulty accordingly.
      `;
    }

    const isMathOrPhysicsSubject = selectedSubject?.id === 'mathematics' || selectedSubject?.id === 'physics' || selectedSubject?.id === 'chemistry';

    if (isMathOrPhysicsSubject) {
        systemInstructionText += `
        \n\nFor problems involving calculations, use **chain-of-thought** reasoning. Show your work step-by-step using numbered lists and use LaTeX for all mathematical expressions. For example, use \\sqrt{} for square roots and \\frac{}{} for fractions.
        - Example:
        **1.** Find a common denominator.
        $\\frac{1}{2}$ becomes $\\frac{2}{4}$
        **2.** Add the fractions.
        $\\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$
        **3.** Final Answer: **$\\frac{3}{4}$**
        `;
    }

    if (chatContext) {
      systemInstructionText += `\nAdditionally, the following context has been provided for this session: ${chatContext}. Refer to this context when relevant.`;
    }

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.isBot ? 'model' : 'user',
        parts: [{ text: msg.text }],
      }));

      const currentTurn = { role: 'user', parts: [{ text: messageToSend }] };
      const historyForApi = conversationHistory;

      // Make API calls to Gemini for both the main reply and the concise answer
      const [mainResponse, directAnswerResponse] = await Promise.allSettled([
        axios.post(
          GEMINI_API_URL,
          {
            contents: [...historyForApi, currentTurn],
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
            systemInstruction: { parts: [{ text: systemInstructionText }] },
          },
          {
            headers: { 'Content-Type': 'application/json' },
            params: { key: GEMINI_API_KEY },
          }
        ),
        axios.post(
          GEMINI_API_URL,
          {
            contents: [...historyForApi, { role: 'user', parts: [{ text: `Generate a concise, direct, notes-style answer for the following prompt: "${messageToSend}". Do not use conversational language. Just provide the facts.` }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
            systemInstruction: { parts: [{ text: "You are a concise, direct assistant." }] },
          },
          {
            headers: { 'Content-Type': 'application/json' },
            params: { key: GEMINI_API_KEY },
          }
        ),
      ]);
      
      let botReply = '';
      let extractedMath = '';

      if (mainResponse.status === 'fulfilled') {
        botReply = mainResponse.value.data.candidates?.[0]?.content?.parts?.[0]?.text || `Sorry, I couldn't understand.`;
        if (isMathOrPhysicsSubject) {
          const extractMathPrompt = `Extract only the mathematical content from the following response. Include only fractions, numbers, equations, and calculations. Do not include any explanatory text, just the clean math content in plain text or LaTeX format. If there are no mathematical elements, return an empty string.
  
          Response to extract from:
          ${botReply}`;
          
          const extractResponse = await axios.post(
            GEMINI_API_URL,
            {
              contents: [{ role: 'user', parts: [{ text: extractMathPrompt }] }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
              systemInstruction: { parts: [{ text: "You are an AI that extracts mathematical content from text. Return only the math, nothing else." }] },
            },
            {
              headers: { 'Content-Type': 'application/json' },
              params: { key: GEMINI_API_KEY },
            }
          );
          extractedMath = extractResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
      } else {
        botReply = `Sorry, I'm having trouble providing a complete response. You can still ask me questions about the material.`;
      }

      if (directAnswerResponse.status === 'fulfilled') {
        setDirectAnswer(directAnswerResponse.value.data.candidates?.[0]?.content?.parts?.[0]?.text || '');
      }

      let suggestedQueries: string[] = [];
      const lines = botReply.split('\n');
      let cleanedReplyLines: string[] = [];
      lines.forEach((line: string) => {
        if (line.trim().startsWith('Suggested YouTube search: ')) {
          const match = line.match(/Suggested YouTube search: "(.*?)"(?: \((.*?)\))?/);
          if (match && match[1]) {
            suggestedQueries.push(match[1]);
          }
        } else {
          cleanedReplyLines.push(line);
        }
      });
      botReply = cleanedReplyLines.join('\n').trim();

      const botMessage: Message = {
        text: '',
        isBot: true,
        timestamp: new Date().toISOString(),
        extractedMath: extractedMath || undefined,
      };
      setMessages((prev) => [...prev, botMessage]);

      startTypingAnimation(botReply, videoList || undefined);

      setLastExplainedConcept(messageToSend);
      setHasReceivedInitialExplanation(true);

    } catch (error) {
      console.error("API call failed:", error);
      const errorMessage: Message = { text: "Sorry, something went wrong. Please try again.", isBot: true, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const paragraphRenderer = (props: any) => {
    const { node, ...rest } = props;
    return <p className="my-0" {...rest} />;
  };

  const mathRenderer = (props: any) => {
    const { children } = props;
    const text = children as string;

    // Handle inline math expressions (single $)
    if (text.startsWith('$') && text.endsWith('$') && text.length > 2) {
      const math = text.slice(1, -1);
      return <InlineMath math={math} />;
    }

    // Handle block math expressions (double $$)
    if (text.startsWith('$$') && text.endsWith('$$') && text.length > 4) {
      const math = text.slice(2, -2);
      return <BlockMath math={math} />;
    }

    return <span>{text}</span>;
  };

  const codeRenderer = (props: any) => {
    const { children, className } = props;
    const text = children as string;

    // Check if this is a math code block
    if (className === 'language-math' || text.includes('\\') || text.includes('$')) {
      // Try to render as math
      try {
        return <BlockMath math={text} />;
      } catch (error) {
        // If math rendering fails, fall back to regular code
        return <code className={className}>{text}</code>;
      }
    }

    return <code className={className}>{text}</code>;
  };

  const categories = Array.from(new Set(subjects.map(s => s.category)));

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
      
      {!selectedSubject ? (
        <div className="flex flex-col flex-1 relative z-10">
          <div className="flex items-center p-4 bg-black/70 border-b border-white/20">
            <button
              onClick={() => window.history.back()}
              className="group relative w-12 h-12 flex items-center justify-center p-2 rounded-full
                         transition-all duration-200 bg-black/50 hover:bg-black/80
                         focus:outline-none focus:ring-2 focus:ring-yellow-500/80"
              title="Back"
            >
              <div className="absolute inset-0 rounded-full z-10 
                           bg-gradient-to-br from-purple-600 to-indigo-800
                           group-hover:from-purple-500 group-hover:to-indigo-700
                           transition-all duration-300 transform group-hover:scale-110"></div>
              <ArrowLeft
                size={24}
                className="relative z-20 text-white"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
                }}
              />
            </button>
            <h1 className="text-4xl font-bold text-white text-center flex-1 pr-16">
              Choose a Subject <Sparkles />
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {categories.map((category) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {subjects
                    .filter((s) => s.category === category)
                    .map((subject) => (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-black/70 p-6 rounded-xl shadow-lg border border-white/20 text-center cursor-pointer hover:bg-black/60 transition"
                        onClick={() => setSelectedSubject(subject)}
                      >
                        <p className="text-xl font-semibold text-white">
                          {subject.name}
                        </p>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden relative z-10">
          <motion.div
            initial={{ width: 250 }}
            animate={{ width: isSidebarCollapsed ? 100 : 250 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 bottom-0 flex flex-col bg-black/70 border-r border-white/20 p-4 shrink-0"
          >
            <button
              onClick={handleBackToSubjectSelect}
              className="group relative w-12 h-12 flex items-center justify-center p-2 rounded-full transition-all duration-200 
                         bg-black/50 hover:bg-black/80 mb-4"
              title="Back to Subjects"
            >
              <div className="absolute inset-0 rounded-full z-10 
                             bg-gradient-to-br from-purple-600 to-indigo-800
                             group-hover:from-purple-500 group-hover:to-indigo-700
                             transition-all duration-300 transform group-hover:scale-110"></div>
              <ArrowLeft
                size={24}
                className="relative z-20 text-white"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
                }}
              />
            </button>

            <div className="flex items-center gap-2 pb-4 mb-4">
              <div className="h-10 w-10 relative flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-no-repeat bg-contain"
                  style={{ backgroundImage: `url(${chatbotimage})` }}
                />
              </div>
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xl font-bold text-white whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Learny
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex flex-col space-y-2 flex-1 overflow-y-auto">
              {sidebarView === 'main' ? (
                <>
                  <button
                    onClick={startNewChatSameSubject}
                    className="flex items-center gap-3 w-full p-3 rounded-md bg-blue-600 hover:bg-blue-500 transition text-white font-semibold"
                  >
                    <PlusCircle size={20} />
                    <AnimatePresence>
                      {!isSidebarCollapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          New Chat
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <button
                    className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-white/20 transition text-blue-300 font-semibold"
                  >
                    <Search size={20} />
                    <AnimatePresence>
                      {!isSidebarCollapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          Search
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center justify-between w-full p-3 rounded-md hover:bg-white/20 transition text-blue-300 font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <HistoryIcon size={20} />
                      <AnimatePresence>
                        {!isSidebarCollapsed && (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            History
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                  <AnimatePresence>
                    {showHistory && !isSidebarCollapsed && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        {Object.keys(groupedByWeekday).length === 0 && (
                          <p className="text-[11px] text-gray-400 p-2">No saved chats.</p>
                        )}
                        {Object.entries(groupedByWeekday).map(([day, sessions]) => (
                          <div key={day} className="mb-3">
                            <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1 pl-2">{day}</p>
                            <div className="space-y-1.5">
                              {sessions.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map((s) => (
                                <div key={s.id} className={`group p-2 rounded-md ${currentSessionId === s.id ? "bg-blue-600" : "bg-black/40 hover:bg-black/30 transition"}`}>
                                  {renamingId === s.id ? (
                                    <input
                                      autoFocus
                                      value={renameValue}
                                      onChange={(e) => setRenameValue(e.target.value)}
                                      onKeyDown={(e) => e.key === "Enter" && commitRename(s)}
                                      onBlur={() => commitRename(s)}
                                      className="w-full bg-transparent text-xs text-blue-200 outline-none border-b border-blue-700/60"
                                    />
                                  ) : (
                                    <button
                                      onClick={() => loadSession(s)}
                                      className="w-full text-left text-xs text-white truncate"
                                      title={s.name}
                                    >
                                      {s.name}
                                    </button>
                                  )}
                                  {renamingId !== s.id && (
                                    <button
                                      onClick={() => beginRename(s)}
                                      className="opacity-0 group-hover:opacity-100 transition text-[10px] text-gray-400 mt-1 flex items-center gap-1"
                                      title="Rename chat"
                                    >
                                      <Pencil size={12} /> rename
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-1 mb-2">
                    <button
                      onClick={() => setSidebarView('main')}
                      className="p-2 rounded-md hover:bg-white/20 transition text-white"
                      title="Back to menu"
                    >
                      <ChevronsLeft size={22} />
                    </button>
                    <AnimatePresence>
                      {!isSidebarCollapsed && (
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="font-bold text-lg text-white"
                        >
                          My Account
                        </motion.h3>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 text-center">
                    {userData?.profileImage ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${userData.profileImage}`}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-purple-400"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center mb-3 border-2 border-purple-400">
                        <User size={40} />
                      </div>
                    )}
                    <h3 className="font-bold text-lg w-full truncate text-white">{userData?.name || 'Explorer'}</h3>
                    <p className="text-xs text-gray-400 w-full truncate">{userData?.email}</p>
                  </div>

                  <div className="space-y-2 p-2 mt-4">
                    <div className="p-3 bg-black/40 rounded-lg">
                      <label className="text-xs text-gray-400">Learning Style</label>
                      <p className="font-medium text-white">{userData?.learningStyle || 'Not set'}</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg">
                      <label className="text-xs text-gray-400">Interests</label>
                      <p className="font-medium text-white">{userData?.interests || 'Not set'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/20 flex items-center justify-between">
              <button
                onClick={() => setSidebarView('account')}
                className="flex items-center gap-2 p-3 rounded-md hover:bg-white/20 transition w-full text-left"
              >
                {userData?.profileImage ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${userData.profileImage}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                    {userData ? (userData.name || userData.email)?.charAt(0).toUpperCase() : <User size={16} />}
                  </div>
                )}
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-semibold text-white whitespace-nowrap truncate"
                      title={userData?.email}
                    >
                      {userData ? userData.name || userData.email : "Loading..."}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 text-white hover:text-white transition z-10 shrink-0"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSidebarCollapsed ? "open" : "close"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSidebarCollapsed ? (
                      <ChevronRight size={20} />
                    ) : (
                      <ChevronLeft size={20} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </motion.div>

          <div className={`flex flex-col flex-1 ${!isSidebarCollapsed ? 'ml-[250px]' : 'ml-[100px]'} transition-all duration-300`}>
            <motion.div
              className="flex-1 overflow-y-auto pt-20 pb-40 px-8 md:px-16 space-y-2"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex w-full ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-7xl ${
                      msg.isBot
                        ? 'text-gray-200 bg-black/70 p-4 rounded-xl'
                        : 'bg-blue-700 text-white p-4 rounded-xl'
                    }`}
                  >
                    <ReactMarkdown
                      className="text-lg leading-relaxed whitespace-pre-wrap text-left"
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: paragraphRenderer,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                    {msg.isBot && directAnswer && idx === messages.length - 1 && !loading && (selectedSubject?.id === 'mathematics' || selectedSubject?.id === 'physics') && initialContext && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        onClick={() => generatePDF(directAnswer, msg.extractedMath)}
                        className="mt-4 inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                        title="Download concise answers as PDF"
                      >
                        <Download size={18} />
                        Download Concise Answers
                      </motion.button>
                    )}

                    {msg.attachmentUrl && (
                      msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img src={msg.attachmentUrl} alt="Generated image" className="mt-4 max-w-full rounded-lg" />
                      ) : (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-blue-300 hover:underline"
                        >
                          <Paperclip size={16} />
                          View Attached File
                        </a>
                      )
                    )}
                    {msg.videoList && msg.videoList.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-500/50">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Related Videos:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {msg.videoList.map((video, videoIdx) => {
                            const videoId = video.videoUrl.split('v=')[1]?.split('&')[0];
                            return (
                              <div
                                key={videoIdx}
                                className="bg-black/50 rounded-lg overflow-hidden"
                              >
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full aspect-square"
                                ></iframe>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-black/70 border border-white/20 p-3 rounded-2xl shadow-sm text-white flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              
            </motion.div>
            
            <AnimatePresence mode="wait">
              {!loading && (
                <motion.div
                  key="input-form"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.3 }}
                  className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center p-6 bg-transparent"
                  style={{
                    marginLeft: isSidebarCollapsed ? '100px' : '250px',
                    transition: 'margin-left 0.3s ease-in-out'
                  }}
                >
                  <AnimatePresence>
                    {activeTool !== "none" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full max-w-5xl"
                      >
                        {renderActiveToolPanel()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="w-full max-w-5xl flex gap-2 mb-4 overflow-x-auto">
                    <AnimatePresence>
                      {recommendedMessages.map((rec, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                          onClick={() => handleRecommendationClick(rec)}
                          className="flex-shrink-0 bg-white/20 backdrop-blur-md text-white text-sm px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors"
                        >
                          {rec}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>

                  <form
                    onSubmit={handleSend}
                    className="w-full max-w-5xl bg-black/70 rounded-3xl p-4 flex flex-col focus-within:ring-2 focus-within:ring-blue-500/80 transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                          }
                        }}
                        className="flex-1 w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                        placeholder="Ask me anything..."
                        disabled={loading}
                      />
                      {userLearningStyle === 'auditory' && audioRef.current && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={toggleAudio}
                          className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isAudioPaused ? "Resume audio" : "Pause audio"}
                        >
                          {isAudioPaused ? <Play size={18} /> : <Pause size={18} />}
                        </motion.button>
                      )}
                      {newMessage.trim() && (
                        <button
                          type="submit"
                          className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send"
                        >
                          <Send size={18} />
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={handleAttachmentClick}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Attach file"
                        >
                          <Plus size={24} />
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                          title="Tools (Display Only)"
                        >
                          <SlidersHorizontal size={22} />
                          <span className="font-medium text-sm">Tools</span>
                        </button>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={handleVoiceToggle}
                          className="text-gray-400 hover:text-white transition-colors relative h-10 w-10 flex items-center justify-center"
                          title="Use microphone"
                        >
                          <AnimatePresence>
                            {isRecording && (
                              <motion.div
                                key="mic-glowing-animation"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: [1, 1.1, 1] }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{
                                  scale: {
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }
                                }}
                                className="absolute inset-0"
                              >
                                <div className="absolute inset-0 animate-spin [animation-duration:3s]">
                                  <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,#4f46e5_0%,#a855f7_50%,#4f46e5_100%)] blur-xl opacity-80"></div>
                                </div>
                                <div className="absolute inset-1.5 bg-gray-900 rounded-full"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Mic size={24} className="text-purple-300" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {!isRecording && <Mic size={24} />}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;