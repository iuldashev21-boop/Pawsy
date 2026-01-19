import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DogProvider } from './context/DogContext'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import AddDogProfile from './pages/AddDogProfile'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <AuthProvider>
      <DogProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/add-dog" element={<AddDogProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Placeholder routes for BottomNav - to be implemented */}
            <Route path="/chat" element={<div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center text-2xl text-[#3D3D3D]">Chat - Coming Soon</div>} />
            <Route path="/photo" element={<div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center text-2xl text-[#3D3D3D]">Photo Analysis - Coming Soon</div>} />
            <Route path="/settings" element={<div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center text-2xl text-[#3D3D3D]">Settings - Coming Soon</div>} />
          </Routes>
        </BrowserRouter>
      </DogProvider>
    </AuthProvider>
  )
}

export default App
