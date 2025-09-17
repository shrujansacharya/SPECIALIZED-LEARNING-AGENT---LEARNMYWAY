import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play, Bot, ShoppingCart, PenTool, Save, Download, Share2, AlertCircle, HardDrive, History, Trophy, Flame, Users, ArrowLeft, Video, MessageCircle, MapPin, Package, CreditCard, Navigation, Star, Plus, Minus, ExternalLink } from 'lucide-react';
import { auth } from '../lib/firebase';

import * as monaco from 'monaco-editor';
import JSZip from 'jszip';
import { useNavigate, useLocation } from 'react-router-dom';

// Import services
import { getMapsService, Store, UserLocation } from './maps-service';
import { getProductsService, Product, CartItem } from './products-service';
import { getProjectImage } from '../lib/image-service';
import { GeminiService } from '../lib/gemini-service';
import { getGoogleProductSearchService, ProductSearchResult } from './google-product-search-service';

// Google API Keys (you'll need to set these in your environment variables)
const GOOGLE_CUSTOM_SEARCH_API_KEY = import.meta.env.VITE_GOOGLE_CUSTOM_SEARCH_API_KEY || 'AIzaSyB9UsFVYRNW-KDhDc3e77DXfJuRy-x1C-M';
const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';


// Import animations
import { animations, variants } from './animations';

// Define TypeScript interfaces
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  content: any;
  updated_at: string;
}

interface Version {
  id: string;
  project_id: string;
  content: any;
  created_at: string;
  version_number: number;
}

interface Badge {
  id: string;
  name: string;
  skill: string;
  earned_at: string;
}

interface Collaborator {
  id: string;
  email: string;
}

interface Tutorial {
  id: number;
  step: string;
  completed: boolean;
}

