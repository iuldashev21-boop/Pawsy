import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  isMockModeEnabled,
  getMockScenario,
  getMockDelay,
  getMockChatResponse,
  getMockPhotoResponse,
  getMockErrorResponse,
  getMockLabResponse
} from '../dev/mockResponses'
import { buildAIContext } from '../ai/contextBuilder'
import LocalStorageService from '../storage/LocalStorageService'
import {
  buildXrayAnalysisSystemPrompt,
  buildBloodWorkAnalysisSystemPrompt,
  buildUrinalysisAnalysisSystemPrompt,
} from '../prompts/labPrompts'
import {
  xrayAnalysisSchema,
  bloodWorkAnalysisSchema,
  urinalysisAnalysisSchema,
} from '../prompts/labSchemas'
import {
  buildClinicalProfileSystemPrompt,
  clinicalProfileSchema,
} from '../prompts/clinicalProfilePrompts'
import {
  buildVetReportSystemPrompt,
  vetReportSchema,
} from '../prompts/vetReportPrompts'

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

// ---------------------------------------------------------------------------
// Specialized Lab Response Parsers (Phase 3)
// ---------------------------------------------------------------------------

function parseXrayAnalysisResponse(text) {
  const defaults = {
    error: false,
    is_xray: true,
    detected_species: 'dog',
    image_quality: 'acceptable',
    view_type: 'unknown',
    body_region: 'unknown',
    overall_impression: 'normal',
    findings: [],
    bone_assessment: null,
    soft_tissue_assessment: null,
    joint_assessment: null,
    foreign_body_detected: false,
    foreign_body_description: null,
    differential_diagnoses: [],
    additional_views_suggested: [],
    recommended_actions: ['Discuss these findings with your veterinarian'],
    summary: 'X-ray analysis complete.',
    confidence: 'medium',
  }

  try {
    const parsed = JSON.parse(cleanJsonText(text))
    return {
      error: false,
      is_xray: ensureBool(parsed.is_xray, true),
      detected_species: ensureString(parsed.detected_species, 'dog'),
      image_quality: ensureString(parsed.image_quality, 'acceptable'),
      view_type: ensureString(parsed.view_type, 'unknown'),
      body_region: ensureString(parsed.body_region, 'unknown'),
      overall_impression: ensureString(parsed.overall_impression, 'normal'),
      findings: ensureArray(parsed.findings),
      bone_assessment: ensureStringOrNull(parsed.bone_assessment),
      soft_tissue_assessment: ensureStringOrNull(parsed.soft_tissue_assessment),
      joint_assessment: ensureStringOrNull(parsed.joint_assessment),
      foreign_body_detected: ensureBool(parsed.foreign_body_detected, false),
      foreign_body_description: ensureStringOrNull(parsed.foreign_body_description),
      differential_diagnoses: ensureArray(parsed.differential_diagnoses),
      additional_views_suggested: ensureArray(parsed.additional_views_suggested),
      recommended_actions: ensureArray(parsed.recommended_actions).length > 0 ? parsed.recommended_actions : defaults.recommended_actions,
      summary: ensureString(parsed.summary, defaults.summary),
      confidence: ensureString(parsed.confidence, 'medium'),
    }
  } catch {
    return defaults
  }
}

function parseBloodWorkAnalysisResponse(text) {
  const defaults = {
    error: false,
    is_blood_work: true,
    detected_panel_type: 'other',
    readability: 'partial',
    values: [],
    organ_system_summary: [],
    medication_interactions: [],
    abnormal_count: 0,
    overall_assessment: 'needs_attention',
    key_findings: [],
    possible_conditions: [],
    recommended_actions: ['Discuss these results with your veterinarian'],
    summary: 'Blood work analysis complete.',
    confidence: 'medium',
  }

  try {
    const parsed = JSON.parse(cleanJsonText(text))
    return {
      error: false,
      is_blood_work: ensureBool(parsed.is_blood_work, true),
      detected_panel_type: ensureString(parsed.detected_panel_type, 'other'),
      readability: ensureString(parsed.readability, 'partial'),
      values: ensureArray(parsed.values),
      organ_system_summary: ensureArray(parsed.organ_system_summary),
      medication_interactions: ensureArray(parsed.medication_interactions),
      abnormal_count: typeof parsed.abnormal_count === 'number' ? parsed.abnormal_count : 0,
      overall_assessment: ensureString(parsed.overall_assessment, 'needs_attention'),
      key_findings: ensureArray(parsed.key_findings),
      possible_conditions: ensureArray(parsed.possible_conditions),
      recommended_actions: ensureArray(parsed.recommended_actions).length > 0 ? parsed.recommended_actions : defaults.recommended_actions,
      summary: ensureString(parsed.summary, defaults.summary),
      confidence: ensureString(parsed.confidence, 'medium'),
    }
  } catch {
    return defaults
  }
}

