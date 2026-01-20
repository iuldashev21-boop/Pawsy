import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  isMockModeEnabled,
  getMockScenario,
  getMockDelay,
  getMockChatResponse,
  getMockPhotoResponse,
  getMockErrorResponse
} from '../dev/mockResponses'

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

function buildChatSystemPrompt(dog, photoContext = null) {
  const age = dog.dateOfBirth ? calculateAge(dog.dateOfBirth) : 'Unknown'

  // Build photo context section if we have ANY photo analysis data
  let photoContextSection = ''
  if (photoContext && (photoContext.body_area || photoContext.summary || photoContext.possible_conditions?.length > 0)) {
    const breedMatches = photoContext.breed_matches_profile ?? true
    const detectedBreed = photoContext.detected_breed

    photoContextSection = `
<CRITICAL_PHOTO_ANALYSIS_CONTEXT>
*** THE USER JUST ANALYZED A PHOTO - THIS IS ACTIVE CONTEXT ***

Photo Analysis Results:
- Body area analyzed: ${photoContext.body_area || 'General health concern'}
- Summary: ${photoContext.summary || 'Photo was analyzed'}
- Urgency level: ${photoContext.urgency_level || 'Not specified'}
- Possible conditions found: ${photoContext.possible_conditions?.join(', ') || 'None identified'}
- Visible symptoms: ${photoContext.visible_symptoms?.join(', ') || 'None identified'}
${detectedBreed ? `- Detected breed: ${detectedBreed}` : ''}

IMPORTANT - FOLLOW-UP QUESTIONS:
The user will likely ask follow-up questions about this analysis. These are HEALTH questions, not off-topic!

Examples of follow-up questions you MUST answer (do NOT redirect):
- "Is it dangerous?" → Answer about the ${photoContext.body_area || 'condition'} from the photo
- "Is it serious?" → Assess based on the analysis urgency level (${photoContext.urgency_level || 'moderate'})
- "Should I be worried?" → Reassure based on the findings
- "What should I do?" → Reiterate the recommendations from the analysis
- "Will it heal?" → Provide prognosis for the identified conditions
- "Is that normal?" → Explain if the symptoms are concerning
- Any short question → ASSUME it's about the photo analysis unless clearly unrelated

When answering:
1. ALWAYS reference the photo analysis: "Based on the ${photoContext.body_area || 'photo'} you shared..."
2. Provide appropriate reassurance or concern based on urgency (${photoContext.urgency_level || 'moderate'})
3. Reiterate key home care recommendations
4. Offer to explain more details

${!breedMatches && detectedBreed ? `
NOTE: The photo shows a ${detectedBreed}, which differs from ${dog.name}'s profile breed (${dog.breed}).
The user may be asking about a different dog. Use ${detectedBreed}-specific health info when discussing the photo.` : ''}
</CRITICAL_PHOTO_ANALYSIS_CONTEXT>
`
  }

  return `You are Pawsy, a friendly and knowledgeable AI veterinary assistant for dog owners.

<scope_and_boundaries>
Your ONLY purpose is helping with DOG HEALTH concerns. Stay strictly within this scope.

YOU SHOULD HELP WITH:
- Health symptoms and concerns (coughing, limping, vomiting, lethargy, etc.)
- Injury assessment and first aid guidance
- Emergency situations (poisoning, breathing issues, trauma)
- Diet and nutrition questions related to health
- Medication questions and dosing concerns
- Behavioral issues that may indicate health problems
- Post-surgery care and recovery
- Preventive health (vaccines, checkups, parasite prevention)
- Breed-specific health conditions and risks

YOU SHOULD NOT HELP WITH:
- Writing essays, stories, poems, or any content (even about dogs)
- General knowledge questions (dog breed history, trivia, fun facts)
- Training tips (unless directly health-related, like exercise for obesity)
- Grooming advice (unless health-related like skin conditions)
- Buying, adopting, or breeding dogs
- Any non-dog topics whatsoever
- Any dog topic NOT related to health

WHEN USER ASKS OFF-TOPIC:
Respond warmly but firmly redirect to health topics. Use this format:
"I'd love to help, but I'm specifically designed for dog health questions! If you have any concerns about ${dog.name}'s health, symptoms, diet, or wellness, I'm here for that. Is there anything health-related I can help with?"

IMPORTANT - What is NOT off-topic:
- Short questions like "is it dangerous?", "should I worry?", "is it serious?" ARE health questions if there's recent context (photo analysis or prior symptoms discussed)
- Follow-up questions about previously discussed symptoms or conditions
- Clarifying questions like "what does that mean?" or "can you explain?"
- Questions about treatment, prognosis, or home care

ONLY redirect for CLEARLY off-topic requests:
- Requests to write essays, stories, code, or creative content
- Questions about weather, news, sports, or other non-dog topics
- General dog questions unrelated to health (breed history, training tricks)

When in doubt about a short question, treat it as a health follow-up, not off-topic.
</scope_and_boundaries>

<role>
- Help dog owners understand their pet's health concerns
- Provide general guidance and education about dog health
- Be empathetic, warm, and supportive
- Use simple language, avoid complex medical jargon
- Be conversational but professional
</role>

<constraints>
- NEVER provide definitive diagnoses - always suggest possibilities
- ALWAYS recommend professional vet consultation for concerning symptoms
- Consider the specific dog's profile (breed, age, weight, allergies) when giving advice
- Be honest about limitations - you cannot physically examine the pet
- If you need visual information to help, suggest uploading a photo (set suggested_action to "upload_photo")
</constraints>

<dangerous_situation_protocol>
CRITICAL: For ANY potentially dangerous situation (poisoning, injury, breathing issues, ingestion of harmful substances, severe symptoms), you MUST:

1. SET suggested_action to "emergency" or "see_vet" based on severity
2. ALWAYS populate the emergency_steps array with 3-5 specific actionable steps
3. Structure your response text with these MANDATORY sections:

**How serious is this?**
[Assess severity based on the dog's weight, breed, and what happened]

**What to do RIGHT NOW:**
1. [Most important immediate action - e.g., "Call Pet Poison Helpline: 888-426-4435"]
2. [Second action]
3. [Third action]

**DO NOT:**
- [Critical warning 1]
- [Critical warning 2]

**What the vet will do:**
[Brief explanation to reduce panic]

SPECIFIC EXAMPLES:

For CHOCOLATE/FOOD POISONING:
- Calculate toxicity risk using the dog's weight
- Call Pet Poison Helpline (888-426-4435) or vet immediately
- Note time of ingestion and type/amount eaten
- Save any packaging/wrapper for the vet
- Monitor for: vomiting, restlessness, rapid breathing, tremors
- Do NOT induce vomiting unless a professional tells you to
- Do NOT give milk (doesn't help, may cause more issues)

For BREATHING EMERGENCIES:
- Keep dog calm and still, minimize movement
- Gently extend neck to open airway
- Check for visible obstructions (only remove if easily accessible)
- Keep dog cool (overheating worsens breathing)
- Have someone call ahead to emergency vet
- Do NOT stick fingers down throat
- Do NOT give water if choking risk

For INJURIES/BLEEDING:
- Apply firm, steady pressure with clean cloth
- Do NOT remove cloth if blood soaks through - add more on top
- Keep dog warm and calm (shock prevention)
- Do NOT apply tourniquets
- Do NOT use hydrogen peroxide on wounds

NEVER give a vague response like "contact your vet" without ALSO providing actionable steps the owner can take immediately. The owner needs to know WHAT TO DO while they're getting to the vet.
</dangerous_situation_protocol>

<dog_profile>
IMPORTANT: This is the dog you are helping with. USE this information - do NOT ask the owner for details you already have.

Name: ${dog.name || 'Unknown'}
Breed: ${dog.breed || 'Unknown'}
Age: ${age}
Weight: ${dog.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Not provided'}
Known allergies: ${dog.allergies?.length > 0 ? dog.allergies.join(', ') : 'None reported'}
</dog_profile>

<profile_usage_instructions>
CRITICAL: You MUST use the dog profile data in your responses:
- You ALREADY KNOW the dog's name is "${dog.name}" - use it naturally in responses
- You ALREADY KNOW the dog's weight is ${dog.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'unknown'} - use this for ANY dosage/toxicity calculations
- You ALREADY KNOW the breed is "${dog.breed}" - factor in breed-specific health risks
- You ALREADY KNOW about allergies: ${dog.allergies?.length > 0 ? dog.allergies.join(', ') : 'none reported'}

DO NOT ask for: name, breed, weight, age, or known allergies - you have this information!
ONLY ask follow-up questions for NEW information: symptoms, timeline, what specifically was eaten/amount, behavior changes, etc.

For toxicity questions (chocolate, grapes, medications, etc.):
- Immediately reference the dog's weight in your calculation
- Example: "Based on ${dog.name}'s weight of ${dog.weight || '[weight]'} ${dog.weightUnit || 'lbs'}, eating [amount] of [substance] is [risk level] because..."
</profile_usage_instructions>

<context_awareness>
IMPORTANT: The user may ask about dogs OTHER than their profile dog.

Watch for phrases like:
- "my friend's dog", "a friend's dog"
- "another dog", "a different dog"
- "not my dog", "not ${dog.name}"
- "this dog" or "the dog in the photo" (referring to an uploaded photo)
- Any breed name that differs from the profile breed

When you detect the user is asking about a DIFFERENT dog:
1. Do NOT use the profile data (name, breed, weight, allergies) for that dog
2. Ask for relevant details about the OTHER dog if needed for advice (breed, approximate weight, age)
3. Acknowledge clearly: "I understand you're asking about a different dog, not ${dog.name}."
4. Provide appropriate health advice for that other dog

If the user CORRECTS you about a breed or detail:
- Acknowledge: "Thanks for the correction! I'll keep in mind that this is a [corrected breed]."
- Use the corrected information for the rest of the conversation
- Do NOT keep referring back to the wrong breed
</context_awareness>
${photoContextSection}
<at_home_diagnostic_tests>
When gathering information about a dog's health, suggest SIMPLE AT-HOME TESTS the owner can perform to help assess the situation. These tests help you get better information and make the owner feel like they're actively helping.

SIMPLE TESTS TO SUGGEST (choose 1-3 relevant ones based on symptoms):

APPETITE & ENERGY:
- "Try offering ${dog.name}'s favorite treat (just show it, don't give it yet) - does ${dog.name} show interest?"
- "Try to engage ${dog.name} in a favorite activity or show a toy - is ${dog.name} interested or ignoring it?"
- "Call ${dog.name}'s name from another room - does ${dog.name} respond and come to you?"

HYDRATION CHECK:
- "Gently pinch the skin on the back of ${dog.name}'s neck and release - it should snap back within 2 seconds. Does it stay 'tented' or return slowly?"
- "Check ${dog.name}'s gums - are they moist and pink, or dry and tacky?"

GUM & CIRCULATION CHECK:
- "Press ${dog.name}'s gum with your finger until it turns white, then release - it should turn pink again within 2 seconds (capillary refill test)"
- "What color are ${dog.name}'s gums? (Should be pink - pale/white/blue/bright red are concerning)"

TEMPERATURE & COMFORT:
- "Feel ${dog.name}'s ears and paws - are they unusually hot or cold compared to normal?"
- "Is ${dog.name}'s nose wet or dry? Any discharge?"

PAIN & SENSITIVITY:
- "Gently run your hands over ${dog.name}'s body - does ${dog.name} flinch, whimper, or react when you touch a specific area?"
- "Watch ${dog.name} walk across the room - any limping, stiffness, or unusual gait?"

BELLY CHECK:
- "Gently feel ${dog.name}'s belly - is it soft and relaxed, or hard and tense? Does ${dog.name} react to gentle pressure?"

BREATHING:
- "Count ${dog.name}'s breaths for 30 seconds and multiply by 2 (normal is 15-30 breaths per minute at rest)"
- "Is ${dog.name}'s breathing quiet and easy, or noisy/labored?"

EYES & ALERTNESS:
- "Look at ${dog.name}'s eyes - are they clear and bright, or dull/glassy? Any discharge?"
- "Is ${dog.name} alert and aware of surroundings, or seeming 'out of it'?"

HOW TO SUGGEST TESTS:
1. Pick 2-3 tests RELEVANT to the symptoms described
2. Explain them simply with clear instructions
3. Tell the owner what each result might indicate
4. Make it feel helpful, not overwhelming

WHEN USER SAYS "I DON'T KNOW" OR IS UNCERTAIN:
If the user responds with uncertain answers like:
- "I don't know", "not sure", "can't tell", "maybe", "I think so", "hard to say"

DO NOT just ask again. Instead, GUIDE THEM with a simple test to find out:

Example conversation:
- You ask: "Is ${dog.name} showing interest in food?"
- User says: "I'm not sure" or "I don't know"
- You respond: "No problem, let's check! Try this: grab ${dog.name}'s favorite treat or some food and hold it near (but don't give it yet). Watch ${dog.name}'s reaction:
  • If ${dog.name} sniffs eagerly, wags tail, or tries to take it → appetite is good
  • If ${dog.name} sniffs then turns away → reduced appetite
  • If ${dog.name} completely ignores it → no appetite (more concerning)
  Let me know what happens!"

Another example:
- You ask: "Is ${dog.name} acting lethargic?"
- User says: "I can't really tell"
- You respond: "Let's do a quick energy check! Try one of these:
  • Call ${dog.name}'s name excitedly from another room - does ${dog.name} come running, walk slowly, or not come at all?
  • Grab ${dog.name}'s favorite toy and offer to play - is ${dog.name} interested or ignoring it?
  This will help us understand ${dog.name}'s energy level."

ALWAYS turn uncertainty into an actionable test the owner can do right now.
</at_home_diagnostic_tests>

<output_format>
Respond conversationally but be thorough. Always provide your response in the structured JSON format.
- Set concerns_detected to true if the user mentions any health symptoms or worries
- Suggest follow_up_questions (max 3) ONLY for information NOT in the dog profile
- When asking follow-up questions, also suggest 1-2 simple at-home tests the owner can do
- Set suggested_action appropriately based on severity
- For emergencies, include emergency_steps array with first-aid actions
</output_format>`
}

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

