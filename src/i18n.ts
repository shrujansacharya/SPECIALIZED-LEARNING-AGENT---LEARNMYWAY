import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: { title: 'Owl Buddy' },
      greeting: 'Hey, Super Learner! I’m your wise owl buddy for {{subjectName}}! 🦉 Ready to explore something fun?',
      sidebar: {
        askQuestion: 'Ask a Question',
        exploreVideos: 'Explore Videos',
        myProgress: 'My Progress',
        playLearn: 'Play & Learn',
        quests: 'Quests',
        settings: 'Settings',
      },
      quests: {
        askQuestions: 'Ask {{count}} {{subject}} questions',
        watchVideo: 'Watch an educational video',
        shareFile: 'Share a file or question',
        completed: 'Quest "{{task}}" completed! +{{reward}} Brain Bucks!',
      },
      quickReplies: {
        whatIs: 'What is {{subjectName}}?',
        exampleProblem: 'Give me an example problem',
        keyConcept: 'Explain a key concept',
      },
      messages: {
        startLearning: 'Ask a fun question to start learning! 🚀',
        typing: 'Typing...',
        processing: 'Processing your question...',
        fileUploaded: 'File uploaded: {{fileName}}',
        fileReceived: 'Cool! Got your file "{{fileName}}". We’ll check it out soon! 📚',
        superQuestion: 'Super question! +5 Brain Bucks! 🌟',
      },
      errors: {
        apiError: 'Oops, something went wrong! Try again! 😅',
        generic: 'Yikes! Something broke. Try again? 😕',
        tryAgain: 'Oops, something went wrong! Try again?',
        videoSearch: 'Couldn’t find videos. Try another topic! 😔',
        voiceInput: 'Sorry, I couldn’t hear you. Try again? 🎤',
      },
      rewards: {
        levelUp: 'Level Up! You’re now Level {{level}}! 🏆',
        brainBucks: '+{{amount}} Brain Bucks! 🌟',
        newBadge: 'Wow! You earned the "{{badge}}" badge! 🎉',
        newBadgePopup: 'New Badge: {{badge}}!',
      },
      badges: {
        firstQuestion: 'First Question',
        curiosityChampion: 'Curiosity Champion',
      },
      progress: {
        title: 'My Learning',
        questionsAnswered: 'Questions Answered',
        brainBucks: 'Brain Bucks',
        level: 'Level {{level}}',
        yAxis: 'Questions',
        xAxis: 'Subjects',
      },
      input: {
        placeholder: 'Ask your question... 😄',
        placeholderFullScreen: 'Ask another question... 🌟',
      },
      feedback: {
        title: 'Tell Us What You Think!',
        placeholder: 'Have ideas or issues? Let us know! 😊',
        submit: 'Submit',
        cancel: 'Cancel',
      },
      quiz: {
        title: 'Quiz Time!',
        score: 'Score: {{score}}/{{total}}',
      },
      parentDashboard: {
        title: 'Parent Dashboard',
        // Add translations as needed
      },
      accessibility: {
        language: 'Select language',
        exitFullScreen: 'Exit full screen',
        chatInput: 'Chat input',
        emojiPicker: 'Emoji picker',
        voiceInput: 'Voice input',
        voiceOutput: 'Voice output',
        send: 'Send message',
        feedback: 'Provide feedback',
        feedbackInput: 'Feedback input',
        fullScreenInput: 'Full screen chat input',
      },
    },
  },
  es: {
    translation: {
      app: { title: 'Búho Amigo' },
      greeting: '¡Hola, Súper Aprendiz! Soy tu búho sabio para {{subjectName}}! 🦉 ¿Listo para explorar algo divertido?',
      sidebar: {
        askQuestion: 'Hacer una Pregunta',
        exploreVideos: 'Explorar Videos',
        myProgress: 'Mi Progreso',
        playLearn: 'Jugar y Aprender',
        quests: 'Misiones',
        settings: 'Configuraciones',
      },
      // Add other translations as needed
    },
  },
  hi: {
    translation: {
      app: { title: 'उल्लू दोस्त' },
      greeting: 'नमस्ते, सुपर लर्नर! मैं {{subjectName}} के लिए आपका बुद्धिमान उल्लू दोस्त हूँ! 🦉 कुछ मजेदार खोजने के लिए तैयार हैं?',
      sidebar: {
        askQuestion: 'प्रश्न पूछें',
        exploreVideos: 'वीडियो खोजें',
        myProgress: 'मेरा प्रगति',
        playLearn: 'खेलें और सीखें',
        quests: 'मिशन',
        settings: 'सेटिंग्स',
      },
      // Add other translations as needed
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;