import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Mic, Volume2, VolumeX, User, MessageSquare, Paperclip, Sun, Moon, X, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import { useThemeStore } from '../store/theme';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestions?: string[];
}

interface ChatSession {
  id: string;
  name: string;
  createdAt: string;
  messages: Message[];
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const playSound = async (url: string) => {
  try {
    const audio = new Audio(url);
    await audio.play();
  } catch (e) {
    console.warn(`Failed to play sound ${url}:`, e);
  }
};

// Utility function to shuffle an array
const shuffleArray = (array: string[]): string[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const BotAI = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chatSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [draftInputs, setDraftInputs] = useState<{ [sessionId: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showThemeSection, setShowThemeSection] = useState(true);
  const [showHistorySection, setShowHistorySection] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !localStorage.getItem('onboardingDismissed'));
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyListRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { currentTheme, getThemeStyles } = useThemeStore();
  const theme = getThemeStyles();

  // Expanded theme photos with 15 images per theme
  const themePhotos: { [key: string]: string[] } = {
    default: [
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1920&q=80', // Abstract
      'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80', // Gradient
      'https://images.unsplash.com/photo-1556680262-9990363a3e6d?auto=format&fit=crop&w=1920&q=80', // Minimalist
      'https://images.unsplash.com/photo-1501696461415-6bd6660c6746?auto=format&fit=crop&w=1920&q=80', // Patterns
      'https://images.unsplash.com/photo-1519125323398-675f1f1d1d1d?auto=format&fit=crop&w=1920&q=80', // Geometric
      'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=1920&q=80', // Soft colors
      'https://images.unsplash.com/photo-1558591710-0b7a0c2e4d0f?auto=format&fit=crop&w=1920&q=80', // Abstract waves
      'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=1920&q=80', // Blue gradient
      'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1920&q=80', // Purple gradient
      'https://images.unsplash.com/photo-1518837695005-208458c018b2?auto=format&fit=crop&w=1920&q=80', // Neutral tones
      'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?auto=format&fit=crop&w=1920&q=80', // Pastel abstract
      'https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&w=1920&q=80', // Gradient waves
      'https://images.unsplash.com/photo-1511497580565-0a7f8c5e88a6?auto=format&fit=crop&w=1920&q=80', // Soft gradient
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1920&q=80', // Colorful abstract
      'https://images.unsplash.com/photo-1518495973542-4542c06c022e?auto=format&fit=crop&w=1920&q=80', // Minimalist shapes
    ],
    space: [
      'https://images.unsplash.com/photo-1543726969-8c0e73f08e72?auto=format&fit=crop&w=1920&q=80', // Stars
      'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1920&q=80', // Galaxy
      'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=1920&q=80', // Nebula
      'https://images.unsplash.com/photo-1454789548928-9efd0d7d5f0e?auto=format&fit=crop&w=1920&q=80', // Planets
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80', // Milky Way
      'https://images.unsplash.com/photo-1570034656573-8d0f2c2f2b5a?auto=format&fit=crop&w=1920&q=80', // Astronaut
      'https://images.unsplash.com/photo-1610296669228-6d79c9c73c0c?auto=format&fit=crop&w=1920&q=80', // Black Hole
      'https://images.unsplash.com/photo-1462331943505-2c0c4f8f8d55?auto=format&fit=crop&w=1920&q=80', // Star Cluster
      'https://images.unsplash.com/photo-1520034471518-071e7e0e0c8f?auto=format&fit=crop&w=1920&q=80', // Space telescope
      'https://images.unsplash.com/photo-1538485399059-9b5d1d1e8821?auto=format&fit=crop&w=1920&q=80', // Distant stars
      'https://images.unsplash.com/photo-1541877946-1a4d6e0e1e64?auto=format&fit=crop&w=1920&q=80', // Cosmic dust
      'https://images.unsplash.com/photo-1504332532890-37e4e361a849?auto=format&fit=crop&w=1920&q=80', // Starfield
      'https://images.unsplash.com/photo-1543128639-4d30e6a4e5b5?auto=format&fit=crop&w=1920&q=80', // Nebula clouds
      'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=1920&q=80', // Solar system
      'https://images.unsplash.com/photo-1614644147798-f8c0fc9d8b1f?auto=format&fit=crop&w=1920&q=80', // Moon surface
    ],
    nature: [
      'https://images.unsplash.com/photo-1472214103451-9374b1e1c3e0?auto=format&fit=crop&w=1920&q=80', // Forest
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Beach
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80', // Mountains
      'https://images.unsplash.com/photo-1518495973542-4542c06c022e?auto=format&fit=crop&w=1920&q=80', // Waterfall
      'https://images.unsplash.com/photo-1508736375693-5de998d259e2?auto=format&fit=crop&w=1920&q=80', // Desert
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1920&q=80', // Sunset
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1920&q=80', // River
      'https://images.unsplash.com/photo-1517816428104-380fd98623e6?auto=format&fit=crop&w=1920&q=80', // Rainforest
      'https://images.unsplash.com/photo-1511497580565-0a7f8c5e88a6?auto=format&fit=crop&w=1920&q=80', // Snowy landscape
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80', // Lake
      'https://images.unsplash.com/photo-1501854140801-50d01698902b?auto=format&fit=crop&w=1920&q=80', // Meadow
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80', // Mountain sunrise
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Coastal cliffs
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Autumn forest
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Savanna
    ],
    cricket: [
      'https://images.unsplash.com/photo-1607944023915-4363d58d7c87?auto=format&fit=crop&w=1920&q=80', // Cricket stadium
      'https://images.unsplash.com/photo-1593341646782-e0b495c41ed8?auto=format&fit=crop&w=1920&q=80', // Cricket match
      'https://images.unsplash.com/photo-1621238742910-9f2a2c37f0f2?auto=format&fit=crop&w=1920&q=80', // Cricket bat and ball
      'https://images.unsplash.com/photo-1593341646782-e0b495c41ed8?auto=format&fit=crop&w=1920&q=80', // Bowler in action
      'https://images.unsplash.com/photo-1607944023915-4363d58d7c87?auto=format&fit=crop&w=1920&q=80', // Stadium crowd
      'https://images.unsplash.com/photo-1621238742910-9f2a2c37f0f2?auto=format&fit=crop&w=1920&q=80', // Cricket field
      'https://images.unsplash.com/photo-1593341646782-e0b495c41ed8?auto=format&fit=crop&w=1920&q=80', // Batsman hitting
      'https://images.unsplash.com/photo-1607944023915-4363d58d7c87?auto=format&fit=crop&w=1920&q=80', // Cricket celebration
      'https://images.unsplash.com/photo-1621238742910-9f2a2c37f0f2?auto=format&fit=crop&w=1920&q=80', // Wicketkeeper
      'https://images.unsplash.com/photo-1593341646782-e0b495c41ed8?auto=format&fit=crop&w=1920&q=80', // Fielding
      'https://images.unsplash.com/photo-1621238742910-9f2a2c37f0f2?auto=format&fit=crop&w=1920&q=80', // Umpire signaling
      'https://images.unsplash.com/photo-1593341646782-e0b495c41ed8?auto=format&fit=crop&w=1920&q=80', // Cricket practice
      'https://images.unsplash.com/photo-1607944023915-4363d58d7c87?auto=format&fit=crop&w=1920&q=80', // Night match
      'https://images.unsplash.com/photo-1621238742910-9f2a2c37f0f2?auto=format&fit=crop&w=1920&q=80', // Boundary catch
      'https://images.unsplash.com/photo-1593341646782-e0b495c41ed8?auto=format&fit=crop&w=1920&q=80', // Team huddle
    ],
    ocean: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Beach
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Ocean waves
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1920&q=80', // Sunset over ocean
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Coral reef
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Deep sea
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Ocean horizon
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Tropical beach
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Underwater scene
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Stormy sea
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Coastal cliffs
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Ocean sunset
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Whale in ocean
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Seagulls over sea
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Rocky shore
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Ocean cave
    ],
    city: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Skyline
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Night city lights
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Downtown traffic
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Skyscrapers
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // City park
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Urban street
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // City sunset
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Bridge at night
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Cityscape
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Rooftop view
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // City skyline at dusk
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Busy intersection
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Subway station
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // City lights reflection
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Urban alley
    ],
  };

  // State for shuffled photos and current photo index
  const [shuffledPhotos, setShuffledPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Get photos for the current theme, fallback to default if theme not found
  const photos = themePhotos[currentTheme] || themePhotos.default;

  // Shuffle photos whenever the theme changes
  useEffect(() => {
    const newShuffledPhotos = shuffleArray(photos);
    setShuffledPhotos(newShuffledPhotos);
    setCurrentPhotoIndex(0); // Reset to first photo when theme changes
  }, [currentTheme]);

  // Cycle through photos every 3 seconds
  useEffect(() => {
    if (shuffledPhotos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % shuffledPhotos.length;
        // If we've reached the end, reshuffle the photos
        if (nextIndex === 0) {
          const newShuffledPhotos = shuffleArray(photos);
          setShuffledPhotos(newShuffledPhotos);
        }
        return nextIndex;
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [shuffledPhotos]);

  const subject = new URLSearchParams(location.search).get('subject') || '';
  const welcomeMessage = subject
    ? `Hi! Ready to explore ${subject}? Ask me anything! 🎓`
    : "Welcome! I'm your professional learning assistant. Ask about any topic, and I'll provide clear, accurate answers. 🎓";

  const saveSessionsToLocalStorage = debounce((sessions: ChatSession[]) => {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }, 500);

  useEffect(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 0,
          text: welcomeMessage,
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSessions((prev) => {
      const updated = [...prev, newSession];
      saveSessionsToLocalStorage(updated);
      return updated;
    });
    setCurrentSessionId(newSession.id);
    setInput(draftInputs[newSession.id] || '');
    setLastSpokenMessageId(null);
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [isDarkMode]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId]);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Voice recognition failed: ${event.error}. Please check your microphone and try again.`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const currentSession = sessions.find((s) => s.id === currentSessionId);
    if (
      isSpeaking &&
      currentSession?.messages.length > 0 &&
      !currentSession.messages[currentSession.messages.length - 1].isUser &&
      !isLoading
    ) {
      const latestMessage = currentSession.messages[currentSession.messages.length - 1];
      if (latestMessage.id !== lastSpokenMessageId) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(latestMessage.text);
        utterance.lang = 'en-US';
        utterance.volume = 1;
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => {
          setLastSpokenMessageId(latestMessage.id);
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [sessions, currentSessionId, isSpeaking, isLoading, lastSpokenMessageId]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowTyping(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowTyping(false);
    }
  }, [isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showAccount &&
        accountRef.current &&
        !accountRef.current.contains(event.target as Node) &&
        accountButtonRef.current &&
        !accountButtonRef.current.contains(event.target as Node)
      ) {
        setShowAccount(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && inputRef.current) {
        e.preventDefault();
        handleSend();
      }
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleListening();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setShowSettings((prev) => !prev);
      }
      if (showSettings && historyListRef.current && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const sessionIds = sessions.map((s) => s.id);
        const currentIndex = sessionIds.indexOf(currentSessionId);
        let newIndex = currentIndex;
        if (e.key === "ArrowUp") {
          newIndex = currentIndex > 0 ? currentIndex - 1 : sessionIds.length - 1;
        } else {
          newIndex = currentIndex < sessionIds.length - 1 ? currentIndex + 1 : 0;
        }
        setCurrentSessionId(sessionIds[newIndex]);
        const activeButton = historyListRef.current.querySelector(
          `[data-session-id="${sessionIds[newIndex]}"]`
        ) as HTMLButtonElement;
        activeButton?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSettings, currentSessionId, sessions]);

  useEffect(() => {
    const currentSession = sessions.find((s) => s.id === currentSessionId);
    if (
      currentSession?.messages.some((m) => m.isUser) &&
      currentSession.name === "New Chat"
    ) {
      const firstUserMessage =
        currentSession.messages.find((m) => m.isUser)?.text.slice(0, 30) ||
        "Chat";
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === currentSessionId ? { ...s, name: firstUserMessage } : s
        );
        saveSessionsToLocalStorage(updated);
        return updated;
      });
    }
  }, [sessions, currentSessionId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!GEMINI_API_KEY) {
      setError("Gemini API key is missing. Please configure it at https://x.ai/grok.");
      return;
    }

    const userMessage: Message = {
      id: sessions.find((s) => s.id === currentSessionId)!.messages.length,
      text: input,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    try {
      setSessions((prev) => {
        const updated = prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, userMessage] }
            : session
        );
        saveSessionsToLocalStorage(updated);
        return updated;
      });
      setDraftInputs((prev) => ({ ...prev, [currentSessionId]: "" }));
      setInput("");
      inputRef.current?.focus();
      setIsLoading(true);
      if (isSpeaking) {
        playSound("/sounds/send.wav");
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional, friendly chatbot for students in classes 5-10. Provide accurate, concise, and engaging responses. Use a warm, encouraging tone. If the question is unclear, ask for clarification politely. ${
                    subject ? `Focus on ${subject} if relevant.` : ""
                  } After answering, suggest 2-3 short follow-up questions related to the topic. User's message: ${input}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Gemini API request failed: ${response.statusText}. Please check your internet connection.`
        );
      }

      const data = await response.json();
      const botReply =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "Sorry, I didn't understand. Could you clarify?";
      const suggestions = extractSuggestions(botReply);

      const botMessage: Message = {
        id: sessions.find((s) => s.id === currentSessionId)!.messages.length + 1,
        text: botReply.replace(/Follow-up questions:.*$/s, "").trim(),
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions,
      };
      setSessions((prev) => {
        const updated = prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, botMessage] }
            : session
        );
        saveSessionsToLocalStorage(updated);
        return updated;
      });
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again later.");
      const errorMessage: Message = {
        id: sessions.find((s) => s.id === currentSessionId)!.messages.length + 1,
        text: "Sorry, I encountered an issue. Please try again! 😔",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setSessions((prev) => {
        const updated = prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        );
        saveSessionsToLocalStorage(updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractSuggestions = (text: string): string[] => {
    const match = text.match(/Follow-up questions:(.*)$/s);
    if (match) {
      return match[1]
        .split("\n")
        .map((q) => q.replace(/^\d+\.\s*/, "").trim())
        .filter((q) => q);
    }
    return [];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not available in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
      if (isSpeaking) {
        playSound("/sounds/click.wav");
      }
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking((prev) => {
      if (prev && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (!prev && isSpeaking) {
        playSound("/sounds/click.wav");
      }
      return !prev;
    });
  };

  const deleteAllChats = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: "New Chat",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 0,
          text: welcomeMessage,
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSessions((prev) => {
      const updated = [newSession];
      saveSessionsToLocalStorage(updated);
      return updated;
    });
    setCurrentSessionId(newSession.id);
    setInput("");
    setDraftInputs({});
    setError(null);
    setLastSpokenMessageId(null);
    setShowDeleteAllConfirm(false);
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const startNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: "New Chat",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 0,
          text: welcomeMessage,
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSessions((prev) => {
      const updated = [...prev, newSession];
      saveSessionsToLocalStorage(updated);
      return updated;
    });
    setCurrentSessionId(newSession.id);
    setInput(draftInputs[newSession.id] || "");
    setShowSettings(false);
    setLastSpokenMessageId(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      setError("Please upload a .txt file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInput((prev) => (prev ? `${prev}\n${text}` : text));
      setToast("File uploaded successfully!");
      setTimeout(() => setToast(null), 3000);
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);

    event.target.value = "";
  };

  const handleSessionSwitch = (sessionId: string) => {
    setDraftInputs((prev) => ({ ...prev, [currentSessionId]: input }));
    setCurrentSessionId(sessionId);
    setInput(draftInputs[sessionId] || "");
    setShowSettings(false);
    inputRef.current?.focus();
  };

  const handleMouseEnter = () => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setShowSettings(true);
    }, 200);
  };

  const handleMouseLeaveHover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleTap = () => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setShowSettings((prev) => !prev);
    }
  };

  const quickReplies = subject
    ? [
        `Tell me about ${subject}`,
        `Explain a ${subject} concept`,
        `Give me a ${subject} quiz`,
      ]
    : ["Explain a math concept", "Tell me about science", "Give me a history fact"];

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="botai-container w-screen h-screen flex flex-col transition-colors duration-300 overflow-hidden font-sans relative">
      {/* Background Photos with Crossfade, Reduced Blur, and Dark Overlay */}
      <div className="absolute inset-0">
        {shuffledPhotos.map((photo, index) => (
          <motion.img
            key={photo + index} // Ensure unique key even if photos repeat in shuffle
            src={photo}
            alt={`Background image ${index + 1} for ${currentTheme} theme`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(3px)" }} // Reduced blur effect
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentPhotoIndex ? 1 : 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Darker Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/70 dark:bg-black/80 transition-opacity duration-300" />

      {/* Pattern Decorations */}
      {theme.patterns.map((pattern, index) => (
        <motion.div
          key={index}
          className="absolute w-32 h-32 opacity-20 rounded-full"
          style={{
            backgroundImage: `url(${pattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            top: index === 0 ? "10%" : "70%",
            left: index === 0 ? "5%" : "auto",
            right: index === 1 ? "5%" : "auto",
          }}
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Hover Strip for Settings */}
      <div
        className="fixed top-0 left-0 w-2 h-screen bg-blue-200/30 dark:bg-blue-800/30 hover:bg-blue-300/50 dark:hover:bg-blue-700/50 transition-colors duration-200 z-30"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeaveHover}
        onClick={handleTap}
        role="button"
        tabIndex={0}
        aria-label="Toggle settings panel (Ctrl + S)"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowSettings(true);
          }
        }}
      />

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md shadow-blue-200/30 dark:shadow-blue-900/30 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20 w-full transition-colors duration-300">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-900 dark:text-gray-100 rounded-full hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-500 dark:hover:to-gray-600 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative group"
          aria-label="Go back to previous page"
        >
          <ArrowLeft size={24} />
          <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
            Back
          </span>
        </motion.button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            LearnSmart AI
          </h1>
          <span
            className={`text-sm font-medium ${theme.accent} bg-white/50 dark:bg-gray-700/50 rounded-full px-3 py-1`}
          >
            Theme: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startNewSession}
            className={`p-2 bg-gradient-to-r ${theme.primary} text-white rounded-full hover:opacity-90 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 relative group`}
            style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
            aria-label="Start a new chat session"
          >
            <MessageSquare size={24} />
            <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
              New Chat
            </span>
          </motion.button>
          <motion.button
            ref={accountButtonRef}
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAccount((prev) => !prev)}
            className={`p-2 bg-gradient-to-r ${theme.primary} text-white rounded-full hover:opacity-90 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 relative group`}
            style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
            aria-label="Toggle account panel"
          >
            <User size={24} />
            <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
              Account
            </span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 sm:px-6 py-2 bg-red-100 dark:bg-red-900/80 text-red-800 dark:text-red-200 text-sm w-full shadow-inner transition-colors duration-300"
            role="alert"
          >
            {error}
          </motion.div>
        )}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 sm:px-6 py-2 bg-green-100 dark:bg-green-900/80 text-green-800 dark:text-green-200 text-sm w-full shadow-inner transition-colors duration-300 absolute top-0 z-10"
            role="status"
          >
            {toast}
          </motion.div>
        )}

        {/* Chat Area */}
        <div
          className="flex-1 w-full overflow-y-auto px-4 sm:px-6 py-6 transition-colors duration-300 scrollbar-hidden relative"
          aria-live="polite"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          data-no-scrollbar
        >
          <AnimatePresence>
            {currentSession?.messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                } mb-4 items-start gap-3 max-w-full`}
              >
                {!message.isUser && (
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0`}
                  >
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl ${
                    message.isUser
                      ? `bg-gradient-to-r ${theme.primary} text-white`
                      : "bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
                  } shadow-lg transition-colors duration-300`}
                >
                  <p className="text-base leading-relaxed">{message.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 opacity-80">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setInput(suggestion);
                            inputRef.current?.focus();
                          }}
                          className="px-3 py-1 bg-gray-100/80 dark:bg-gray-600/80 text-gray-900 dark:text-gray-100 rounded-full text-xs font-medium hover:bg-gray-200/80 dark:hover:bg-gray-500/80 transition-all"
                          aria-label={`Suggest: ${suggestion}`}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
                {message.isUser && (
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0`}
                  >
                    U
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {showTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4 items-start gap-3"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
              >
                AI
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 p-4 rounded-2xl shadow-lg transition-colors duration-300">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bot is typing...
                </p>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="flex gap-3 px-4 sm:px-6 pb-4 overflow-x-auto w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm snap-x snap-mandatory transition-colors duration-300">
          {quickReplies.map((reply, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInput(reply);
                inputRef.current?.focus();
              }}
              className={`px-4 py-2 bg-gradient-to-r ${theme.primary} text-white rounded-full text-sm font-medium hover:opacity-90 shadow-md snap-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2`}
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
              aria-label={`Quick reply: ${reply}`}
            >
              {reply}
            </motion.button>
          ))}
        </div>

        {/* Input and Controls */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg shadow-blue-200/30 dark:shadow-blue-900/30 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 w-full transition-colors duration-300 relative">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                subject ? `Ask about ${subject} or anything else!` : "Ask me anything!"
              }
              className={`relative w-full p-2 border-2 ${theme.accent} rounded-full focus:outline-none focus:ring-2 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-gray-100 text-sm resize-none transition-all duration-300 placeholder:animate-pulse max-h-16 min-h-8 z-10`}
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
              rows={1}
              aria-label="Chat input"
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={isLoading}
              className={`p-2 bg-gradient-to-r ${theme.primary} text-white rounded-full hover:opacity-90 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 relative group ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
              aria-label="Send message (Ctrl + Enter)"
            >
              <Send size={20} />
              <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                Send (Ctrl + Enter)
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 bg-gradient-to-r ${theme.primary} text-white rounded-full hover:opacity-90 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 relative group`}
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
              aria-label="Upload text file"
            >
              <Paperclip size={20} />
              <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                Upload .txt
              </span>
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
              aria-hidden="true"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`p-2 rounded-full ${
                isListening
                  ? `bg-gradient-to-r from-red-500 to-red-600 text-white`
                  : `bg-gradient-to-r ${theme.primary} text-white`
              } hover:opacity-90 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 relative group`}
              style={{
                "--tw-ring-color": isListening ? "rgb(239, 68, 68)" : theme.accent,
              } as React.CSSProperties}
              aria-label={
                isListening
                  ? "Stop listening (Ctrl + M)"
                  : "Start listening (Ctrl + M)"
              }
              disabled={!SpeechRecognition}
            >
              <Mic size={20} />
              <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                {isListening ? "Stop Voice (Ctrl + M)" : "Voice Input (Ctrl + M)"}
              </span>
              {isListening && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  Listening…
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSpeaking}
              className={`p-2 rounded-full ${
                isSpeaking
                  ? `bg-gradient-to-r ${theme.primary} text-white`
                  : `bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-900 dark:text-gray-100`
              } hover:opacity-90 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 relative group`}
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
              aria-label={
                isSpeaking ? "Disable voice (Ctrl + S)" : "Enable voice (Ctrl + S)"
              }
            >
              {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                {isSpeaking
                  ? "Disable Voice (Ctrl + S)"
                  : "Enable Voice (Ctrl + S)"}
              </span>
            </motion.button>
          </div>
          {/* Onboarding Tooltip */}
          <AnimatePresence>
            {showOnboarding && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 left-4 sm:left-6 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-xl p-4 shadow-lg max-w-xs z-10"
                role="alert"
              >
                <p>
                  Welcome to LearnSmart AI! Try typing a question or use the mic to ask
                  about {subject || "any topic"}!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowOnboarding(false);
                    localStorage.setItem("onboardingDismissed", "true");
                  }}
                  className={`mt-2 px-3 py-1 bg-gradient-to-r ${theme.primary} text-white rounded-full text-xs hover:opacity-90 transition-all`}
                  aria-label="Dismiss onboarding"
                >
                  Got it!
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Menu */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              ref={settingsRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-screen w-full sm:w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-6 z-30 overflow-y-auto transition-colors duration-300 scrollbar-hidden"
              onMouseLeave={() => setShowSettings(false)}
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              data-no-scrollbar
              aria-expanded={showSettings}
              role="dialog"
              aria-label="Settings panel"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Settings
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Close settings panel"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* New Chat Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startNewSession}
                className={`w-full p-3 mb-6 bg-gradient-to-r ${theme.primary} text-white rounded-xl hover:opacity-90 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2`}
                style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
                aria-label="Start a new chat session"
              >
                <span className="text-sm font-medium flex items-center justify-center gap-2">
                  <MessageSquare size={20} />
                  New Chat
                </span>
              </motion.button>

              {/* Theme Section */}
              <div className="mb-6">
                <button
                  onClick={() => setShowThemeSection((prev) => !prev)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3"
                  aria-expanded={showThemeSection}
                  aria-controls="theme-section"
                >
                  Theme
                  {showThemeSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {showThemeSection && (
                    <motion.div
                      id="theme-section"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsDarkMode((prev) => !prev)}
                        className={`flex items-center justify-between w-full p-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
                        aria-label={
                          isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                        }
                        aria-checked={isDarkMode}
                        role="switch"
                      >
                        <span className="text-sm font-medium">
                          {isDarkMode ? "Light Mode" : "Dark Mode"}
                        </span>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat History */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => setShowHistorySection((prev) => !prev)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-200"
                    aria-expanded={showHistorySection}
                    aria-controls="history-section"
                  >
                    Chat History (↑↓ to navigate)
                    {showHistorySection ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startNewSession}
                    className={`text-sm ${theme.accent} hover:underline focus:outline-none`}
                    aria-label="Start a new chat session"
                  >
                    New Chat
                  </motion.button>
                </div>
                <AnimatePresence>
                  {showHistorySection && (
                    <motion.div
                      id="history-section"
                      ref={historyListRef}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {sessions.map((session) => (
                        <motion.button
                          key={session.id}
                          data-session-id={session.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSessionSwitch(session.id)}
                          className={`w-full text-left p-4 rounded-xl text-sm ${
                            session.id === currentSessionId
                              ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg`
                              : "bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
                          } shadow-md backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2`}
                          style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
                          aria-label={`Switch to chat session: ${session.name}`}
                        >
                          <p className="font-semibold truncate">{session.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {session.messages[0]?.text.slice(0, 30) || "No messages"}
                            ...
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Delete All Chats */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteAllConfirm(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Delete all chat sessions"
              >
                Delete All Chats
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Account Dropdown */}
        <AnimatePresence>
          {showAccount && (
            <motion.div
              ref={accountRef}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-16 right-4 sm:right-6 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-6 z-30 transition-colors duration-300"
              role="dialog"
              aria-label="Account panel"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Account
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white text-lg font-bold shadow-lg`}
                >
                  JD
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    John Doe
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    john@example.com
                  </p>
                </div>
              </div>
              <hr className="border-gray-200 dark:border-gray-700 my-4" />
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Upgrade Plan
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Unlock higher usage quotas with SuperGrok subscription.
                </p>
                <a
                  href="https://x.ai/grok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block px-4 py-2 bg-gradient-to-r ${theme.primary} text-white rounded-xl hover:opacity-90 shadow-md transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
                  aria-label="Learn more about SuperGrok subscription"
                >
                  Learn More
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete All Chats Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteAllConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40"
              role="dialog"
              aria-label="Delete all chats confirmation"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Delete All Chats?
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  This will remove all chat sessions. This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteAllConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-gray-100 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    aria-label="Cancel delete all chats"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={deleteAllChats}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Confirm delete all chats"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};