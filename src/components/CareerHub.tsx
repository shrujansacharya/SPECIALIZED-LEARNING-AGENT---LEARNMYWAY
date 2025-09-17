// Modified CareerHub.tsx with updated categories and static icons
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from '../store/theme'; // ADDED: Import theme store

/* ─────────────────────────────────────────
   Types
────────────────────────────────────────── */
type Resource = { title: string; url: string };
type Stage = { title: string; summary: string; resources: Resource[] };
type Career = {
  id: string;
  name: string;
  emoji: string;
  category: "Science" | "Commerce" | "Arts" | "General";
  overview: string; // friendly “what this job is”
  funHook: string; // “If you like…” line
  roadmap: Stage[];
  funFacts: string[]; // for popup
  story: string[]; // story mode (short steps)
};

/* ─────────────────────────────────────────
   Dataset – categorized by stream
────────────────────────────────────────── */
const CAREERS: Career[] = [
  // ── Science (10)
  {
    id: "software-engineer",
    name: "Software Developer",
    emoji: "💻",
    category: "Science",
    overview: "Build apps, games, and tools that people use every day.",
    funHook: "Love solving puzzles and making computers do magic? This is for you!",
    roadmap: [
      {
        title: "Programming Basics",
        summary: "Start with Python/JS: variables, loops, logic.",
        resources: [
          { title: "Python for Beginners", url: "https://youtu.be/kqtD5dpn9C8" },
          { title: "JS Crash Course", url: "https://youtu.be/W6NZfCO5SIk" },
        ],
      },
      {
        title: "Web Foundations",
        summary: "HTML/CSS + DOM to make pages come alive.",
        resources: [
          { title: "HTML & CSS in 1 Video", url: "https://youtu.be/mU6anWqZJcc" },
        ],
      },
      {
        title: "Build Mini Projects",
        summary: "To-do app, quiz game, drawing app.",
        resources: [
          { title: "10 JS Projects", url: "https://youtu.be/3PHXvlpOkf4" },
        ],
      },
    ],
    funFacts: [
      "The first computer programmer was Ada Lovelace in the 1800s!",
      "‘Bug’ in code came from a real moth found in a computer.",
    ],
    story: [
      "You spot a problem at school: homework reminders are messy.",
      "You design a tiny app with colorful buttons.",
      "Friends love it—boom, you just helped your class with code!",
    ],
  },
  {
    id: "data-scientist",
    name: "Data Scientist / AI",
    emoji: "🧠",
    category: "Science",
    overview: "Find patterns in data and build smart systems that predict.",
    funHook: "Enjoy spotting patterns and making smart guesses? You’ll love AI!",
    roadmap: [
      {
        title: "Python & Math",
        summary: "Basics of Python, stats & probability.",
        resources: [
          { title: "Python Crash Course", url: "https://youtu.be/rfscVS0vtbw" },
          { title: "Stats for Beginners", url: "https://youtu.be/Vfo5le26IhY" },
        ],
      },
      {
        title: "Data Tools",
        summary: "Use pandas/NumPy to clean and explore data.",
        resources: [
          { title: "pandas Tutorial", url: "https://youtu.be/vmEHCJofslg" },
        ],
      },
      {
        title: "Intro to ML",
        summary: "Simple models: regression, classification.",
        resources: [
          { title: "ML Crash Course", url: "https://youtu.be/GwIo3gDZCVQ" },
        ],
      },
    ],
    funFacts: [
      "Recommendation engines help you find videos and songs you’ll like.",
      "AI can recognize handwritten digits almost perfectly!",
    ],
    story: [
      "You collect class test scores.",
      "You chart them and find tricky chapters.",
      "You suggest a study plan—test scores improve!",
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    emoji: "🛡️",
    category: "Science",
    overview: "Keep people safe online and stop hackers.",
    funHook: "Like solving mysteries and catching sneaky tricks? Be a cyber-hero!",
    roadmap: [
      {
        title: "Computer & Web Basics",
        summary: "How the internet works: IP, DNS, HTTP.",
        resources: [
          { title: "Networking Basics", url: "https://youtu.be/qiQR5rTSshw" },
        ],
      },
      {
        title: "Security 101",
        summary: "Passwords, encryption, common attacks.",
        resources: [
          { title: "Cybersecurity 101", url: "https://youtu.be/inWWhr5tnEA" },
        ],
      },
      {
        title: "Practice Safe Web",
        summary: "Phishing awareness & safe browsing.",
        resources: [
          { title: "OWASP Intro", url: "https://youtu.be/Xm4BObh4MhI" },
        ],
      },
    ],
    funFacts: [
      "The strongest passwords are long phrases!",
      "Hackers often trick people, not just computers.",
    ],
    story: [
      "A fake link tries to steal your friend’s account.",
      "You spot it and warn everyone.",
      "The class stays safe—hero unlocked!",
    ],
  },
  {
    id: "robotics",
    name: "Robotics Engineer",
    emoji: "🤖🦾",
    category: "Science",
    overview: "Build real moving machines using code, electronics, and mechanics.",
    funHook: "Love tinkering and making things move? Robots await you!",
    roadmap: [
      {
        title: "Electronics & Sensors",
        summary: "Circuits, microcontrollers, safe handling.",
        resources: [
          { title: "Arduino Basics", url: "https://youtu.be/zJ-LqeX_fLU" },
        ],
      },
      {
        title: "First Robot",
        summary: "Line follower / obstacle avoider.",
        resources: [
          { title: "Line Follower", url: "https://youtu.be/_-x0cR4eS98" },
        ],
      },
      {
        title: "Control & Code",
        summary: "PID basics, sensors fusion (kid-level).",
        resources: [
          { title: "Robotics Intro", url: "https://youtu.be/0R5NQw9s1-0" },
        ],
      },
    ],
    funFacts: [
      "Mars rovers are robots exploring another planet!",
      "Robots use sensors like our eyes and ears (cameras & mics).",
    ],
    story: [
      "You attach wheels, a sensor, and upload code.",
      "Your robot follows a line like a pro.",
      "You add lights—it dances when it wins!",
    ],
  },
  {
    id: "game-dev",
    name: "Game Developer",
    emoji: "🎮",
    category: "Science",
    overview: "Design rules, characters, and worlds to create fun games.",
    funHook: "Love games and want to build your own levels? Power up!",
    roadmap: [
      {
        title: "Pick an Engine",
        summary: "Unity or Godot for 2D/3D basics.",
        resources: [
          { title: "Unity Beginner", url: "https://youtu.be/IlKaB1etrik" },
        ],
      },
      {
        title: "Make a Simple Game",
        summary: "Endless runner or platformer.",
        resources: [
          { title: "2D Platformer", url: "https://youtu.be/3I5d2rUJ0pE" },
        ],
      },
      {
        title: "Polish & Share",
        summary: "Add sounds, UI and share with friends.",
        resources: [
          { title: "Game Polish Tips", url: "https://youtu.be/6OT43pvUyfY" },
        ],
      },
    ],
    funFacts: [
      "First video game ‘Pong’ was made in 1972!",
      "Some games are made by a single person!",
    ],
    story: [
      "You sketch a character on paper.",
      "You make it jump across platforms.",
      "Your friends try to beat your high score!",
    ],
  },
  {
    id: "ar-vr",
    name: "AR / VR Designer",
    emoji: "🕶️",
    category: "Science",
    overview: "Create immersive 3D experiences you can see and touch.",
    funHook: "Like stepping into new worlds? Build your own in AR/VR!",
    roadmap: [
      {
        title: "Unity 3D Basics",
        summary: "Scenes, cameras, materials.",
        resources: [
          { title: "Unity 3D Crash", url: "https://youtu.be/QZpWZ1x9mS8" },
        ],
      },
      {
        title: "AR Toolkit",
        summary: "Try AR Foundation / WebXR.",
        resources: [
          { title: "AR Foundation Intro", url: "https://youtu.be/4t-7B_Jxv1I" },
        ],
      },
    ],
    funFacts: [
      "AR adds digital items to your real world!",
      "VR tricks your eyes to feel presence in 3D.",
    ],
    story: [
      "You place a virtual rocket on your desk.",
      "It lifts off when you tap it.",
      "Your room becomes a tiny spaceport!",
    ],
  },
  {
    id: "astronomer",
    name: "Space Scientist / Astronomer",
    emoji: "🔭",
    category: "Science",
    overview: "Study stars, planets, and galaxies to unlock space secrets.",
    funHook: "Love stars and asking big questions? Space is calling!",
    roadmap: [
      {
        title: "Space Basics",
        summary: "Solar system, stars, galaxies.",
        resources: [
          { title: "Astronomy Course", url: "https://youtube.com/playlist?list=PL8dPuuaLjXtPAJr1ysd5yGIyiSFuh0mIL" },
        ],
      },
      {
        title: "Observe & Log",
        summary: "Use apps/telescopes, keep a sky journal.",
        resources: [
          { title: "Star Charts", url: "https://youtu.be/c4nV7n1VQmY" },
        ],
      },
    ],
    funFacts: [
      "Stars are so far, we see their past light!",
      "Jupiter could fit 1,300 Earths inside it.",
    ],
    story: [
      "You spot a bright ‘star’—it’s a planet!",
      "You track its path for a week.",
      "You feel like a real space detective.",
    ],
  },
  {
    id: "biotech",
    name: "Biotechnologist",
    emoji: "🧬",
    category: "Science",
    overview: "Use biology + tech to create medicines and solutions.",
    funHook: "Curious about DNA and lab experiments? Biotech is your lab playground!",
    roadmap: [
      {
        title: "Cells & DNA",
        summary: "Basic biology and lab safety.",
        resources: [
          { title: "DNA Basics", url: "https://youtu.be/zwibgNGe4aY" },
        ],
      },
      {
        title: "Simple Experiments",
        summary: "Safe, teacher-supervised demos.",
        resources: [
          { title: "Home Science Ideas", url: "https://youtu.be/zZ5tH5lY0aQ" },
        ],
      },
    ],
    funFacts: [
      "Your body has ~37 trillion cells!",
      "DNA is like a recipe book for life.",
    ],
    story: [
      "You extract DNA from a strawberry (in class!).",
      "You see white strands—wow!",
      "You dream of curing diseases someday.",
    ],
  },
  {
    id: "civil-engineer",
    name: "Civil Engineer",
    emoji: "🏗️",
    category: "Science",
    overview: "Design bridges, roads, and safe buildings.",
    funHook: "Love structure sets and strong builds? Civil engineering fits!",
    roadmap: [
      {
        title: "Physics & Math",
        summary: "Forces, materials, measurements.",
        resources: [
          { title: "Physics Basics", url: "https://youtu.be/7wfYIMyS_dI" },
        ],
      },
      {
        title: "Structures",
        summary: "How bridges stand strong.",
        resources: [
          { title: "Bridge Basics", url: "https://youtu.be/e2U8xF1m0aE" },
        ],
      },
    ],
    funFacts: [
      "Triangles make super strong structures!",
      "Concrete gets stronger for years.",
    ],
    story: [
      "You build a paper bridge model.",
      "You test weights and tweak design.",
      "Your bridge holds the most books!",
    ],
  },
  {
    id: "doctor",
    name: "Doctor",
    emoji: "🩺",
    category: "Science",
    overview: "Keep people healthy and treat illnesses using science.",
    funHook: "Fascinated by the human body and helping others? Doctor path!",
    roadmap: [
      {
        title: "Human Body",
        summary: "Organs, systems, health basics.",
        resources: [
          { title: "Human Body Basics", url: "https://youtu.be/d6N2d-2qX8A" },
        ],
      },
      {
        title: "First Aid",
        summary: "Safety and simple care.",
        resources: [
          { title: "First Aid Basics", url: "https://youtu.be/-e3Vwzj1xJ4" },
        ],
      },
    ],
    funFacts: [
      "Your heart beats ~100,000 times a day!",
      "Bones heal by building new tissue.",
    ],
    story: [
      "You learn basic first aid.",
      "You help a classmate safely.",
      "You inspire others to learn too.",
    ],
  },

  // ── Commerce (7)
  {
    id: "financial-analyst",
    name: "Financial Analyst",
    emoji: "📈",
    category: "Commerce",
    overview: "Study money data to make smart decisions.",
    funHook: "Like charts and planning? Finance is your playground!",
    roadmap: [
      {
        title: "Money Basics",
        summary: "Budget, saving, interest.",
        resources: [
          { title: "Personal Finance 101", url: "https://youtu.be/vS4nR9JAnS4" },
        ],
      },
      {
        title: "Markets Intro",
        summary: "Stocks, funds, risk & reward.",
        resources: [
          { title: "Stock Market Basics", url: "https://youtu.be/p7HKvqRI_Bo" },
        ],
      },
    ],
    funFacts: [
      "Saving early grows with compound interest!",
      "Diversifying reduces risk.",
    ],
    story: [
      "You track your pocket money.",
      "You set a goal and save weekly.",
      "You buy that book—goal achieved!",
    ],
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    emoji: "🚀",
    category: "Commerce",
    overview: "Turn ideas into real products that help people.",
    funHook: "See problems and want to fix them? Start something!",
    roadmap: [
      {
        title: "Find a Problem",
        summary: "Observe & list daily pains.",
        resources: [
          { title: "Find Startup Ideas", url: "httpsyoutu.be/DOtRkz5z4wQ" },
        ],
      },
      {
        title: "Build & Test",
        summary: "Create a simple prototype.",
        resources: [
          { title: "MVP Explained", url: "https://youtu.be/1hHMwLxN6EM" },
        ],
      },
    ],
    funFacts: [
      "Many startups begin as school projects!",
      "Feedback is a free superpower.",
    ],
    story: [
      "You sell a small planner you made.",
      "Friends love it and ask for more.",
      "Hello, young founder!",
    ],
  },
  {
    id: "social-media",
    name: "Social Media Manager",
    emoji: "📱",
    category: "Commerce",
    overview: "Grow brands with posts, reels, and community.",
    funHook: "Love trends and posting creative content? Manage a brand!",
    roadmap: [
      {
        title: "Audience & Story",
        summary: "Who is it for? What do they care about?",
        resources: [
          { title: "Marketing Basics", url: "https://youtu.be/4gWpVnz3eZw" },
        ],
      },
      {
        title: "Plan & Measure",
        summary: "Schedule posts, check results.",
        resources: [
          { title: "Social Tips", url: "https://youtu.be/6x0dYQh6kEw" },
        ],
      },
    ],
    funFacts: [
      "Short videos get the most attention!",
      "Good captions can double engagement.",
    ],
    story: [
      "You run a page for a school event.",
      "Your countdown posts build hype.",
      "It becomes the most crowded event yet!",
    ],
  },
  {
    id: "teacher",
    name: "Teacher",
    emoji: "🧑‍🏫",
    category: "Commerce",
    overview: "Help others understand and grow.",
    funHook: "Love explaining things to friends? Teaching is your superpower!",
    roadmap: [
      {
        title: "Pick a Subject",
        summary: "Choose what you love to explain.",
        resources: [
          { title: "Teaching Tips", url: "https://youtu.be/dp8PhLsUcFE" },
        ],
      },
      {
        title: "Make Simple Lessons",
        summary: "Use examples, stories, and games.",
        resources: [
          { title: "Engaging Lessons", url: "https://youtu.be/36Z3x3DNbFw" },
        ],
      },
    ],
    funFacts: [
      "Teachers learn from students too!",
      "Stories help brains remember better.",
    ],
    story: [
      "You help a friend with fractions.",
      "You draw pizza slices to explain.",
      "They finally get it—victory!",
    ],
  },
  {
    id: "journalist",
    name: "Journalist",
    emoji: "📰",
    category: "Commerce",
    overview: "Find facts, ask questions, share stories with the world.",
    funHook: "Curious and love asking ‘why’? Journalism fits you!",
    roadmap: [
      {
        title: "Find a Story",
        summary: "Observe, interview, take notes.",
        resources: [
          { title: "Journalism Basics", url: "https://youtu.be/3zLXy0gJ_68" },
        ],
      },
      {
        title: "Write Clearly",
        summary: "Headlines, structure, edits.",
        resources: [
          { title: "Writing Tips", url: "https://youtu.be/HJ5r6WikI6U" },
        ],
      },
    ],
    funFacts: [
      "Headlines decide if people read your story!",
      "Good journalists double-check everything.",
    ],
    story: [
      "You notice a new school rule.",
      "You ask teachers and students why.",
      "You publish a fair, helpful article.",
    ],
  },
  {
    id: "lawyer",
    name: "Lawyer",
    emoji: "⚖️",
    category: "Commerce",
    overview: "Understand rules and speak up for fairness.",
    funHook: "Like debates and defending friends? Try law!",
    roadmap: [
      {
        title: "Law & Rights",
        summary: "Basics of rules, rights, duties.",
        resources: [
          { title: "Law 101", url: "https://youtu.be/h3Xxg_YEo_E" },
        ],
      },
      {
        title: "Case Practice",
        summary: "Read simple cases, argue both sides.",
        resources: [
          { title: "Argument Skills", url: "https://youtu.be/9kbiL9kTzdQ" },
        ],
      },
    ],
    funFacts: [
      "Mock trials are role-play courts for students!",
      "Many disputes are solved without court.",
    ],
    story: [
      "Your team argues a mock case.",
      "You listen, then speak clearly.",
      "The judge praises your fairness.",
    ],
  },
  {
    id: "psychologist",
    name: "Psychologist",
    emoji: "🧠",
    category: "Commerce",
    overview: "Study how people think and feel; help them grow.",
    funHook: "Like listening and understanding feelings? Psychology is for you!",
    roadmap: [
      {
        title: "Mind & Behavior",
        summary: "Emotions, habits, memory.",
        resources: [
          { title: "Psychology Intro", url: "https://youtu.be/vo4pMVb0R6M" },
        ],
      },
      {
        title: "Helping Skills",
        summary: "Empathy & active listening.",
        resources: [
          { title: "Active Listening", url: "https://youtu.be/m5L2Z0l_7d0" },
        ],
      },
    ],
    funFacts: [
      "Smiling can make you feel happier!",
      "Brains rewire as you learn—neuroplasticity!",
    ],
    story: [
      "You notice a friend looking down.",
      "You listen and sit with them.",
      "They feel better—you made a difference.",
    ],
  },

  // ── Arts (5)
  {
    id: "graphic-designer",
    name: "Graphic / UI-UX Designer",
    emoji: "🎨",
    category: "Arts",
    overview: "Make apps & posters look beautiful and easy to use.",
    funHook: "Love colors, fonts, and layouts? Design is your canvas!",
    roadmap: [
      {
        title: "Design Basics",
        summary: "Color, typography, spacing.",
        resources: [
          { title: "Design for Beginners", url: "https://youtu.be/_2LLXnUdUIc" },
        ],
      },
      {
        title: "Wireframe to UI",
        summary: "From sketches to Figma mockups.",
        resources: [
          { title: "Figma Tutorial", url: "https://youtu.be/FTFaQWZBqQ8" },
        ],
      },
      {
        title: "Mini Portfolio",
        summary: "3 sample screens or posters.",
        resources: [
          { title: "UI Tips", url: "https://youtu.be/_Hp_dI0DzY4" },
        ],
      },
    ],
    funFacts: [
      "Good design is invisible—it just feels easy.",
      "Color can change how we feel and act!",
    ],
    story: [
      "You redesign your school notice board poster.",
      "More students actually read it!",
      "You start getting mini ‘design gigs’.",
    ],
  },
  {
    id: "animator",
    name: "Animator",
    emoji: "✏️",
    category: "Arts",
    overview: "Bring drawings and characters to life.",
    funHook: "Love cartoons and doodling characters? Animate them!",
    roadmap: [
      {
        title: "Drawing & Motion",
        summary: "Squash & stretch, keyframes.",
        resources: [
          { title: "Animation Basics", url: "https://youtu.be/u7d8u2f4l2o" },
        ],
      },
      {
        title: "2D Tools",
        summary: "Try Pencil2D/Krita keyframes.",
        resources: [
          { title: "Krita Animation", url: "https://youtu.be/oP2G1G5qK7k" },
        ],
      },
    ],
    funFacts: [
      "Early cartoons used flipbooks!",
      "12 basic principles guide most animation.",
    ],
    story: [
      "You draw a bouncing ball.",
      "You add faces and emotion.",
      "Your mini short makes friends laugh!",
    ],
  },
  {
    id: "youtuber",
    name: "YouTuber / Creator",
    emoji: "📹",
    category: "Arts",
    overview: "Teach, entertain, or share stories online.",
    funHook: "Love talking, teaching, or showing cool hacks? Start creating!",
    roadmap: [
      {
        title: "Plan & Script",
        summary: "Pick topics, write simple outlines.",
        resources: [
          { title: "Script Basics", url: "https://youtu.be/Tiy2LONr050" },
        ],
      },
      {
        title: "Shoot & Edit",
        summary: "Phone + CapCut/Resolve.",
        resources: [
          { title: "CapCut Beginner", url: "https://youtu.be/2nF4JtG5MCI" },
        ],
      },
    ],
    funFacts: [
      "Most viral videos started from simple ideas!",
      "Thumbnails are like tiny posters—super important.",
    ],
    story: [
      "You share a fun science trick.",
      "Comments ask for more!",
      "You build a helpful channel for students.",
    ],
  },
  {
    id: "filmmaker",
    name: "Filmmaker / Video Editor",
    emoji: "🎬",
    category: "Arts",
    overview: "Tell stories with camera, light, and cuts.",
    funHook: "Love movies and storytelling? Make your own short films!",
    roadmap: [
      {
        title: "Shots & Angles",
        summary: "Framing, rule of thirds, light.",
        resources: [
          { title: "Cinematography 101", url: "https://youtu.be/7ZvyY0xQ5a0" },
        ],
      },
      {
        title: "Editing Basics",
        summary: "Cutting, transitions, audio.",
        resources: [
          { title: "Resolve Beginner", url: "https://youtu.be/3k3NfW1uY1Q" },
        ],
      },
    ],
    funFacts: [
      "Editing can change the mood of the same shot!",
      "Silent films told stories without words.",
    ],
    story: [
      "You plan a 1-minute story.",
      "You shoot with friends.",
      "You add music—instant cinema!",
    ],
  },
  {
    id: "digital-artist",
    name: "Digital Artist / Illustrator",
    emoji: "🖌️",
    category: "Arts",
    overview: "Create characters, posters, and book art digitally.",
    funHook: "Love drawing and coloring? Go digital and level up!",
    roadmap: [
      {
        title: "Drawing Fundamentals",
        summary: "Shapes, proportions, shading.",
        resources: [
          { title: "Beginner Drawing", url: "https://youtu.be/7TXEZ4tP06c" },
        ],
      },
      {
        title: "Paint & Layers",
        summary: "Krita/Procreate basics.",
        resources: [
          { title: "Krita Basics", url: "https://youtu.be/hK-pq9QKc6M" },
        ],
      },
    ],
    funFacts: [
      "Layers let you fix mistakes easily!",
      "Concept artists draw worlds before movies are made.",
    ],
    story: [
      "You sketch a hero.",
      "You color it with glow effects.",
      "Your sticker pack becomes class-famous!",
    ],
  },
  {
    id: "architect",
    name: "Architect",
    emoji: "🏛️",
    category: "Arts",
    overview: "Plan spaces that are safe, useful, and beautiful.",
    funHook: "Love sketching houses and rooms? Become an architect!",
    roadmap: [
      {
        title: "Sketch & Space",
        summary: "Perspective, scale, simple models.",
        resources: [
          { title: "Perspective Drawing", url: "https://youtu.be/pG2d8GkH-FA" },
        ],
      },
      {
        title: "CAD Basics",
        summary: "2D/3D tools like SketchUp.",
        resources: [
          { title: "SketchUp Beginner", url: "https://youtu.be/gsfH_cyXa1o" },
        ],
      },
    ],
    funFacts: [
      "Tiny homes can feel big with clever design!",
      "Natural light changes how spaces feel.",
    ],
    story: [
      "You plan a reading corner.",
      "You add sunlight and plants.",
      "It becomes everyone’s favorite spot.",
    ],
  },

  // ── General (4)
  {
    id: "athlete",
    name: "Athlete",
    emoji: "🏅",
    category: "General",
    overview: "Train body and mind to perform your best.",
    funHook: "Love movement, competition, and teamwork? Go pro athlete!",
    roadmap: [
      {
        title: "Fitness Basics",
        summary: "Warm-ups, stamina, strength.",
        resources: [
          { title: "Beginner Workout", url: "https://youtu.be/UItWltVZZmE" },
        ],
      },
      {
        title: "Game Strategy",
        summary: "Rules, tactics, teamwork.",
        resources: [
          { title: "Strategy Basics", url: "https://youtu.be/2E_4YI2bKzU" },
        ],
      },
    ],
    funFacts: [
      "Sleep is a secret superpower for athletes.",
      "Even pros practice basic drills daily.",
    ],
    story: [
      "You practice a new move daily.",
      "Your coach spots your progress.",
      "You score the winning point!",
    ],
  },
  {
    id: "fitness",
    name: "Fitness Trainer / Nutrition",
    emoji: "🥗",
    category: "General",
    overview: "Help people exercise safely and eat well.",
    funHook: "Love guiding friends to be healthy? Be a trainer!",
    roadmap: [
      {
        title: "Food & Body",
        summary: "Basics of nutrition, hydration.",
        resources: [
          { title: "Nutrition Basics", url: "https://youtu.be/yeu5xJnzopY" },
        ],
      },
      {
        title: "Simple Routines",
        summary: "Beginner-friendly workout plans.",
        resources: [
          { title: "Home Workout Plan", url: "https://youtu.be/2pLT-olgUJs" },
        ],
      },
    ],
    funFacts: [
      "Muscles rebuild stronger while you rest!",
      "Water helps your brain and body work better.",
    ],
    story: [
      "You design a safe beginner plan.",
      "Your friend sticks to it for 2 weeks.",
      "They feel more energetic every day!",
    ],
  },
  {
    id: "chef",
    name: "Chef",
    emoji: "👨‍🍳",
    category: "General",
    overview: "Create tasty dishes and smiles.",
    funHook: "Love flavors and plating food like art? Chef time!",
    roadmap: [
      {
        title: "Kitchen Basics",
        summary: "Tools, safety, hygiene.",
        resources: [
          { title: "Knife Skills", url: "https://youtu.be/7dVgQpZJZ7s" },
        ],
      },
      {
        title: "Recipes & Plating",
        summary: "Follow recipes, plate beautifully.",
        resources: [
          { title: "Beginner Recipes", url: "https://youtu.be/Hr8lW5vS0g8" },
        ],
      },
    ],
    funFacts: [
      "Smell is a huge part of taste!",
      "Chefs ‘mise en place’—everything in its place.",
    ],
    story: [
      "You try a simple pasta recipe.",
      "You add a colorful garnish.",
      "Everyone asks for seconds!",
    ],
  },
  {
    id: "pilot",
    name: "Pilot",
    emoji: "✈️",
    category: "General",
    overview: "Fly aircraft safely, from small planes to jets.",
    funHook: "Love heights, travel, and precision? Become a pilot!",
    roadmap: [
      {
        title: "Flight Basics",
        summary: "Lift, drag, thrust, control surfaces.",
        resources: [
          { title: "How Planes Fly", url: "https://youtu.be/8i0b7aF1yG8" },
        ],
      },
      {
        title: "Sim & Checklists",
        summary: "Flight sim practice & procedures.",
        resources: [
          { title: "Flight Sim 101", url: "https://youtu.be/0JZ3X3w6x5w" },
        ],
      },
    ],
    funFacts: [
      "Pilots use checklists like pro gamers use keybinds!",
      "Cloud types help predict weather.",
    ],
    story: [
      "You try a flight sim.",
      "You nail a smooth landing.",
      "Future captain vibes unlocked.",
    ],
  },
];

/* ─────────────────────────────────────────
   Categories
────────────────────────────────────────── */
const CATEGORIES = [
  { name: "Science", color: "#e0f2fe", border: "#bae6fd" },
  { name: "Commerce", color: "#fce7f3", border: "#fbcfe8" },
  { name: "Arts", color: "#ede9fe", border: "#ddd6fe" },
  { name: "General", color: "#dcfce7", border: "#bbf7d0" },
] as const;

/* ─────────────────────────────────────────
   Helpers: Flow builder, LS favorites
────────────────────────────────────────── */
function buildFlow(career: Career) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const startId = "start";

  nodes.push({
    id: startId,
    position: { x: 0, y: 120 },
    data: { label: `Start: ${career.emoji} ${career.name}` },
    type: "input",
    sourcePosition: Position.Right,
    style: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
      fontWeight: 700,
      boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
    },
  });

  const colX = (col: number) => 240 * col + 160;
  const rowY = (row: number) => 70 + row * 140;

  career.roadmap.forEach((stage, i) => {
    const id = `${career.id}-${i}`;
    nodes.push({
      id,
      position: { x: colX(i + 1), y: rowY(i % 3) },
      data: { label: stage.title, stage },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
        width: 220,
        fontWeight: 600,
        boxShadow: "0 12px 24px rgba(0,0,0,0.05)",
      },
    });

    edges.push({
      id: `edge-${i}`,
      source: i === 0 ? startId : `${career.id}-${i - 1}`,
      target: id,
      animated: true,
      style: { stroke: "#7c3aed" },
    });
  });

  nodes.push({
    id: "end",
    position: { x: colX(career.roadmap.length + 1), y: 120 },
    data: { label: "Finish 🎉" },
    type: "output",
    targetPosition: Position.Left,
    style: {
      background: "#ecfeff",
      border: "1px solid #bae6fd",
      borderRadius: 12,
      padding: 12,
      fontWeight: 700,
      boxShadow: "0 8px 18px rgba(2,132,199,0.15)",
    },
  });

  if (career.roadmap.length) {
    edges.push({
      id: "edge-end",
      source: `${career.id}-${career.roadmap.length - 1}`,
      target: "end",
      animated: true,
      style: { stroke: "#0ea5e9" },
    });
  }

  return { nodes, edges };
}

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem("favorites-careers") || "[]");
  } catch {
    return [];
  }
}
function saveFavorites(ids: string[]) {
  localStorage.setItem("favorites-careers", JSON.stringify(ids));
}

