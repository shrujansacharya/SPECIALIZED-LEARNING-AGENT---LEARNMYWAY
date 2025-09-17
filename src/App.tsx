import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Import the new LandingPage and HomePage components
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import UploadedMaterialsList from './components/UploadedMaterialsList';

import TasksPage from './components/TasksPage';

// All other existing component imports
import QuizPage from './components/QuizPage';
import LearningStyleQuiz from './components/LearningStyleQuiz';
import PuzzlePage from './components/PuzzlePage';
import GamesPage from './components/GamesPage';
import ReadingPage from './components/ReadingPage';
import TeacherDashboard from './components/TeacherDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { ExplorationMode } from './components/ExplorationMode';
import { WhatIfPage } from './components/WhatIfPage';
import StudyGroups from './components/StudyGroups';
import { ProgressMap } from './components/ProgressMap';
import CareerHub from './components/CareerHub';
import ProjectBuilder, { projectTemplates } from './components/ProjectBuilder';
import ProjectDetail from './components/ProjectDetail';
import { ExploreMenu } from './components/ExploreMenu';
import { SubjectsPage } from './components/SubjectsPage';
import { SubjectDetailsPage } from './components/SubjectDetailsPage';
import { BotAI } from './components/BotAI';
import Chatbot from './components/Chatbot';
import AboutPage from './components/AboutPage';
import WelcomeBack from './components/WelcomeBack';

import AuthPage from './components/AuthPage';
import AuthWrapper from './components/AuthWrapper';
import AccountDetails from './components/AccountDetails';
import VerifyEmail from './components/VerifyEmail';

// Import the new challenge components
import GrammarChallenge from './components/GrammarChallenge';

import PronunciationChallenge from './components/PronunciationChallenge';
import WritingChallenge from './components/WritingChallenge';
import { DailyQuiz } from './components/DailyQuiz';

import CasualConversationPage from './components/CasualConversationPage';
import GuidedPracticePage from './components/GuidedPracticePage';
import ReadingChallenge from './components/ReadingChallenge';
import ListeningComprehensionChallenge from './components/ListeningComprehensionChallenge';
import { SpeakingPage } from './components/SpeakingPage';

import './styles/App.css'; // Keep existing styles

const App: React.FC = () => {
  // Removed darkMode and notifications state/functions from App.tsx
  // as they are now handled in LandingPage/HomePage for their respective UIs.
  // If app-wide state is needed, consider a React Context or global state management solution.

  return (
    <>
      <Routes>
        {/* Route for the initial Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Route for the new Home Page (after clicking 'Get Started') */}
        <Route path="/home" element={<HomePage />} />

        {/* Existing routes remain as they were */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Routes - AuthWrapper remains the same */}
        <Route element={<AuthWrapper />}>
          <Route path="/welcome-back" element={<WelcomeBack />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/quiz" element={<LearningStyleQuiz />} />
          <Route path="/quizpage" element={<QuizPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/puzzle" element={<PuzzlePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/explore-menu" element={<ExploreMenu />} />
          <Route path="/explore" element={<ExplorationMode />} />
          <Route path="/what-if" element={<WhatIfPage />} />
          <Route path="/groups" element={<StudyGroups />} />
          <Route path="/progress" element={<ProgressMap />} />
          <Route path="/careers" element={<CareerHub />} />
          <Route path="/project-builder" element={<ProjectBuilder />} />
          <Route path="/create" element={<ProjectBuilder />} />
          <Route path="/project/:id" element={<ProjectDetail projectTemplates={projectTemplates} />} />
          <Route path="/template/:id" element={<ProjectDetail projectTemplates={projectTemplates} />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:subjectId" element={<SubjectDetailsPage />} />
          <Route path="/subjects/:subjectId/chat" element={<Chatbot />} />
          <Route path="/subjects/chat" element={<Chatbot />} />
          <Route path="/botai" element={<BotAI />} />
          <Route path="/account" element={<AccountDetails />} />
          <Route path="/reading-challenge" element={<ReadingChallenge />} />

          {/* New routes for challenge components */}
    
          <Route path="/grammar" element={<GrammarChallenge />} />
        
          <Route path="/pronunciation" element={<PronunciationChallenge />} />
          <Route path="/writing" element={<WritingChallenge />} />
          <Route path="/daily-quiz" element={<DailyQuiz />} />
          <Route path="/listening" element={<ListeningComprehensionChallenge />} />
          <Route path="/speaking" element={<SpeakingPage />} />

          {/* Added routes for new practice pages */}
          <Route path="/casual" element={<CasualConversationPage />} />
          <Route path="/guided-practice" element={<GuidedPracticePage />} />
        </Route>
        
        {/* Teacher and Parent dashboards are still public routes with their own password protection */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/teacher/uploads" element={<UploadedMaterialsList onBack={() => window.history.back()} />} />

        {/* 404 Page */}
        <Route path="*" element={<div className="p-6 text-center text-2xl text-gray-800 dark:text-white">404: Page Not Found</div>} />
      </Routes>
    </>
  );
};

export default App;