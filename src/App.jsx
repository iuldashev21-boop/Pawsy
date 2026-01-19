import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-dog" element={<div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center text-2xl text-[#3D3D3D]">Add Dog Profile - Coming Soon</div>} />
          <Route path="/dashboard" element={<div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center text-2xl text-[#3D3D3D]">Dashboard - Coming Soon</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
