import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wrench, X, Minimize2, Maximize2, Database, Zap, Settings,
  User, Dog, MessageSquare, Camera, Trash2, Plus, Eye, EyeOff,
  ChevronDown, CheckCircle, AlertCircle, Rocket
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDog } from '../../context/DogContext'
import { useChat } from '../../context/ChatContext'
import { useNavigate } from 'react-router-dom'
import {
  CHAT_SCENARIOS,
  PHOTO_SCENARIOS,
  ERROR_SCENARIOS,
  isMockModeEnabled,
  getMockScenario,
  getMockDelay,
  setMockMode
} from '../../services/dev/mockResponses'

// Only render in development
const isDev = import.meta.env.DEV

function DevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState('state')

  // Mock mode state
  const [mockEnabled, setMockEnabled] = useState(isMockModeEnabled())
  const [mockScenario, setMockScenarioState] = useState(getMockScenario())
  const [mockDelay, setMockDelayState] = useState(getMockDelay())
  const [scenarioType, setScenarioType] = useState('chat') // 'chat', 'photo', 'error'

  // Context hooks
  const { user, isAuthenticated } = useAuth()
  const { dogs, activeDog } = useDog()
  const { activeSession, sessions } = useChat()
  const navigate = useNavigate()

  // Keyboard shortcut to toggle panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Update mock mode in localStorage
  const handleMockModeChange = (enabled) => {
    setMockEnabled(enabled)
    setMockMode(enabled, mockScenario, mockDelay)
  }

  const handleScenarioChange = (scenario) => {
    setMockScenarioState(scenario)
    setMockMode(mockEnabled, scenario, mockDelay)
  }

  const handleDelayChange = (delay) => {
    setMockDelayState(delay)
    setMockMode(mockEnabled, mockScenario, delay)
  }

  // Get all scenarios based on type
  const getScenarios = () => {
    switch (scenarioType) {
      case 'chat':
        return CHAT_SCENARIOS
      case 'photo':
        return PHOTO_SCENARIOS
      case 'error':
        return ERROR_SCENARIOS
      default:
        return CHAT_SCENARIOS
    }
  }

  // Quick actions
  const clearAllData = () => {
    if (confirm('Clear all Pawsy data? This cannot be undone.')) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('pawsy_'))
      keys.forEach(k => localStorage.removeItem(k))
      window.location.reload()
    }
  }

  const addSampleDog = () => {
    const sampleDog = {
      id: `sample-${Date.now()}`,
      userId: user?.id,
      name: 'Max',
      breed: 'Golden Retriever',
      dateOfBirth: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 years ago
      weight: 65,
      weightUnit: 'lbs',
      allergies: ['Chicken'],
      photoUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const storageKey = `pawsy_${user?.id}_dogs`
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
    existing.push(sampleDog)
    localStorage.setItem(storageKey, JSON.stringify(existing))
    localStorage.setItem(`pawsy_${user?.id}_active_dog`, sampleDog.id)
    window.location.reload()
  }

  const viewLocalStorage = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('pawsy_'))
    const data = {}
    keys.forEach(k => {
      try {
        data[k] = JSON.parse(localStorage.getItem(k))
      } catch {
        data[k] = localStorage.getItem(k)
      }
    })
    console.log('=== Pawsy localStorage ===')
    console.table(Object.keys(data).map(k => ({ key: k, size: JSON.stringify(data[k]).length })))
    console.log('Full data:', data)
    alert('localStorage data logged to console. Open DevTools to view.')
  }

  // Quick setup - skip onboarding with test data
  const quickSetup = () => {
    // Clear any existing data first to avoid conflicts
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('pawsy_'))
    keysToRemove.forEach(k => localStorage.removeItem(k))

    // Create test user
    const testUser = {
      id: crypto.randomUUID(),
      email: 'test@pawsy.dev',
      name: 'Test Developer',
      createdAt: new Date().toISOString()
    }

    // Add to users registry
    const users = {}
    users[testUser.email] = testUser
    localStorage.setItem('pawsy_users', JSON.stringify(users))

    // Set as current user
    localStorage.setItem('pawsy_current_user', JSON.stringify(testUser))

    // Create sample dog
    const sampleDog = {
      id: crypto.randomUUID(),
      userId: testUser.id,
      name: 'Max',
      breed: 'Golden Retriever',
      dateOfBirth: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 65,
      weightUnit: 'lbs',
      allergies: ['Chicken'],
      photoUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const dogsKey = `pawsy_${testUser.id}_dogs`
    const activeDogKey = `pawsy_${testUser.id}_active_dog`

    localStorage.setItem(dogsKey, JSON.stringify([sampleDog]))
    localStorage.setItem(activeDogKey, sampleDog.id)

    // Reload to apply auth state and navigate to dashboard
    window.location.href = '/dashboard'
  }

  if (!isDev) return null

  // Floating trigger button when panel is closed
  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 z-50 w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        title="Open Dev Tools (Ctrl+Shift+D)"
      >
        <Wrench className="w-5 h-5" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed bottom-24 left-4 z-50 w-80 bg-[#1a1a2e] text-white rounded-xl shadow-2xl border border-purple-500/30 overflow-hidden"
      style={{ maxHeight: isMinimized ? '48px' : '70vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-800">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          <span className="text-sm font-semibold">Dev Tools</span>
          {mockEnabled && (
            <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500 text-black rounded font-bold">
              MOCK
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 48px)' }}>
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'state', icon: Database, label: 'State' },
              { id: 'mock', icon: Zap, label: 'Mock' },
              { id: 'actions', icon: Settings, label: 'Actions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {/* State Tab */}
            {activeTab === 'state' && (
              <div className="space-y-3">
                {/* Auth State */}
                <div className="bg-gray-800/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    AUTH
                  </div>
                  <div className="text-sm">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-300">{user?.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-yellow-300">Not logged in</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dog State */}
                <div className="bg-gray-800/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1.5">
                    <Dog className="w-3.5 h-3.5" />
                    DOG ({dogs.length} total)
                  </div>
                  {activeDog ? (
                    <div className="text-sm space-y-1">
                      <div className="text-white font-medium">{activeDog.name}</div>
                      <div className="text-gray-400 text-xs">
                        {activeDog.breed} • {activeDog.weight}{activeDog.weightUnit}
                      </div>
                      {activeDog.allergies?.length > 0 && (
                        <div className="text-yellow-400 text-xs">
                          Allergies: {activeDog.allergies.join(', ')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No active dog</div>
                  )}
                </div>

                {/* Chat State */}
                <div className="bg-gray-800/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    CHAT ({sessions.length} sessions)
                  </div>
                  {activeSession ? (
                    <div className="text-sm space-y-1">
                      <div className="text-white">{activeSession.messages?.length || 0} messages</div>
                      <div className="text-gray-400 text-xs truncate">
                        {activeSession.title || 'Untitled'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No active session</div>
                  )}
                </div>

                {/* Storage Info */}
                <div className="bg-gray-800/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1.5">
                    <Database className="w-3.5 h-3.5" />
                    STORAGE
                  </div>
                  <div className="text-sm text-gray-300">
                    {Object.keys(localStorage).filter(k => k.startsWith('pawsy_')).length} keys
                  </div>
                </div>
              </div>
            )}

            {/* Mock Mode Tab */}
            {activeTab === 'mock' && (
              <div className="space-y-3">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mock Mode</span>
                  <button
                    onClick={() => handleMockModeChange(!mockEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      mockEnabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: mockEnabled ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>

                {mockEnabled && (
                  <>
                    {/* Scenario Type */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Scenario Type</label>
                      <div className="flex gap-1">
                        {['chat', 'photo', 'error'].map(type => (
                          <button
                            key={type}
                            onClick={() => setScenarioType(type)}
                            className={`flex-1 py-1.5 text-xs rounded transition-colors ${
                              scenarioType === type
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scenario Selection */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Scenario</label>
                      <select
                        value={mockScenario}
                        onChange={(e) => handleScenarioChange(e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:border-purple-400 focus:outline-none"
                      >
                        {Object.values(getScenarios()).map(scenario => (
                          <option key={scenario.id} value={scenario.id}>
                            {scenario.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delay */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        Response Delay: {mockDelay}ms
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3000"
                        step="100"
                        value={mockDelay}
                        onChange={(e) => handleDelayChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                        <span>Instant</span>
                        <span>Slow</span>
                      </div>
                    </div>

                    {/* Current Scenario Preview */}
                    <div className="bg-gray-800/50 rounded-lg p-2.5">
                      <div className="text-xs text-gray-400 mb-1">Preview</div>
                      <div className="text-xs text-gray-300 font-mono overflow-x-auto">
                        {JSON.stringify(getScenarios()[Object.keys(getScenarios()).find(
                          k => getScenarios()[k].id === mockScenario
                        )]?.response || {}, null, 2).slice(0, 200)}...
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div className="space-y-2">
                {/* Quick Setup - only show if not authenticated */}
                {!isAuthenticated && (
                  <button
                    onClick={quickSetup}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg"
                  >
                    <Rocket className="w-4 h-4" />
                    Quick Setup (Skip Onboarding)
                  </button>
                )}

                <button
                  onClick={addSampleDog}
                  disabled={!isAuthenticated}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Sample Dog
                </button>

                <button
                  onClick={viewLocalStorage}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View localStorage
                </button>

                <button
                  onClick={clearAllData}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>

                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-[10px] text-gray-500">
                    Keyboard: Ctrl+Shift+D to toggle panel
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default DevPanel
