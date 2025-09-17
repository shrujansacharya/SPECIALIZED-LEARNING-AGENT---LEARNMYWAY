// src/utils/subjects.ts
export const subjects = [
  'Math',
  'Biology',
  'History',
  'English',
  'Kannada',
  'Hindi',
  'Physics',
  'Chemistry',
  'Social'
];

export const categories = ['All', 'Academic', 'Coding'];

export const subjectDetails = [
  { 
    id: 'math', 
    name: 'Mathematics', 
    icon: 'Calculator', 
    color: 'from-blue-600 to-blue-800', 
    description: 'Explore numbers through real-world examples', 
    category: 'Academic',
    examples: [
      'Solve: If a car travels 60 miles in 2 hours, what is its average speed?',
      'Find the roots of the quadratic equation x² - 5x + 6 = 0.',
      'Calculate the area of a circle with radius 7 cm.'
    ],
    questionPaperLink: 'https://example.com/question-papers/math.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/math-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/math-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/math-tamilnadu.pdf',
    },
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: 'Flask',
    color: 'from-green-600 to-green-800',
    description: 'Explore life sciences and biological processes',
    category: 'Academic',
    examples: [
      'Describe the structure and function of a cell.',
      'Explain the process of mitosis and meiosis.',
      'What are the main components of DNA?'
    ],
    questionPaperLink: 'https://example.com/question-papers/biology.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/biology-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/biology-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/biology-tamilnadu.pdf',
    },
  },
  { 
    id: 'social', 
    name: 'Social Studies', 
    icon: 'Globe', 
    color: 'from-yellow-600 to-yellow-800', 
    description: 'Learn about our world and its people', 
    category: 'Academic',
    examples: [
      'Describe the main causes of the Industrial Revolution.',
      'Explain the concept of democracy.',
      'Name three major rivers in India and their significance.'
    ],
    questionPaperLink: 'https://example.com/question-papers/social-studies.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/social-studies-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/social-studies-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/social-studies-tamilnadu.pdf',
    },
  },
  { 
    id: 'english', 
    name: 'English', 
    icon: 'Book', 
    color: 'from-purple-600 to-purple-800', 
    description: 'Master the art of communication', 
    category: 'Academic',
    examples: [
      'Write a short paragraph describing your favorite place.',
      'Identify the main theme in the poem "The Road Not Taken."',
      'Correct the sentence: She don’t like to read books.'
    ],
    questionPaperLink: 'https://example.com/question-papers/english.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/english-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/english-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/english-tamilnadu.pdf',
    },
  },
  {
    id: 'kannada',
    name: 'Kannada',
    icon: 'Languages',
    color: 'from-red-600 to-red-800',
    description: 'Learn the beautiful language of Karnataka',
    category: 'Academic',
    examples: [
      'Translate "The sun rises in the east" to Kannada.',
      'Write a sentence using the Kannada word "ನದಿ" (river).',
      'Name three famous Kannada poets.'
    ],
    questionPaperLink: 'https://example.com/question-papers/kannada.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/kannada-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/kannada-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/kannada-tamilnadu.pdf',
    },
  },
  {
    id: 'hindi',
    name: 'Hindi',
    icon: 'Languages',
    color: 'from-pink-600 to-pink-800',
    description: 'Learn the national language of India',
    category: 'Academic',
    examples: [
      'Translate "The sun rises in the east" to Hindi.',
      'Write a sentence using the Hindi word "नदी" (river).',
      'Name three famous Hindi poets.'
    ],
    questionPaperLink: 'https://example.com/question-papers/hindi.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/hindi-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/hindi-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/hindi-tamilnadu.pdf',
    },
  },
  { 
    id: 'physics', 
    name: 'Physics', 
    icon: 'Atom', 
    color: 'from-indigo-600 to-indigo-800', 
    description: 'Understand the fundamental laws of nature', 
    category: 'Academic',
    examples: [
      'Calculate the force needed to accelerate a 5kg object at 2m/s².',
      'Explain Newton’s First Law of Motion with an example.',
      'What is the wavelength of light with a frequency of 5x10¹⁴ Hz?'
    ],
    questionPaperLink: 'https://example.com/question-papers/physics.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/physics-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/physics-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/physics-tamilnadu.pdf',
    },
  },
  { 
    id: 'chemistry', 
    name: 'Chemistry', 
    icon: 'Beaker', 
    color: 'from-teal-600 to-teal-800', 
    description: 'Dive into the world of elements and reactions', 
    category: 'Academic',
    examples: [
      'Balance the chemical equation: H₂ + O₂ → H₂O.',
      'What is the atomic number of Carbon?',
      'Explain the difference between an acid and a base.'
    ],
    questionPaperLink: 'https://example.com/question-papers/chemistry.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/chemistry-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/chemistry-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/chemistry-tamilnadu.pdf',
    },
  },
  { 
    id: 'history', 
    name: 'History', 
    icon: 'Landmark', 
    color: 'from-orange-600 to-orange-800', 
    description: 'Travel through time and uncover the past', 
    category: 'Academic',
    examples: [
      'Discuss the significance of the Magna Carta.',
      'Name the major causes of World War I.',
      'Who was the first Emperor of the Maurya Dynasty?'
    ],
    questionPaperLink: 'https://example.com/question-papers/history.pdf',
    stateQuestionPapers: {
      Karnataka: 'https://example.com/question-papers/history-karnataka.pdf',
      Maharashtra: 'https://example.com/question-papers/history-maharashtra.pdf',
      'Tamil Nadu': 'https://example.com/question-papers/history-tamilnadu.pdf',
    },
  },

];