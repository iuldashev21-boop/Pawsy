import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  isMockModeEnabled,
  getMockScenario,
  getMockDelay,
  getMockChatResponse,
  getMockPhotoResponse,
  getMockErrorResponse
} from '../dev/mockResponses'

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
Sex: ${dog.sex || 'Unknown'}
Known Allergies: ${dog.allergies?.length > 0 ? dog.allergies.join(', ') : 'None reported'}
Known Conditions: ${dog.conditions?.length > 0 ? dog.conditions.join(', ') : 'None reported'}

ONLY ask about: symptoms, timeline, what was eaten/amount, behavior changes - NOT profile data.

For toxicity questions: "Based on ${dog.name}'s weight of ${dog.weight || '[weight]'} ${dog.weightUnit || 'lbs'}, eating [amount] of [substance] is [risk level]..."
</dog_profile>

<allergy_protocol>
*** CRITICAL - ALLERGY SAFETY ***

${dog.name}'s KNOWN ALLERGIES: ${dog.allergies?.length > 0 ? dog.allergies.join(', ') : 'None'}

YOU MUST NEVER:
- Recommend ANY food, treat, or ingredient that ${dog.name} is allergic to
- Suggest bland diets containing allergens (e.g., if allergic to chicken, NEVER suggest "boiled chicken and rice")
- Overlook allergies when suggesting home remedies or foods

ALWAYS:
- Check every food recommendation against the allergy list above
- If a common remedy contains an allergen, suggest an ALTERNATIVE (e.g., "Since ${dog.name} is allergic to chicken, use boiled turkey or lean ground beef instead")
- Acknowledge the allergy when relevant: "Since ${dog.name} is allergic to [allergen], avoid..."
- If the current issue involves an allergen exposure, prioritize this in your assessment

Common bland diet alternatives by allergen:
- Chicken allergy: Use turkey, lean beef, or white fish instead
- Beef allergy: Use chicken, turkey, or white fish instead
- Grain allergy: Use plain pumpkin, sweet potato, or white rice (if tolerated)
- Dairy allergy: Avoid any milk, cheese, or yogurt suggestions

This is a SAFETY-CRITICAL requirement. Recommending an allergen could harm ${dog.name}.
</allergy_protocol>

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

  async chat(dog, userMessage, history = [], photoContext = null) {
    if (isMockModeEnabled()) return handleMockMode(getMockChatResponse)

    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    return this._executeChat(ai, PRIMARY_MODEL, dog, userMessage, history, photoContext)
  },

  async _executeChat(ai, modelName, dog, userMessage, history, photoContext) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: chatResponseSchema,
        },
        systemInstruction: buildChatSystemPrompt(dog, photoContext),
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
        return this._executeChat(ai, FALLBACK_MODEL, dog, userMessage, history, photoContext)
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

  async streamChat(dog, userMessage, history = [], onChunk) {
    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured.')
    }

    try {
      const model = ai.getGenerativeModel({
        model: PRIMARY_MODEL,
        generationConfig,
        systemInstruction: buildChatSystemPrompt(dog),
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
