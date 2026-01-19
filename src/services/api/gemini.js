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

    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt,
    })

    // Convert history to Gemini format
    const chatHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: chatHistory,
    })

    const result = await chat.sendMessage(userMessage)
    return result.response.text()
  },

  async analyzePhoto(imageBase64, mimeType, prompt) {
    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: imageBase64 } }
    ])

    return result.response.text()
  }
}
