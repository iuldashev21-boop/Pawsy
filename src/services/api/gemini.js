import { GoogleGenerativeAI } from '@google/generative-ai'

// ============================================================================
// Configuration
// ============================================================================

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

// Model selection
const PRIMARY_MODEL = 'gemini-2.0-flash'
const FALLBACK_MODEL = 'gemini-1.5-flash'

// Generation config optimized for Gemini 3
const generationConfig = {
  temperature: 1.0,  // Keep at 1.0 for Gemini 3 models
  maxOutputTokens: 2048,
  topP: 0.95,
  topK: 40,
}

let genAI = null

function getGenAI() {
  if (!genAI && apiKey) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

// ============================================================================
// Structured Output Schemas
// ============================================================================

// Schema definitions for documentation and future structured output support
// eslint-disable-next-line no-unused-vars
const _photoAnalysisSchema = {
  type: "object",
  properties: {
    urgency_level: {
      type: "string",
      enum: ["emergency", "urgent", "moderate", "low"],
      description: "How urgently the pet needs veterinary attention"
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"],
      description: "AI confidence in this assessment"
    },
    possible_conditions: {
      type: "array",
      items: { type: "string" },
      description: "List of possible health conditions based on the image"
    },
    visible_symptoms: {
      type: "array",
      items: { type: "string" },
      description: "What symptoms are visible in the photo"
    },
    recommended_actions: {
      type: "array",
      items: { type: "string" },
      description: "Immediate steps the owner should take"
    },
    should_see_vet: {
      type: "boolean",
      description: "Whether professional vet visit is recommended"
    },
    vet_urgency: {
      type: "string",
      enum: ["immediately", "within_24_hours", "within_week", "routine_checkup", "not_required"],
      description: "When to see the vet if recommended"
    },
    home_care_tips: {
      type: "array",
      items: { type: "string" },
      description: "Safe home care suggestions while monitoring"
    },
    summary: {
      type: "string",
      description: "Brief 1-2 sentence summary of the assessment"
    }
  },
  required: ["urgency_level", "confidence", "possible_conditions", "recommended_actions", "should_see_vet", "summary"]
}

// eslint-disable-next-line no-unused-vars
const _chatResponseSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "The conversational response to the user"
    },
    follow_up_questions: {
      type: "array",
      items: { type: "string" },
      description: "Helpful follow-up questions to ask the owner (max 3)"
    },
    concerns_detected: {
      type: "boolean",
      description: "Whether any health concerns were mentioned"
    },
    suggested_action: {
      type: "string",
      enum: ["continue_chat", "upload_photo", "see_vet", "emergency"],
      description: "Recommended next step"
    }
  },
  required: ["message"]
}

// ============================================================================
// System Prompts
// ============================================================================

function buildChatSystemPrompt(dog) {
  const age = dog.dateOfBirth ? calculateAge(dog.dateOfBirth) : 'Unknown'

  return `You are Pawsy, a friendly and knowledgeable AI veterinary assistant for dog owners.

<role>
- Help dog owners understand their pet's health concerns
- Provide general guidance and education about dog health
- Be empathetic, warm, and supportive
- Use simple language, avoid complex medical jargon
- Be conversational but professional - no cutesy language like "woof" or excessive exclamation marks
</role>

<constraints>
- NEVER provide definitive diagnoses - always suggest possibilities
- ALWAYS recommend professional vet consultation for concerning symptoms
- If symptoms suggest EMERGENCY (difficulty breathing, severe bleeding, collapse, seizures, inability to stand, extreme lethargy, bloated abdomen, ingested toxins), immediately advise emergency vet care and set suggested_action to "emergency"
- Consider the specific dog's profile (breed, age, weight, allergies) when giving advice
- Be honest about limitations - you cannot physically examine the pet
- If you need visual information to help, suggest uploading a photo (set suggested_action to "upload_photo")
</constraints>

<dog_profile>
Name: ${dog.name || 'Unknown'}
Breed: ${dog.breed || 'Unknown'}
Age: ${age}
Weight: ${dog.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Unknown'}
Known allergies: ${dog.allergies?.length > 0 ? dog.allergies.join(', ') : 'None known'}
</dog_profile>

<output_format>
Respond conversationally but be thorough. Always provide your response in the structured JSON format.
- Set concerns_detected to true if the user mentions any health symptoms or worries
- Suggest follow_up_questions (max 3) when you need more information to help
- Set suggested_action appropriately based on severity
</output_format>`
}

