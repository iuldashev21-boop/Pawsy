import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DogProvider } from './context/DogContext'
import { ChatProvider } from './context/ChatContext'
import { UsageProvider } from './context/UsageContext'
import { OnboardingProvider } from './context/OnboardingContext'
import { ToastProvider } from './context/ToastContext'
import { UpgradeFlowProvider } from './context/UpgradeFlowContext'
import ErrorBoundary from './components/ErrorBoundary'
import CelebrationToast from './components/feedback/CelebrationToast'

import AppShell from './components/layout/AppShell'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const AddDogProfile = lazy(() => import('./pages/AddDogProfile'))
const Chat = lazy(() => import('./pages/Chat'))
const PhotoAnalysis = lazy(() => import('./pages/PhotoAnalysis'))
const Settings = lazy(() => import('./pages/Settings'))
const ToxicChecker = lazy(() => import('./pages/ToxicChecker'))
const EmergencyGuides = lazy(() => import('./pages/EmergencyGuides'))
const BreedInfo = lazy(() => import('./pages/BreedInfo'))
const EmergencyVet = lazy(() => import('./pages/EmergencyVet'))
const HealthTimeline = lazy(() => import('./pages/HealthTimeline'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const LabAnalysis = lazy(() => import('./pages/LabAnalysis'))
const HealthHub = lazy(() => import('./pages/HealthHub'))
const NotFound = lazy(() => import('./pages/NotFound'))

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
                <ToastProvider>
                  <BrowserRouter>
                    <UpgradeFlowProvider>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* Public routes — no AppShell */}
                          <Route path="/" element={<Landing />} />
                          <Route path="/signup" element={<SignUp />} />
                          <Route path="/login" element={<Login />} />

                          {/* Onboarding — clean, focused (no AppShell) */}
                          <Route path="/add-dog" element={<AddDogProfile />} />

                          {/* Authenticated routes — wrapped in AppShell */}
                          <Route element={<AppShell />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/photo" element={<PhotoAnalysis />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/toxic-checker" element={<ToxicChecker />} />
                            <Route path="/emergency-guides" element={<EmergencyGuides />} />
                            <Route path="/breed-info" element={<BreedInfo />} />
                            <Route path="/emergency-vet" element={<EmergencyVet />} />
                            <Route path="/health-timeline" element={<HealthTimeline />} />
                            <Route path="/alerts" element={<AlertsPage />} />
                            <Route path="/lab-analysis" element={<LabAnalysis />} />
                            <Route path="/health-hub" element={<HealthHub />} />
                          </Route>

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
<CelebrationToast />
                    </UpgradeFlowProvider>
                  </BrowserRouter>
                </ToastProvider>
              </OnboardingProvider>
            </ChatProvider>
          </UsageProvider>
        </DogProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
