import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft, ChevronDown, Plus, History, Dog, Sparkles,
  AlertCircle, MessageCircle, PawPrint, Camera, Stethoscope
} from 'lucide-react'
import { useDog } from '../context/DogContext'
import { useChat } from '../context/ChatContext'
import { geminiService } from '../services/api/gemini'
import ChatBubble from '../components/chat/ChatBubble'
import ChatInput from '../components/chat/ChatInput'
import PawTypingIndicator from '../components/chat/PawTypingIndicator'
import BottomNav from '../components/layout/BottomNav'

// Welcome message for new conversations
function getWelcomeMessage(dogName) {
  return `Hi! I'm Pawsy, your AI vet assistant. I'm here to help with any questions about ${dogName}'s health and wellbeing.\n\nI can help you understand symptoms, provide general care advice, and let you know when it's time to see a vet. You can also share photos if you'd like me to take a look at something.\n\nWhat can I help you with today?`
}

function Chat() {
  const { activeDog, dogs } = useDog()
  const {
    activeSession,
    createSession,
    addMessage,
    setActiveSession,
    getSessionsForDog,
    loading,
    setLoading,
  } = useChat()
  const navigate = useNavigate()
  const location = useLocation()

  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [suggestedAction, setSuggestedAction] = useState(null) // Track AI-suggested next action
  const [emergencySteps, setEmergencySteps] = useState([]) // First-aid steps for emergencies
  const [photoAnalysisHandled, setPhotoAnalysisHandled] = useState(false) // Track if we've handled photo context
  const [photoContext, setPhotoContext] = useState(null) // Store photo analysis context for chat
  const [showScrollButton, setShowScrollButton] = useState(false) // Show scroll-to-bottom FAB
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle scroll to show/hide scroll-to-bottom button
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    // Show button if scrolled up more than 200px from bottom
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200)
  }

  // Redirect if no dogs
  useEffect(() => {
    if (dogs.length === 0) {
      navigate('/add-dog')
    }
  }, [dogs, navigate])

  // Create a new session if none exists for current dog
  useEffect(() => {
    if (activeDog && !activeSession) {
      const existingSessions = getSessionsForDog(activeDog.id)
      if (existingSessions.length > 0) {
        // Use the most recent session
        setActiveSession(existingSessions[existingSessions.length - 1].id)
      } else {
        // Create a new session with welcome message
        const session = createSession(activeDog.id, {
          name: activeDog.name,
          breed: activeDog.breed,
          age: activeDog.dateOfBirth,
          weight: activeDog.weight,
          allergies: activeDog.allergies || [],
        })
        // Add welcome message
        addMessage(session.id, {
          role: 'assistant',
          content: getWelcomeMessage(activeDog.name),
        })
      }
    }
  }, [activeDog, activeSession])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages, isTyping])

  // Handle photo analysis context passed from PhotoAnalysis page
  useEffect(() => {
    const state = location.state
    if (state?.fromPhotoAnalysis && !photoAnalysisHandled && activeSession && activeDog) {
      setPhotoAnalysisHandled(true)

      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title)

      // Store photo context for use in chat - this helps Pawsy understand
      // when the user is asking about the dog in the photo vs their profile dog
      const { analysis, photo } = state
      const detectedBreed = analysis.detected_breed || null
      const breedMatchesProfile = analysis.breed_matches_profile ?? true

      setPhotoContext({
        detected_breed: detectedBreed,
        breed_matches_profile: breedMatchesProfile,
        body_area: analysis.body_area,
        urgency_level: analysis.urgency_level,
        possible_conditions: analysis.possible_conditions,
        visible_symptoms: analysis.visible_symptoms,
        summary: analysis.summary,
        hasPhoto: !!photo,
      })

      // Create a new chat session for this discussion
      const session = createSession(activeDog.id, {
        name: activeDog.name,
        breed: activeDog.breed,
        age: activeDog.dateOfBirth,
        weight: activeDog.weight,
        allergies: activeDog.allergies || [],
      })

      // Build context message from photo analysis
      // If breed doesn't match, acknowledge the photo shows a different dog
      let contextMessage = ''

      if (!breedMatchesProfile && detectedBreed) {
        contextMessage = `I just analyzed a photo showing a **${detectedBreed}**. `
        contextMessage += `(I noticed this is different from ${activeDog.name}'s profile breed of ${activeDog.breed} - are you asking about a different dog?)\n\n`
      } else {
        contextMessage = `I just analyzed a photo of ${activeDog.name}'s ${analysis.body_area || 'health concern'}. `
      }

      contextMessage += `${analysis.summary}\n\nI'm here to answer any questions you have about this. What would you like to know?`

      // Add the context message as assistant
      addMessage(session.id, {
        role: 'assistant',
        content: contextMessage,
        // Attach the photo for reference
        image: photo ? {
          preview: photo.preview,
          hadImage: true, // Mark that this had an image (for history display)
        } : null,
        metadata: {
          fromPhotoAnalysis: true,
          // Include photo_analysis for rich card rendering
          photo_analysis: {
            urgency_level: analysis.urgency_level,
            confidence: analysis.confidence,
            visible_symptoms: analysis.visible_symptoms || [],
            possible_conditions: analysis.possible_conditions || [],
            recommended_actions: analysis.recommended_actions || [],
            home_care_tips: analysis.home_care_tips || [],
            should_see_vet: analysis.should_see_vet,
            vet_urgency: analysis.vet_urgency,
          },
          photoContext: {
            detected_breed: detectedBreed,
            breed_matches_profile: breedMatchesProfile,
          },
        },
      })

      // Set urgency banner if needed
      if (analysis.urgency_level === 'emergency') {
        setSuggestedAction('emergency')
      } else if (analysis.urgency_level === 'urgent') {
        setSuggestedAction('see_vet')
      }
    }
  }, [location.state, photoAnalysisHandled, activeSession, activeDog])

  const handleSendMessage = async (content) => {
    if (!activeSession || !activeDog) return

    setError(null)
    setSuggestedAction(null)
    setEmergencySteps([])

    // Add user message
    addMessage(activeSession.id, {
      role: 'user',
      content,
    })

    // Check if API is configured
    if (!geminiService.isConfigured()) {
      // Add a mock response for demo purposes
      setIsTyping(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsTyping(false)

      addMessage(activeSession.id, {
        role: 'assistant',
        content: `I'd love to help you with that question about ${activeDog.name}! However, the Gemini API isn't configured yet.\n\nTo enable AI responses, add your API key to a .env file:\n\nVITE_GEMINI_API_KEY=your_api_key_here\n\nYou can get a free API key from Google AI Studio.`,
      })
      return
    }

    // Get AI response using new structured API
    setIsTyping(true)
    try {
      const history = activeSession.messages.slice(-10) // Last 10 messages for context

      // Pass dog object and photo context (if any) to help Pawsy understand
      // when the user is asking about a different dog than their profile
      const response = await geminiService.chat(activeDog, content, history, photoContext)

      // Handle error responses
      if (response.error) {
        setError(response.message || 'Something went wrong. Please try again.')
        addMessage(activeSession.id, {
          role: 'assistant',
          content: response.message || "I'm sorry, I encountered an error processing your message. Please try again.",
        })
        return
      }

      // Add the AI response message with structured health data
      addMessage(activeSession.id, {
        role: 'assistant',
        content: response.message,
        // Store metadata for rich card UI rendering
        metadata: {
          follow_up_questions: response.follow_up_questions || [],
          concerns_detected: response.concerns_detected || false,
          suggested_action: response.suggested_action || 'continue_chat',
          // Structured health data for rich cards
          urgency_level: response.urgency_level || 'low',
          visible_symptoms: response.symptoms_mentioned || [], // Map to visible_symptoms for RichHealthResponse
          possible_conditions: response.possible_conditions || [],
          recommended_actions: response.recommended_actions || [],
          home_care_tips: response.home_care_tips || [],
          should_see_vet: response.should_see_vet || false,
          emergency_steps: response.emergency_steps || [],
        },
      })

      // Track suggested action for UI hints
      if (response.suggested_action && response.suggested_action !== 'continue_chat') {
        setSuggestedAction(response.suggested_action)
      }

      // Store emergency steps if present
      if (response.emergency_steps?.length > 0) {
        setEmergencySteps(response.emergency_steps)
      } else {
        setEmergencySteps([])
      }

    } catch (err) {
      console.error('Chat error:', err)
      setError('Something went wrong. Please try again.')
      addMessage(activeSession.id, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your message. Please try again, and if the issue persists, check your internet connection.",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleImageUpload = async (imageData, userDescription = '') => {
    if (!activeSession || !activeDog) return

    setError(null)
    setSuggestedAction(null)

    // Add user message with image
    addMessage(activeSession.id, {
      role: 'user',
      content: userDescription || 'Can you analyze this photo?',
      image: {
        preview: imageData.preview,
        base64Data: imageData.base64Data,
        mimeType: imageData.mimeType,
      },
    })

    // Check if API is configured
    if (!geminiService.isConfigured()) {
      setIsTyping(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsTyping(false)

      addMessage(activeSession.id, {
        role: 'assistant',
        content: `I can see you've shared a photo of ${activeDog.name}! However, the Gemini API isn't configured yet, so I can't analyze it.\n\nTo enable AI photo analysis, add your API key to a .env file:\n\nVITE_GEMINI_API_KEY=your_api_key_here\n\nYou can get a free API key from Google AI Studio.`,
      })
      return
    }

    // Analyze with Gemini using new structured API
    setIsTyping(true)
    try {
      // New API: pass dog object, body area (empty for chat inline), and description
      const response = await geminiService.analyzePhoto(
        imageData.base64Data,
        imageData.mimeType,
        activeDog,
        '', // No specific body area for inline chat photos
        userDescription
      )

      // Handle error responses
      if (response.error) {
        setError(response.message || 'Failed to analyze photo.')
        addMessage(activeSession.id, {
          role: 'assistant',
          content: response.message || "I'm sorry, I had trouble analyzing that photo. Please try again.",
        })
        return
      }

      // Format the structured response into a readable message
      const formattedResponse = formatPhotoAnalysisForChat(response)

      addMessage(activeSession.id, {
        role: 'assistant',
        content: formattedResponse,
        metadata: {
          photo_analysis: response,
          urgency_level: response.urgency_level,
          should_see_vet: response.should_see_vet,
        },
      })

      // Set suggested action based on urgency
      if (response.urgency_level === 'emergency' || response.urgency_level === 'urgent') {
        setSuggestedAction('see_vet')
      }

    } catch (err) {
      console.error('Photo analysis error:', err)
      setError('Failed to analyze photo. Please try again.')
      addMessage(activeSession.id, {
        role: 'assistant',
        content: "I'm sorry, I had trouble analyzing that photo. Please try again, or describe what you're seeing and I'll do my best to help!",
      })
    } finally {
      setIsTyping(false)
    }
  }

  // Format structured photo analysis into readable chat message
  const formatPhotoAnalysisForChat = (analysis) => {
    let message = analysis.summary || "Here's what I can see in the photo."

    if (analysis.visible_symptoms?.length > 0) {
      message += `\n\n**What I observe:** ${analysis.visible_symptoms.join(', ')}.`
    }

    if (analysis.possible_conditions?.length > 0) {
      message += `\n\n**Possible causes:** This could be ${analysis.possible_conditions.slice(0, 3).join(', ')}.`
    }

    if (analysis.recommended_actions?.length > 0) {
      message += `\n\n**Recommendations:**\n${analysis.recommended_actions.map(a => `• ${a}`).join('\n')}`
    }

    if (analysis.should_see_vet) {
      const urgencyText = {
        immediately: "I'd recommend seeing a vet **as soon as possible**.",
        within_24_hours: "I'd recommend scheduling a vet visit **within the next 24 hours**.",
        within_week: "I'd recommend scheduling a vet visit **within the next few days**.",
        routine_checkup: "You might want to mention this at your next routine checkup.",
      }
      message += `\n\n${urgencyText[analysis.vet_urgency] || "I'd recommend consulting with your vet about this."}`
    }

    if (analysis.home_care_tips?.length > 0) {
      message += `\n\n**In the meantime:**\n${analysis.home_care_tips.map(t => `• ${t}`).join('\n')}`
    }

    return message
  }

  const handleQuickQuestion = (question) => {
    handleSendMessage(question)
  }

  // Handle action from rich health response cards
  const handleAction = (action) => {
    switch (action) {
      case 'find_vet':
        window.open('https://www.google.com/maps/search/veterinarian+near+me', '_blank')
        break
      case 'upload_photo':
        navigate('/photo-analysis')
        break
      case 'ask_more':
        // Focus the input - could be enhanced with a ref
        break
      default:
        break
    }
  }

  const handleNewChat = () => {
    if (!activeDog) return
    const session = createSession(activeDog.id, {
      name: activeDog.name,
      breed: activeDog.breed,
      age: activeDog.dateOfBirth,
      weight: activeDog.weight,
      allergies: activeDog.allergies || [],
    })
    addMessage(session.id, {
      role: 'assistant',
      content: getWelcomeMessage(activeDog.name),
    })
    // Clear any photo context from previous conversations
    setPhotoContext(null)
    setPhotoAnalysisHandled(false)
    setSuggestedAction(null)
    setEmergencySteps([])
    setShowHistory(false)
  }

  const dogSessions = activeDog ? getSessionsForDog(activeDog.id) : []

  // Check if this is the first assistant message (for showing quick questions)
  const isFirstMessage = (index) => {
    if (!activeSession) return false
    const messages = activeSession.messages
    // Find the index of first assistant message
    const firstAssistantIndex = messages.findIndex(m => m.role === 'assistant')
    return index === firstAssistantIndex && messages.length <= 2
  }

  // Determine if timestamp should be shown (only show if 5+ minutes gap from previous message)
  const shouldShowTimestamp = (index) => {
    if (!activeSession) return true
    const messages = activeSession.messages
    if (index === 0) return true // Always show first message timestamp

    const currentMsg = messages[index]
    const prevMsg = messages[index - 1]

    if (!prevMsg?.timestamp || !currentMsg?.timestamp) return true

    const timeDiff = new Date(currentMsg.timestamp) - new Date(prevMsg.timestamp)
    return timeDiff > 5 * 60 * 1000 // 5 minutes in milliseconds
  }

  if (!activeDog) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <Dog className="w-16 h-16 text-[#F4A261] mx-auto mb-4" />
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <motion.button
                whileTap={{ scale: 0.95 }}
                aria-label="Back to dashboard"
                className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
              >
                <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] flex items-center justify-center shadow-sm">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Pawsy
                </h1>
                <p className="text-xs text-[#6B6B6B]">AI Vet Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* History toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              aria-label="Chat history"
              aria-expanded={showHistory}
              className={`p-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] ${
                showHistory ? 'bg-[#7EC8C8]/20 text-[#7EC8C8]' : 'hover:bg-[#E8E8E8]/50 text-[#6B6B6B]'
              }`}
            >
              <History className="w-5 h-5" />
            </motion.button>

            {/* New chat */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              aria-label="Start new chat"
              className="p-2 rounded-xl bg-[#F4A261]/10 text-[#F4A261] hover:bg-[#F4A261]/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E8]/50 overflow-hidden"
          >
            <div className="max-w-lg mx-auto px-4 py-3">
              <p className="text-xs font-medium text-[#6B6B6B] mb-2">Recent Conversations</p>
              {dogSessions.length === 0 ? (
                <p className="text-sm text-[#9E9E9E]">No previous conversations</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dogSessions.slice().reverse().map((session) => (
                    <motion.button
                      key={session.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveSession(session.id)
                        setShowHistory(false)
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-colors ${
                        session.id === activeSession?.id
                          ? 'bg-[#F4A261]/10 border border-[#F4A261]/30'
                          : 'bg-[#FDF8F3] hover:bg-[#F4A261]/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#F4A261]" />
                        <span className="text-sm font-medium text-[#3D3D3D] truncate">
                          {session.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#9E9E9E] mt-1">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <main
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-44 overscroll-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Compact dog context pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-[#F4A261]/15 shadow-sm">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-[#F4A261]/30 bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex-shrink-0">
                {activeDog.photoUrl ? (
                  <img
                    src={activeDog.photoUrl}
                    alt={activeDog.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dog className="w-3 h-3 text-[#F4A261]" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-[#3D3D3D]">{activeDog.name}</span>
              <span className="text-xs text-[#9E9E9E]">•</span>
              <span className="text-xs text-[#6B6B6B]">{activeDog.breed}</span>
            </div>
          </motion.div>

          {/* Messages */}
          {activeSession?.messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              dogPhoto={null}
              isFirstAssistantMessage={isFirstMessage(index)}
              onQuickQuestion={handleQuickQuestion}
              onAction={handleAction}
              showTimestamp={shouldShowTimestamp(index)}
            />
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && <PawTypingIndicator />}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl p-3"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {/* Suggested Action Banner */}
          <AnimatePresence>
            {suggestedAction && suggestedAction !== 'continue_chat' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-4 ${
                  suggestedAction === 'emergency'
                    ? 'bg-red-50 border border-red-200'
                    : suggestedAction === 'see_vet'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-[#7EC8C8]/10 border border-[#7EC8C8]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {suggestedAction === 'emergency' && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">Emergency Care Needed</p>
                        <p className="text-sm text-red-700 mt-1">
                          Based on what you've described, please seek emergency veterinary care immediately.
                        </p>
                        {emergencySteps.length > 0 && (
                          <div className="mt-3 p-3 bg-red-100/50 rounded-lg">
                            <p className="text-xs font-semibold text-red-800 mb-2">While getting to the vet:</p>
                            <ul className="space-y-1">
                              {emergencySteps.map((step, idx) => (
                                <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                  <span className="font-bold text-red-800">{idx + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {suggestedAction === 'see_vet' && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-800">Vet Visit Recommended</p>
                        <p className="text-sm text-amber-700 mt-1">
                          I'd recommend having a veterinarian examine {activeDog.name} for this concern.
                        </p>
                      </div>
                    </>
                  )}
                  {suggestedAction === 'upload_photo' && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#7EC8C8]/20 flex items-center justify-center flex-shrink-0">
                        <Camera className="w-5 h-5 text-[#5FB3B3]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#3D3D3D]">Photo Would Help</p>
                        <p className="text-sm text-[#6B6B6B] mt-1">
                          Sharing a photo would help me give you better advice about this.
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSuggestedAction(null)}
                  className="mt-3 text-xs text-[#9E9E9E] hover:text-[#6B6B6B]"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Scroll to bottom FAB */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToBottom}
            className="fixed bottom-40 right-4 w-10 h-10 bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white rounded-full shadow-lg z-40 flex items-center justify-center hover:shadow-xl transition-shadow"
            aria-label="Scroll to latest messages"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="fixed bottom-[88px] left-0 right-0 bg-gradient-to-t from-[#FDF8F3] via-[#FDF8F3]/95 to-transparent pt-6 pb-2 px-4 z-30">
        <div className="max-w-lg mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            onImageUpload={handleImageUpload}
            disabled={isTyping || loading}
            placeholder={`Ask about ${activeDog.name}...`}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default Chat
