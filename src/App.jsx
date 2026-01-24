import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DogProvider } from './context/DogContext'
import { ChatProvider } from './context/ChatContext'
import { UsageProvider } from './context/UsageContext'
import { OnboardingProvider } from './context/OnboardingContext'
import ErrorBoundary from './components/ErrorBoundary'
import DevPanel from './components/dev/DevPanel'
import CelebrationToast from './components/feedback/CelebrationToast'

// Eagerly loaded pages (critical path)
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Lazy loaded pages (non-critical)
const AddDogProfile = lazy(() => import('./pages/AddDogProfile'))
const Chat = lazy(() => import('./pages/Chat'))
const PhotoAnalysis = lazy(() => import('./pages/PhotoAnalysis'))
const Settings = lazy(() => import('./pages/Settings'))
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'))
const ToxicChecker = lazy(() => import('./pages/ToxicChecker'))
const EmergencyGuides = lazy(() => import('./pages/EmergencyGuides'))
const BreedInfo = lazy(() => import('./pages/BreedInfo'))
const EmergencyVet = lazy(() => import('./pages/EmergencyVet'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#F4A261]/30 border-t-[#F4A261] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#6B6B6B] text-sm">Loading&hellip;</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DogProvider>
          <UsageProvider>
            <ChatProvider>
              <OnboardingProvider>
              <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
              {/* Dev tools - only renders in development mode */}
              <DevPanel />
              {/* Celebration toast for onboarding milestones */}
              <CelebrationToast />
              </BrowserRouter>
              </OnboardingProvider>
            </ChatProvider>
          </UsageProvider>
        </DogProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
