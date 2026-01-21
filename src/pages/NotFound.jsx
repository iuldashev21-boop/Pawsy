import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import PawsyMascot from '../components/mascot/PawsyMascot'

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <PawsyMascot mood="concerned" size={80} />

        <h1
          className="text-6xl font-bold text-[#F4A261] mt-6"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          404
        </h1>

        <h2
          className="text-xl font-bold text-[#3D3D3D] mt-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Page Not Found
        </h2>

        <p className="text-[#6B6B6B] mt-3">
          Oops! Looks like this page wandered off. Let's get you back home.
        </p>

        <Link to="/dashboard">
          <button className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