function parseUrinalysisAnalysisResponse(text) {
  const defaults = {
    error: false,
    is_urinalysis: true,
    readability: 'partial',
    physical_properties: null,
    chemical_analysis: [],
    sediment_findings: [],
    hydration_assessment: null,
    infection_indicators: false,
    overall_assessment: 'needs_attention',
    key_findings: [],
    possible_conditions: [],
    recommended_actions: ['Discuss these results with your veterinarian'],
    summary: 'Urinalysis complete.',
    confidence: 'medium',
  }

  try {
    const parsed = JSON.parse(cleanJsonText(text))
    return {
      error: false,
      is_urinalysis: ensureBool(parsed.is_urinalysis, true),
      readability: ensureString(parsed.readability, 'partial'),
      physical_properties: parsed.physical_properties || null,
      chemical_analysis: ensureArray(parsed.chemical_analysis),
      sediment_findings: ensureArray(parsed.sediment_findings),
      hydration_assessment: ensureStringOrNull(parsed.hydration_assessment),
      infection_indicators: ensureBool(parsed.infection_indicators, false),
      overall_assessment: ensureString(parsed.overall_assessment, 'needs_attention'),
      key_findings: ensureArray(parsed.key_findings),
      possible_conditions: ensureArray(parsed.possible_conditions),
      recommended_actions: ensureArray(parsed.recommended_actions).length > 0 ? parsed.recommended_actions : defaults.recommended_actions,
      summary: ensureString(parsed.summary, defaults.summary),
      confidence: ensureString(parsed.confidence, 'medium'),
    }
  } catch {
    return defaults
  }
}

function parseClinicalProfileResponse(text, dog) {
  const defaults = {
    error: false,
    overview: `${dog?.name || 'Your dog'}'s clinical profile is being generated.`,
    health_score: 'good',
    active_concerns: [],
    recent_diagnostics_summary: 'No recent diagnostic data available.',
    chronic_management: 'No ongoing conditions tracked.',
    breed_considerations: '',
    positive_indicators: [],
    recommendations: ['Continue regular veterinary checkups'],
    upcoming_care: [],
    confidence: 'low',
    data_quality_notes: 'Limited data available for comprehensive assessment.',
    generated_at: new Date().toISOString(),
  }

  try {
    const parsed = JSON.parse(cleanJsonText(text))
    return {
      error: false,
      overview: ensureString(parsed.overview, defaults.overview),
      health_score: ensureString(parsed.health_score, 'good'),
      active_concerns: ensureArray(parsed.active_concerns),
      recent_diagnostics_summary: ensureString(parsed.recent_diagnostics_summary, defaults.recent_diagnostics_summary),
      chronic_management: ensureString(parsed.chronic_management, defaults.chronic_management),
      breed_considerations: ensureString(parsed.breed_considerations, ''),
      positive_indicators: ensureArray(parsed.positive_indicators),
      recommendations: ensureArray(parsed.recommendations).length > 0 ? parsed.recommendations : defaults.recommendations,
      upcoming_care: ensureArray(parsed.upcoming_care),
      confidence: ensureString(parsed.confidence, 'medium'),
      data_quality_notes: ensureString(parsed.data_quality_notes, ''),
      generated_at: new Date().toISOString(),
    }
  } catch {
    return defaults
  }
}

