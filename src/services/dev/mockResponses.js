export const CHAT_SCENARIOS = {
  HAPPY_PATH: {
    id: 'happy_path',
    label: 'Happy Path (Low Concern)',
    response: {
      error: false,
      message: "Based on what you've described, this sounds like a minor issue that's quite common. Your pup should be fine with some basic care at home. Keep an eye on things and let me know if anything changes!",
      follow_up_questions: [
        "Has this happened before?",
        "Any changes in appetite?",
        "Is your dog acting normally otherwise?"
      ],
      concerns_detected: true,
      suggested_action: 'continue_chat',
      urgency_level: 'low',
      symptoms_mentioned: ['Minor discomfort'],
      possible_conditions: ['Normal variation', 'Minor irritation', 'Temporary issue'],
      recommended_actions: [
        'Monitor for the next 24 hours',
        'Ensure fresh water is available',
        'Keep your dog comfortable and calm'
      ],
      home_care_tips: [
        'Rest and quiet time',
        'Normal diet unless vomiting'
      ],
      should_see_vet: false,
      emergency_steps: []
    }
  },

  MODERATE_CONCERN: {
    id: 'moderate',
    label: 'Moderate Concern',
    response: {
      error: false,
      message: "I'd like to learn more about this. While it's not necessarily an emergency, these symptoms are worth monitoring closely. If things don't improve in the next day or two, a vet visit would be a good idea.",
      follow_up_questions: [
        "How long has this been going on?",
        "Any other symptoms you've noticed?",
        "Has your dog eaten anything unusual?"
      ],
      concerns_detected: true,
      suggested_action: 'continue_chat',
      urgency_level: 'moderate',
      symptoms_mentioned: ['Lethargy', 'Reduced appetite', 'Mild discomfort'],
      possible_conditions: ['Mild infection', 'Dietary upset', 'Stress-related issue', 'Early-stage illness'],
      recommended_actions: [
        'Monitor symptoms closely for 24-48 hours',
        'Offer bland diet (boiled chicken and rice)',
        'Ensure plenty of rest',
        'Schedule vet appointment if no improvement'
      ],
      home_care_tips: [
        'Keep a symptom diary',
        'Take temperature if possible (normal: 101-102.5°F)',
        'Limit exercise'
      ],
      should_see_vet: false,
      emergency_steps: []
    }
  },

  URGENT_VET: {
    id: 'urgent',
    label: 'Urgent - See Vet',
    response: {
      error: false,
      message: "I'm concerned about what you're describing. While this isn't a life-threatening emergency, I strongly recommend seeing a vet within the next 24 hours. These symptoms shouldn't be ignored.",
      follow_up_questions: [
        "Can you get to a vet today?",
        "Is your dog still eating and drinking?"
      ],
      concerns_detected: true,
      suggested_action: 'see_vet',
      urgency_level: 'urgent',
      symptoms_mentioned: ['Persistent vomiting', 'Blood in stool', 'Severe lethargy', 'Refusing food'],
      possible_conditions: ['Infection requiring treatment', 'Gastrointestinal issue', 'Possible toxin exposure', 'Internal issue'],
      recommended_actions: [
        'Schedule vet appointment for today or tomorrow',
        'Do not give any medications without vet approval',
        'Keep your dog calm and comfortable',
        'Withhold food but offer small amounts of water'
      ],
      home_care_tips: [
        'Note down all symptoms and when they started',
        'Save any vomit or stool samples for the vet',
        'Keep your dog in a quiet, comfortable space'
      ],
      should_see_vet: true,
      emergency_steps: []
    }
  },

  EMERGENCY: {
    id: 'emergency',
    label: 'Emergency Response',
    response: {
      error: false,
      message: "**This is a potential emergency.** Based on what you've described, your dog needs immediate veterinary care. Please contact an emergency vet right away or head to the nearest animal hospital.",
      follow_up_questions: [],
      concerns_detected: true,
      suggested_action: 'emergency',
      urgency_level: 'emergency',
      symptoms_mentioned: ['Difficulty breathing', 'Collapse', 'Severe bleeding', 'Seizures', 'Unresponsive'],
      possible_conditions: ['Acute poisoning', 'Bloat/GDV', 'Severe trauma', 'Cardiac emergency', 'Anaphylaxis'],
      recommended_actions: [
        'Call emergency vet immediately: Find nearest 24hr clinic',
        'Keep your dog calm and still',
        'Do NOT induce vomiting unless directed by a vet',
        'Head to emergency vet NOW'
      ],
      home_care_tips: [],
      should_see_vet: true,
      emergency_steps: [
        'Call Pet Poison Helpline (888-426-4435) or emergency vet',
        'Keep your dog calm - minimize movement',
        'Note the time symptoms started',
        'Bring any packaging/substances your dog may have ingested'
      ]
    }
  },

  PHOTO_SUGGESTION: {
    id: 'photo_suggestion',
    label: 'Suggests Photo Upload',
    response: {
      error: false,
      message: "I'd really like to help you with this, but I think seeing the affected area would give me a much better understanding. Would you be able to share a photo? You can use the Photo Analysis feature to get a detailed assessment.",
      follow_up_questions: [
        "Can you describe what it looks like?",
        "Is there any swelling or discoloration?"
      ],
      concerns_detected: true,
      suggested_action: 'upload_photo',
      urgency_level: 'moderate',
      symptoms_mentioned: ['Skin issue', 'Visible abnormality'],
      possible_conditions: ['Skin condition', 'Injury', 'Allergic reaction', 'Infection'],
      recommended_actions: [
        'Take a clear, well-lit photo of the affected area',
        'Use the Photo Analysis feature for detailed assessment',
        'Keep the area clean in the meantime'
      ],
      home_care_tips: [],
      should_see_vet: false,
      emergency_steps: []
    }
  },

  OFF_TOPIC: {
    id: 'off_topic',
    label: 'Off-Topic Response',
    response: {
      error: false,
      message: "I'd love to help, but I'm specifically designed for dog health questions! If you have any concerns about your pup's health, symptoms, diet, or wellness, I'm here for that. Is there anything health-related I can help with?",
      follow_up_questions: [
        "Do you have any health concerns about your dog?",
        "Would you like tips on preventive care?"
      ],
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

export const PHOTO_SCENARIOS = {
  HEALTHY: {
    id: 'healthy',
    label: 'Healthy - Low Concern',
    response: {
      error: false,
      is_dog: true,
      detected_subject: 'dog',
      detected_breed: 'Labrador Retriever',
      breed_matches_profile: true,
      image_quality: 'good',
      image_quality_note: null,
      urgency_level: 'low',
      confidence: 'high',
      possible_conditions: ['Normal appearance', 'Minor dryness', 'No significant concerns'],
      visible_symptoms: ['Slight redness (normal variation)', 'Minor coat roughness'],
      recommended_actions: [
        'Continue regular grooming routine',
        'Monitor for any changes',
        'Maintain normal diet and exercise'
      ],
      should_see_vet: false,
      vet_urgency: 'not_required',
      home_care_tips: [
        'Regular brushing helps maintain coat health',
        'Ensure adequate hydration'
      ],
      summary: "Good news! The area you're concerned about looks normal. I don't see any signs of infection, injury, or other issues that would require immediate attention."
    }
  },

  MODERATE_ISSUE: {
    id: 'moderate_issue',
    label: 'Moderate - Monitor',
    response: {
      error: false,
      is_dog: true,
      detected_subject: 'dog',
      detected_breed: 'Golden Retriever',
      breed_matches_profile: true,
      image_quality: 'good',
      image_quality_note: null,
      urgency_level: 'moderate',
      confidence: 'medium',
      possible_conditions: ['Minor skin irritation', 'Allergic reaction', 'Hot spot developing', 'Mild infection'],
      visible_symptoms: ['Redness', 'Slight swelling', 'Hair loss in small area', 'Possible scratching damage'],
      recommended_actions: [
        'Keep the area clean and dry',
        'Prevent licking with an e-collar if needed',
        'Monitor for worsening over 24-48 hours',
        'Schedule vet visit if no improvement'
      ],
      should_see_vet: false,
      vet_urgency: 'within_week',
      home_care_tips: [
        'Apply a cool compress to reduce inflammation',
        'Avoid using human products on the area',
        'Check for fleas or other parasites'
      ],
      summary: "I can see an area of mild irritation that's worth monitoring. While it doesn't look serious, keep an eye on it and prevent your dog from licking or scratching."
    }
  },

  URGENT_ISSUE: {
    id: 'urgent_issue',
    label: 'Urgent - Vet Needed',
    response: {
      error: false,
      is_dog: true,
      detected_subject: 'dog',
      detected_breed: 'German Shepherd',
      breed_matches_profile: true,
      image_quality: 'good',
      image_quality_note: null,
      urgency_level: 'urgent',
      confidence: 'high',
      possible_conditions: ['Infected wound', 'Deep hot spot', 'Abscess', 'Severe allergic reaction'],
      visible_symptoms: ['Significant swelling', 'Discharge or pus', 'Deep redness', 'Open wound', 'Hair matting from discharge'],
      recommended_actions: [
        'See a veterinarian within 24 hours',
        'Do not apply any ointments without vet guidance',
        'Prevent your dog from licking the area',
        'Keep the area as clean as possible'
      ],
      should_see_vet: true,
      vet_urgency: 'within_24_hours',
      home_care_tips: [
        'Use an e-collar to prevent licking',
        'Gently clean with saline if needed'
      ],
      summary: "This needs professional attention. I can see signs of possible infection or a significant skin issue. Please schedule a vet appointment as soon as possible, ideally within 24 hours."
    }
  },

  NOT_A_DOG: {
    id: 'not_a_dog',
    label: 'Not a Dog',
    response: {
      error: false,
      is_dog: false,
      detected_subject: 'cat',
      detected_breed: null,
      breed_matches_profile: false,
      image_quality: 'good',
      image_quality_note: null,
      urgency_level: 'low',
      confidence: 'high',
      possible_conditions: [],
      visible_symptoms: [],
      recommended_actions: ['Upload a photo of your dog'],
      should_see_vet: false,
      vet_urgency: 'not_required',
      home_care_tips: [],
      summary: "I can only analyze photos of dogs. The image you uploaded appears to show a cat. Please upload a photo of your pup!"
    }
  },

  BLURRY_IMAGE: {
    id: 'blurry',
    label: 'Blurry Image',
    response: {
      error: false,
      is_dog: true,
      detected_subject: 'dog',
      detected_breed: 'Unknown (image unclear)',
      breed_matches_profile: true,
      image_quality: 'poor',
      image_quality_note: "The image is blurry and out of focus. For a better assessment, try: holding the camera steady, using good lighting, and getting closer to the affected area. You may need someone to help hold your dog still.",
      urgency_level: 'moderate',
      confidence: 'low',
      possible_conditions: ['Unable to determine clearly due to image quality'],
      visible_symptoms: ['Image too blurry to identify specific symptoms'],
      recommended_actions: [
        'Try taking another photo with better lighting',
        'Hold camera steady and focus on the area of concern',
        'If you cannot get a clear photo, describe what you see in chat'
      ],
      should_see_vet: false,
      vet_urgency: 'not_required',
      home_care_tips: [],
      summary: "I'm having trouble seeing the details clearly due to image quality. Could you try taking another photo? Make sure there's good lighting and hold the camera steady."
    }
  },

  BREED_MISMATCH: {
    id: 'breed_mismatch',
    label: 'Different Breed Detected',
    response: {
      error: false,
      is_dog: true,
      detected_subject: 'dog',
      detected_breed: 'Corgi',
      breed_matches_profile: false,
      image_quality: 'good',
      image_quality_note: null,
      urgency_level: 'low',
      confidence: 'high',
      possible_conditions: ['Normal healthy appearance'],
      visible_symptoms: ['No concerning symptoms visible'],
      recommended_actions: [
        'No immediate action needed',
        'Continue regular health monitoring'
      ],
      should_see_vet: false,
      vet_urgency: 'not_required',
      home_care_tips: ['Regular grooming and care'],
      summary: "I notice the dog in this photo appears to be a Corgi, though your profile lists a different breed. I'll base my analysis on what I see in the image. The dog looks healthy!"
    }
  }
}

export const ERROR_SCENARIOS = {
  API_ERROR: {
    id: 'api_error',
    label: 'API Error',
    response: {
      error: true,
      errorType: 'rate_limit',
      message: "I'm receiving too many requests right now. Please wait a moment and try again."
    }
  },

  SAFETY_BLOCK: {
    id: 'safety_block',
    label: 'Safety Block',
    response: {
      error: true,
      errorType: 'safety_block',
      message: "I couldn't analyze this content due to safety guidelines. Please try a different photo or rephrase your question."
    }
  },

  AUTH_ERROR: {
    id: 'auth_error',
    label: 'Auth Error',
    response: {
      error: true,
      errorType: 'auth_error',
      message: "There's an issue with the API configuration. Please check your API key."
    }
  },

  NETWORK_ERROR: {
    id: 'network_error',
    label: 'Network Error',
    response: {
      error: true,
      errorType: 'unknown',
      message: "Something went wrong. Please check your internet connection and try again."
    }
  }
}

function findScenarioResponse(scenarios, scenarioId, fallbackKey) {
  const match = Object.values(scenarios).find(s => s.id === scenarioId)
  return match?.response || scenarios[fallbackKey].response
}

export function getMockChatResponse(scenarioId) {
  return findScenarioResponse(CHAT_SCENARIOS, scenarioId, 'HAPPY_PATH')
}

export function getMockPhotoResponse(scenarioId) {
  return findScenarioResponse(PHOTO_SCENARIOS, scenarioId, 'HEALTHY')
}

export function getMockErrorResponse(scenarioId) {
  return findScenarioResponse(ERROR_SCENARIOS, scenarioId, 'API_ERROR')
}

export function isMockModeEnabled() {
  return localStorage.getItem('pawsy_dev_mock_mode') === 'true'
}

export function getMockScenario() {
  return localStorage.getItem('pawsy_dev_mock_scenario') || 'happy_path'
}

export function getMockDelay() {
  const delay = localStorage.getItem('pawsy_dev_mock_delay')
  return delay ? parseInt(delay, 10) : 500
}

export function setMockMode(enabled, scenario = 'happy_path', delay = 500) {
  localStorage.setItem('pawsy_dev_mock_mode', enabled ? 'true' : 'false')
  localStorage.setItem('pawsy_dev_mock_scenario', scenario)
  localStorage.setItem('pawsy_dev_mock_delay', String(delay))
}