/* ─────────────────────────────────────────
   Stage Side Panel (resources)
────────────────────────────────────────── */
const StagePanel: React.FC<{
  career: Career;
  stage: Stage | null;
  onClose: () => void;
}> = ({ career, stage, onClose }) => (
  <AnimatePresence>
    {stage && (
      <motion.aside
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          position: "fixed",
          right: 16,
          top: 16,
          bottom: 16,
          width: 340,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: 'blur(8px)',
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          padding: 16,
          zIndex: 50,
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "#fff" }}>
            {career.emoji} {career.name}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "rgba(255,255,255,0.2)",
              padding: "8px 10px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, marginBottom: 12 }}>{career.funHook}</p>

        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6, color: "#fff" }}>{stage.title}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.4 }}>{stage.summary}</div>
        </div>

        <div style={{ fontWeight: 800, marginBottom: 6, color: "#fff" }}>Learning Resources</div>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {stage.resources.map((r, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <a href={r.url} target="_blank" rel="noreferrer" style={{ color: "#93c5fd", textDecoration: "underline" }}>
                {r.title}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          Tip: Mark this step “done” in your notebook to track progress! ✅
        </div>
      </motion.aside>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────
   Fun Facts Popup
────────────────────────────────────────── */
const FunFactsModal: React.FC<{ career: Career; onClose: () => void }> = ({ career, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "grid",
        placeItems: "center",
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        style={{
          width: 520,
          maxWidth: "92vw",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: 'blur(8px)',
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>
            💡 Fun Facts — {career.emoji} {career.name}
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "#fff" }}
          >
            Close
          </button>
        </div>
        <ul style={{ paddingLeft: 18, margin: 0, color: "rgba(255,255,255,0.8)" }}>
          {career.funFacts.map((f, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {f}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ─────────────────────────────────────────
   Story Mode Card
────────────────────────────────────────── */
const StoryModeCard: React.FC<{ career: Career; onClose: () => void }> = ({ career, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 55,
        display: "grid",
        placeItems: "center",
      }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        style={{
          width: 720,
          maxWidth: "96vw",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: 'blur(8px)',
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 18px 36px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 22 }}>{career.emoji}</div>
          <div style={{ fontWeight: 900, color: "#fff" }}>Story Mode — {career.name}</div>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: "#fff" }}
            >
              Close
            </button>
          </div>
        </div>
        <ol style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.8)" }}>
          {career.story.map((step, i) => (
            <li key={i} style={{ marginBottom: 8 }}>{step}</li>
          ))}
        </ol>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ─────────────────────────────────────────
   Main Component
────────────────────────────────────────── */
export default function CareerHubAllInOne(): JSX.Element {
  // ADDED: Theme state from the store
  const { getThemeStyles } = useThemeStore();
  const theme = getThemeStyles();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  // UI state
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]["name"] | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [factsFor, setFactsFor] = useState<Career | null>(null);
  const [storyFor, setStoryFor] = useState<Career | null>(null);

  // ADDED: Get the current background image URL
  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || theme.background;
  
  // Favorites handlers
  const toggleFavorite = (careerId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(careerId) ? prev.filter((id) => id !== careerId) : [...prev, careerId];
      saveFavorites(next);
      return next;
    });
  };

  // ADDED: Effect to cycle through dynamic backgrounds
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const backgroundInterval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 8000);
      return () => clearInterval(backgroundInterval);
    }
  }, [theme.backgrounds]);

  // Derived lists
  const filteredByCategory = useMemo(() => {
    const list = selectedCategory ? CAREERS.filter((c) => c.category === selectedCategory) : CAREERS;
    return list.filter((c) => `${c.name} ${c.overview} ${c.funHook}`.toLowerCase().includes(search.toLowerCase()));
  }, [selectedCategory, search]);

  // Flow graph for selected career
  const flow = useMemo(() => (selectedCareer ? buildFlow(selectedCareer) : { nodes: [] as Node[], edges: [] as Edge[] }), [selectedCareer]);
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  useEffect(() => {
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [flow.nodes, flow.edges, setNodes, setEdges]);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);
  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (node.data?.stage) setSelectedStage(node.data.stage as Stage);
  }, []);

  // Category chips
  const CategoryChips = () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {CATEGORIES.map((cat) => {
        const active = selectedCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(active ? null : cat.name)}
            style={{
              background: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
              // Removed border
              padding: "8px 12px",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 700,
              color: "#1a202c",
            }}
          >
            {cat.name}
          </button>
        );
      })}
      <button
        onClick={() => setSelectedCategory(null)}
        style={{
          background: "rgba(255,255,255,0.7)",
          // Removed border
          padding: "8px 12px",
          borderRadius: 999,
          cursor: "pointer",
          fontWeight: 700,
          color: "#4a5568",
        }}
      >
        Show All
      </button>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
        position: 'relative',
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 1,
        }}
      />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px", position: "relative", zIndex: 2 }}>
        {/* Header */}
        <header style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          {selectedCareer && (
            <button
              onClick={() => {
                setSelectedCareer(null);
                setSelectedStage(null);
              }}
              style={{
                background: "rgba(255,255,255,0.7)", // Adjusted for transparency
                backdropFilter: 'blur(4px)',
                // Removed border
                borderRadius: 12,
                padding: "10px 12px",
                cursor: "pointer",
                fontWeight: 700,
                color: "#4a5568",
              }}
            >
              ⬅ Back to Careers
            </button>
          )}
          <h1 style={{ margin: 0, fontWeight: 900, color: "#fff", textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '2.5rem', lineHeight: '1.2em' }}>
            <span style={{ background: 'linear-gradient(90deg, #6a82fb, #fc5c7d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Career Hub</span> <span style={{ color: '#fff' }}>for Students</span>
          </h1>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search careers..."
              aria-label="Search careers"
              style={{
                background: "rgba(255,255,255,0.7)", // Adjusted for transparency
                backdropFilter: 'blur(4px)',
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 12,
                padding: "10px 12px",
                minWidth: 240,
                color: "#1a202c",
              }}
            />
          </div>
        </header>

        {/* Categories row */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ marginLeft: "auto" }}>
            <CategoryChips />
          </div>
        </div>

        {/* Favorites quick row */}
        {favorites.length > 0 && !selectedCareer && (
          <div
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: 'blur(8px)',
              borderRadius: 12,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6, color: "#fff" }}>❤️ Your Favorites</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {favorites.map((id) => {
                const c = CAREERS.find((x) => x.id === id);
                if (!c) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedCareer(c)}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none", // Removed border
                      borderRadius: 10,
                      padding: "6px 10px",
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    {c.emoji} {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main area: grid or flow */}
        {!selectedCareer ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: 12,
            }}
          >
            {filteredByCategory.map((c) => {
              const fav = favorites.includes(c.id);
              return (
                <motion.div
                  key={c.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: "rgba(0,0,0,0.75)",
                    backdropFilter: 'blur(8px)',
                    border: "none", // Removed border
                    borderRadius: 16,
                    padding: 14,
                    boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 22 }}>{c.emoji}</div>
                    <div style={{ fontWeight: 900, color: "#fff" }}>{c.name}</div>
                    <button
                      onClick={() => toggleFavorite(c.id)}
                      title="Save to favorites"
                      style={{
                        marginLeft: "auto",
                        background: fav ? "#fee2e2" : "rgba(255,255,255,0.2)",
                        border: "none", // Removed border
                        borderRadius: 10,
                        padding: "6px 8px",
                        cursor: "pointer",
                      }}
                    >
                      {fav ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.8)", minHeight: 42 }}>{c.overview}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6 }}>{c.funHook}</div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => setSelectedCareer(c)}
                      style={{
                        background: "#7c3aed",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 10px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      View Roadmap
                    </button>
                    <button
                      onClick={() => setFactsFor(c)}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none", // Removed border
                        borderRadius: 10,
                        padding: "8px 10px",
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      💡 Fun Facts
                    </button>
                    <button
                      onClick={() => setStoryFor(c)}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none", // Removed border
                        borderRadius: 10,
                        padding: "8px 10px",
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      📖 Story
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {filteredByCategory.length === 0 && (
              <div style={{ color: "#fff", textAlign: "center", gridColumn: "1 / -1", textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>No careers match your search.</div>
            )}
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: 12,
              alignItems: "stretch",
            }}
          >
            {/* Flowchart panel (interactive map) */}
            <div
              style={{
                height: "70vh",
                background: "rgba(0,0,0,0.75)",
                backdropFilter: 'blur(8px)',
                border: "none", // Removed border
                borderRadius: 16,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeOrigin={[0.5, 0.5]}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                proOptions={{ hideAttribution: true }}
                style={{ background: "transparent" }}
              >
                <MiniMap pannable zoomable />
                <Controls />
                <Background gap={20} />
              </ReactFlow>
            </div>

            {/* Right info panel with career icon */}
            <div
              style={{
                background: "rgba(0,0,0,0.75)",
                backdropFilter: 'blur(8px)',
                border: "none", // Removed border
                borderRadius: 16,
                padding: 12,
                display: "grid",
                gridTemplateRows: "180px auto auto",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  fontSize: 100,
                  border: "none", // Removed border
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.3)",
                }}
              >
                {selectedCareer.emoji}
              </div>

              <div style={{ color: "#fff", lineHeight: 1.45 }}>
                <div style={{ fontWeight: 800, marginBottom: 4, color: "#fff" }}>Overview</div>
                {selectedCareer.overview}
                <div style={{ marginTop: 6, color: "rgba(255,255,255,0.8)" }}>{selectedCareer.funHook}</div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => toggleFavorite(selectedCareer.id)}
                  style={{
                    background: favorites.includes(selectedCareer.id) ? "#fee2e2" : "rgba(255,255,255,0.2)",
                    border: "none", // Removed border
                    borderRadius: 10,
                    padding: "8px 10px",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  {favorites.includes(selectedCareer.id) ? "❤️ Saved" : "🤍 Save"}
                </button>
                <button
                  onClick={() => setFactsFor(selectedCareer)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none", // Removed border
                    borderRadius: 10,
                    padding: "8px 10px",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  💡 Fun Facts
                </button>
                <button
                  onClick={() => setStoryFor(selectedCareer)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none", // Removed border
                    borderRadius: 10,
                    padding: "8px 10px",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  📖 Story
                </button>
              </div>
            </div>

            {/* Footer hint */}
            <div
              style={{
                gridColumn: "1 / -1",
                background: "rgba(0,0,0,0.75)",
                backdropFilter: 'blur(8px)',
                border: "none", // Removed border
                borderRadius: 12,
                padding: 10,
                color: "#fff",
              }}
            >
              <strong>Hint:</strong> Click a step node to see learning links on the right panel. Use the map controls to zoom and pan.
            </div>
          </div>
        )}
      </div>

      {/* Panels & Modals */}
      {selectedCareer && (
        <StagePanel career={selectedCareer} stage={selectedStage} onClose={() => setSelectedStage(null)} />
      )}
      {factsFor && <FunFactsModal career={factsFor} onClose={() => setFactsFor(null)} />}
      {storyFor && <StoryModeCard career={storyFor} onClose={() => setStoryFor(null)} />}
    </div>
  );
}