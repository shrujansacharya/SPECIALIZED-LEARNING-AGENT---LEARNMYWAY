// Shared types for study components

export interface StudyTool {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  color: string;
}

export interface BaseComponentProps {
  onClose: () => void;
  isMobile?: boolean;
  isFullscreen?: boolean;
}

// Calculator types
export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  memory: number;
  history: string[];
}

// Study Timer types
export interface TimerSession {
  id: string;
  type: 'pomodoro' | 'short-break' | 'long-break' | 'custom';
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // after how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

// Whiteboard types
export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter' | 'eraser';
  timestamp: Date;
}

export interface WhiteboardState {
  paths: DrawingPath[];
  currentTool: 'pen' | 'highlighter' | 'eraser' | 'select';
  currentColor: string;
  currentWidth: number;
  isDrawing: boolean;
  selectedPath: string | null;
}

// Smart Notes types
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  aiSuggestions?: string[];
  summary?: string;
  keyPoints?: string[];
}

export interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  searchQuery: string;
  selectedTags: string[];
  isAiProcessing: boolean;
}

// Flashcards types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
  createdAt: Date;
}

export interface FlashcardSet {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  setId: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  totalAnswers: number;
}

// Quiz types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  createdAt: Date;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  startTime: Date;
  endTime?: Date;
  answers: { questionId: string; selectedAnswer: string }[];
  score: number;
  completed: boolean;
}

// AI Summarizer types
export interface SummaryRequest {
  id: string;
  content: string;
  type: 'bullet' | 'paragraph' | 'mindmap' | 'outline';
  length: 'short' | 'medium' | 'long';
  focus?: string;
}

export interface Summary {
  id: string;
  originalContent: string;
  summary: string;
  type: 'bullet' | 'paragraph' | 'mindmap' | 'outline';
  keyPoints: string[];
  createdAt: Date;
  wordCount: number;
  compressionRatio: number;
}

// Smart Recorder types
export interface RecordingSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  audioBlob?: Blob;
  videoBlob?: Blob;
  transcription?: string;
  summary?: string;
  keyTopics?: string[];
  participants?: string[];
}

export interface RecordingSettings {
  includeAudio: boolean;
  includeVideo: boolean;
  includeScreen: boolean;
  quality: 'low' | 'medium' | 'high';
  autoTranscribe: boolean;
  autoSummarize: boolean;
  speakerDetection: boolean;
}

// Common UI types
export interface ModalProps extends BaseComponentProps {
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  disabled?: boolean;
  error?: string;
  className?: string;
}

