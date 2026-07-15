import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layouts
import AppLayout from './components/layout/AppLayout'

// Public Pages
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import OTPVerifyPage from './pages/Auth/OTPVerifyPage'
import AuthCallbackPage from './pages/Auth/AuthCallbackPage'

// Protected Pages
import DashboardPage from './pages/Dashboard/DashboardPage'
import ChatPage from './pages/Chat/ChatPage'
import VoicePage from './pages/Voice/VoicePage'
import PronunciationPage from './pages/Pronunciation/PronunciationPage'
import GrammarPage from './pages/Grammar/GrammarPage'
import VocabularyPage from './pages/Vocabulary/VocabularyPage'
import LessonsPage from './pages/Lessons/LessonsPage'
import ChallengesPage from './pages/Challenges/ChallengesPage'
import ScenariosPage from './pages/Scenarios/ScenariosPage'
import MockInterviewPage from './pages/MockInterview/MockInterviewPage'
import QuizzesPage from './pages/Quizzes/QuizzesPage'
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AdminPage from './pages/Admin/AdminPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<OTPVerifyPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected – with layout */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="voice" element={<VoicePage />} />
        <Route path="pronunciation" element={<PronunciationPage />} />
        <Route path="grammar" element={<GrammarPage />} />
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="challenges" element={<ChallengesPage />} />
        <Route path="scenarios" element={<ScenariosPage />} />
        <Route path="mock-interview" element={<MockInterviewPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