function buildPhotoAnalysisSystemPrompt(dog, bodyArea, ownerDescription) {
  const age = dog.dateOfBirth ? calculateAge(dog.dateOfBirth) : 'Unknown'

  return `You are Pawsy, an AI veterinary assistant specialized in visual analysis of dog health concerns.

<role>
Analyze photos of dogs to identify potential health issues and provide guidance to owners.
</role>

<constraints>
- Analyze ONLY what is visible in the image
- Never claim certainty - use phrases like "this could be", "this appears to be", "possible signs of"
- Consider the body area reported by the owner: ${bodyArea || 'Not specified'}
- Factor in the dog's breed, age, and known allergies
- For ANY sign of: difficulty breathing, severe injury, significant blood, extreme swelling, eye injuries, or signs of severe pain - mark as URGENT or EMERGENCY
- Be reassuring but honest
- If the image quality is poor or the area of concern isn't clearly visible, note this in your assessment
</constraints>

<dog_profile>
Name: ${dog.name || 'Unknown'}
Breed: ${dog.breed || 'Unknown'}
Age: ${age}
Weight: ${dog.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Unknown'}
Known allergies: ${dog.allergies?.length > 0 ? dog.allergies.join(', ') : 'None known'}
</dog_profile>

<context>
Body area reported: ${bodyArea || 'Not specified'}
Owner's description: "${ownerDescription || 'No description provided'}"
</context>

Analyze the image and provide a structured assessment. Consider breed-specific health tendencies and the dog's known allergies when making your assessment.`
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 'Unknown'
  const birth = new Date(dateOfBirth)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()

  if (years === 0) {
    return `${months + (months < 0 ? 12 : 0)} months`
  }
  if (years === 1 && months < 0) {
    return `${12 + months} months`
  }
  return `${years} ${years === 1 ? 'year' : 'years'} old`
}

// ============================================================================
// Error Handling
// ============================================================================

function handleGeminiError(error, response) {
  // Check for safety blocks
  if (response?.candidates?.[0]?.finishReason === 'SAFETY') {
    return {
      error: true,
      errorType: 'safety_block',
      message: "I couldn't analyze this content due to safety guidelines. Please try a different photo or rephrase your question."
    }
  }

  // Check for rate limits
  if (error?.status === 429 || error?.message?.includes('quota')) {
    return {
      error: true,
      errorType: 'rate_limit',
      message: "I'm receiving too many requests right now. Please wait a moment and try again."
    }
  }

  // Check for invalid API key
  if (error?.status === 401 || error?.status === 403) {
    return {
      error: true,
      errorType: 'auth_error',
      message: "There's an issue with the API configuration. Please check your API key."
    }
  }

  // Generic error
  return {
    error: true,
    errorType: 'unknown',
    message: "Something went wrong. Please try again."
  }
}

// ============================================================================
// Response Parsing Helper
// ============================================================================

/**
 * Parse Gemini response - handles markdown code blocks and extracts JSON
 */
function parseGeminiChatResponse(text) {
  // Remove markdown code block wrapper if present
  let cleaned = text.trim()

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }

  cleaned = cleaned.trim()

  try {
    const parsed = JSON.parse(cleaned)
    return {
      success: true,
      message: parsed.response || parsed.message || cleaned,
      follow_up_questions: parsed.follow_up_questions || [],
      concerns_detected: parsed.concerns_detected ?? false,
      suggested_action: parsed.suggested_action || 'continue_chat'
    }
  } catch {
    // If parsing fails, return as plain message
    return {
      success: false,
      message: text,
      follow_up_questions: [],
      concerns_detected: false,
      suggested_action: 'continue_chat'
    }
  }
}

// ============================================================================
// Main Service
// ============================================================================

