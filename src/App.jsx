import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DogProvider } from './context/DogContext'
import { ChatProvider } from './context/ChatContext'
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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DogProvider>
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
              </Routes>
              {/* Dev tools - only renders in development mode */}
              <DevPanel />
            </BrowserRouter>
          </ChatProvider>
        </DogProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
