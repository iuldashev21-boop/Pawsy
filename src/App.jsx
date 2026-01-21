import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DogProvider } from './context/DogContext'
import { ChatProvider } from './context/ChatContext'
import { UsageProvider } from './context/UsageContext'
import ErrorBoundary from './components/ErrorBoundary'
import DevPanel from './components/dev/DevPanel'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import AddDogProfile from './pages/AddDogProfile'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import PhotoAnalysis from './pages/PhotoAnalysis'
import Settings from './pages/Settings'
import SymptomChecker from './pages/SymptomChecker'
import ToxicChecker from './pages/ToxicChecker'
import EmergencyGuides from './pages/EmergencyGuides'
import BreedInfo from './pages/BreedInfo'
import EmergencyVet from './pages/EmergencyVet'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DogProvider>
          <UsageProvider>
            <ChatProvider>
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/add-dog" element={<AddDogProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/photo" element={<PhotoAnalysis />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/symptom-checker" element={<SymptomChecker />} />
                <Route path="/toxic-checker" element={<ToxicChecker />} />
                <Route path="/emergency-guides" element={<EmergencyGuides />} />
                <Route path="/breed-info" element={<BreedInfo />} />
                <Route path="/emergency-vet" element={<EmergencyVet />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              {/* Dev tools - only renders in development mode */}
              <DevPanel />
              </BrowserRouter>
            </ChatProvider>
          </UsageProvider>
        </DogProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
