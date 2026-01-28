import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  isMockModeEnabled,
  getMockScenario,
  getMockDelay,
  getMockChatResponse,
  getMockPhotoResponse,
  getMockErrorResponse
} from '../dev/mockResponses'
import { buildAIContext } from '../ai/contextBuilder'
import LocalStorageService from '../storage/LocalStorageService'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

const PRIMARY_MODEL = 'gemini-2.0-flash'
const FALLBACK_MODEL = 'gemini-1.5-flash'

const generationConfig = {
  temperature: 1.0,
  maxOutputTokens: 2048,
  topP: 0.95,
  topK: 40,
}

const API_TIMEOUT_MS = 30000 // 30 seconds

function withTimeout(promise, ms = API_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('API request timed out. Please try again.')), ms)
    ),
  ])
}

const MAX_RETRIES = 2

function isRateLimitError(error) {
  return error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429')
}

async function withRetry(fn, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (isRateLimitError(error) && attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt) // 1s, 2s
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw error
    }
  }
}

let genAI = null

function getGenAI() {
  if (!genAI && apiKey) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

const photoAnalysisSchema = {
  type: "object",
  properties: {
    is_dog: {
      type: "boolean",
      description: "Whether the image contains a dog"
    },
    detected_subject: {
      type: "string",
      description: "What is detected in the image if not a dog"
    },
    detected_breed: {
      type: "string",
      description: "Visually identified breed from the image"
    },
    breed_matches_profile: {
      type: "boolean",
      description: "Whether detected breed matches the profile"
    },
    image_quality: {
      type: "string",
      enum: ["good", "acceptable", "poor"],
      description: "Quality assessment of the uploaded image"
    },
    image_quality_note: {
      type: "string",
      description: "Explanation if image quality is not good"
    },
    body_area: {
      type: "string",
      description: "Body area being analyzed"
    },
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
  required: ["is_dog", "urgency_level", "confidence", "possible_conditions", "recommended_actions", "should_see_vet", "summary"]
}

const labAnalysisSchema = {
  type: "object",
  properties: {
    is_lab_report: { type: "boolean", description: "Whether the image contains a lab report or medical document" },
    detected_type: { type: "string", enum: ["blood_work", "xray", "urinalysis", "other"], description: "Type of lab report detected" },
    readability: { type: "string", enum: ["clear", "partial", "poor"], description: "How readable the document/image is" },
    readability_note: { type: "string", description: "Explanation if readability is not clear" },
    values: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
          unit: { type: "string" },
          reference_range: { type: "string" },
          status: { type: "string", enum: ["normal", "high", "low", "critical"] },
          interpretation: { type: "string" },
        },
        required: ["name", "value", "status"],
      },
      description: "Extracted lab values with reference ranges and status"
    },
    overall_assessment: { type: "string", enum: ["normal", "needs_attention", "concerning"], description: "Overall assessment of the lab results" },
    summary: { type: "string", description: "Brief summary of key findings" },
    key_findings: { type: "array", items: { type: "string" }, description: "Notable findings from the report" },
    abnormal_count: { type: "integer", description: "Number of abnormal values detected" },
    possible_conditions: { type: "array", items: { type: "string" }, description: "Conditions that abnormal values may suggest" },
    recommended_actions: { type: "array", items: { type: "string" }, description: "Recommended next steps" },
    additional_tests_suggested: { type: "array", items: { type: "string" }, description: "Additional tests that might be helpful" },
    should_see_vet: { type: "boolean", description: "Whether a vet visit is recommended" },
    vet_urgency: { type: "string", enum: ["immediately", "within_24_hours", "within_week", "routine_checkup", "not_required"], description: "When to see the vet" },
    confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level in the interpretation" },
  },
  required: ["is_lab_report", "detected_type", "readability", "overall_assessment", "summary", "should_see_vet", "confidence"]
}

