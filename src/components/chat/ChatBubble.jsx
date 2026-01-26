import { memo } from 'react'
import { motion } from 'framer-motion'
import { User, PawPrint, Image as ImageIcon } from 'lucide-react'
import RichHealthResponse from './RichHealthResponse'

const QUICK_QUESTIONS = [
  "My dog threw up",
  "Is this food safe?",
  "Check this photo",
  "Won't eat today",
]

function renderMarkdown(text) {
  if (!text) return null

  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/)

  return paragraphs.map((paragraph, pIdx) => {
    // Check if this paragraph is a list
    const lines = paragraph.split('\n')
    const isBulletList = lines.every(line => /^[-•]\s/.test(line.trim()) || line.trim() === '')
    const isNumberedList = lines.every(line => /^\d+\.\s/.test(line.trim()) || line.trim() === '')

    if (isBulletList) {
      const items = lines.filter(line => /^[-•]\s/.test(line.trim()))
      return (
        <ul key={pIdx} className="space-y-1.5 my-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#7EC8C8] mt-1.5 text-xs">●</span>
              <span>{renderInlineMarkdown(item.replace(/^[-•]\s/, ''))}</span>
            </li>
          ))}
        </ul>
      )
    }

    if (isNumberedList) {
      const items = lines.filter(line => /^\d+\.\s/.test(line.trim()))
      return (
        <ol key={pIdx} className="space-y-1.5 my-2">
          {items.map((item, idx) => {
            const content = item.replace(/^\d+\.\s/, '')
            return (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#F4A261] font-semibold min-w-[1.25rem]">{idx + 1}.</span>
                <span>{renderInlineMarkdown(content)}</span>
              </li>
            )
          })}
        </ol>
      )
    }

    // Regular paragraph - handle line breaks within
    const lineElements = lines.map((line, lIdx) => (
      <span key={lIdx}>
        {renderInlineMarkdown(line)}
        {lIdx < lines.length - 1 && <br />}
      </span>
    ))

    return (
      <p key={pIdx} className={pIdx > 0 ? 'mt-3' : ''}>
        {lineElements}
      </p>
    )
  })
}

function renderInlineMarkdown(text) {
  if (!text) return null

  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-[#3D3D3D]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={idx}>{part}</span>
  })
}

function hasRichData(metadata) {
  const hasSymptoms = metadata.visible_symptoms?.length >= 2 || metadata.symptoms_mentioned?.length >= 2
  const hasConditions = metadata.possible_conditions?.length >= 2
  const hasRecommendations = metadata.recommended_actions?.length >= 2
  const hasHomeCare = metadata.home_care_tips?.length >= 1
  const substantialSections = [hasSymptoms, hasConditions, hasRecommendations, hasHomeCare].filter(Boolean).length
  const isAskingQuestions = (metadata.follow_up_questions?.length || 0) >= 2

  return (
    metadata.photo_analysis === true ||
    metadata.emergency_steps?.length > 0 ||
    metadata.urgency_level === 'urgent' ||
    metadata.urgency_level === 'emergency' ||
    (substantialSections >= 3 && !isAskingQuestions)
  )
}

function ChatBubble({ message, dogPhoto, isFirstAssistantMessage, onQuickQuestion, onAction, showTimestamp = true }) {
  const isUser = message.role === 'user'
  const hasImage = message.image?.preview
  const hadImagePreviously = message.image?.hadImage && !hasImage
  const metadata = message.metadata || {}
  const hasRichHealthData = !isUser && hasRichData(metadata)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser
          ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F]'
          : 'bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3]'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : dogPhoto ? (
          <img src={dogPhoto} alt="Pawsy" className="w-full h-full rounded-full object-cover" />
        ) : (
          <PawPrint className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble and quick questions container */}
      <div className="flex flex-col gap-2 max-w-[85%]">
        {/* Bubble */}
        <div
          className={`rounded-2xl ${
            isUser
              ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white rounded-tr-md shadow-md px-4 py-3'
              : 'bg-[#FAFAFA] text-[#4A4A4A] rounded-tl-md border border-[#E8E8E8]/60 px-4 py-3'
          }`}
        >
          {/* Image if present */}
          {hasImage && (
            <div className="mb-3">
              <div className="relative">
                <img
                  src={message.image.preview}
                  alt="Uploaded photo for analysis"
                  loading="lazy"
                  className="max-w-full max-h-48 rounded-xl object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded-lg text-[10px] text-white flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Photo for analysis
                </div>
              </div>
            </div>
          )}
          {/* Placeholder for images from previous sessions (data not persisted) */}
          {hadImagePreviously && (
            <div className="mb-3">
              <div className="w-full h-24 bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] rounded-xl flex items-center justify-center gap-2 text-[#D4793A]">
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm">Photo was shared</span>
              </div>
            </div>
          )}
          {/* Message content with markdown for assistant, plain for user */}
          {message.content && (
            <div className={`text-sm leading-relaxed ${isUser ? 'whitespace-pre-wrap' : ''}`}>
              {isUser ? message.content : renderMarkdown(message.content)}
            </div>
          )}

          {/* Rich health response cards for structured data */}
          {hasRichHealthData && (
            <RichHealthResponse
              metadata={metadata}
              onAction={onAction}
            />
          )}

          {showTimestamp && (
            <p className={`text-[11px] mt-2 ${isUser ? 'text-white/60' : 'text-[#ADADAD]'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Quick question chips - only show after first assistant message */}
        {isFirstAssistantMessage && !isUser && onQuickQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mt-1"
          >
            {QUICK_QUESTIONS.map((question, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onQuickQuestion(question)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onQuickQuestion(question)
                  }
                }}
                aria-label={`Ask: ${question}`}
                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-[#FFF5ED] to-[#FFE8D6] text-[#D4793A] rounded-full border border-[#F4A261]/20 hover:border-[#F4A261]/40 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
              >
                {question}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default memo(ChatBubble)