export interface ProjectTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  skills: string[];
  progress: number;
  content: {
    type: string;
    features: string[];
    code?: string;
    tutorials: Tutorial[];
    components?: string[];
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// YouTube API interfaces
interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

// YouTube API service
class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchVideos(query: string, maxResults: number = 12): Promise<YouTubeVideo[]> {
    try {
      const searchQuery = encodeURIComponent(`${query} tutorial how to build`);
      const url = `${this.baseUrl}/search?part=snippet&type=video&q=${searchQuery}&maxResults=${maxResults}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data: YouTubeSearchResponse = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return [];
    }
  }

  getVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}

// Expanded project templates with more projects added
export const projectTemplates: ProjectTemplate[] = [
  // Software Projects (original 10 + 5 new)
  {
    id: 'software-1',
    type: 'software',
    title: 'To-Do List App',
    description: 'A simple app to manage tasks with add, edit, and delete functionality.',
    image: getProjectImage('To-Do List App'),
    category: 'Web',
    difficulty: 'Beginner',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Task creation', 'Task completion', 'Local storage'],
      code: '// Sample React component\nfunction TodoList() {\n  const [todos, setTodos] = useState([]);\n  // Add todo logic\n}',
      tutorials: [
        { id: 1, step: 'Set up React project', completed: false },
        { id: 2, step: 'Create Todo component', completed: false },
        { id: 3, step: 'Add local storage', completed: false },
      ],
    },
  },
  {
    id: 'software-2',
    type: 'software',
    title: 'Weather App',
    description: 'A weather forecasting app using a public API.',
    image: getProjectImage('Weather App'),
    category: 'Web',
    difficulty: 'Intermediate',
    skills: ['HTML', 'CSS', 'JavaScript', 'API'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Current weather', '5-day forecast', 'Location search'],
      code: '// Sample API fetch\nasync function getWeather(city) {\n  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}`);\n  return response.json();\n}',
      tutorials: [
        { id: 1, step: 'Create UI layout', completed: false },
        { id: 2, step: 'Integrate weather API', completed: false },
        { id: 3, step: 'Display forecast', completed: false },
      ],
    },
  },
  {
    id: 'software-3',
    type: 'software',
    title: 'Number Guessing Game',
    description: 'A game where users guess a random number between 1 and 100.',
    image: getProjectImage('Number Guessing Game'),
    category: 'Web',
    difficulty: 'Beginner',
    skills: ['HTML', 'CSS', 'JavaScript'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Random number generation', 'User input', 'Feedback messages'],
      code: '// Sample JavaScript game\nlet number = Math.floor(Math.random() * 100) + 1;\nfunction guessNumber(userGuess) {\n  if (userGuess == number) return "Correct!";\n  return userGuess < number ? "Too low!" : "Too high!";\n}',
      tutorials: [
        { id: 1, step: 'Create game interface', completed: false },
        { id: 2, step: 'Add guessing logic', completed: false },
        { id: 3, step: 'Display feedback', completed: false },
      ],
    },
  },
  {
    id: 'software-4',
    type: 'software',
    title: 'Chat Application',
    description: 'A real-time chat app with multiple users.',
    image: getProjectImage('Chat Application'),
    category: 'Web',
    difficulty: 'Advanced',
    skills: ['React', 'Node.js', 'WebSocket', 'CSS'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Real-time messaging', 'User authentication', 'Chat rooms'],
      code: '// Sample WebSocket setup\nconst socket = new WebSocket("ws://your-server.com");\nsocket.onmessage = (event) => {\n  console.log("Message:", event.data);\n};',
      tutorials: [
        { id: 1, step: 'Set up backend server', completed: false },
        { id: 2, step: 'Implement WebSocket', completed: false },
        { id: 3, step: 'Create chat UI', completed: false },
      ],
    },
  },
  {
    id: 'software-5',
    type: 'software',
    title: 'Photo Gallery',
    description: 'A responsive photo gallery with upload functionality.',
    image: getProjectImage('Photo Gallery'),
    category: 'Web',
    difficulty: 'Intermediate',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Image upload', 'Grid layout', 'Lightbox view'],
      code: '// Sample React component\nfunction Gallery() {\n  const [images, setImages] = useState([]);\n  // Image upload logic\n}',
      tutorials: [
        { id: 1, step: 'Create gallery layout', completed: false },
        { id: 2, step: 'Add upload functionality', completed: false },
        { id: 3, step: 'Implement lightbox', completed: false },
      ],
    },
  },
  {
    id: 'software-6',
    type: 'software',
    title: 'E-commerce Store',
    description: 'A basic online store with product listings and cart.',
    image: getProjectImage('E-commerce Store'),
    category: 'Web',
    difficulty: 'Advanced',
    skills: ['React', 'Node.js', 'MongoDB', 'CSS'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Product catalog', 'Shopping cart', 'Checkout'],
      code: '// Sample product fetch\nasync function getProducts() {\n  const response = await fetch("/api/products");\n  return response.json();\n}',
      tutorials: [
        { id: 1, step: 'Set up database', completed: false },
        { id: 2, step: 'Create product listing', completed: false },
        { id: 3, step: 'Implement cart', completed: false },
      ],
    },
  },
  {
    id: 'software-7',
    type: 'software',
    title: 'Blog Platform',
    description: 'A blogging platform with post creation and comments.',
    image: getProjectImage('Blog Platform'),
    category: 'Web',
    difficulty: 'Intermediate',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Post creation', 'Comment system', 'User profiles'],
      code: '// Sample post component\nfunction Post({ title, content }) {\n  return <div>{title}</div>;\n}',
      tutorials: [
        { id: 1, step: 'Create blog layout', completed: false },
        { id: 2, step: 'Add post functionality', completed: false },
        { id: 3, step: 'Implement comments', completed: false },
      ],
    },
  },
  {
    id: 'software-8',
    type: 'software',
    title: 'Task Scheduler',
    description: 'A calendar-based task scheduling application.',
    image: getProjectImage('Task Scheduler'),
    category: 'Web',
    difficulty: 'Intermediate',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Calendar view', 'Task assignment', 'Reminders'],
      code: '// Sample calendar component\nfunction Calendar() {\n  const [date, setDate] = useState(new Date());\n  // Calendar logic\n}',
      tutorials: [
        { id: 1, step: 'Create calendar UI', completed: false },
        { id: 2, step: 'Add task functionality', completed: false },
        { id: 3, step: 'Implement reminders', completed: false },
      ],
    },
  },
  {
    id: 'software-9',
    type: 'software',
    title: 'Music Player',
    description: 'A web-based music player with playlist support.',
    image: getProjectImage('Music Player'),
    category: 'Web',
    difficulty: 'Intermediate',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Play/pause controls', 'Playlist management', 'Progress bar'],
      code: '// Sample audio component\nfunction AudioPlayer() {\n  const audioRef = useRef(null);\n  // Audio controls\n}',
      tutorials: [
        { id: 1, step: 'Create player UI', completed: false },
        { id: 2, step: 'Add audio controls', completed: false },
        { id: 3, step: 'Implement playlist', completed: false },
      ],
    },
  },
  {
    id: 'software-10',
    type: 'software',
    title: 'Note Taking App',
    description: 'A digital note-taking app with rich text editing.',
    image: getProjectImage('Note Taking App'),
    category: 'Web',
    difficulty: 'Intermediate',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Rich text editor', 'Note categories', 'Search functionality'],
      code: '// Sample note component\nfunction NoteEditor() {\n  const [content, setContent] = useState("");\n  // Editor logic\n}',
      tutorials: [
        { id: 1, step: 'Create editor UI', completed: false },
        { id: 2, step: 'Add rich text features', completed: false },
        { id: 3, step: 'Implement search', completed: false },
      ],
    },
  },
  // New Software Projects
  {
    id: 'software-11',
    type: 'software',
    title: 'Portfolio Website',
    description: 'A personal portfolio site to showcase projects and skills.',
    image: getProjectImage('Portfolio Website'),
    category: 'Web',
    difficulty: 'Beginner',
    skills: ['HTML', 'CSS', 'JavaScript'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Responsive design', 'Project showcase', 'Contact form'],
      code: '// Sample JS for contact form\n function submitForm() { console.log("Form submitted"); }',
      tutorials: [
        { id: 1, step: 'Set up HTML structure', completed: false },
        { id: 2, step: 'Add CSS styling', completed: false },
        { id: 3, step: 'Implement interactivity', completed: false },
      ],
    },
  },
  {
    id: 'software-12',
    type: 'software',
    title: 'Calculator App',
    description: 'A basic calculator for arithmetic operations.',
    image: getProjectImage('Calculator App'),
    category: 'Web',
    difficulty: 'Beginner',
    skills: ['HTML', 'CSS', 'JavaScript'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Basic operations', 'Display screen', 'Button inputs'],
      code: '// Sample calculator logic\nfunction calculate(op, a, b) {\n  switch(op) { case "+": return a + b; /* etc */ }\n}',
      tutorials: [
        { id: 1, step: 'Create UI buttons', completed: false },
        { id: 2, step: 'Add calculation logic', completed: false },
        { id: 3, step: 'Handle errors', completed: false },
      ],
    },
  },
  {
    id: 'software-13',
    type: 'software',
    title: 'Quiz Game',
    description: 'An interactive quiz application with scoring.',
    image: getProjectImage('Quiz Game'),
    category: 'Web',
    difficulty: 'Intermediate',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Multiple questions', 'Scoring system', 'Timer'],
      code: '// Sample quiz state\n const [score, setScore] = useState(0);',
      tutorials: [
        { id: 1, step: 'Set up questions', completed: false },
        { id: 2, step: 'Add scoring', completed: false },
        { id: 3, step: 'Implement timer', completed: false },
      ],
    },
  },
  {
    id: 'software-14',
    type: 'software',
    title: 'Social Media Clone',
    description: 'A simplified version of a social media platform.',
    image: getProjectImage('Social Media Clone'),
    category: 'Web',
    difficulty: 'Advanced',
    skills: ['React', 'Node.js', 'MongoDB'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Posting', 'Liking', 'Commenting'],
      code: '// Sample post API\n async function createPost(post) { /* fetch */ }',
      tutorials: [
        { id: 1, step: 'Set up backend', completed: false },
        { id: 2, step: 'Create frontend', completed: false },
        { id: 3, step: 'Integrate features', completed: false },
      ],
    },
  },
  {
    id: 'software-15',
    type: 'software',
    title: 'Blog CMS',
    description: 'A content management system for blogs.',
    image: getProjectImage('Blog CMS'),
    category: 'Web',
    difficulty: 'Advanced',
    skills: ['React', 'Node.js', 'SQL'],
    progress: 0,
    content: {
      type: 'web',
      features: ['Post editing', 'User management', 'SEO tools'],
      code: '// Sample CMS logic\n function editPost(id, content) { /* update */ }',
      tutorials: [
        { id: 1, step: 'Database setup', completed: false },
        { id: 2, step: 'Admin panel', completed: false },
        { id: 3, step: 'Frontend integration', completed: false },
      ],
    },
  },
  // Science Projects (original 10 + 5 new, fixed image URLs)
  {
    id: 'science-1',
    type: 'science',
    title: 'Solar System Model',
    description: 'Create a static model of the solar system to understand planetary orbits and relative sizes.',
    image: getProjectImage('Solar System Model'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Astronomy', 'Crafting', 'Measurement'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Planetary arrangement', 'Orbit paths', 'Relative scale'],
      tutorials: [
        { id: 1, step: 'Gather materials and paint styrofoam balls', completed: false },
        { id: 2, step: 'Arrange planets on a base with orbit paths', completed: false },
        { id: 3, step: 'Label planets and add details', completed: false },
      ],
      components: ['Styrofoam balls (various sizes)', 'Wooden dowels', 'Cardboard base', 'Acrylic paint', 'Glue', 'Markers'],
    },
  },
  {
    id: 'science-2',
    type: 'science',
    title: 'Volcano Model',
    description: 'Build a static model of a volcano to learn about its structure and geological features.',
    image: getProjectImage('Volcano Model'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Geology', 'Crafting', 'Modeling'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Crater structure', 'Layered rock formation', 'Labeling parts'],
      tutorials: [
        { id: 1, step: 'Create a base and mold the volcano shape', completed: false },
        { id: 2, step: 'Paint and add texture to the model', completed: false },
        { id: 3, step: 'Label volcano parts (crater, magma chamber)', completed: false },
      ],
      components: ['Clay or papier-mâché', 'Cardboard base', 'Acrylic paint', 'Small container (for crater)', 'Glue', 'Labels'],
    },
  },
  {
    id: 'science-3',
    type: 'science',
    title: 'Water Cycle Model',
    description: 'Construct a static model to illustrate the stages of the water cycle.',
    image: getProjectImage('Water Cycle Model'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Environmental Science', 'Crafting', 'Diagramming'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Evaporation', 'Condensation', 'Precipitation'],
      tutorials: [
        { id: 1, step: 'Create a base and add water body', completed: false },
        { id: 2, step: 'Add clouds and arrows for cycle stages', completed: false },
        { id: 3, step: 'Label stages of the water cycle', completed: false },
      ],
      components: ['Poster board', 'Cotton balls (clouds)', 'Blue fabric (water)', 'Markers', 'Glue', 'Labels'],
    },
  },
  {
    id: 'science-4',
    type: 'science',
    title: 'Human Heart Model',
    description: 'Build a static model of the human heart to explore its anatomy and function.',
    image: getProjectImage('Human Heart Model'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Biology', 'Crafting', 'Anatomy'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Chambers', 'Valves', 'Major blood vessels'],
      tutorials: [
        { id: 1, step: 'Mold heart shape using clay', completed: false },
        { id: 2, step: 'Add chambers and vessels with paint', completed: false },
        { id: 3, step: 'Label parts of the heart', completed: false },
      ],
      components: ['Modeling clay', 'Acrylic paint', 'Small tubes (vessels)', 'Cardboard base', 'Glue', 'Labels'],
    },
  },
  {
    id: 'science-5',
    type: 'science',
    title: 'DNA Double Helix Model',
    description: 'Create a static model of the DNA double helix to understand its structure.',
    image: getProjectImage('DNA Double Helix Model'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Biology', 'Crafting', 'Molecular Science'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Double helix structure', 'Base pairs', 'Backbone'],
      tutorials: [
        { id: 1, step: 'Create backbone using straws or pipe cleaners', completed: false },
        { id: 2, step: 'Add base pairs with beads or foam', completed: false },
        { id: 3, step: 'Label DNA components', completed: false },
      ],
      components: ['Straws or pipe cleaners', 'Colored beads or foam', 'Cardboard base', 'Glue', 'Labels'],
    },
  },
  {
    id: 'science-6',
    type: 'science',
    title: 'Electric Circuit Model',
    description: 'Build a simple electric circuit to understand current flow.',
    image: getProjectImage('Electric Circuit Model'),
    category: 'Science',
    difficulty: 'Intermediate',
    skills: ['Physics', 'Crafting', 'Electronics'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Series circuit', 'Parallel circuit', 'Switch control'],
      tutorials: [
        { id: 1, step: 'Gather circuit components', completed: false },
        { id: 2, step: 'Assemble series circuit', completed: false },
        { id: 3, step: 'Add parallel circuit', completed: false },
      ],
      components: ['Battery', 'Wires', 'LEDs', 'Switch', 'Breadboard'],
    },
  },
  {
    id: 'science-7',
    type: 'science',
    title: 'Weather Station Model',
    description: 'Create a model to measure basic weather parameters.',
    image: getProjectImage('Weather Station Model'),
    category: 'Science',
    difficulty: 'Intermediate',
    skills: ['Meteorology', 'Crafting', 'Measurement'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Temperature', 'Humidity', 'Wind direction'],
      tutorials: [
        { id: 1, step: 'Build thermometer housing', completed: false },
        { id: 2, step: 'Add humidity sensor', completed: false },
        { id: 3, step: 'Create wind vane', completed: false },
      ],
      components: ['Thermometer', 'Hygrometer', 'Cardboard', 'Glue', 'Plastic sheets'],
    },
  },
  {
    id: 'science-8',
    type: 'science',
    title: 'Plant Cell Model',
    description: 'Construct a model of a plant cell to study its components.',
    image: getProjectImage('Plant Cell Model'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Biology', 'Crafting', 'Modeling'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Cell wall', 'Chloroplasts', 'Nucleus'],
      tutorials: [
        { id: 1, step: 'Create cell base with clay', completed: false },
        { id: 2, step: 'Add organelles with colored materials', completed: false },
        { id: 3, step: 'Label cell components', completed: false },
      ],
      components: ['Clay', 'Colored beads', 'Cardboard base', 'Glue', 'Labels'],
    },
  },
  {
    id: 'science-9',
    type: 'science',
    title: 'Bridge Structure Model',
    description: 'Build a model bridge to understand structural engineering.',
    image: getProjectImage('Bridge Structure Model'),
    category: 'Science',
    difficulty: 'Intermediate',
    skills: ['Physics', 'Crafting', 'Engineering'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Truss design', 'Load testing', 'Material strength'],
      tutorials: [
        { id: 1, step: 'Design bridge structure', completed: false },
        { id: 2, step: 'Assemble with craft materials', completed: false },
        { id: 3, step: 'Test load capacity', completed: false },
      ],
      components: ['Popsicle sticks', 'Glue', 'String', 'Cardboard base'],
    },
  },
  {
    id: 'science-10',
    type: 'science',
    title: 'Ecosystem Diorama',
    description: 'Create a diorama representing a specific ecosystem.',
    image: getProjectImage('Ecosystem Diorama'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Environmental Science', 'Crafting', 'Modeling'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Flora representation', 'Fauna representation', 'Terrain'],
      tutorials: [
        { id: 1, step: 'Create terrain base', completed: false },
        { id: 2, step: 'Add plant models', completed: false },
        { id: 3, step: 'Include animal figures', completed: false },
      ],
      components: ['Shoebox', 'Clay', 'Plastic figures', 'Paint', 'Glue'],
    },
  },
  // New Science Projects
  {
    id: 'science-11',
    type: 'science',
    title: 'Simple Pendulum',
    description: 'Demonstrate oscillation and period measurement.',
    image: getProjectImage('Simple Pendulum'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Physics', 'Measurement', 'Crafting'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Pendulum swing', 'Period calculation', 'Variable lengths'],
      tutorials: [
        { id: 1, step: 'Assemble pendulum', completed: false },
        { id: 2, step: 'Measure periods', completed: false },
        { id: 3, step: 'Analyze data', completed: false },
      ],
      components: ['String', 'Weight', 'Stand', 'Stopwatch'],
    },
  },
  {
    id: 'science-12',
    type: 'science',
    title: 'Magnetic Field Model',
    description: 'Visualize magnetic fields using iron filings.',
    image: getProjectImage('Magnetic Field Model'),
    category: 'Science',
    difficulty: 'Intermediate',
    skills: ['Physics', 'Electromagnetism', 'Modeling'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Field lines', 'Pole interactions', 'Electromagnet'],
      tutorials: [
        { id: 1, step: 'Set up magnets', completed: false },
        { id: 2, step: 'Add iron filings', completed: false },
        { id: 3, step: 'Observe patterns', completed: false },
      ],
      components: ['Magnets', 'Iron filings', 'Paper', 'Battery', 'Wire'],
    },
  },
  {
    id: 'science-13',
    type: 'science',
    title: 'Solar Panel Demo',
    description: 'Build a small solar-powered device.',
    image: getProjectImage('Solar Panel Demo'),
    category: 'Science',
    difficulty: 'Intermediate',
    skills: ['Physics', 'Renewable Energy', 'Electronics'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Energy conversion', 'Circuit integration', 'Efficiency test'],
      tutorials: [
        { id: 1, step: 'Assemble panel', completed: false },
        { id: 2, step: 'Connect to device', completed: false },
        { id: 3, step: 'Test under light', completed: false },
      ],
      components: ['Solar cell', 'LED', 'Wires', 'Resistor'],
    },
  },
  {
    id: 'science-14',
    type: 'science',
    title: 'Chemical Reaction Model',
    description: 'Demonstrate endothermic/exothermic reactions.',
    image: getProjectImage('Chemical Reaction Model'),
    category: 'Science',
    difficulty: 'Beginner',
    skills: ['Chemistry', 'Safety', 'Observation'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Temperature change', 'Color change', 'Gas production'],
      tutorials: [
        { id: 1, step: 'Prepare chemicals', completed: false },
        { id: 2, step: 'Mix and observe', completed: false },
        { id: 3, step: 'Record results', completed: false },
      ],
      components: ['Baking soda', 'Vinegar', 'Thermometer', 'Beakers'],
    },
  },
  {
    id: 'science-15',
    type: 'science',
    title: 'Ecosystem Terrarium',
    description: 'Create a self-sustaining mini ecosystem.',
    image: getProjectImage('Ecosystem Terrarium'),
    category: 'Science',
    difficulty: 'Advanced',
    skills: ['Biology', 'Environmental Science', 'Maintenance'],
    progress: 0,
    content: {
      type: 'science',
      features: ['Plant growth', 'Water cycle', 'Animal inclusion'],
      tutorials: [
        { id: 1, step: 'Set up container', completed: false },
        { id: 2, step: 'Add soil and plants', completed: false },
        { id: 3, step: 'Monitor ecosystem', completed: false },
      ],
      components: ['Glass jar', 'Soil', 'Plants', 'Small insects'],
    },
  },
];