const chatResponseSchema = {
  type: "object",
  properties: {
    response: {
      type: "string",
      description: "The conversational response to the user. Put follow-up questions at the end as a numbered list (1, 2, 3)."
    },
    follow_up_questions: {
      type: "array",
      items: { type: "string" },
      description: "Same questions as in response, for tracking (max 3)"
    },
    concerns_detected: {
      type: "boolean",
      description: "True if user mentions any health symptom or concern"
    },
    suggested_action: {
      type: "string",
      enum: ["continue_chat", "upload_photo", "see_vet", "emergency"],
      description: "Recommended next step based on severity"
    },
    urgency_level: {
      type: "string",
      enum: ["low", "moderate", "urgent", "emergency"],
      description: "Severity level based on symptoms described"
    },
    symptoms_mentioned: {
      type: "array",
      items: { type: "string" },
      description: "List of symptoms the user described"
    },
    possible_conditions: {
      type: "array",
      items: { type: "string" },
      description: "2-4 possible causes if concerns detected"
    },
    recommended_actions: {
      type: "array",
      items: { type: "string" },
      description: "2-4 actionable steps the owner should take"
    },
    home_care_tips: {
      type: "array",
      items: { type: "string" },
      description: "1-3 home care suggestions if appropriate"
    },
    should_see_vet: {
      type: "boolean",
      description: "Whether professional vet visit is recommended"
    },
    emergency_steps: {
      type: "array",
      items: { type: "string" },
      description: "For emergencies only: 2-4 immediate first-aid steps"
    }
  },
  required: ["response", "concerns_detected", "suggested_action", "urgency_level", "should_see_vet"]
}

// buildChatSystemPrompt removed — prompt assembly consolidated into contextBuilder.js (Phase 6)

function buildPhotoAnalysisSystemPrompt(dog, bodyArea, ownerDescription) {
  const age = dog.dateOfBirth ? calculateAge(dog.dateOfBirth) : 'Unknown'

  return `You are Pawsy, an AI veterinary assistant specialized in visual analysis of dog health concerns.

<role>
Analyze photos of dogs to identify potential health issues and provide guidance to owners.
</role>

<image_validation>
BEFORE analyzing for health issues, FIRST confirm the image contains a dog.

Set is_dog to true or false, and detected_subject to describe what's actually in the image.

If the image does NOT contain a dog:
- Set is_dog to false
- Set detected_subject to what you see (e.g., "cat", "bird", "human", "food", "object", "landscape", etc.)
- Set urgency_level to "low"
- Set confidence to "high"
- Set possible_conditions to []
- Set visible_symptoms to []
- Set recommended_actions to ["Upload a photo of your dog"]
- Set should_see_vet to false
- Set vet_urgency to "not_required"
- Set home_care_tips to []
- Set summary to: "I can only analyze photos of dogs. The image you uploaded appears to show a [detected_subject]. Please upload a photo of your dog for a health assessment."

Only proceed with health analysis if is_dog is true.
</image_validation>

<breed_verification>
IMPORTANT: Visually identify the dog's breed from the image - do NOT just trust the profile data.

1. Look at the dog in the photo and determine the breed based on physical characteristics (body shape, size, coat, ears, face structure, coloring)
2. Set detected_breed to what you see in the image
3. Compare with the profile breed: "${dog.breed || 'Unknown'}"
4. Set breed_matches_profile to true or false

If breeds DON'T MATCH:
- Include in your summary: "I notice the dog in this photo appears to be a [detected_breed], though your profile lists ${dog.breed || 'Unknown'}. I'll base my analysis on what I see in the image."
- Use the VISUALLY DETECTED breed for all breed-specific health considerations

This is critical because:
- Users might upload photos of a different pet
- Profile data might be outdated or incorrect
- Breed-specific health advice must be accurate to the actual dog in the photo
</breed_verification>

<image_quality_assessment>
FIRST, assess the image quality before analysis. Check for:
- Blur or motion blur that obscures details
- Poor lighting (too dark, overexposed, harsh shadows)
- Distance too far to see details clearly
- Obstruction (fur covering the area, wrong angle)
- Focus issues (area of concern is out of focus)

Set image_quality field:
- "good": Clear, well-lit image showing the area of concern
- "acceptable": Some minor issues but analysis is still possible
- "poor": Significant issues that limit analysis accuracy

If image_quality is "poor" or "acceptable", ALWAYS include image_quality_note explaining:
1. What's wrong with the image
2. Specific tips to get a better photo (e.g., "Hold the camera closer to the affected area", "Use natural lighting", "Ask someone to help hold your dog still")

Even with poor quality images, still attempt analysis but lower confidence accordingly.
</image_quality_assessment>

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
USE this information in your analysis - the owner has already provided these details:

Name: ${dog.name || 'Unknown'}
Breed: ${dog.breed || 'Unknown'}
Age: ${age}
Weight: ${dog.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Not provided'}
Known allergies: ${dog.allergies?.length > 0 ? dog.allergies.join(', ') : 'None reported'}

IMPORTANT: Reference ${dog.name}'s breed-specific health tendencies and consider any known allergies when making your assessment.
</dog_profile>

<context>
Body area reported: ${bodyArea || 'Not specified'}
Owner's description: "${ownerDescription || 'No description provided'}"
</context>

<example_assessment>
For a photo showing a red, irritated patch on a dog's belly:

summary: "I can see a red, slightly raised area on Buddy's belly that appears inflamed. This could be a hot spot, allergic reaction, or insect bite."
urgency_level: "moderate"
possible_conditions: ["Hot spot (acute moist dermatitis)", "Contact dermatitis", "Insect bite reaction"]
recommended_actions: ["Keep the area clean and dry", "Prevent Buddy from licking it (consider e-collar)", "Monitor for spreading or worsening"]
</example_assessment>

Analyze the image and provide a structured assessment. Use the dog's profile data above in your response.`
}

