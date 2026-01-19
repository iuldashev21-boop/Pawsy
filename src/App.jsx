import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DogProvider } from './context/DogContext'
import { ChatProvider } from './context/ChatContext'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import AddDogProfile from './pages/AddDogProfile'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import PhotoAnalysis from './pages/PhotoAnalysis'

function App() {
  return (
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
              {/* Placeholder route - to be implemented */}
              <Route path="/settings" element={<div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center text-2xl text-[#3D3D3D]">Settings - Coming Soon</div>} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </DogProvider>
    </AuthProvider>
  )
}

export default App