// Unsplash background images for cycling
const unsplashBackgrounds = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1614732414444-901a73e886ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
];

const ProjectBuilder: React.FC = () => {
  // State management
  const [view, setView] = useState<'landing' | 'software' | 'science' | 'project-detail'>('landing');
  const [previousView, setPreviousView] = useState<'landing' | 'software' | 'science'>('landing');
  const [selectedProject, setSelectedProject] = useState<ProjectTemplate | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showLearningModeModal, setShowLearningModeModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [currentBackground, setCurrentBackground] = useState<number>(0);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [videoPosition, setVideoPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [videoSize, setVideoSize] = useState({ width: 400, height: 250 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[][]>([]);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'history' | 'files' | 'video' | 'ideas' | 'code' | 'notes' | 'planner'>('code');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // AI Features state
  const [projectIdeas, setProjectIdeas] = useState<string[]>([]);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [projectPlan, setProjectPlan] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [ideasInput, setIdeasInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [planInput, setPlanInput] = useState('');

  // Store state
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [storeSearchResults, setStoreSearchResults] = useState<any[]>([]);

  // Product search state
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [isProductSearching, setIsProductSearching] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState('All');
  const [productSearchHistory, setProductSearchHistory] = useState<string[]>([]);

  // Import product search service
  const productSearchService = getGoogleProductSearchService(GOOGLE_CUSTOM_SEARCH_API_KEY, GOOGLE_CUSTOM_SEARCH_ENGINE_ID);

  // Function to perform product search
  const performProductSearch = async (query: string) => {
    if (!query.trim()) {
      setProductSearchResults([]);
      return;
    }
    setIsProductSearching(true);
    try {
      const results = await productSearchService.searchProducts(query);
      // Map ProductSearchResult[] to Product[] to match state type
      const mappedResults: Product[] = results.map(result => ({
        id: result.id || Math.random().toString(),
        name: result.title || 'Unknown Product',
        price: 0, // Google search doesn't provide price info
        image: result.pagemap?.cse_image?.[0]?.src || result.pagemap?.cse_thumbnail?.[0]?.src || '',
        description: result.snippet || result.htmlSnippet || '',
        category: 'General', // Default category
        inStock: true, // Assume available
        stockQuantity: 1, // Default stock
        brand: result.pagemap?.product?.[0]?.brand || '',
        tags: [], // Empty tags array
        relatedProjects: [], // Empty related projects
        averageRating: 0, // No rating from search
        reviewCount: 0 // No reviews from search
      }));
      setProductSearchResults(mappedResults);
      setProductSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)];
        return newHistory.slice(0, 10); // Keep last 10 searches
      });
    } catch (error) {
      console.error('Error searching products:', error);
      setProductSearchResults([]);
    } finally {
      setIsProductSearching(false);
    }
  };

  // Handler for product search input change
  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearchQuery(value);
    if (value.trim().length === 0) {
      setProductSearchResults([]);
    }
  };

  // Handler for product search submit (e.g., on Enter key)
  const handleProductSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performProductSearch(productSearchQuery);
  };

  // Project filtering state
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Other state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; duration?: number } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Favourites state
  const [favourites, setFavourites] = useState<string[]>(() => {
    const saved = localStorage.getItem('projectFavourites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  // Auto-dismiss toast after specified duration
  useEffect(() => {
    if (toast?.duration) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Save favourites to localStorage whenever favourites change
  useEffect(() => {
    localStorage.setItem('projectFavourites', JSON.stringify(favourites));
  }, [favourites]);

  // Favourites functions
  const toggleFavourite = (projectId: string) => {
    setFavourites(prev => {
      const isFavourite = prev.includes(projectId);
      const newFavourites = isFavourite
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId];

      setToast({
        message: isFavourite ? 'Removed from favourites' : 'Added to favourites',
        type: 'success',
        duration: 2000
      });

      return newFavourites;
    });
  };

  const isFavourite = (projectId: string) => {
    return favourites.includes(projectId);
  };

  // Services
  const youtubeService = new YouTubeService(YOUTUBE_API_KEY || '');
  const navigate = useNavigate();
  const location = useLocation();

  // Function to request location permission
  const requestLocationPermission = async (): Promise<UserLocation | null> => {
    setIsRequestingLocation(true);
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setToast({
          message: 'Geolocation is not supported by this browser.',
          type: 'error',
          duration: 3000
        });
        setIsRequestingLocation(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setLocationPermissionGranted(true);
          setIsRequestingLocation(false);
          resolve(userLoc);
        },
        (error) => {
          console.warn('Location permission denied or error:', error);
          setLocationPermissionGranted(false);
          setIsRequestingLocation(false);
          setToast({
            message: 'Location access denied. Using default location.',
            type: 'error',
            duration: 3000
          });
          // Return default location
          const defaultLocation: UserLocation = { lat: 37.7749, lng: -122.4194 };
          setUserLocation(defaultLocation);
          resolve(defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Function to fetch nearby stores
  const fetchNearbyStores = async (location: UserLocation) => {
    try {
      const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');
      const stores = await mapsService.findNearbyStores(location).catch((err) => {
        console.warn('findNearbyStores failed, using fallback stores:', err);
        return mapsService.getMockStores(location);
      });
      setNearbyStores(stores || []);
    } catch (error) {
      console.warn('Error fetching nearby stores:', error);
      setNearbyStores([]);
    }
  };

  // Ref for auto search timeout
  const autoSearchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize services and background cycling
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const productsService = getProductsService();
        setProducts(productsService.getAllProducts());

        if (navigator.geolocation) {
          navigator.geolocation.watchPosition((position) => {
            // Wrap the async work so exceptions are caught locally
            (async () => {
              try {
                const userLocation: UserLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };

                const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');

                // mapsService now gracefully returns mock data if the API key is missing
                const stores = await mapsService.findNearbyStores(userLocation).catch((err) => {
                  console.warn('ProjectBuilder: findNearbyStores failed, using fallback stores:', err);
                  return mapsService.getFallbackStores(userLocation);
                });

                setNearbyStores(stores || []);
              } catch (err) {
                console.warn('ProjectBuilder: Error while fetching nearby stores:', err);
                // Fallback to empty list to avoid crashing render
                setNearbyStores([]);
              }
            })();
          }, (geoErr) => {
            console.warn('Geolocation error (watchPosition):', geoErr);
            // Provide a default location so rest of the UI can function
            const fallbackLocation: UserLocation = { lat: 37.7749, lng: -122.4194 };
            const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');
            mapsService.findNearbyStores(fallbackLocation).then(stores => setNearbyStores(stores)).catch(() => setNearbyStores([]));
          });
        }
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();

    // Background image cycling
    const backgroundInterval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % unsplashBackgrounds.length);
    }, 8000);

    return () => clearInterval(backgroundInterval);
  }, []);

  // Auto-save chat when component unmounts or view changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Removed auto-save chat on unload as per user request
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Removed auto-save chat on unmount as per user request
    };
  }, [chatMessages]);

  // Handle learning mode selection
  const handleLearningModeSelect = async (mode: 'video' | 'chatbot') => {
    setShowLearningModeModal(false);
    
    if (mode === 'video') {
      await handleWatchVideos();
    } else if (mode === 'chatbot') {
      setShowChatbot(true);
      // Initialize chatbot with project context
      if (selectedProject) {
        const initialMessage: ChatMessage = {
          role: 'assistant',
          content: `Hi! I'm here to help you with your ${selectedProject.title} project. What would you like to know?`,
          timestamp: new Date()
        };
        setChatMessages([initialMessage]);
      }
    }
  };

  // Handle watch videos functionality
  const handleWatchVideos = async () => {
    if (!selectedProject) return;
    
    setVideosLoading(true);
    setShowVideoModal(true);
    
    try {
      // Create search query based on project title and skills
      const searchQuery = `${selectedProject.title} ${selectedProject.skills.join(' ')} project`;
      setVideoSearchQuery(searchQuery);
      
      const fetchedVideos = await youtubeService.searchVideos(searchQuery, 12);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setToast({
        message: 'Failed to load videos. Please try again.',
        type: 'error'
      });
    } finally {
      setVideosLoading(false);
    }
  };

  // Handle video search
  const handleVideoSearch = async (query: string) => {
    if (!query.trim()) return;

    setVideosLoading(true);
    setVideoSearchQuery(query);

    try {
      const fetchedVideos = await youtubeService.searchVideos(query, 12);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error searching videos:', error);
      setToast({
        message: 'Failed to search videos. Please try again.',
        type: 'error'
      });
    } finally {
      setVideosLoading(false);
    }
  };

  // Drag handlers for floating video player
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - videoPosition.x,
      y: e.clientY - videoPosition.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const newWidth = Math.max(320, Math.min(resizeStart.width + deltaX, window.innerWidth - videoPosition.x));
      const newHeight = Math.max(200, Math.min(resizeStart.height + deltaY, window.innerHeight - videoPosition.y));

      setVideoSize({ width: newWidth, height: newHeight });
    } else if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep video player within viewport bounds
      const maxX = window.innerWidth - videoSize.width;
      const maxY = window.innerHeight - videoSize.height;

      setVideoPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Resize handler
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: videoSize.width,
      height: videoSize.height
    });
  };

  // Size presets
  const setVideoSizePreset = (width: number, height: number) => {
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    setVideoSize({ width, height });
    setVideoPosition(prev => ({
      x: Math.min(prev.x, maxX),
      y: Math.min(prev.y, maxY)
    }));
  };

  // Add global mouse event listeners for dragging and resizing
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  // Handle chat submission for sidebar
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatbotLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setChatbotLoading(true);

    try {
      const context = selectedProject ?
        `Project: ${selectedProject.title}\nDescription: ${selectedProject.description}\nSkills: ${selectedProject.skills.join(', ')}\n\n` : '';

      const response = await (await import('../lib/gemini-service')).GeminiService.generateText(context + currentInput);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Auto-save chat after every 4 exchanges (8 messages total)
      if (chatMessages.length >= 8) {
        setTimeout(() => saveChatToHistory(false), 1000);
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatbotLoading(false);
    }
  };

  // Helper function to generate ideas response
  const generateIdeasResponse = async (input: string): Promise<string[]> => {
    if (!input.trim()) return [];
    try {
      const prompt = `Generate 5 creative and educational project ideas for children based on the following interests or keywords: "${input}".

Requirements:
- Each idea should be suitable for children aged 8-14
- Include a mix of software and science projects
- Make ideas engaging and age-appropriate
- Focus on learning through fun activities
- Consider safety and supervision needs

Format each idea as a brief title followed by a short description (2-3 sentences).
Separate each idea with a blank line.`;

      const response = await GeminiService.generateText(prompt);

      // Parse the response into individual ideas
      const ideas = response.split('\n\n').filter(idea => idea.trim().length > 0);

      // Clean up and format the ideas
      return ideas.map(idea => idea.trim()).filter(idea => idea.length > 0);
    } catch (error) {
      console.error('Error generating ideas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return [`❌ Failed to generate ideas. Please check your internet connection and try again. Error: ${errorMessage}`];
    }
  };

  // Helper function to generate code helper response
  const generateCodeHelperResponse = async (input: string): Promise<string> => {
    if (!input.trim()) return '';
    try {
      const prompt = `You are a helpful coding assistant for children learning to program.

The child has asked for help with: "${input}"

Please provide:
1. A clear, simple explanation of the concept or solution
2. Working code example (if applicable)
3. Step-by-step instructions
4. Common mistakes to avoid
5. Tips for testing and debugging

Keep the language simple and encouraging. Use age-appropriate examples.
If this involves debugging, explain what might be wrong and how to fix it.
If this is a new concept, start with basics and build up.

Format your response with clear sections and code blocks where appropriate.`;

      const response = await GeminiService.generateText(prompt);
      return response || 'Sorry, I couldn\'t generate a response. Please try rephrasing your question.';
    } catch (error) {
      console.error('Error generating code snippet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `❌ Failed to generate code help. Please check your internet connection and try again. Error: ${errorMessage}`;
    }
  };

  // AI Feature: Generic function for all AI generations, refactored to use helper functions
  const generateAiFeature = async (feature: 'ideas' | 'code' | 'notes' | 'plan', input?: string) => {
    // Use the appropriate input based on the feature
    let actualInput = input ?? '';
    if (feature === 'ideas') actualInput = ideasInput;
    if (feature === 'code') actualInput = codeInput;
    if (feature === 'notes') actualInput = notesInput;
    if (feature === 'plan') actualInput = planInput;

    if (!actualInput.trim() || aiLoading) return;

    // Reset relevant state
    if (feature === 'ideas') setProjectIdeas([]);
    if (feature === 'code') setCodeSnippet('');
    if (feature === 'notes') setProjectNotes('');
    if (feature === 'plan') setProjectPlan([]);

    setAiLoading(true);

    try {
      let response = '';
      switch(feature) {
        case 'ideas':
          const ideas = await generateIdeasResponse(actualInput);
          setProjectIdeas(ideas);
          break;
        case 'code':
          response = await generateCodeHelperResponse(actualInput);
          setCodeSnippet(response);
          break;
        case 'notes':
          const promptNotes = `You are an educational AI assistant helping children organize and understand project information. Analyze the following content and create comprehensive, structured notes:

CONTENT TO ANALYZE: "${actualInput}"

PROJECT CONTEXT: ${selectedProject ? `Project: ${selectedProject.title}, Skills: ${selectedProject.skills.join(', ')}, Difficulty: ${selectedProject.difficulty}` : 'General project context'}

Create structured notes with the following sections:

1. **📋 KEY CONCEPTS** - Main ideas and important terms
2. **🎯 LEARNING OBJECTIVES** - What should be learned from this content
3. **📝 MAIN POINTS** - Summarized key information in bullet points
4. **🔗 CONNECTIONS** - How this relates to the project or other concepts
5. **❓ IMPORTANT QUESTIONS** - Key questions that arise from this content
6. **💡 STUDY TIPS** - How to remember and apply this information
7. **📚 RESOURCES NEEDED** - Materials or tools mentioned
8. **⏰ TIME ESTIMATES** - How long different parts might take

Format the response in a clear, organized way that's easy for children to read and study. Use emojis and formatting to make it engaging. Include practical examples and real-world applications where relevant.

Make the notes comprehensive but not overwhelming - focus on the most important information that will help with the project.`;
          response = await GeminiService.generateText(promptNotes);
          setProjectNotes(response);
          break;
        case 'plan':
          const promptPlan = `You are an educational project planning assistant helping children create detailed, achievable project plans. Create a comprehensive project plan based on the following:

PROJECT DESCRIPTION: "${actualInput}"
${selectedProject ? `PROJECT DETAILS: Title: ${selectedProject.title}, Skills: ${selectedProject.skills.join(', ')}, Difficulty: ${selectedProject.difficulty}, Current Progress: ${selectedProject.progress}%` : ''}

Create a detailed project plan with the following structure:

**🎯 PROJECT OVERVIEW**
- Project title and main goal
- Why this project is valuable to learn
- Expected learning outcomes

**📋 DETAILED STEPS**
Break down the project into specific, actionable steps. Each step should include:
- Step number and title
- Detailed description of what to do
- Time estimate (in minutes/hours)
- Required materials or tools
- Skills needed for this step
- Potential challenges and how to overcome them
- Success criteria (how to know it's done correctly)

**🛠️ MATERIALS & RESOURCES**
- Complete list of all materials needed
- Where to get materials (home, store, online)
- Cost estimates if applicable
- Alternative materials if originals aren't available

**⏰ TIMELINE & MILESTONES**
- Total estimated time
- Suggested daily/weekly schedule
- Key milestones and checkpoints
- Flexibility for different paces

**📚 LEARNING INTEGRATION**
- How each step builds skills
- Related concepts to research
- Extension activities for advanced learners
- Simplified versions for beginners

**🔍 ASSESSMENT & NEXT STEPS**
- How to evaluate project success
- What to do if things don't go as planned
- Ideas for presenting or sharing the project
- Follow-up projects or related activities

**⚠️ SAFETY & SUPERVISION NOTES**
- Any safety considerations
- When adult supervision is needed
- Age-appropriate modifications

Format this as a clear, step-by-step guide that's encouraging and supportive. Use emojis and formatting to make it engaging for children. Consider the child's age and skill level when creating the plan.`;
          response = await GeminiService.generateText(promptPlan);
          // Parse the response to extract steps more intelligently
          const lines = response.split('\n').filter((line: any) => line.trim());
          const steps = lines
            .filter((line: any) => /^\d+\./.test(line) || /^•/.test(line) || /^-/.test(line))
            .map((line: any) => line.replace(/^(\d+\.|\•|\-)\s*/, '').trim())
            .filter((step: any) => step.length > 0);
          setProjectPlan(steps);
          break;
      }
    } catch (error) {
      console.error(`Error generating ${feature}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (feature === 'ideas') setProjectIdeas([`❌ Failed to generate ideas. Please check your internet connection and try again. Error: ${errorMessage}`]);
      if (feature === 'code') setCodeSnippet(`❌ Failed to generate code help. Please check your internet connection and try again. Error: ${errorMessage}`);
      if (feature === 'notes') setProjectNotes(`❌ Failed to generate notes summary. Please check your internet connection and try again. Error: ${errorMessage}`);
      if (feature === 'plan') setProjectPlan([`❌ Failed to generate project plan. Please check your internet connection and try again. Error: ${errorMessage}`]);
    } finally {
      setAiLoading(false);
    }
  };

  // Cart functions
  const addToCart = (productId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1, addedAt: new Date() }];
    });
    
    setToast({
      message: 'Item added to cart!',
      type: 'success'
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Get comprehensive electronic components for science projects
  const getScienceElectronicComponents = () => {
    // Comprehensive list of electronic components for science projects
    const electronicComponents = [
      // Basic Components
      'Resistor (10Ω)', 'Resistor (100Ω)', 'Resistor (1kΩ)', 'Resistor (10kΩ)',
      'Capacitor (10µF)', 'Capacitor (100µF)', 'Capacitor (1000µF)',
      'Transistor (2N2222)', 'Transistor (BC547)', 'Diode (1N4001)', 'Zener Diode (5.1V)',
      'LED (Red)', 'LED (Green)', 'LED (Blue)', 'LED (White)', 'RGB LED',

      // Power Components
      '9V Battery', 'AA Battery (4-pack)', 'AAA Battery (4-pack)', 'Coin Cell Battery (CR2032)',
      '9V Battery Connector', 'Battery Holder (4xAA)', 'DC Power Supply (5V)', 'DC Power Supply (12V)',

      // Switches and Buttons
      'Push Button Switch', 'Toggle Switch', 'Slide Switch', 'Rotary Switch',
      'Micro Switch', 'Limit Switch', 'Reed Switch',

      // Sensors
      'Temperature Sensor (DS18B20)', 'Light Sensor (LDR)', 'Motion Sensor (PIR)',
      'Sound Sensor', 'Humidity Sensor', 'Pressure Sensor', 'IR Sensor',
      'Ultrasonic Sensor', 'Gas Sensor (MQ-2)', 'Soil Moisture Sensor',

      // Motors and Actuators
      'DC Motor (5V)', 'DC Motor (12V)', 'Servo Motor (SG90)', 'Stepper Motor',
      'Vibration Motor', 'Solenoid', 'Relay Module',

      // Display Components
      '7-Segment Display', 'LCD Display (16x2)', 'OLED Display (0.96")',
      'LED Matrix (8x8)', 'Dot Matrix Display',

      // Integrated Circuits
      '555 Timer IC', 'Op-Amp IC (LM358)', 'Voltage Regulator (7805)',
      'Shift Register (74HC595)', 'Arduino Nano', 'Arduino Uno', 'Raspberry Pi Pico',

      // Connection and Prototyping
      'Breadboard (400 points)', 'Breadboard (830 points)', 'Jumper Wires (Male-Male)',
      'Jumper Wires (Male-Female)', 'Jumper Wires (Female-Female)', 'Dupont Wires',
      'PCB Board', 'Soldering Iron', 'Solder Wire', 'Wire Stripper',

      // Tools and Accessories
      'Multimeter', 'Oscilloscope (Basic)', 'Function Generator', 'Logic Analyzer',
      'USB Cable', 'Serial Cable', 'Ethernet Cable', 'Heat Shrink Tubing',

      // Advanced Components
      'Arduino Starter Kit', 'Raspberry Pi 4', 'ESP32 Development Board',
      'Bluetooth Module (HC-05)', 'WiFi Module (ESP8266)', 'RF Module',
      'GPS Module', 'Accelerometer', 'Gyroscope', 'Magnetometer',

      // Passive Components
      'Potentiometer (10kΩ)', 'Variable Resistor', 'Inductor (10µH)', 'Crystal Oscillator',
      'Transformer (220V to 12V)', 'Fuse (1A)', 'Fuse Holder',

      // Audio Components
      'Buzzer', 'Speaker (8Ω)', 'Microphone', 'Audio Amplifier Module',
      'MP3 Player Module', 'Voice Recorder Module',

      // Optical Components
      'Laser Diode', 'Photo Diode', 'Photo Transistor', 'Fiber Optic Cable',
      'Optocoupler', 'Light Dependent Resistor (LDR)',

      // Power Management
      'Solar Panel (5V)', 'Solar Panel (12V)', 'Battery Charger Module',
      'Power Bank Module', 'Voltage Booster Module', 'Voltage Regulator Module',

      // Connectors and Interfaces
      'USB Connector', 'HDMI Connector', 'Audio Jack (3.5mm)', 'RCA Connector',
      'BNC Connector', 'DB9 Connector', 'GPIO Header', 'Pin Headers',

      // Storage and Memory
      'SD Card Module', 'EEPROM Memory', 'Flash Memory Module',
      'Real Time Clock (RTC) Module', 'Data Logger Module',

      // Communication
      'Serial to USB Converter', 'I2C Module', 'SPI Module', 'CAN Bus Module',
      'RS485 Module', 'LoRa Module', 'NFC Module', 'RFID Reader'
    ];

    // Extract additional components from science projects
    projectTemplates
      .filter(project => project.type === 'science')
      .forEach(project => {
        if (project.content?.components) {
          project.content.components.forEach(component => {
            // Filter for electronic components not already in our list
            const electronicKeywords = ['battery', 'wire', 'led', 'switch', 'breadboard', 'resistor', 'capacitor', 'transistor', 'motor', 'sensor', 'arduino', 'raspberry', 'circuit', 'bulb', 'lamp', 'diode', 'relay', 'servo', 'potentiometer'];
            if (electronicKeywords.some(keyword => component.toLowerCase().includes(keyword)) &&
                !electronicComponents.some(existing => existing.toLowerCase().includes(component.toLowerCase()))) {
              electronicComponents.push(component);
            }
          });
        }
      });

    // Convert to Product format with images and detailed information
    return electronicComponents.map((component, index) => {
      // Determine category based on component type
      let category = 'Electronics';
      if (component.includes('Sensor') || component.includes('Module')) category = 'Sensors & Modules';
      else if (component.includes('Motor') || component.includes('Servo')) category = 'Motors & Actuators';
      else if (component.includes('Arduino') || component.includes('Raspberry') || component.includes('ESP')) category = 'Microcontrollers';
      else if (component.includes('Battery') || component.includes('Power')) category = 'Power Supply';
      else if (component.includes('Display') || component.includes('LED')) category = 'Display & Lighting';
      else if (component.includes('Wire') || component.includes('Cable') || component.includes('Connector')) category = 'Wiring & Connectors';

      // Determine realistic pricing based on component type
      let basePrice = 5;
      if (component.includes('Arduino') || component.includes('Raspberry')) basePrice = 15;
      else if (component.includes('Sensor') || component.includes('Module')) basePrice = 8;
      else if (component.includes('Motor')) basePrice = 12;
      else if (component.includes('Display')) basePrice = 10;
      else if (component.includes('Kit')) basePrice = 25;
      else if (component.includes('Battery')) basePrice = 3;
      else if (component.includes('Resistor') || component.includes('Capacitor')) basePrice = 2;

      const price = Math.floor(Math.random() * 15) + basePrice;

      return {
        id: `electronic-${index}`,
        name: component,
        price: price,
        image: getProjectImage(component),
        description: `High-quality ${component} for science projects and electronics experiments`,
        category: category,
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 50) + 10, // Stock 10-60
        brand: component.includes('Arduino') ? 'Arduino' :
               component.includes('Raspberry') ? 'Raspberry Pi' :
               component.includes('ESP') ? 'Espressif' : 'Generic',
        tags: ['electronics', 'science', 'component', category.toLowerCase().replace(' & ', '-')],
        relatedProjects: projectTemplates
          .filter(p => p.type === 'science' && p.content?.components?.some(c =>
            c.toLowerCase().includes(component.split(' ')[0].toLowerCase())
          ))
          .map(p => p.id),
        averageRating: (Math.random() * 1.5 + 3.5).toFixed(1), // Rating 3.5-5.0
        reviewCount: Math.floor(Math.random() * 100) + 20 // Reviews 20-120
      };
    });
  };

  const getFilteredProducts = () => {
    let filtered = getScienceElectronicComponents();

    if (storeSearchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(storeSearchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getFilteredProjects = (type: 'software' | 'science') => {
    let filtered = projectTemplates.filter(p => p.type === type);

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    if (projectSearchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(projectSearchQuery.toLowerCase())
      );
    }

    if (showFavouritesOnly) {
      filtered = filtered.filter(p => favourites.includes(p.id));
    }

    return filtered;
  };

  // Video Modal Component (enhanced with better UX)
const renderVideoModal = () => (
  showVideoModal && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] mx-4 overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Video className="text-red-500" size={28} />
            Tutorial Videos
            {selectedProject && (
              <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                for {selectedProject.title}
              </span>
            )}
          </h2>
          <button
            onClick={() => {
              setShowVideoModal(false);
              setCurrentPlayingVideo(null);
              setIsVideoMinimized(false);
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tutorials... (e.g., React basics)"
                value={videoSearchQuery}
                onChange={(e) => setVideoSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVideoSearch(videoSearchQuery)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>
            <button
              onClick={() => handleVideoSearch(videoSearchQuery)}
              disabled={videosLoading}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Video Player or Videos Grid */}
        <div className="flex-1 overflow-y-auto max-h-[70vh] p-6 bg-white dark:bg-gray-900">
          {currentPlayingVideo ? (
            <div className="flex flex-col items-center">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                  🎥 Video is now playing in floating player! You can continue working while watching.
                </p>
              </div>
              <iframe
                width="100%"
                height="400"
                src={youtubeService.getEmbedUrl(currentPlayingVideo.id.videoId)}
                title={currentPlayingVideo.snippet.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg shadow-lg"
              />
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{currentPlayingVideo.snippet.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{currentPlayingVideo.snippet.channelTitle}</p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setCurrentPlayingVideo(null)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Videos
                </button>
                <button
                  onClick={() => {
                    setIsVideoMinimized(false);
                    setShowVideoModal(false);
                  }}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Float Video
                </button>
              </div>
            </div>
          ) : videosLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-300">Discovering tutorials...</p>
              </div>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <motion.div
                  key={video.id.videoId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setCurrentPlayingVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative group overflow-hidden">
                    <img
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                      className="w-full h-40 object-cover transition-transform group-hover:scale-110 duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <Play 
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity scale-150" 
                        size={40}
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {video.snippet.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {video.snippet.channelTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {video.snippet.description}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(youtubeService.getVideoUrl(video.id.videoId));
                          setToast({
                            message: 'Link copied!',
                            type: 'success'
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Video className="mx-auto mb-4 text-gray-400" size={64} />
                <p className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">No videos found</p>
                <p className="text-gray-500 dark:text-gray-400">Try different keywords or check your spelling</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
);

  // Share Notes Modal
  const renderShareNotesModal = () => (
    <AnimatePresence>
      {showShareModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Share Your Notes
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(59, 130, 246, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigator.clipboard.writeText(projectNotes);
                  setToast({ message: 'Notes copied to clipboard!', type: 'success', duration: 3000 });
                  setShowShareModal(false);
                }}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                  >
                    📋
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Copy to Clipboard
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Copy notes to paste anywhere
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(34, 197, 94, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const blob = new Blob([projectNotes], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedProject?.title || 'Project'}_Notes.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setToast({ message: 'Notes downloaded as text file!', type: 'success', duration: 3000 });
                  setShowShareModal(false);
                }}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
                  >
                    📥
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Download as File
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Save notes as a text file
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(168, 85, 247, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const subject = encodeURIComponent(`Check out my ${selectedProject?.title || 'Project'} Notes!`);
                  const body = encodeURIComponent(`Hi!\n\nI wanted to share my organized notes for the ${selectedProject?.title || 'project'}:\n\n${projectNotes}\n\nThese notes were created using AI to help with learning!`);
                  window.open(`mailto:?subject=${subject}&body=${body}`);
                  setShowShareModal(false);
                }}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
                  >
                    ✉️
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Share via Email
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send notes through email
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(239, 68, 68, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${selectedProject?.title || 'Project'} Notes`,
                      text: projectNotes,
                      url: window.location.href
                    });
                  } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(projectNotes);
                    setToast({ message: 'Notes copied! Share with your preferred app.', type: 'success', duration: 3000 });
                  }
                  setShowShareModal(false);
                }}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full group-hover:bg-red-100 dark:group-hover:bg-red-900/30"
                  >
                    📤
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Share to Apps
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Share with other apps on your device
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Learning Mode Selection Modal (enhanced)
  const renderLearningModeModal = () => (
    <AnimatePresence>
      {showLearningModeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Learning Mode
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLearningModeModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(239, 68, 68, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLearningModeSelect('video')}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full group-hover:bg-red-100 dark:group-hover:bg-red-900/30"
                  >
                    <Video className="text-red-600" size={24} />
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Video Tutorials
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Step-by-step videos from experts
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(34, 197, 94, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLearningModeSelect('chatbot')}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
                  >
                    <MessageCircle className="text-green-600" size={24} />
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Assistant
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Real-time personalized guidance
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Chatbot Modal (enhanced with better scrolling and input)
  const renderChatbotModal = () => (
    showChatbot && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl h-[80vh] mx-4 overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bot className="text-blue-500" size={24} />
              Project AI Assistant
            </h2>
            <button
              onClick={() => setShowChatbot(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
            {chatMessages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-2 text-right">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
            {chatbotLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none">
                  <motion.div className="flex space-x-2">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                disabled={chatbotLoading}
              />
              <button
                type="submit"
                disabled={chatbotLoading || !chatInput.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  );

  // Store Modal (enhanced with tabs and better layout)
  const [showMapModal, setShowMapModal] = useState(false);

  const handleStoreButtonClick = async () => {
    if (locationPermissionGranted === null) {
      // Request location permission first time
      const location = await requestLocationPermission();
      if (location) {
        await fetchNearbyStores(location);
        setShowStoreModal(true);
      }
    } else if (locationPermissionGranted === true && userLocation) {
      // Permission already granted, fetch stores based on saved location
      await fetchNearbyStores(userLocation);
      setShowStoreModal(true);
    } else {
      // Permission denied or unknown, use default location
      const defaultLocation: UserLocation = { lat: 37.7749, lng: -122.4194 };
      await fetchNearbyStores(defaultLocation);
      setShowStoreModal(true);
    }
  };

  // Enhanced checkout function that searches for stores selling cart items
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setToast({
        message: 'Your cart is empty!',
        type: 'error',
        duration: 3000
      });
      return;
    }

    setShowStoreModal(false);
    setShowMapModal(true);

    // Get cart items with product details
    const cartItems = cart.map(cartItem => {
      const product = getScienceElectronicComponents().find(p => p.id === cartItem.productId);
      return product;
    }).filter(product => product !== undefined);

    if (cartItems.length === 0) {
      setToast({
        message: 'No valid items in cart',
        type: 'error',
        duration: 3000
      });
      return;
    }

    // Request location permission if not already granted
    let userLoc = userLocation;
    if (locationPermissionGranted === null || locationPermissionGranted === false) {
      userLoc = await requestLocationPermission();
    }

    if (!userLoc) {
      // Use default location if permission denied
      userLoc = { lat: 37.7749, lng: -122.4194 };
      setToast({
        message: 'Using default location. Enable location for better results.',
        type: 'error',
        duration: 4000
      });
    }

    // Perform comprehensive search for stores that sell these products
    setIsSearchingPlaces(true);
    try {
      const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');

      // Create search queries based on cart items
      const searchQueries = [
        // Search for specific product names
        ...cartItems.map(item => `${item!.name} store`).slice(0, 3),
        // Search for electronics stores
        'electronics store',
        'electronic components store',
        // Search for maker/hobby stores
        'maker store',
        'hobby electronics store'
      ];

      const allResults: Store[] = [];

      // Perform multiple searches for comprehensive results
      for (const query of searchQueries.slice(0, 5)) { // Limit to 5 searches
        try {
          const results = await mapsService.searchStores(query, userLoc);
          if (results && results.length > 0) {
            allResults.push(...results);
          }
        } catch (error) {
          console.warn(`Search failed for query "${query}":`, error);
        }
      }

      // Remove duplicates and sort by distance
      const uniqueResults = allResults.filter((store, index, self) =>
        index === self.findIndex(s => s.id === store.id)
      ).sort((a, b) => a.distance - b.distance).slice(0, 20); // Top 20 results

      setPlaceSearchResults(uniqueResults.length > 0 ? uniqueResults : []);

      // If no results from API, use fallback
      if (uniqueResults.length === 0) {
        console.info('No search results found, using fallback stores');
        const fallbackResults = mapsService.getFallbackStores(userLoc);
        setPlaceSearchResults(fallbackResults);
      }

      // Auto-set search query to show what we're looking for
      const cartItemNames = cartItems.map(item => item!.name).slice(0, 2).join(', ');
      setPlaceSearchQuery(`${cartItemNames}${cartItems.length > 2 ? ' and more' : ''} - electronics stores`);

    } catch (error) {
      console.warn('Error in checkout store search:', error);
      // Fallback to basic electronics store search
      try {
        const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');
        const fallbackResults = mapsService.getFallbackStores(userLoc);
        setPlaceSearchResults(fallbackResults);
        setPlaceSearchQuery('electronics store');
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setPlaceSearchResults([]);
      }
    } finally {
      setIsSearchingPlaces(false);
    }

    setToast({
      message: `Finding stores for ${cart.length} item${cart.length > 1 ? 's' : ''} in your cart...`,
      type: 'success',
      duration: 3000
    });
  };

  const renderStoreModal = () => (
    showStoreModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-7xl h-[90vh] mx-4 overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="text-purple-500" size={28} />
                Science Electronics Store
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Electronic components for your science projects
              </p>
            </div>
            <button
              onClick={() => setShowStoreModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search electronic components..."
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredProducts().map(product => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
              >
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">${product.price}</p>
                <button 
                  onClick={() => addToCart(product.id)}
                  className="mt-2 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <span className="font-bold">Total: ${getCartTotal()}</span>
            <button
              onClick={handleCheckout}
              className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
            >
              Checkout
            </button>
          </div>
        </motion.div>
      </div>
    )
  );
  
  // Map Modal to show nearby stores and user location
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placeSearchResults, setPlaceSearchResults] = useState<Store[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const handlePlaceSearch = async () => {
    if (!placeSearchQuery.trim()) return;
    setIsSearchingPlaces(true);
    try {
      const mapsService = getMapsService('AIzaSyDsxELRYuY9ozjzZ1wxbbe_1WiWqcDhzXY');
      // Use a default location if user location is not available
      const defaultLocation: UserLocation = { lat: 37.7749, lng: -122.4194 };
      const results = await mapsService.searchStores(placeSearchQuery, defaultLocation);
      setPlaceSearchResults(results);
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaceSearchResults([]);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // Automatically search for products and stores when map modal opens or cart changes
  useEffect(() => {
    if (showMapModal && cart.length > 0) {
      const selectedProducts = cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        return product;
      }).filter(product => product !== undefined);

      if (selectedProducts.length > 0) {
        const fetchNearbyStores = async () => {
          setIsSearchingPlaces(true);
          try {
            const mapsService = getMapsService('AIzaSyDsxELRYuY9ozjzZ1wxbbe_1WiWqcDhzXY');
            // Use default location or get user location
            const userLocation = await mapsService.getCurrentLocation().catch(() => ({ lat: 37.7749, lng: -122.4194 }));

            // Enhanced search: search for both products and stores
            const searchQueries = [
              // Search for product names directly
              selectedProducts.map(p => p!.name).join(' '),
              // Search for electronics/hardware stores
              'electronics store',
              // Search for specific product types
              ...selectedProducts.map(p => `${p!.category} store`).filter((v, i, a) => a.indexOf(v) === i)
            ];

            const allResults: Store[] = [];

            // Perform multiple searches for comprehensive results
            for (const query of searchQueries.slice(0, 3)) { // Limit to 3 searches to avoid rate limits
              try {
                const results = await mapsService.searchStores(query, userLocation);
                if (results && results.length > 0) {
                  allResults.push(...results);
                }
              } catch (error) {
                console.warn(`Search failed for query "${query}":`, error);
              }
            }

            // Remove duplicates and sort by distance
            const uniqueResults = allResults.filter((store, index, self) =>
              index === self.findIndex(s => s.id === store.id)
            ).sort((a, b) => a.distance - b.distance).slice(0, 15); // Top 15 results

            setPlaceSearchResults(uniqueResults.length > 0 ? uniqueResults : []);

            // If no results from API, use fallback
            if (uniqueResults.length === 0) {
              console.info('No search results found, using fallback stores');
              const fallbackResults = mapsService.getFallbackStores(userLocation);
              setPlaceSearchResults(fallbackResults);
            }

          } catch (error) {
            console.warn('Error in comprehensive store search, using fallback data:', error);
            // Use fallback stores from the maps service
            const mapsService = getMapsService('AIzaSyDsxELRYuY9ozjzZ1wxbbe_1WiWqcDhzXY');
            const fallbackLocation = { lat: 37.7749, lng: -122.4194 };
            const fallbackResults = mapsService.getFallbackStores(fallbackLocation);
            setPlaceSearchResults(fallbackResults);
          } finally {
            setIsSearchingPlaces(false);
          }
        };
        fetchNearbyStores();
      }
    }
  }, [showMapModal, cart, products]);

  const renderMapModal = () => (
    showMapModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl h-[85vh] mx-4 overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-blue-500" size={28} />
              Find Stores & Products
            </h2>
            <button
              onClick={() => setShowMapModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Enhanced Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for products, stores, or locations..."
                  value={placeSearchQuery}
                  onChange={(e) => {
                    setPlaceSearchQuery(e.target.value);
                    // Auto-search after user stops typing for 500ms
                    if (autoSearchTimeout.current) {
                      clearTimeout(autoSearchTimeout.current);
                    }
                    autoSearchTimeout.current = setTimeout(() => {
                      if (e.target.value.trim()) {
                        handlePlaceSearch();
                      }
                    }, 500);
                  }}
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                onClick={handlePlaceSearch}
                disabled={isSearchingPlaces}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSearchingPlaces ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Quick Search Suggestions */}
            {cart.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quick search:</span>
                {cart.slice(0, 3).map(cartItem => {
                  const product = products.find(p => p.id === cartItem.productId);
                  return product ? (
                    <button
                      key={product.id}
                      onClick={() => {
                        setPlaceSearchQuery(product.name);
                        handlePlaceSearch();
                      }}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {product.name}
                    </button>
                  ) : null;
                })}
                <button
                  onClick={() => {
                    setPlaceSearchQuery('electronics store');
                    handlePlaceSearch();
                  }}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  Electronics Stores
                </button>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Map Section */}
            <div className="flex-1 relative">
              {isSearchingPlaces && (
                <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-90 flex items-center justify-center z-10">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600 dark:text-gray-300">Finding stores and products...</p>
                  </div>
                </div>
              )}

              {(placeSearchResults.length > 0 ? placeSearchResults : nearbyStores).length > 0 ? (
                <iframe
                  title="Nearby Stores Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={getMapsService('AIzaSyDsxELRYuY9ozjzZ1wxbbe_1WiWqcDhzXY').getEmbedMapUrl(placeSearchResults.length > 0 ? placeSearchResults : nearbyStores)}
                  allowFullScreen
                  className="rounded-lg"
                />
              ) : !isSearchingPlaces ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-4 text-gray-400" size={64} />
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">No stores found</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Try searching for products or store types</p>
                    <button
                      onClick={() => {
                        setPlaceSearchQuery('electronics store');
                        handlePlaceSearch();
                      }}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Search Electronics Stores
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Results Sidebar */}
            {placeSearchResults.length > 0 && (
              <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500" size={16} />
                    Search Results ({placeSearchResults.length})
                  </h3>
                  <div className="space-y-3">
                    {placeSearchResults.slice(0, 10).map((store, index) => (
                      <motion.div
                        key={store.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                            {store.name}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {store.distance.toFixed(1)} mi
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {store.address}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-400" size={12} />
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {store.rating > 0 ? store.rating.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const mapsService = getMapsService('AIzaSyDsxELRYuY9ozjzZ1wxbbe_1WiWqcDhzXY');
                              window.open(mapsService.getDirectionsUrl(store), '_blank');
                            }}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Directions
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  );

  // 3D Background Component (removed due to missing dependencies)


  // Enhanced Landing Page with professional design and 3D animation
  const renderLandingPage = () => (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with cycling images */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBackground}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <img
              src={unsplashBackgrounds[currentBackground]}
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Creative Floating Elements */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {/* Animated geometric shapes */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-sm"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-green-400/30 to-blue-500/30 rounded-lg blur-sm"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 15, repeat: Infinity, ease: "linear" }
          }}
          className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-sm"
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-white/40 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}

        {/* Code-like floating elements */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-32 right-10 text-white/60 text-sm font-mono"
        >
          {'{ code }'}
        </motion.div>
        <motion.div
          animate={{
            x: [0, -15, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-32 left-10 text-white/60 text-sm font-mono"
        >
          {'<build />'}
        </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 flex flex-col items-center min-h-screen text-center">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mb-4 self-start bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>

        {/* Hero Section with enhanced animations */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
          >
            Build Your
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              {' Future'}
            </motion.span>
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl drop-shadow-lg"
        >
          Explore innovative software and science projects. Learn, create, and innovate with AI guidance and expert tutorials.
        </motion.p>

        {/* Enhanced Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col md:flex-row gap-6 mb-8"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              rotateX: 5,
              rotateY: 5,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('software')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-lg font-semibold border border-blue-500/20"
            style={{ transformStyle: 'preserve-3d' }}
          >
            🚀 Software Projects
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
              rotateX: 5,
              rotateY: -5,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('science')}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 text-lg font-semibold border border-green-500/20"
            style={{ transformStyle: 'preserve-3d' }}
          >
            🔬 Science Projects
          </motion.button>
        </motion.div>

        {/* Enhanced Utility Buttons */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1 }}
  className="flex items-center gap-4 justify-center"
>
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => setShowStoreModal(true)}
    className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
  >
    <ShoppingCart size={24} />
  </motion.button>
</motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-white">25+</div>
            <div className="text-blue-100">Projects</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="text-3xl mb-2">🤖</div>
            <div className="text-2xl font-bold text-white">AI</div>
            <div className="text-blue-100">Powered</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-white">Learn</div>
            <div className="text-blue-100">By Doing</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  // Enhanced Projects View
  const renderProjectsView = (type: 'software' | 'science', color: string) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('landing')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {type.charAt(0).toUpperCase() + type.slice(1)} Projects
            </h1>
          </div>
<div className="flex gap-4">
  <button 
    onClick={() => setShowStoreModal(true)}
    className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900 text-${color}-600 dark:text-${color}-400`}
  >
    <ShoppingCart size={20} />
  </button>
</div>
        </div>
        
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
            >
              <option>All Difficulties</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
<div className="relative flex-1">
  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-400 pointer-events-none select-none">
    <Search size={18} />
    <span className="text-sm lowercase">search here</span>
  </div>
  <input
    type="text"
    placeholder=" "
    value={projectSearchQuery}
    onChange={(e) => setProjectSearchQuery(e.target.value)}
    className="w-full pl-20 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
  />
  {projectSearchQuery && (
    <button
      type="button"
      onClick={() => setProjectSearchQuery('')}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
      aria-label="Clear search"
    >
      <X size={20} />
    </button>
  )}
</div>

            <button
              onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                showFavouritesOnly
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Star
                size={20}
                className={showFavouritesOnly ? 'fill-current' : ''}
              />
              {showFavouritesOnly ? 'Show All' : 'Favourites'} ({favourites.length})
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ perspective: '1000px' }}>
          {getFilteredProjects(type).map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer transform-gpu transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => {
                setPreviousView(view as 'landing' | 'software' | 'science');
                setSelectedProject(project);
                setView('project-detail');
                // Initialize chat with welcome message
                const initialMessage: ChatMessage = {
                  role: 'assistant',
                  content: `Hi! I'm here to help you with your ${project.title} project. I can assist you with planning, coding, debugging, and answering any questions you have. What would you like to know?`,
                  timestamp: new Date()
                };
                setChatMessages([initialMessage]);
                setSidebarTab('chat');
              }}
            >
              <div className="overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {project.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="flex justify-between items-center mb-4">
              <span className={`text-sm px-3 py-1 rounded-full ${
                project.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {project.difficulty}
              </span>
              <div className="flex gap-2">
                {project.skills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {project.skills.length > 2 && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">+{project.skills.length - 2}</span>}
              </div>
            </div>
            {/* Project progress tracking */}
            <div className="mb-4">
              <label htmlFor={`progress-${project.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Progress: {project.progress}%
              </label>
              <progress
                id={`progress-${project.id}`}
                value={project.progress}
                max={100}
                className="w-full h-4 rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(project.id);
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isFavourite(project.id)
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={isFavourite(project.id) ? 'Remove from favourites' : 'Add to favourites'}
              >
                <Star
                  size={16}
                  className={isFavourite(project.id) ? 'fill-current' : ''}
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject(project);
                  setShowLearningModeModal(true);
                }}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                Start Learning
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject(project);
                  setShowStoreModal(true);
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>
            </div>
          ))}
        </div>
        {getFilteredProjects(type).length === 0 && (
          <div className="text-center py-16">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-xl text-gray-600 dark:text-gray-300">No projects found</p>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSoftwareProjects = () => renderProjectsView('software', 'blue');

  const renderScienceProjects = () => renderProjectsView('science', 'green');

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setToast({
        message: `${newFiles.length} file(s) uploaded successfully!`,
        type: 'success'
      });
    }
  };

  // Save current chat to history
  const saveChatToHistory = (clearCurrent = false) => {
    if (chatMessages.length > 1) { // Only save if there's more than just the initial message
      const chatToSave = [...chatMessages];
      const existingIndex = chatHistory.findIndex(chat =>
        chat.length === chatToSave.length &&
        chat[0]?.content === chatToSave[0]?.content
      );

      if (existingIndex === -1) { // Only save if not already in history
        setChatHistory(prev => [...prev, chatToSave]);
        setToast({
          message: 'Chat saved to history!',
          type: 'success',
          // Auto-dismiss toast after 3 seconds
          duration: 3000
        });
      } else {
        // Show message when chat already exists
        setToast({
          message: 'This chat is already saved in history.',
          type: 'error',
          duration: 3000
        });
      }

      if (clearCurrent) {
        setChatMessages([]);
      }
    } else {
      // No message shown when there's nothing to save
    }
  };

  // Auto-save chat when navigating away
  const handleBackNavigation = () => {
    saveChatToHistory(true); // Save and clear current chat
    setView(previousView);
  };

  // Load chat from history
  const loadChatFromHistory = (index: number) => {
    setChatMessages([...chatHistory[index]]);
    setSidebarTab('chat');
  };

  // Delete chat from history
  const deleteChatFromHistory = (index: number) => {
    setChatHistory(prev => prev.filter((_, i) => i !== index));
    setToast({
      message: 'Chat deleted from history!',
      type: 'success'
    });
  };

  // Project Detail View with Sidebar
  // Handler for clicking a component to search stores
const handleComponentClick = async (componentName: string) => {
  setIsLoadingStores(true);
  setStoreSearchResults([]);
  try {
    const searchResults = await productSearchService.searchProducts(componentName);
    setStoreSearchResults([{ component: componentName, stores: searchResults }]);
    setShowStoreModal(true);
  } catch (error) {
    console.error('Error fetching store details:', error);
    alert('Failed to fetch store details. Please try again later.');
  } finally {
    setIsLoadingStores(false);
  }
};

  const renderProjectDetail = () => {
    // Debug: log current selectedProject to help trace null-property errors
    try {
      // Keep logs concise for production debugging; remove after issue is resolved
      // eslint-disable-next-line no-console
      console.log('renderProjectDetail — selectedProject:', selectedProject);
    } catch (e) {
      // ignore logging errors
    }
    if (!selectedProject) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No project selected</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please select a project to view its details.</p>
            <button
              onClick={() => setView(previousView)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedProject.title}
            </h1>
          </div>
        </div>
          
          {/* Main content with sidebar */}
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="w-2/5">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-5">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-sm"
                  />
                  <motion.div
                    animate={{
                      rotate: -360,
                      scale: [1.2, 1, 1.2],
                    }}
                    transition={{
                      rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                      scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg blur-sm"
                  />
                </div>

                {/* Project Image with Enhanced Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative mb-6"
                >
                  <motion.img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Floating badges on image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="absolute top-4 left-4"
                  >
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedProject?.difficulty === 'Beginner' ? 'bg-green-500 text-white' :
                      selectedProject?.difficulty === 'Intermediate' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    } shadow-lg`}>
                      {selectedProject?.difficulty}
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="absolute top-4 right-4 flex gap-2"
                  >
                    {isFavourite(selectedProject?.id || '') && (
                      <div className="bg-red-500 text-white p-1 rounded-full shadow-lg">
                        <Star size={12} className="fill-current" />
                      </div>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-lg">
                      {selectedProject?.category}
                    </span>
                  </motion.div>
                </motion.div>

                {/* Enhanced Description with Animation */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
                >
                  {selectedProject.description}
                </motion.p>

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
                      selectedProject?.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                      selectedProject?.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {selectedProject?.difficulty}
                    </span>
                  </div>
                </div>
                
                {/* Tutorials */}
                {selectedProject.content?.tutorials && (
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

                {/* Components List for Science Projects */}
                {selectedProject && selectedProject.type === 'science' && selectedProject.content?.components && selectedProject.content.components.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Components</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {selectedProject.content.components.map((component, index) => (
                        <button
                          key={index}
                          onClick={() => handleComponentClick(component)}
                          className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
                          title={`Find stores selling ${component}`}
                        >
                          {component}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={async () => {
                        if (!selectedProject.content?.components) return;
                        setIsLoadingStores(true);
                        setStoreSearchResults([]);
                        try {
                          const results = [];
                          for (const component of selectedProject.content.components) {
                            const searchResults = await productSearchService.searchProducts(component);
                            results.push({ component, stores: searchResults });
                          }
                          setStoreSearchResults(results);
                          setShowStoreModal(true);
                        } catch (error) {
                          console.error('Error fetching store details:', error);
                          alert('Failed to fetch store details. Please try again later.');
                        } finally {
                          setIsLoadingStores(false);
                        }
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      title="Find stores selling all components"
                    >
                      {isLoadingStores ? 'Loading...' : 'Buy Components'}
                    </button>

                    {showStoreModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
                          <button
                            onClick={() => setShowStoreModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                            aria-label="Close"
                          >
                            ✕
                          </button>
                          <h2 className="text-2xl font-bold mb-4">Stores Selling Components</h2>
                          {storeSearchResults.length === 0 && <p>No store data available.</p>}
                          {storeSearchResults.map(({ component, stores }, idx) => (
                            <div key={idx} className="mb-6">
                              <h3 className="text-xl font-semibold mb-2">{component}</h3>
                              {stores.length === 0 ? (
                                <p>No stores found for this component.</p>
                              ) : (
                                <ul className="list-disc list-inside space-y-2 max-h-48 overflow-y-auto">
                                  {stores.map((store, sidx) => (
                                    <li key={sidx} className="border-b border-gray-200 pb-2">
                                      <a href={store.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {store.title}
                                      </a>
                                      <p className="text-sm text-gray-600">{store.snippet}</p>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress */}
                <div className="mt-6">
                  <label htmlFor={`progress-${selectedProject.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Progress: {selectedProject.progress}%
                  </label>
                  <progress
                    id={`progress-${selectedProject.id}`}
                    value={selectedProject.progress}
                    max={100}
                    className="w-full h-4 rounded-lg bg-gray-200 dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-3/5 h-screen bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-y-auto">
              {/* Sidebar Tabs */}
              <div className="flex overflow-x-auto flex-nowrap border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
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

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
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
                          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-60 mt-2 text-right">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {chatbotLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none">
                          <motion.div className="flex space-x-2">
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your question here..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                        disabled={chatbotLoading}
                      />
                      <button
                        type="submit"
                        disabled={chatbotLoading || !chatInput.trim()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Send
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => saveChatToHistory(false)}
                        disabled={chatMessages.length <= 1}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                        title="Save current chat to history"
                      >
                        <Save size={16} />
                        Save Chat
                      </button>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {chatMessages.length - 1} messages • Auto-saves every 4 exchanges
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {sidebarTab === 'history' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Chat History</h3>
                  {chatHistory.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No chat history yet</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {chatHistory.map((chat, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex-1 min-w-0 pr-2">
                            <p
                              className="text-sm text-gray-900 dark:text-white line-clamp-2 break-words"
                              title={chat[0]?.content || 'Empty chat'}
                            >
                              {chat[0]?.content || 'Empty chat'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {chat.length} messages • {chat[chat.length - 1]?.timestamp ? new Date(chat[chat.length - 1].timestamp).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => loadChatFromHistory(index)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                              title="Load this chat"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deleteChatFromHistory(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              title="Delete this chat"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}



              {sidebarTab === 'video' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Video Tutorials</h3>
                  <button
                    onClick={handleWatchVideos}
                    className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Watch Tutorials
                  </button>
                </div>
              )}

              {sidebarTab === 'ideas' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Project Ideas</h3>
                  <input
                    type="text"
                    value={ideasInput}
                    onChange={(e) => setIdeasInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAiFeature('ideas')}
                    placeholder="Describe your interests... (Press Enter to generate)"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => generateAiFeature('ideas')}
                    disabled={aiLoading || !ideasInput.trim()}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {aiLoading ? 'Generating...' : 'Generate Ideas'}
                  </button>
                  <div className="mt-4 space-y-2">
                    {projectIdeas.map((idea, index) => (
                      <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{idea}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sidebarTab === 'code' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Code Helper</h3>
                  <textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAiFeature('code')}
                    placeholder="Describe what you need help with..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 dark:bg-gray-800 dark:text-white h-32 resize-none"
                  />
                  <button
                    onClick={() => generateAiFeature('code')}
                    disabled={aiLoading || !codeInput.trim()}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {aiLoading ? 'Generating...' : 'Get Help'}
                  </button>
                  <div className="mt-4">
                    <pre className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white whitespace-pre-wrap overflow-x-auto">
                      {codeSnippet}
                    </pre>
                  </div>
                </div>
              )}
            {/* Answer and Explanation */}
          

            {sidebarTab === 'notes' && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📒 AI Notes Organizer</h3>

                {/* Input Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAiFeature('notes')}
                    placeholder="Paste your project notes, research, or any content you want to organize..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 dark:bg-gray-700 dark:text-white h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => generateAiFeature('notes')}
                    disabled={aiLoading || !notesInput.trim()}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {aiLoading ? '🧠 Analyzing & Organizing...' : '📝 Organize Notes'}
                  </button>
                </div>

                {/* Organized Notes Display */}
                {projectNotes && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">📋 Organized Study Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        AI has analyzed and structured your content for better learning
                      </p>
                    </div>

                    <div className="p-4 max-h-96 overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div
                          className="text-gray-900 dark:text-white leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: projectNotes
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-blue-900 dark:text-blue-100">$1</h3>')
                              .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-purple-900 dark:text-purple-100">$1</h2>')
                              .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">$1</h1>')
                              .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
                              .replace(/^(\d+)\. (.*$)/gim, '<div class="ml-4">$1. $2</div>')
                              .replace(/\n\n/g, '</p><p class="mb-3">')
                              .replace(/\n/g, '<br/>')
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(projectNotes);
                            setToast({ message: 'Notes copied to clipboard!', type: 'success', duration: 3000 });
                          }}
                          className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          📋 Copy Notes
                        </button>
                        <button
                          onClick={() => generateAiFeature('notes')}
                          disabled={aiLoading}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm"
                        >
                          🔄 Reorganize
                        </button>
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                        >
                          💾 Share Notes
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!projectNotes && !aiLoading && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📝</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Organize Your Notes?</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Paste your project notes, research, or any content above and let AI organize it into structured, easy-to-study format.
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      ✨ AI will create sections for key concepts, learning objectives, study tips, and more!
                    </div>
                  </div>
                )}
              </div>
            )}

            {sidebarTab === 'planner' && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📅 AI Project Planner</h3>

                {/* Input Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                  <textarea
                    value={planInput}
                    onChange={(e) => setPlanInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAiFeature('plan')}
                    placeholder="Describe your project idea, goals, and any specific requirements..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 dark:bg-gray-700 dark:text-white h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => generateAiFeature('plan')}
                    disabled={aiLoading || !planInput.trim()}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {aiLoading ? '🎯 Creating Detailed Plan...' : '🚀 Generate Project Plan'}
                  </button>
                </div>

                {/* Project Plan Display */}
                {projectPlan.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🎯 Your Project Plan</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        AI-generated comprehensive project roadmap with timelines and resources
                      </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {/* Project Steps */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          📋 Detailed Steps
                        </h5>
                        <div className="space-y-3">
                          {projectPlan.map((step, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white font-medium">{step}</p>
                              </div>
                              <div className="flex-shrink-0">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  title="Mark as completed"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress Tracking */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">📊 Progress Tracking</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Completed Steps</span>
                            <span>{projectPlan.filter((_, idx) => idx < Math.floor(projectPlan.length * (selectedProject?.progress || 0) / 100)).length} / {projectPlan.length}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedProject?.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="p-4">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">⚡ Quick Actions</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <button className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium">
                            📝 Edit Plan
                          </button>
                          <button className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium">
                            ✅ Mark Complete
                          </button>
                          <button className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium">
                            📤 Share Plan
                          </button>
                          <button
                            onClick={() => generateAiFeature('plan')}
                            disabled={aiLoading}
                            className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            🔄 Regenerate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {projectPlan.length === 0 && !aiLoading && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🎯</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Plan Your Project?</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Describe your project idea above and let AI create a comprehensive, step-by-step plan with timelines, materials, and milestones.
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-500 space-y-1">
                      <div>✨ Detailed step-by-step instructions</div>
                      <div>🛠️ Material lists and resource requirements</div>
                      <div>⏰ Time estimates and scheduling</div>
                      <div>🎯 Learning objectives and success criteria</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    );
  };
return (
    <div className="relative">
      {/* Page rendering based on view */}
      {view === 'landing' && renderLandingPage()}
      {view === 'software' && renderSoftwareProjects()}
      {view === 'science' && renderScienceProjects()}
      {view === 'project-detail' && renderProjectDetail()}

      {/* Modals */}
      {renderVideoModal()}
      {renderChatbotModal()}
      {renderStoreModal()}
      {renderMapModal()}
      {renderLearningModeModal()}

      {/* Floating Video Player */}
      {currentPlayingVideo && !showVideoModal && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          style={{
            left: videoPosition.x,
            top: videoPosition.y,
            width: isVideoMinimized ? '320px' : `${videoSize.width}px`,
            height: isVideoMinimized ? '200px' : `${videoSize.height}px`,
            cursor: isDragging ? 'grabbing' : isResizing ? 'nw-resize' : 'grab',
          }}
        >
          {/* Header with drag handle and controls */}
          <div
            className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <Video className="text-red-500" size={16} />
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                {currentPlayingVideo.snippet?.title || 'Video Title'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Size Presets */}
              <div className="flex gap-1 mr-2">
                <button
                  onClick={() => setVideoSizePreset(400, 250)}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                  title="Small (400x250)"
                >
                  S
                </button>
                <button
                  onClick={() => setVideoSizePreset(600, 350)}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                  title="Medium (600x350)"
                >
                  M
                </button>
                <button
                  onClick={() => setVideoSizePreset(800, 450)}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                  title="Large (800x450)"
                >
                  L
                </button>
              </div>

              <button
                onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                title={isVideoMinimized ? 'Maximize' : 'Minimize'}
              >
                {isVideoMinimized ? <Plus size={14} /> : <Minus size={14} />}
              </button>
              <button
                onClick={() => {
                  setCurrentPlayingVideo(null);
                  setIsVideoMinimized(false);
                  setVideoSize({ width: 400, height: 250 });
                }}
                className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Video Player */}
          {!isVideoMinimized && (
            <div className="relative">
              <iframe
                width="100%"
                height={videoSize.height - 50}
                src={youtubeService.getEmbedUrl(currentPlayingVideo.id?.videoId)}
                title={currentPlayingVideo.snippet?.title || 'Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-b-lg"
              />

              {/* Resize Handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize bg-gray-300 dark:bg-gray-600 rounded-tl-lg flex items-end justify-start"
                onMouseDown={handleResizeStart}
              >
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-tl-sm"></div>
              </div>
            </div>
          )}

          {/* Minimized state info */}
          {isVideoMinimized && (
            <div className="p-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {currentPlayingVideo.snippet?.title || 'Video Title'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Click + to expand
              </p>
            </div>
          )}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ProjectBuilder;