function buildLabAnalysisSystemPrompt(dog, labType, notes) {
  const age = dog?.dateOfBirth ? calculateAge(dog.dateOfBirth) : 'Unknown'

  return `You are Pawsy, an AI veterinary lab interpreter specialized in analyzing veterinary lab reports, X-rays, and medical documents for dogs.

<role>
Analyze uploaded lab reports, X-ray images, blood work results, and urinalysis reports to help dog owners understand their pet's test results.
</role>

<image_validation>
FIRST, determine if the image contains a veterinary lab report, medical document, or X-ray.

If the image does NOT contain a lab report or medical image:
- Set is_lab_report to false
- Set detected_type to "other"
- Set readability to "poor"
- Set readability_note to a description of what the image contains
- Set overall_assessment to "normal"
- Set summary to "This image does not appear to contain a lab report, X-ray, or medical document. Please upload a photo of your pet's lab results."
- Set values to []
- Set key_findings to []
- Set should_see_vet to false
- Set vet_urgency to "not_required"
- Set confidence to "high"
- Return immediately

Only proceed with analysis if the image IS a lab report or medical document.
</image_validation>

<lab_type>
Expected lab type from user: ${labType || 'Not specified'}
If the detected type differs from what the user selected, note this in your response and analyze based on what you actually see.
</lab_type>

<dog_profile>
Name: ${dog?.name || 'Unknown'}
Breed: ${dog?.breed || 'Unknown'}
Age: ${age}
Weight: ${dog?.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Not provided'}
Known allergies: ${dog?.allergies?.length > 0 ? dog.allergies.join(', ') : 'None reported'}
Known conditions: ${dog?.chronicConditions?.length > 0 ? dog.chronicConditions.join(', ') : 'None reported'}
Current medications: ${dog?.medications?.length > 0 ? dog.medications.map(m => m.name).join(', ') : 'None reported'}
</dog_profile>

${notes ? `<owner_notes>\n${notes}\n</owner_notes>` : ''}

<analysis_instructions>
For BLOOD WORK / CBC / Chemistry panels:
- Extract ALL readable values with their reference ranges
- Mark each value as normal, high, low, or critical
- Highlight abnormal values with clear explanations
- Consider breed-specific normal ranges when applicable
- Note if medications could affect results

For X-RAYS / RADIOGRAPHS:
- Describe what you observe in the image
- Note any abnormalities in bone structure, soft tissue, or organ appearance
- Consider the dog's breed and size for normal anatomical variations
- Be clear about limitations of AI interpretation of radiographs

For URINALYSIS:
- Extract all readable values (pH, specific gravity, protein, glucose, etc.)
- Flag abnormal concentrations
- Note potential implications

For ALL types:
- Use dog-specific reference ranges (not human ranges)
- Consider the dog's age, breed, and known conditions
- Always recommend professional veterinary review for concerning findings
- Be educational and help the owner understand what the results mean
</analysis_instructions>

<constraints>
- Never claim certainty in diagnosis from lab results alone
- Use phrases like "these values may suggest", "this could indicate", "worth discussing with your vet"
- Factor in the dog's profile (breed, age, medications) when interpreting results
- For any critical values, always recommend veterinary attention
- Always include the disclaimer that AI interpretation is not a substitute for veterinary review
</constraints>

Analyze the image and provide a structured interpretation. Use the dog's profile data above in your response.`
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

const ERROR_MESSAGES = {
  safety_block: "I couldn't analyze this content due to safety guidelines. Please try a different photo or rephrase your question.",
  timeout: "The request took too long. Please try again.",
  rate_limit: "I'm receiving too many requests right now. Please wait a moment and try again.",
  auth_error: "There's an issue with the API configuration. Please check your API key.",
  unknown: "Something went wrong. Please try again."
}

function buildError(errorType) {
  return { error: true, errorType, message: ERROR_MESSAGES[errorType] }
}

function handleGeminiError(error, response) {
  if (response?.candidates?.[0]?.finishReason === 'SAFETY') return buildError('safety_block')
  if (error?.message?.includes('timed out')) return buildError('timeout')
  if (error?.status === 429 || error?.message?.includes('quota')) return buildError('rate_limit')
  if (error?.status === 401 || error?.status === 403) return buildError('auth_error')
  return buildError('unknown')
}

function cleanJsonText(text) {
  let cleaned = text.trim()
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  return jsonMatch ? jsonMatch[0] : cleaned
}

function ensureArray(val) {
  return Array.isArray(val) ? val : []
}

function ensureString(val, fallback = '') {
  return typeof val === 'string' ? val : fallback
}

function ensureBool(val, fallback = false) {
  return typeof val === 'boolean' ? val : fallback
}

function ensureStringOrNull(val) {
  return typeof val === 'string' ? val : null
}

function parseGeminiChatResponse(text) {
  const defaults = {
    message: text,
    follow_up_questions: [],
    quick_replies: [],
    concerns_detected: false,
    suggested_action: 'continue_chat',
    urgency_level: 'low',
    symptoms_mentioned: [],
    possible_conditions: [],
    recommended_actions: [],
    home_care_tips: [],
    should_see_vet: false,
    emergency_steps: []
  }

  try {
    const parsed = JSON.parse(cleanJsonText(text))
    return {
      success: true,
      message: ensureString(parsed.response || parsed.message, text),
      follow_up_questions: ensureArray(parsed.follow_up_questions),
      quick_replies: ensureArray(parsed.quick_replies),
      concerns_detected: ensureBool(parsed.concerns_detected, false),
      suggested_action: ensureString(parsed.suggested_action, 'continue_chat'),
      urgency_level: ensureString(parsed.urgency_level, 'low'),
      symptoms_mentioned: ensureArray(parsed.symptoms_mentioned),
      possible_conditions: ensureArray(parsed.possible_conditions),
      recommended_actions: ensureArray(parsed.recommended_actions),
      home_care_tips: ensureArray(parsed.home_care_tips),
      should_see_vet: ensureBool(parsed.should_see_vet, false),
      emergency_steps: ensureArray(parsed.emergency_steps)
    }
  } catch {
    return { success: false, ...defaults }
  }
}

function parsePhotoAnalysisResponse(text, fallbackSummary = '') {
  const defaults = {
    error: false,
    is_dog: true,
    detected_subject: 'dog',
    detected_breed: null,
    breed_matches_profile: true,
    image_quality: 'good',
    image_quality_note: null,
    urgency_level: 'moderate',
    confidence: 'medium',
    possible_conditions: [],
    visible_symptoms: [],
    recommended_actions: ['Consult with a veterinarian for proper diagnosis'],
    should_see_vet: true,
    vet_urgency: 'within_week',
    home_care_tips: [],
    summary: fallbackSummary || 'Assessment complete.'
  }

  try {
    const parsed = JSON.parse(cleanJsonText(text))
    return {
      error: false,
      is_dog: ensureBool(parsed.is_dog, true),
      detected_subject: ensureString(parsed.detected_subject, 'dog'),
      detected_breed: ensureStringOrNull(parsed.detected_breed),
      breed_matches_profile: ensureBool(parsed.breed_matches_profile, true),
      image_quality: ensureString(parsed.image_quality, 'good'),
      image_quality_note: ensureStringOrNull(parsed.image_quality_note),
      urgency_level: ensureString(parsed.urgency_level, 'moderate'),
      confidence: ensureString(parsed.confidence, 'medium'),
      possible_conditions: ensureArray(parsed.possible_conditions),
      visible_symptoms: ensureArray(parsed.visible_symptoms),
      recommended_actions: ensureArray(parsed.recommended_actions).length > 0 ? parsed.recommended_actions : defaults.recommended_actions,
      should_see_vet: ensureBool(parsed.should_see_vet, true),
      vet_urgency: ensureString(parsed.vet_urgency, 'within_week'),
      home_care_tips: ensureArray(parsed.home_care_tips),
      summary: ensureString(parsed.summary, defaults.summary)
    }
  } catch {
    return defaults
  }
}

function parseLabAnalysisResponse(text, fallbackSummary = '') {
  const defaults = {
    error: false,
    is_lab_report: true,
    detected_type: 'other',
    readability: 'partial',
    readability_note: null,
    values: [],
    overall_assessment: 'needs_attention',
    summary: fallbackSummary || 'Lab analysis complete.',
    key_findings: [],
    abnormal_count: 0,
    possible_conditions: [],
    recommended_actions: ['Discuss these results with your veterinarian'],
    additional_tests_suggested: [],
    should_see_vet: true,
    vet_urgency: 'routine_checkup',
    confidence: 'medium',
  }

  try {
    const parsed = JSON.parse(cleanJsonText(text))
    return {
      error: false,
      is_lab_report: ensureBool(parsed.is_lab_report, true),
      detected_type: ensureString(parsed.detected_type, 'other'),
      readability: ensureString(parsed.readability, 'partial'),
      readability_note: ensureStringOrNull(parsed.readability_note),
      values: ensureArray(parsed.values),
      overall_assessment: ensureString(parsed.overall_assessment, 'needs_attention'),
      summary: ensureString(parsed.summary, defaults.summary),
      key_findings: ensureArray(parsed.key_findings),
      abnormal_count: typeof parsed.abnormal_count === 'number' ? parsed.abnormal_count : 0,
      possible_conditions: ensureArray(parsed.possible_conditions),
      recommended_actions: ensureArray(parsed.recommended_actions).length > 0 ? parsed.recommended_actions : defaults.recommended_actions,
      additional_tests_suggested: ensureArray(parsed.additional_tests_suggested),
      should_see_vet: ensureBool(parsed.should_see_vet, true),
      vet_urgency: ensureString(parsed.vet_urgency, 'routine_checkup'),
      confidence: ensureString(parsed.confidence, 'medium'),
    }
  } catch {
    return defaults
  }
}

function buildChatHistory(history) {
  const validHistory = history.filter(msg => msg.role === 'user' || msg.role === 'assistant')
  const firstUserIndex = validHistory.findIndex(msg => msg.role === 'user')
  if (firstUserIndex === -1) return []

  return validHistory.slice(firstUserIndex).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))
}