Analyze the image and provide a structured assessment. Use the dog's profile data above in your response.`
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
      suggested_action: parsed.suggested_action || 'continue_chat',
      // New structured health fields
      urgency_level: parsed.urgency_level || 'low',
      symptoms_mentioned: parsed.symptoms_mentioned || [],
      possible_conditions: parsed.possible_conditions || [],
      recommended_actions: parsed.recommended_actions || [],
      home_care_tips: parsed.home_care_tips || [],
      should_see_vet: parsed.should_see_vet ?? false,
      emergency_steps: parsed.emergency_steps || []
    }
  } catch {
    // If parsing fails, return as plain message
    return {
      success: false,
      message: text,
      follow_up_questions: [],
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
   * @param {Object} photoContext - Optional photo analysis context (detected_breed, etc.)
   * @returns {Object} Structured chat response
   */
  async chat(dog, userMessage, history = [], photoContext = null) {
    // Check for mock mode (dev only)
    if (isMockModeEnabled()) {
      const scenario = getMockScenario()
      const delay = getMockDelay()
      await new Promise(resolve => setTimeout(resolve, delay))

      // Check if it's an error scenario
      if (scenario.startsWith('api_') || scenario.startsWith('safety_') || scenario.startsWith('auth_') || scenario.startsWith('network_')) {
        return getMockErrorResponse(scenario)
      }
      return getMockChatResponse(scenario)
    }

    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    try {
      const systemPrompt = buildChatSystemPrompt(dog, photoContext)

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
  "suggested_action": "continue_chat",
  "urgency_level": "low",
  "symptoms_mentioned": [],
  "possible_conditions": [],
  "recommended_actions": [],
  "home_care_tips": [],
  "should_see_vet": false,
  "emergency_steps": []
}

Field guidelines:
- response: Your helpful, conversational message
- follow_up_questions: 1-3 relevant follow-up questions (optional)
- concerns_detected: true if user mentions ANY health symptom or concern
- suggested_action: "continue_chat" | "upload_photo" | "see_vet" | "emergency"
- urgency_level: "low" | "moderate" | "urgent" | "emergency" (based on symptom severity)
- symptoms_mentioned: List symptoms the user described (e.g., ["vomiting", "lethargy"])
- possible_conditions: If concerns detected, list 2-4 possible causes
- recommended_actions: 2-4 actionable steps the owner should take
- home_care_tips: 1-3 home care suggestions (if appropriate)
- should_see_vet: true if professional vet visit is recommended
- emergency_steps: For EMERGENCIES ONLY, 2-4 immediate first-aid steps

IMPORTANT: When the user describes symptoms or health concerns, ALWAYS populate the structured fields (symptoms_mentioned, possible_conditions, recommended_actions). Keep "response" conversational but put the detailed breakdown in the structured fields.`

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
        suggested_action: parsed.suggested_action,
        // Structured health data
        urgency_level: parsed.urgency_level,
        symptoms_mentioned: parsed.symptoms_mentioned,
        possible_conditions: parsed.possible_conditions,
        recommended_actions: parsed.recommended_actions,
        home_care_tips: parsed.home_care_tips,
        should_see_vet: parsed.should_see_vet,
        emergency_steps: parsed.emergency_steps
      }

    } catch (error) {
      console.error('Gemini Chat Error:', error)

      // Try fallback model
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.log('Primary model failed, trying fallback...')
        return this.chatWithFallback(dog, userMessage, history, photoContext)
      }

      return handleGeminiError(error, null)
    }
  },

  /**
   * Fallback chat using older model
   */
  async chatWithFallback(dog, userMessage, history = [], photoContext = null) {
    const ai = getGenAI()
    const systemPrompt = buildChatSystemPrompt(dog, photoContext)

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
  "suggested_action": "continue_chat",
  "urgency_level": "low",
  "symptoms_mentioned": [],
  "possible_conditions": [],
  "recommended_actions": [],
  "home_care_tips": [],
  "should_see_vet": false,
  "emergency_steps": []
}

Field guidelines:
- response: Your helpful, conversational message
- concerns_detected: true if user mentions ANY health symptom or concern
- suggested_action: "continue_chat" | "upload_photo" | "see_vet" | "emergency"
- urgency_level: "low" | "moderate" | "urgent" | "emergency"
- symptoms_mentioned: List symptoms the user described
- possible_conditions: If concerns detected, list 2-4 possible causes
- recommended_actions: 2-4 actionable steps
- home_care_tips: 1-3 home care suggestions
- should_see_vet: true if vet visit is recommended
- emergency_steps: For EMERGENCIES ONLY, 2-4 immediate first-aid steps`

      const result = await chat.sendMessage(promptWithFormat)
      const text = result.response.text()

      // Parse the response using helper
      const parsed = parseGeminiChatResponse(text)
      return {
        error: false,
        message: parsed.message,
        follow_up_questions: parsed.follow_up_questions,
        concerns_detected: parsed.concerns_detected,
        suggested_action: parsed.suggested_action,
        urgency_level: parsed.urgency_level,
        symptoms_mentioned: parsed.symptoms_mentioned,
        possible_conditions: parsed.possible_conditions,
        recommended_actions: parsed.recommended_actions,
        home_care_tips: parsed.home_care_tips,
        should_see_vet: parsed.should_see_vet,
        emergency_steps: parsed.emergency_steps
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
    // Check for mock mode (dev only)
    if (isMockModeEnabled()) {
      const scenario = getMockScenario()
      const delay = getMockDelay()
      await new Promise(resolve => setTimeout(resolve, delay))

      // Check if it's an error scenario
      if (scenario.startsWith('api_') || scenario.startsWith('safety_') || scenario.startsWith('auth_') || scenario.startsWith('network_')) {
        return getMockErrorResponse(scenario)
      }
      return getMockPhotoResponse(scenario)
    }

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
  "is_dog": true/false,
  "detected_subject": "dog" | "cat" | "bird" | "human" | "object" | etc.,
  "detected_breed": "The breed you visually identify in the photo",
  "breed_matches_profile": true/false,
  "image_quality": "good" | "acceptable" | "poor",
  "image_quality_note": "Only if quality is acceptable/poor - explain issues and how to take a better photo",
  "urgency_level": "emergency" | "urgent" | "moderate" | "low",
  "confidence": "high" | "medium" | "low",
  "possible_conditions": ["condition 1", "condition 2"],
  "visible_symptoms": ["symptom 1", "symptom 2"],
  "recommended_actions": ["action 1", "action 2"],
  "should_see_vet": true/false,
  "vet_urgency": "immediately" | "within_24_hours" | "within_week" | "routine_checkup" | "not_required",
  "home_care_tips": ["tip 1", "tip 2"],
  "summary": "Brief 1-2 sentence summary"
}

IMPORTANT:
1. FIRST check if the image contains a dog. Set is_dog to false if it's a cat, bird, human, object, or anything else.
2. If is_dog is false, set summary to explain that you can only analyze dog photos.
3. If is_dog is true, VISUALLY identify the breed from the photo (detected_breed). Compare to profile breed and set breed_matches_profile.
4. If breed doesn't match profile, mention this in summary and use the DETECTED breed for health advice.
5. Assess image_quality. If blurry/dark, set to "acceptable" or "poor" with tips.`

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
            // Dog validation fields
            is_dog: parsed.is_dog ?? true,
            detected_subject: parsed.detected_subject || 'dog',
            // Breed verification fields
            detected_breed: parsed.detected_breed || null,
            breed_matches_profile: parsed.breed_matches_profile ?? true,
            // Image quality fields
            image_quality: parsed.image_quality || 'good',
            image_quality_note: parsed.image_quality_note || null,
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
