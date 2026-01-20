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

// Structured Output Schemas - Used with native JSON mode for reliable parsing
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
CRITICAL: Use this data in ALL responses - do NOT ask for information you already have!

Name: ${dog.name || 'Unknown'} (use naturally in responses)
Breed: ${dog.breed || 'Unknown'} (factor in breed-specific health risks)
Age: ${age}
Weight: ${dog.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Not provided'} (use for toxicity/dosage calculations)
Allergies: ${dog.allergies?.length > 0 ? dog.allergies.join(', ') : 'None reported'}

ONLY ask about: symptoms, timeline, what was eaten/amount, behavior changes - NOT profile data.

For toxicity questions: "Based on ${dog.name}'s weight of ${dog.weight || '[weight]'} ${dog.weightUnit || 'lbs'}, eating [amount] of [substance] is [risk level]..."
</dog_profile>

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
ONLY suggest tests when user is UNCERTAIN ("I don't know", "not sure", "can't tell"). Do NOT use tests in initial questions.

Quick tests to suggest (choose 1-2 relevant to symptoms):
- APPETITE: Offer treat without giving it - eager, turns away, or ignores?
- ENERGY: Call name from another room - comes running, slowly, or not at all?
- HYDRATION: Pinch neck skin - should snap back within 2 seconds
- GUMS: Press until white, should turn pink in 2 seconds. Color should be pink (pale/blue/red = concerning)
- PAIN: Run hands over body - flinch or react to specific areas?
- BELLY: Gently feel - soft or hard/tense? Any reaction to pressure?
- BREATHING: Count breaths for 30 sec × 2 (normal: 15-30/min at rest)

When user says "I'm not sure": Turn uncertainty into a simple test with clear outcomes.
Example: "Let's check! Grab ${dog.name}'s favorite treat and hold it near. If ${dog.name} sniffs eagerly → appetite good. Turns away → reduced. Ignores completely → concerning."
</at_home_diagnostic_tests>

<output_format>
Respond conversationally and CONCISELY. Keep initial responses SHORT - don't overwhelm the user.
- Set concerns_detected to true if the user mentions any health symptoms or worries
- Suggest follow_up_questions (max 3) ONLY for information NOT in the dog profile
- Keep questions SIMPLE and direct. Do NOT add at-home tests with initial questions
- ONLY suggest at-home tests when the user says "I don't know", "not sure", "can't tell", etc.
- Set suggested_action appropriately based on severity
- For emergencies, include emergency_steps array with first-aid actions
</output_format>

<example_response>
User: "Max has been scratching his ears a lot"

Good response format:
"I noticed Max has been scratching his ears - that's definitely worth looking into! Ear issues are common in Golden Retrievers due to their floppy ears that can trap moisture.

This could be anything from allergies to an ear infection. A few questions to help me understand better:

1) Do you notice any smell or discharge from his ears?
2) Is he shaking his head frequently?
3) How long has this been going on?"

Note how this:
- Uses Max's name naturally (from profile)
- References breed-specific info (Golden Retrievers)
- Asks simple, direct questions
- Puts numbered questions at the end
</example_response>`
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

<example_assessment>
For a photo showing a red, irritated patch on a dog's belly:

summary: "I can see a red, slightly raised area on Buddy's belly that appears inflamed. This could be a hot spot, allergic reaction, or insect bite."
urgency_level: "moderate"
possible_conditions: ["Hot spot (acute moist dermatitis)", "Contact dermatitis", "Insect bite reaction"]
recommended_actions: ["Keep the area clean and dry", "Prevent Buddy from licking it (consider e-collar)", "Monitor for spreading or worsening"]
</example_assessment>

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

  // Handle various markdown code fence formats
  cleaned = cleaned.replace(/^```json\s*/i, '')
  cleaned = cleaned.replace(/^```\s*/i, '')
  cleaned = cleaned.replace(/\s*```$/i, '')
  cleaned = cleaned.trim()

  // Try to extract JSON if it's embedded in other text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }

  try {
    const parsed = JSON.parse(cleaned)
    return {
      success: true,
      message: parsed.response || parsed.message || cleaned,
      follow_up_questions: parsed.follow_up_questions || [],
      quick_replies: parsed.quick_replies || [],
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

      // Use native JSON mode with schema for reliable structured output
      const model = ai.getGenerativeModel({
        model: PRIMARY_MODEL,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: chatResponseSchema,
        },
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

      const result = await chat.sendMessage(userMessage)
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
        quick_replies: parsed.quick_replies,
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
      // Use native JSON mode with schema for reliable structured output
      const model = ai.getGenerativeModel({
        model: FALLBACK_MODEL,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: chatResponseSchema,
        },
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

      const result = await chat.sendMessage(userMessage)
      const text = result.response.text()

      // Parse the response using helper
      const parsed = parseGeminiChatResponse(text)
      return {
        error: false,
        message: parsed.message,
        follow_up_questions: parsed.follow_up_questions,
        quick_replies: parsed.quick_replies,
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

      // Use native JSON mode with schema for reliable structured output
      const model = ai.getGenerativeModel({
        model: PRIMARY_MODEL,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: photoAnalysisSchema,
        },
        systemInstruction: systemPrompt,
      })

      // IMPORTANT: Image FIRST, then text prompt (per Google's best practices)
      const prompt = `Analyze this image for health concerns. Follow the instructions in the system prompt.`

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
      // Use native JSON mode with schema for reliable structured output
      const model = ai.getGenerativeModel({
        model: FALLBACK_MODEL,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: photoAnalysisSchema,
        },
        systemInstruction: systemPrompt,
      })

      const result = await model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },
        { text: 'Analyze this image for health concerns. Follow the instructions in the system prompt.' }
      ])

      const text = result.response.text()

      // With native JSON mode, response should be valid JSON
      try {
        const parsed = JSON.parse(text)
        return {
          error: false,
          is_dog: parsed.is_dog ?? true,
          detected_subject: parsed.detected_subject || 'dog',
          detected_breed: parsed.detected_breed || null,
          breed_matches_profile: parsed.breed_matches_profile ?? true,
          image_quality: parsed.image_quality || 'good',
          image_quality_note: parsed.image_quality_note || null,
          urgency_level: parsed.urgency_level || 'moderate',
          confidence: parsed.confidence || 'medium',
          possible_conditions: parsed.possible_conditions || [],
          visible_symptoms: parsed.visible_symptoms || [],
          recommended_actions: parsed.recommended_actions || ['Consult with a veterinarian'],
          should_see_vet: parsed.should_see_vet ?? true,
          vet_urgency: parsed.vet_urgency || 'within_week',
          home_care_tips: parsed.home_care_tips || [],
          summary: parsed.summary || 'Assessment complete.'
        }
      } catch {
        // Fallback if JSON parsing fails
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