function formatChatResponse(parsed) {
  const { success: _S, ...fields } = parsed
  return { error: false, ...fields }
}

const MOCK_ERROR_PREFIXES = ['api_', 'safety_', 'auth_', 'network_']

function isErrorScenario(scenario) {
  return MOCK_ERROR_PREFIXES.some(prefix => scenario.startsWith(prefix))
}

async function handleMockMode(getResponse) {
  const scenario = getMockScenario()
  await new Promise(resolve => setTimeout(resolve, getMockDelay()))
  if (isErrorScenario(scenario)) return getMockErrorResponse(scenario)
  return getResponse(scenario)
}

export const geminiService = {
  isConfigured() {
    return !!apiKey
  },

  async chat(dog, userMessage, history = [], photoContext = null, healthEvents = [], isPremium = false) {
    if (isMockModeEnabled()) return handleMockMode(getMockChatResponse)

    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    return this._executeChat(ai, PRIMARY_MODEL, dog, userMessage, history, photoContext, healthEvents, isPremium)
  },

  async _executeChat(ai, modelName, dog, userMessage, history, photoContext, healthEvents, isPremium) {
    try {
      // Load PetFacts for context enrichment
      const petFacts = dog?.id ? LocalStorageService.getPetFacts(dog.id) : []

      // Extract conversation tags from recent messages for relevance scoring
      const conversationTags = (history || [])
        .filter(msg => msg.role === 'user')
        .slice(-3)
        .flatMap(msg => (msg.content || '').toLowerCase().split(/\s+/).filter(w => w.length > 3))

      // Build prioritized AI context via contextBuilder
      const { systemPrompt } = buildAIContext({
        dog,
        petFacts,
        isPremium,
        conversationTags,
        photoContext,
      })

      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: chatResponseSchema,
        },
        systemInstruction: systemPrompt,
      })

      const chat = model.startChat({ history: buildChatHistory(history) })
      const result = await withRetry(() => withTimeout(chat.sendMessage(userMessage)))
      const response = result.response

      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      return formatChatResponse(parseGeminiChatResponse(response.text()))
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Gemini Chat Error (${modelName}):`, error)

      if (modelName === PRIMARY_MODEL && (error.message?.includes('not found') || error.message?.includes('404'))) {
        return this._executeChat(ai, FALLBACK_MODEL, dog, userMessage, history, photoContext, healthEvents, isPremium)
      }

      return handleGeminiError(error, null)
    }
  },

  async analyzePhoto(imageBase64, mimeType, dog, bodyArea = '', description = '') {
    if (isMockModeEnabled()) return handleMockMode(getMockPhotoResponse)

    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    return this._executePhotoAnalysis(ai, PRIMARY_MODEL, imageBase64, mimeType, dog, bodyArea, description)
  },

  async _executePhotoAnalysis(ai, modelName, imageBase64, mimeType, dog, bodyArea, description) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: photoAnalysisSchema,
        },
        systemInstruction: buildPhotoAnalysisSystemPrompt(dog, bodyArea, description),
      })

      const result = await withRetry(() => withTimeout(model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },
        { text: 'Analyze this image for health concerns. Follow the instructions in the system prompt.' }
      ])))

      const response = result.response

      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      const text = response.text()
      const truncatedSummary = text.slice(0, 200) + (text.length > 200 ? '...' : '')
      return parsePhotoAnalysisResponse(text, truncatedSummary)
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Gemini Photo Analysis Error (${modelName}):`, error)

      if (modelName === PRIMARY_MODEL && (error.message?.includes('not found') || error.message?.includes('404'))) {
        return this._executePhotoAnalysis(ai, FALLBACK_MODEL, imageBase64, mimeType, dog, bodyArea, description)
      }

      return handleGeminiError(error, null)
    }
  },

  async analyzeLab(imageBase64, mimeType, dog, labType = '', notes = '') {
    if (isMockModeEnabled()) return handleMockMode(getMockPhotoResponse)

    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    return this._executeLabAnalysis(ai, PRIMARY_MODEL, imageBase64, mimeType, dog, labType, notes)
  },

  async _executeLabAnalysis(ai, modelName, imageBase64, mimeType, dog, labType, notes) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: labAnalysisSchema,
        },
        systemInstruction: buildLabAnalysisSystemPrompt(dog, labType, notes),
      })

      const result = await withRetry(() => withTimeout(model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },
        { text: 'Analyze this lab report/medical image. Follow the instructions in the system prompt.' }
      ])))

      const response = result.response

      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      const text = response.text()
      const truncatedSummary = text.slice(0, 200) + (text.length > 200 ? '...' : '')
      return parseLabAnalysisResponse(text, truncatedSummary)
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Gemini Lab Analysis Error (${modelName}):`, error)

      if (modelName === PRIMARY_MODEL && (error.message?.includes('not found') || error.message?.includes('404'))) {
        return this._executeLabAnalysis(ai, FALLBACK_MODEL, imageBase64, mimeType, dog, labType, notes)
      }

      return handleGeminiError(error, null)
    }
  },

  async streamChat(dog, userMessage, history = [], onChunk, isPremium = false) {
    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured.')
    }

    try {
      const petFacts = dog?.id ? LocalStorageService.getPetFacts(dog.id) : []
      const { systemPrompt } = buildAIContext({ dog, petFacts, isPremium })

      const model = ai.getGenerativeModel({
        model: PRIMARY_MODEL,
        generationConfig,
        systemInstruction: systemPrompt,
      })

      const chat = model.startChat({ history: buildChatHistory(history) })
      const result = await chat.sendMessageStream(userMessage)

      let fullText = ''
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        fullText += chunkText
        onChunk?.(chunkText, fullText)
      }

      return {
        error: false,
        message: fullText,
        follow_up_questions: [],
        concerns_detected: false,
        suggested_action: 'continue_chat'
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Gemini Stream Error:', error)
      return handleGeminiError(error, null)
    }
  }
}
