import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RecruiterLoginPage from './pages/RecruiterLoginPage'
import RecruiterRegisterPage from './pages/RecruiterRegisterPage'
import RecruiterDashboardPage from './pages/RecruiterDashboardPage'
import CandidateAccountPage from './pages/CandidateAccountPage'
import CVAnalysisPage from './pages/CVAnalysisPage'
import JobsPage from './pages/JobsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="cview-page-background text-cview-dark min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cv-analysis" element={<CVAnalysisPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/candidate/account" element={<CandidateAccountPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/recruiter/login" element={<RecruiterLoginPage />} />
            <Route path="/recruiter/register" element={<RecruiterRegisterPage />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