export const geminiService = {
  isConfigured() {
    return !!apiKey
  },

  /**
   * Chat with Pawsy - returns structured response
   * @param {Object} dog - Dog profile object
   * @param {string} userMessage - User's message
   * @param {Array} history - Previous messages in conversation
   * @returns {Object} Structured chat response
   */
  async chat(dog, userMessage, history = []) {
    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    try {
      const systemPrompt = buildChatSystemPrompt(dog)

      const model = ai.getGenerativeModel({
        model: PRIMARY_MODEL,
        generationConfig,
        systemInstruction: systemPrompt,
      })

      // Build chat history
      const chatHistory = []

      // Add conversation history (skip welcome messages)
      const validHistory = history.filter(msg => msg.role === 'user' || msg.role === 'assistant')
      let startIndex = 0
      if (validHistory.length > 0 && validHistory[0].role === 'assistant') {
        startIndex = 1
      }

      for (let i = startIndex; i < validHistory.length; i++) {
        const msg = validHistory[i]
        chatHistory.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })
      }

      const chat = model.startChat({ history: chatHistory })

      // Request structured output
      const promptWithFormat = `${userMessage}

IMPORTANT: Respond ONLY with a valid JSON object (no markdown, no explanation). Use this exact format:
{
  "response": "your conversational response here",
  "follow_up_questions": [],
  "concerns_detected": false,
  "suggested_action": "continue_chat"
}

Where suggested_action is one of: "continue_chat", "upload_photo", "see_vet", "emergency"`

      const result = await chat.sendMessage(promptWithFormat)
      const response = result.response
      const text = response.text()

      // Check for safety blocks
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      // Parse the response using helper
      const parsed = parseGeminiChatResponse(text)
      return {
        error: false,
        message: parsed.message,
        follow_up_questions: parsed.follow_up_questions,
        concerns_detected: parsed.concerns_detected,
        suggested_action: parsed.suggested_action
      }

    } catch (error) {
      console.error('Gemini Chat Error:', error)

      // Try fallback model
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.log('Primary model failed, trying fallback...')
        return this.chatWithFallback(dog, userMessage, history)
      }

      return handleGeminiError(error, null)
    }
  },

  /**
   * Fallback chat using older model
   */
  async chatWithFallback(dog, userMessage, history = []) {
    const ai = getGenAI()
    const systemPrompt = buildChatSystemPrompt(dog)

    try {
      const model = ai.getGenerativeModel({
        model: FALLBACK_MODEL,
        generationConfig,
        systemInstruction: systemPrompt,
      })

      const chatHistory = []
      const validHistory = history.filter(msg => msg.role === 'user' || msg.role === 'assistant')
      let startIndex = validHistory.length > 0 && validHistory[0].role === 'assistant' ? 1 : 0

      for (let i = startIndex; i < validHistory.length; i++) {
        const msg = validHistory[i]
        chatHistory.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })
      }

      const chat = model.startChat({ history: chatHistory })

      // Request structured output (same as primary)
      const promptWithFormat = `${userMessage}

IMPORTANT: Respond ONLY with a valid JSON object (no markdown, no explanation). Use this exact format:
{
  "response": "your conversational response here",
  "follow_up_questions": [],
  "concerns_detected": false,
  "suggested_action": "continue_chat"
}

Where suggested_action is one of: "continue_chat", "upload_photo", "see_vet", "emergency"`

      const result = await chat.sendMessage(promptWithFormat)
      const text = result.response.text()

      // Parse the response using helper
      const parsed = parseGeminiChatResponse(text)
      return {
        error: false,
        message: parsed.message,
        follow_up_questions: parsed.follow_up_questions,
        concerns_detected: parsed.concerns_detected,
        suggested_action: parsed.suggested_action
      }
    } catch (error) {
      console.error('Fallback chat also failed:', error)
      return handleGeminiError(error, null)
    }
  },

  /**
   * Analyze a photo for health concerns - returns structured response
   * @param {string} imageBase64 - Base64 encoded image data
   * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
   * @param {Object} dog - Dog profile object
   * @param {string} bodyArea - Body area being analyzed
   * @param {string} description - Owner's description of the concern
   * @returns {Object} Structured photo analysis response
   */
  async analyzePhoto(imageBase64, mimeType, dog, bodyArea = '', description = '') {
    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    try {
      const systemPrompt = buildPhotoAnalysisSystemPrompt(dog, bodyArea, description)

      const model = ai.getGenerativeModel({
        model: PRIMARY_MODEL,
        generationConfig,
        systemInstruction: systemPrompt,
      })

      // IMPORTANT: Image FIRST, then text prompt
      const prompt = `Analyze this image and provide a structured health assessment in JSON format:
{
  "urgency_level": "emergency" | "urgent" | "moderate" | "low",
  "confidence": "high" | "medium" | "low",
  "possible_conditions": ["condition 1", "condition 2"],
  "visible_symptoms": ["symptom 1", "symptom 2"],
  "recommended_actions": ["action 1", "action 2"],
  "should_see_vet": true/false,
  "vet_urgency": "immediately" | "within_24_hours" | "within_week" | "routine_checkup" | "not_required",
  "home_care_tips": ["tip 1", "tip 2"],
  "summary": "Brief 1-2 sentence summary"
}`

      const result = await model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },  // IMAGE FIRST
        { text: prompt }  // TEXT AFTER
      ])

      const response = result.response
      const text = response.text()

      // Check for safety blocks
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      // Parse JSON response - strip markdown code blocks first
      try {
        // Remove markdown code block wrapper if present (```json ... ``` or ``` ... ```)
        let cleanedText = text
          .replace(/```json\s*/gi, '')  // Remove ```json anywhere
          .replace(/```\s*/g, '')       // Remove ``` anywhere
          .trim()

        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            error: false,
            // Ensure required fields have defaults
            urgency_level: parsed.urgency_level || 'moderate',
            confidence: parsed.confidence || 'medium',
            possible_conditions: parsed.possible_conditions || [],
            visible_symptoms: parsed.visible_symptoms || [],
            recommended_actions: parsed.recommended_actions || ['Monitor the area for changes', 'Consult a veterinarian if symptoms persist'],
            should_see_vet: parsed.should_see_vet ?? true,
            vet_urgency: parsed.vet_urgency || 'within_week',
            home_care_tips: parsed.home_care_tips || [],
            summary: parsed.summary || 'Assessment complete. Please review the details below.'
          }
        }
      } catch (e) {
        console.warn('Failed to parse structured photo response:', e.message)
      }

      // Fallback: create basic structure from raw text
      return {
        error: false,
        urgency_level: 'moderate',
        confidence: 'medium',
        possible_conditions: [],
        visible_symptoms: [],
        recommended_actions: ['Consult with a veterinarian for proper diagnosis'],
        should_see_vet: true,
        vet_urgency: 'within_week',
        home_care_tips: [],
        summary: text.slice(0, 200) + (text.length > 200 ? '...' : '')
      }

    } catch (error) {
      console.error('Gemini Photo Analysis Error:', error)

      // Try fallback model
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.log('Primary model failed for photo, trying fallback...')
        return this.analyzePhotoWithFallback(imageBase64, mimeType, dog, bodyArea, description)
      }

      return handleGeminiError(error, null)
    }
  },

  /**
   * Fallback photo analysis using older model
   */
  async analyzePhotoWithFallback(imageBase64, mimeType, dog, bodyArea, description) {
    const ai = getGenAI()
    const systemPrompt = buildPhotoAnalysisSystemPrompt(dog, bodyArea, description)

    try {
      const model = ai.getGenerativeModel({
        model: FALLBACK_MODEL,
        generationConfig,
        systemInstruction: systemPrompt,
      })

      const result = await model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },
        { text: 'Analyze this image for health concerns and provide your assessment.' }
      ])

      const text = result.response.text()

      return {
        error: false,
        urgency_level: 'moderate',
        confidence: 'medium',
        possible_conditions: [],
        visible_symptoms: [],
        recommended_actions: ['Consult with a veterinarian for proper diagnosis'],
        should_see_vet: true,
        vet_urgency: 'within_week',
        home_care_tips: [],
        summary: text.slice(0, 300) + (text.length > 300 ? '...' : '')
      }
    } catch (error) {
      console.error('Fallback photo analysis also failed:', error)
      return handleGeminiError(error, null)
    }
  },

  /**
   * Stream chat responses for real-time display
   * @param {Object} dog - Dog profile object
   * @param {string} userMessage - User's message
   * @param {Array} history - Previous messages
   * @param {Function} onChunk - Callback for each text chunk
   * @returns {Object} Final structured response
   */
  async streamChat(dog, userMessage, history = [], onChunk) {
    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured.')
    }

    try {
      const systemPrompt = buildChatSystemPrompt(dog)

      const model = ai.getGenerativeModel({
        model: PRIMARY_MODEL,
        generationConfig,
        systemInstruction: systemPrompt,
      })

      const chatHistory = []
      const validHistory = history.filter(msg => msg.role === 'user' || msg.role === 'assistant')
      let startIndex = validHistory.length > 0 && validHistory[0].role === 'assistant' ? 1 : 0

      for (let i = startIndex; i < validHistory.length; i++) {
        const msg = validHistory[i]
        chatHistory.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })
      }

      const chat = model.startChat({ history: chatHistory })
      const result = await chat.sendMessageStream(userMessage)

      let fullText = ''

      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        fullText += chunkText
        if (onChunk) {
          onChunk(chunkText, fullText)
        }
      }

      return {
        error: false,
        message: fullText,
        follow_up_questions: [],
        concerns_detected: false,
        suggested_action: 'continue_chat'
      }

    } catch (error) {
      console.error('Gemini Stream Error:', error)
      return handleGeminiError(error, null)
    }
  }
}