function getMockClinicalProfile(dog) {
  const dogName = dog?.name || 'Your dog'
  return {
    error: false,
    overview: `${dogName} is a generally healthy ${dog?.breed || 'dog'} with good vitals and activity levels. Recent health monitoring shows consistent patterns with no major concerns detected.`,
    health_score: 'good',
    active_concerns: [
      {
        concern: 'Seasonal allergies',
        severity: 'low',
        details: 'Mild seasonal itching noted, common for the breed during spring months.',
        recommendation: 'Monitor for worsening symptoms; antihistamines may help if needed.'
      }
    ],
    recent_diagnostics_summary: 'Most recent blood work (demo) showed all values within normal ranges. No imaging studies on file.',
    chronic_management: dog?.medications?.length > 0
      ? `Currently managing with: ${dog.medications.join(', ')}`
      : 'No ongoing medications or chronic conditions tracked.',
    breed_considerations: dog?.breed
      ? `As a ${dog.breed}, monitor for breed-typical health concerns. Regular checkups recommended.`
      : 'Breed-specific considerations not available without breed information.',
    positive_indicators: [
      'Good appetite reported in recent observations',
      'Consistent activity levels',
      'No concerning symptoms in recent health history'
    ],
    recommendations: [
      'Continue regular veterinary checkups',
      'Maintain current diet and exercise routine',
      'Update vaccinations at next annual visit',
      'Monitor seasonal allergy symptoms',
      'Consider dental cleaning if not done recently'
    ],
    upcoming_care: [
      { item: 'Annual wellness exam', timeframe: 'Within 6 months', priority: 'routine' },
      { item: 'Heartworm prevention renewal', timeframe: 'Check current supply', priority: 'routine' }
    ],
    confidence: 'medium',
    data_quality_notes: 'This is a demo profile. Connect to real health data for accurate assessment.',
    generated_at: new Date().toISOString(),
  }
}

function parseVetReportResponse(text, dog, dateRange) {
  const defaults = {
    error: false,
    patient_header: {
      name: dog?.name || 'Patient',
      species: 'Canine',
      breed: dog?.breed || 'Unknown',
      age: 'Unknown',
      weight: dog?.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Not recorded',
      sex: dog?.sex || dog?.gender || 'Unknown',
    },
    report_date: new Date().toISOString(),
    report_period: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'All available data',
    subjective: {
      chief_concerns: [],
      history: 'No history available.',
      behavioral_notes: '',
    },
    objective: {
      current_medications: [],
      laboratory_findings: [],
      imaging_findings: [],
      allergies: dog?.allergies || [],
    },
    assessment: {
      problem_list: [],
      clinical_impression: 'Insufficient data for clinical assessment.',
      differentials: [],
    },
    plan: {
      follow_up: ['Schedule wellness examination'],
      monitoring: [],
      owner_instructions: [],
    },
    data_sources: ['AI-generated summary from available health records'],
    ai_disclosure: 'This report was generated by AI and is intended for informational purposes only. It is not a substitute for professional veterinary examination and diagnosis.',
    generated_at: new Date().toISOString(),
  }

  try {
    const parsed = JSON.parse(cleanJsonText(text))
    return {
      error: false,
      patient_header: parsed.patient_header || defaults.patient_header,
      report_date: ensureString(parsed.report_date, defaults.report_date),
      report_period: ensureString(parsed.report_period, defaults.report_period),
      subjective: parsed.subjective || defaults.subjective,
      objective: parsed.objective || defaults.objective,
      assessment: parsed.assessment || defaults.assessment,
      plan: parsed.plan || defaults.plan,
      data_sources: ensureArray(parsed.data_sources).length > 0 ? parsed.data_sources : defaults.data_sources,
      ai_disclosure: ensureString(parsed.ai_disclosure, defaults.ai_disclosure),
      generated_at: new Date().toISOString(),
    }
  } catch {
    return defaults
  }
}

