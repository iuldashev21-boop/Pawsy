import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

let genAI = null

function getGenAI() {
  if (!genAI && apiKey) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

export const geminiService = {
  isConfigured() {
    return !!apiKey
  },

  async chat(systemPrompt, userMessage, history = []) {
    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' })

      // Build chat history - must start with 'user' role
      const chatHistory = []

      // Add system prompt as first user message
      chatHistory.push({
        role: 'user',
        parts: [{ text: `You are Pawsy, a friendly AI vet assistant. Here is the context:\n\n${systemPrompt}\n\nRespond as Pawsy from now on.` }],
      })
      chatHistory.push({
        role: 'model',
        parts: [{ text: "Got it! I'm Pawsy, ready to help with any questions about your dog's health." }],
      })

      // Add conversation history, skipping assistant-only starts
      const validHistory = history.filter(msg => msg.role === 'user' || msg.role === 'assistant')

      // Skip the welcome message (first assistant message if no user message before it)
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

      const chat = model.startChat({
        history: chatHistory,
      })

      const result = await chat.sendMessage(userMessage)
      return result.response.text()
    } catch (error) {
      console.error('Gemini API Error:', error.message)
      console.error('Full error:', error)
      throw error
    }
  },

  async analyzePhoto(imageBase64, mimeType, prompt) {
    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType, data: imageBase64 } }
      ])

      return result.response.text()
    } catch (error) {
      console.error('Gemini Photo Analysis Error:', error.message)
      console.error('Full error:', error)
      throw error
    }
  }
}