function getMockVetReport(dog, dateRange) {
  const dogName = dog?.name || 'Patient'
  const today = new Date().toLocaleDateString()

  return {
    error: false,
    patient_header: {
      name: dogName,
      species: 'Canine',
      breed: dog?.breed || 'Mixed Breed',
      age: '4 years',
      weight: dog?.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : '55 lbs',
      sex: dog?.sex || dog?.gender || 'Male, Neutered',
    },
    report_date: new Date().toISOString(),
    report_period: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'Last 90 days',
    subjective: {
      chief_concerns: ['Routine wellness monitoring', 'Seasonal allergy management'],
      history: `${dogName} is a well-cared-for ${dog?.breed || 'canine'} with a history of mild seasonal allergies. Owner reports good appetite, normal activity levels, and regular exercise. No recent trauma or illness reported.`,
      behavioral_notes: 'Alert and active per owner report. Normal temperament observed.',
    },
    objective: {
      current_medications: dog?.medications?.length > 0
        ? dog.medications.map(m => ({
            medication: typeof m === 'string' ? m : m.name,
            dosage: typeof m === 'string' ? 'As prescribed' : (m.dosage || 'As prescribed'),
            indication: 'Per veterinary prescription',
          }))
        : [],
      laboratory_findings: [
        {
          test_date: today,
          test_type: 'CBC + Chemistry (Demo)',
          summary: 'All values within normal reference ranges',
          abnormal_values: [],
        },
      ],
      imaging_findings: [],
      allergies: dog?.allergies || ['NKDA'],
    },
    assessment: {
      problem_list: [
        {
          problem: 'Seasonal environmental allergies',
          status: 'stable',
          onset: 'Chronic, managed',
        },
      ],
      clinical_impression: `${dogName} appears to be in good overall health based on available data. Seasonal allergies are well-managed. No acute concerns identified at this time.`,
      differentials: [],
    },
    plan: {
      follow_up: [
        'Annual wellness examination due within 6 months',
        'Dental evaluation recommended at next visit',
      ],
      monitoring: [
        'Continue monitoring for seasonal allergy symptoms',
        'Weight management - maintain current healthy weight',
      ],
      owner_instructions: [
        'Continue current diet and exercise regimen',
        'Administer preventatives as prescribed',
        'Contact clinic if any new symptoms develop',
      ],
    },
    data_sources: [
      'Owner-reported history (via Pawsy app)',
      'AI analysis of uploaded lab results (demo mode)',
      'Health observations recorded in app',
    ],
    ai_disclosure: 'This report was generated by Pawsy AI and is intended for informational purposes only. It should not replace professional veterinary examination, diagnosis, or treatment. All clinical decisions should be made by a licensed veterinarian based on physical examination and diagnostic testing.',
    generated_at: new Date().toISOString(),
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
    if (isMockModeEnabled()) return handleMockMode((scenario) => getMockLabResponse(scenario, labType))

    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    // Route to specialized agent based on lab type
    const labTypeLower = labType.toLowerCase()
    if (labTypeLower.includes('x-ray') || labTypeLower.includes('xray') || labTypeLower.includes('radiograph')) {
      return this._executeXrayAnalysis(ai, PRIMARY_MODEL, imageBase64, mimeType, dog, notes)
    }
    if (labTypeLower.includes('blood') || labTypeLower.includes('cbc') || labTypeLower.includes('chemistry')) {
      return this._executeBloodWorkAnalysis(ai, PRIMARY_MODEL, imageBase64, mimeType, dog, notes)
    }
    if (labTypeLower.includes('urin')) {
      return this._executeUrinalysisAnalysis(ai, PRIMARY_MODEL, imageBase64, mimeType, dog, notes)
    }

    // Fallback to generic lab analysis
    return this._executeLabAnalysis(ai, PRIMARY_MODEL, imageBase64, mimeType, dog, labType, notes)
  },

  // ---------------------------------------------------------------------------
  // Specialized Lab Analysis Methods (Phase 3)
  // ---------------------------------------------------------------------------

  async _executeXrayAnalysis(ai, modelName, imageBase64, mimeType, dog, notes) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: xrayAnalysisSchema,
        },
        systemInstruction: buildXrayAnalysisSystemPrompt(dog, notes),
      })

      const result = await withRetry(() => withTimeout(model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },
        { text: 'Analyze this radiograph/X-ray. Follow the instructions in the system prompt.' }
      ])))

      const response = result.response
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      const text = response.text()
      return parseXrayAnalysisResponse(text)
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Gemini X-ray Analysis Error (${modelName}):`, error)
      if (modelName === PRIMARY_MODEL && (error.message?.includes('not found') || error.message?.includes('404'))) {
        return this._executeXrayAnalysis(ai, FALLBACK_MODEL, imageBase64, mimeType, dog, notes)
      }
      return handleGeminiError(error, null)
    }
  },

  async _executeBloodWorkAnalysis(ai, modelName, imageBase64, mimeType, dog, notes) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: bloodWorkAnalysisSchema,
        },
        systemInstruction: buildBloodWorkAnalysisSystemPrompt(dog, notes),
      })

      const result = await withRetry(() => withTimeout(model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },
        { text: 'Analyze this blood work panel. Follow the instructions in the system prompt.' }
      ])))

      const response = result.response
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      const text = response.text()
      return parseBloodWorkAnalysisResponse(text)
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Gemini Blood Work Analysis Error (${modelName}):`, error)
      if (modelName === PRIMARY_MODEL && (error.message?.includes('not found') || error.message?.includes('404'))) {
        return this._executeBloodWorkAnalysis(ai, FALLBACK_MODEL, imageBase64, mimeType, dog, notes)
      }
      return handleGeminiError(error, null)
    }
  },

  async _executeUrinalysisAnalysis(ai, modelName, imageBase64, mimeType, dog, notes) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: urinalysisAnalysisSchema,
        },
        systemInstruction: buildUrinalysisAnalysisSystemPrompt(dog, notes),
      })

      const result = await withRetry(() => withTimeout(model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },
        { text: 'Analyze this urinalysis report. Follow the instructions in the system prompt.' }
      ])))

      const response = result.response
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      const text = response.text()
      return parseUrinalysisAnalysisResponse(text)
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Gemini Urinalysis Analysis Error (${modelName}):`, error)
      if (modelName === PRIMARY_MODEL && (error.message?.includes('not found') || error.message?.includes('404'))) {
        return this._executeUrinalysisAnalysis(ai, FALLBACK_MODEL, imageBase64, mimeType, dog, notes)
      }
      return handleGeminiError(error, null)
    }
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
  },

  // ---------------------------------------------------------------------------
  // Clinical Profile Generation (Phase 7)
  // ---------------------------------------------------------------------------

  async generateClinicalProfile(dog, healthData) {
    if (isMockModeEnabled()) {
      await new Promise(resolve => setTimeout(resolve, getMockDelay()))
      return getMockClinicalProfile(dog)
    }

    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    return this._executeClinicalProfile(ai, PRIMARY_MODEL, dog, healthData)
  },

  async _executeClinicalProfile(ai, modelName, dog, healthData) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          maxOutputTokens: 4096, // Larger output for comprehensive profile
          responseMimeType: "application/json",
          responseSchema: clinicalProfileSchema,
        },
        systemInstruction: buildClinicalProfileSystemPrompt(dog, healthData),
      })

      const result = await withRetry(() => withTimeout(
        model.generateContent('Generate a comprehensive clinical profile for this dog based on all available health data.'),
        60000 // 60 second timeout for larger response
      ))

      const response = result.response
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      const text = response.text()
      return parseClinicalProfileResponse(text, dog)
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Gemini Clinical Profile Error (${modelName}):`, error)

      if (modelName === PRIMARY_MODEL && (error.message?.includes('not found') || error.message?.includes('404'))) {
        return this._executeClinicalProfile(ai, FALLBACK_MODEL, dog, healthData)
      }

      return handleGeminiError(error, null)
    }
  },

  // ---------------------------------------------------------------------------
  // Vet Report Generation (Phase 8)
  // ---------------------------------------------------------------------------

  async generateVetReport(dog, healthData, dateRange = null) {
    if (isMockModeEnabled()) {
      await new Promise(resolve => setTimeout(resolve, getMockDelay()))
      return getMockVetReport(dog, dateRange)
    }

    const ai = getGenAI()
    if (!ai) {
      throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    return this._executeVetReport(ai, PRIMARY_MODEL, dog, healthData, dateRange)
  },

  async _executeVetReport(ai, modelName, dog, healthData, dateRange) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...generationConfig,
          maxOutputTokens: 4096, // Larger output for comprehensive report
          responseMimeType: "application/json",
          responseSchema: vetReportSchema,
        },
        systemInstruction: buildVetReportSystemPrompt(dog, healthData, dateRange),
      })

      const result = await withRetry(() => withTimeout(
        model.generateContent('Generate a professional veterinary report based on all available health data.'),
        60000 // 60 second timeout for larger response
      ))

      const response = result.response
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        return handleGeminiError(null, response)
      }

      const text = response.text()
      return parseVetReportResponse(text, dog, dateRange)
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Gemini Vet Report Error (${modelName}):`, error)

      if (modelName === PRIMARY_MODEL && (error.message?.includes('not found') || error.message?.includes('404'))) {
        return this._executeVetReport(ai, FALLBACK_MODEL, dog, healthData, dateRange)
      }

      return handleGeminiError(error, null)
    }
  }
}
