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

// ---------------------------------------------------------------------------
// Specialized Lab Scenarios (Phase 3)
// ---------------------------------------------------------------------------

export const XRAY_SCENARIOS = {
  XRAY_NORMAL: {
    id: 'xray_normal',
    label: 'X-Ray - Normal',
    response: {
      error: false,
      is_xray: true,
      detected_species: 'dog',
      image_quality: 'good',
      view_type: 'lateral',
      body_region: 'thorax',
      overall_impression: 'normal',
      findings: [
        { structure: 'Heart', observation: 'Normal cardiac silhouette size and shape', significance: 'normal', location: 'midline' },
        { structure: 'Lungs', observation: 'Clear lung fields, no infiltrates or masses', significance: 'normal', location: 'bilateral' },
        { structure: 'Ribs', observation: 'All ribs intact, normal density', significance: 'normal', location: 'bilateral' }
      ],
      bone_assessment: 'All visible bones appear normal with appropriate density and alignment.',
      soft_tissue_assessment: 'Soft tissue structures appear within normal limits.',
      joint_assessment: 'Visible joint spaces appear normal.',
      foreign_body_detected: false,
      foreign_body_description: null,
      differential_diagnoses: [],
      additional_views_suggested: [],
      recommended_actions: ['No immediate concerns identified', 'Continue routine health monitoring'],
      summary: 'This thoracic radiograph appears normal. Heart size, lung fields, and bony structures all look healthy.',
      confidence: 'high'
    }
  },

  XRAY_FRACTURE: {
    id: 'xray_fracture',
    label: 'X-Ray - Fracture Detected',
    response: {
      error: false,
      is_xray: true,
      detected_species: 'dog',
      image_quality: 'good',
      view_type: 'lateral',
      body_region: 'limb',
      overall_impression: 'abnormal_urgent',
      findings: [
        { structure: 'Radius', observation: 'Complete transverse fracture at mid-shaft with mild displacement', significance: 'critical', location: 'right forelimb' },
        { structure: 'Ulna', observation: 'Appears intact, no visible fracture line', significance: 'normal', location: 'right forelimb' },
        { structure: 'Surrounding soft tissue', observation: 'Moderate soft tissue swelling around fracture site', significance: 'abnormal', location: 'right forelimb' }
      ],
      bone_assessment: 'Fracture identified in the right radius. Bone density otherwise appears normal.',
      soft_tissue_assessment: 'Significant swelling around the injury site consistent with acute trauma.',
      joint_assessment: 'Elbow and carpal joints appear intact.',
      foreign_body_detected: false,
      foreign_body_description: null,
      differential_diagnoses: ['Complete radial fracture', 'Traumatic injury'],
      additional_views_suggested: ['Craniocaudal view of right forelimb'],
      recommended_actions: [
        'Veterinary orthopedic consultation required',
        'Immobilize the limb',
        'Pain management needed',
        'Surgical repair may be necessary'
      ],
      summary: 'A fracture of the radius is visible in the right forelimb. This requires immediate veterinary attention for proper stabilization and treatment planning.',
      confidence: 'high'
    }
  },

  XRAY_FOREIGN_BODY: {
    id: 'xray_foreign_body',
    label: 'X-Ray - Foreign Body',
    response: {
      error: false,
      is_xray: true,
      detected_species: 'dog',
      image_quality: 'good',
      view_type: 'lateral',
      body_region: 'abdomen',
      overall_impression: 'abnormal_urgent',
      findings: [
        { structure: 'Small intestine', observation: 'Dilated intestinal loops with radio-opaque object visible', significance: 'critical', location: 'mid-abdomen' },
        { structure: 'Foreign body', observation: 'Irregular radio-opaque object approximately 3cm in size', significance: 'critical', location: 'small intestine' },
        { structure: 'Stomach', observation: 'Slightly distended with gas', significance: 'abnormal', location: 'cranial abdomen' }
      ],
      bone_assessment: 'Spine and pelvis appear normal.',
      soft_tissue_assessment: 'Intestinal dilation noted, suggesting possible obstruction.',
      joint_assessment: 'Hip joints appear normal.',
      foreign_body_detected: true,
      foreign_body_description: 'Radio-opaque object in the small intestine, possibly a bone fragment or toy piece.',
      differential_diagnoses: ['Intestinal foreign body', 'Partial intestinal obstruction'],
      additional_views_suggested: ['VD abdominal view'],
      recommended_actions: [
        'Emergency veterinary consultation required',
        'Do not feed or give water',
        'Surgical removal may be necessary',
        'Monitor for vomiting or abdominal pain'
      ],
      summary: 'A foreign body is visible in the intestinal tract. This requires urgent veterinary attention to prevent complete obstruction.',
      confidence: 'high'
    }
  }
}

export const BLOOD_WORK_SCENARIOS = {
  BLOOD_WORK_NORMAL: {
    id: 'blood_work_normal',
    label: 'Blood Work - Normal',
    response: {
      error: false,
      is_blood_work: true,
      detected_panel_type: 'CBC_and_chemistry',
      readability: 'clear',
      values: [
        { name: 'RBC', value: '6.8', unit: 'M/uL', reference_range: '5.5-8.5', status: 'normal', category: 'RBC', interpretation: 'Normal red blood cell count' },
        { name: 'WBC', value: '11.2', unit: 'K/uL', reference_range: '5.5-16.9', status: 'normal', category: 'WBC', interpretation: 'Normal white blood cell count' },
        { name: 'HCT', value: '45', unit: '%', reference_range: '37-55', status: 'normal', category: 'RBC', interpretation: 'Normal packed cell volume' },
        { name: 'ALT', value: '42', unit: 'U/L', reference_range: '10-125', status: 'normal', category: 'liver', interpretation: 'Liver enzyme within normal range' },
        { name: 'BUN', value: '18', unit: 'mg/dL', reference_range: '7-27', status: 'normal', category: 'kidney', interpretation: 'Normal kidney function marker' },
        { name: 'Creatinine', value: '1.1', unit: 'mg/dL', reference_range: '0.5-1.8', status: 'normal', category: 'kidney', interpretation: 'Normal kidney function' }
      ],
      organ_system_summary: [
        { system: 'Red Blood Cells', status: 'normal', notes: 'All RBC parameters within normal limits' },
        { system: 'White Blood Cells', status: 'normal', notes: 'WBC count and differential normal' },
        { system: 'Liver', status: 'normal', notes: 'Liver enzymes normal' },
        { system: 'Kidney', status: 'normal', notes: 'Kidney function markers normal' }
      ],
      medication_interactions: [],
      abnormal_count: 0,
      overall_assessment: 'normal',
      key_findings: ['All values within normal reference ranges'],
      possible_conditions: [],
      recommended_actions: ['Continue regular wellness monitoring', 'No immediate concerns identified'],
      summary: 'All blood work values are within normal limits. Your dog appears to have healthy organ function.',
      confidence: 'high'
    }
  },

  BLOOD_WORK_ABNORMAL: {
    id: 'blood_work_abnormal',
    label: 'Blood Work - Abnormal Values',
    response: {
      error: false,
      is_blood_work: true,
      detected_panel_type: 'CBC_and_chemistry',
      readability: 'clear',
      values: [
        { name: 'RBC', value: '5.2', unit: 'M/uL', reference_range: '5.5-8.5', status: 'low', category: 'RBC', interpretation: 'Slightly low red blood cell count may indicate mild anemia' },
        { name: 'WBC', value: '18.5', unit: 'K/uL', reference_range: '5.5-16.9', status: 'high', category: 'WBC', interpretation: 'Elevated WBC may indicate infection or inflammation' },
        { name: 'HCT', value: '34', unit: '%', reference_range: '37-55', status: 'low', category: 'RBC', interpretation: 'Low hematocrit supports mild anemia finding' },
        { name: 'ALT', value: '185', unit: 'U/L', reference_range: '10-125', status: 'high', category: 'liver', interpretation: 'Elevated liver enzyme may indicate liver stress' },
        { name: 'BUN', value: '32', unit: 'mg/dL', reference_range: '7-27', status: 'high', category: 'kidney', interpretation: 'Elevated BUN may indicate dehydration or kidney function changes' },
        { name: 'Creatinine', value: '1.4', unit: 'mg/dL', reference_range: '0.5-1.8', status: 'normal', category: 'kidney', interpretation: 'Creatinine normal, BUN elevation more likely dehydration' }
      ],
      organ_system_summary: [
        { system: 'Red Blood Cells', status: 'needs_attention', notes: 'Mild anemia detected - RBC and HCT slightly low' },
        { system: 'White Blood Cells', status: 'needs_attention', notes: 'Elevated WBC suggests possible infection or inflammation' },
        { system: 'Liver', status: 'needs_attention', notes: 'ALT elevated - liver stress possible' },
        { system: 'Kidney', status: 'normal', notes: 'BUN elevated but creatinine normal - likely dehydration' }
      ],
      medication_interactions: [],
      abnormal_count: 4,
      overall_assessment: 'needs_attention',
      key_findings: [
        'Mild anemia (low RBC and HCT)',
        'Elevated white blood cells',
        'Elevated liver enzyme (ALT)',
        'Elevated BUN (possible dehydration)'
      ],
      possible_conditions: ['Infection', 'Mild anemia', 'Liver stress', 'Dehydration'],
      recommended_actions: [
        'Schedule veterinary appointment to discuss results',
        'Ensure adequate hydration',
        'Follow-up blood work may be recommended',
        'Monitor for signs of illness'
      ],
      summary: 'Several values are outside normal ranges. While not critical, these findings warrant a discussion with your veterinarian to determine the cause.',
      confidence: 'high'
    }
  },

  BLOOD_WORK_CRITICAL: {
    id: 'blood_work_critical',
    label: 'Blood Work - Critical Values',
    response: {
      error: false,
      is_blood_work: true,
      detected_panel_type: 'chemistry',
      readability: 'clear',
      values: [
        { name: 'BUN', value: '85', unit: 'mg/dL', reference_range: '7-27', status: 'critical', category: 'kidney', interpretation: 'Severely elevated BUN indicates significant kidney dysfunction' },
        { name: 'Creatinine', value: '4.8', unit: 'mg/dL', reference_range: '0.5-1.8', status: 'critical', category: 'kidney', interpretation: 'Critically elevated creatinine confirms kidney failure' },
        { name: 'Phosphorus', value: '9.2', unit: 'mg/dL', reference_range: '2.5-6.8', status: 'high', category: 'electrolytes', interpretation: 'Elevated phosphorus common in kidney disease' },
        { name: 'Potassium', value: '6.8', unit: 'mEq/L', reference_range: '3.5-5.8', status: 'high', category: 'electrolytes', interpretation: 'Elevated potassium can be dangerous for heart function' }
      ],
      organ_system_summary: [
        { system: 'Kidney', status: 'concerning', notes: 'Critical elevation of kidney markers - kidney failure suspected' },
        { system: 'Electrolytes', status: 'concerning', notes: 'Dangerous electrolyte imbalances present' }
      ],
      medication_interactions: [],
      abnormal_count: 4,
      overall_assessment: 'concerning',
      key_findings: [
        'Critical kidney values indicating kidney failure',
        'Dangerous potassium elevation',
        'Multiple electrolyte abnormalities'
      ],
      possible_conditions: ['Acute kidney injury', 'Chronic kidney disease', 'Kidney failure'],
      recommended_actions: [
        'Seek veterinary care immediately',
        'Hospitalization and IV fluids may be needed',
        'Further diagnostics required',
        'Do not delay treatment'
      ],
      summary: 'These values indicate serious kidney dysfunction requiring immediate veterinary attention. Please contact your vet or emergency clinic right away.',
      confidence: 'high'
    }
  }
}

export const URINALYSIS_SCENARIOS = {
  URINALYSIS_NORMAL: {
    id: 'urinalysis_normal',
    label: 'Urinalysis - Normal',
    response: {
      error: false,
      is_urinalysis: true,
      readability: 'clear',
      physical_properties: {
        color: 'yellow',
        clarity: 'clear',
        specific_gravity: '1.030',
        specific_gravity_status: 'normal'
      },
      chemical_analysis: [
        { marker: 'pH', value: '6.5', status: 'normal', interpretation: 'Normal urine pH' },
        { marker: 'Protein', value: 'Negative', status: 'normal', interpretation: 'No protein detected' },
        { marker: 'Glucose', value: 'Negative', status: 'normal', interpretation: 'No glucose in urine' },
        { marker: 'Blood', value: 'Negative', status: 'normal', interpretation: 'No blood detected' },
        { marker: 'WBC', value: 'Negative', status: 'normal', interpretation: 'No white blood cells' }
      ],
      sediment_findings: [
        { element: 'RBC', quantity: '0-2/hpf', status: 'normal', notes: 'Occasional RBCs normal' },
        { element: 'WBC', quantity: '0-3/hpf', status: 'normal', notes: 'Within normal limits' },
        { element: 'Bacteria', quantity: 'None seen', status: 'normal', notes: 'No bacteria detected' }
      ],
      hydration_assessment: 'Urine concentration suggests normal hydration status.',
      infection_indicators: false,
      overall_assessment: 'normal',
      key_findings: ['All urinalysis parameters within normal limits'],
      possible_conditions: [],
      recommended_actions: ['Continue normal hydration', 'No concerns identified'],
      summary: 'This urinalysis is normal. All values are within expected ranges and there are no signs of infection or other abnormalities.',
      confidence: 'high'
    }
  },

  URINALYSIS_UTI: {
    id: 'urinalysis_uti',
    label: 'Urinalysis - UTI Suspected',
    response: {
      error: false,
      is_urinalysis: true,
      readability: 'clear',
      physical_properties: {
        color: 'dark yellow',
        clarity: 'cloudy',
        specific_gravity: '1.025',
        specific_gravity_status: 'normal'
      },
      chemical_analysis: [
        { marker: 'pH', value: '8.0', status: 'abnormal', interpretation: 'Alkaline pH may indicate bacterial infection' },
        { marker: 'Protein', value: '2+', status: 'abnormal', interpretation: 'Protein in urine may indicate inflammation' },
        { marker: 'Glucose', value: 'Negative', status: 'normal', interpretation: 'No glucose detected' },
        { marker: 'Blood', value: '1+', status: 'abnormal', interpretation: 'Blood in urine suggests inflammation or infection' },
        { marker: 'WBC', value: 'Positive', status: 'abnormal', interpretation: 'White blood cells indicate infection' },
        { marker: 'Nitrites', value: 'Positive', status: 'abnormal', interpretation: 'Nitrites suggest bacterial infection' }
      ],
      sediment_findings: [
        { element: 'RBC', quantity: '10-20/hpf', status: 'abnormal', notes: 'Elevated red blood cells' },
        { element: 'WBC', quantity: '25-50/hpf', status: 'significant', notes: 'Significantly elevated white blood cells' },
        { element: 'Bacteria', quantity: 'Many rods', status: 'significant', notes: 'Bacterial infection evident' },
        { element: 'Struvite crystals', quantity: 'Few', status: 'abnormal', notes: 'Crystals may form with infection' }
      ],
      hydration_assessment: 'Adequate hydration based on specific gravity.',
      infection_indicators: true,
      overall_assessment: 'concerning',
      key_findings: [
        'Multiple signs of urinary tract infection',
        'Bacteria present in urine',
        'Blood and white blood cells detected',
        'Struvite crystals present'
      ],
      possible_conditions: ['Urinary tract infection', 'Bacterial cystitis', 'Bladder inflammation'],
      recommended_actions: [
        'Veterinary appointment needed for antibiotic treatment',
        'Urine culture may be recommended',
        'Ensure plenty of fresh water',
        'Monitor urination frequency and discomfort'
      ],
      summary: 'This urinalysis shows multiple signs consistent with a urinary tract infection. Veterinary treatment with antibiotics is recommended.',
      confidence: 'high'
    }
  },

  URINALYSIS_CRYSTALS: {
    id: 'urinalysis_crystals',
    label: 'Urinalysis - Crystal Formation',
    response: {
      error: false,
      is_urinalysis: true,
      readability: 'clear',
      physical_properties: {
        color: 'yellow',
        clarity: 'slightly_cloudy',
        specific_gravity: '1.045',
        specific_gravity_status: 'concentrated'
      },
      chemical_analysis: [
        { marker: 'pH', value: '6.0', status: 'normal', interpretation: 'Acidic pH' },
        { marker: 'Protein', value: 'Trace', status: 'normal', interpretation: 'Trace protein, not clinically significant' },
        { marker: 'Glucose', value: 'Negative', status: 'normal', interpretation: 'No glucose' },
        { marker: 'Blood', value: 'Trace', status: 'abnormal', interpretation: 'Trace blood may be from crystal irritation' }
      ],
      sediment_findings: [
        { element: 'Calcium oxalate crystals', quantity: 'Moderate', status: 'significant', notes: 'Calcium oxalate crystals can form stones' },
        { element: 'RBC', quantity: '5-10/hpf', status: 'abnormal', notes: 'Mild elevation, likely from crystal irritation' },
        { element: 'WBC', quantity: '2-5/hpf', status: 'normal', notes: 'Within normal limits' }
      ],
      hydration_assessment: 'Concentrated urine may contribute to crystal formation. Increased water intake recommended.',
      infection_indicators: false,
      overall_assessment: 'needs_attention',
      key_findings: [
        'Calcium oxalate crystals present',
        'Concentrated urine',
        'Mild blood in urine from crystal irritation'
      ],
      possible_conditions: ['Crystal formation', 'Risk of bladder stones', 'Urolithiasis tendency'],
      recommended_actions: [
        'Increase water intake significantly',
        'Discuss dietary changes with veterinarian',
        'Monitor for straining during urination',
        'Follow-up urinalysis recommended'
      ],
      summary: 'Calcium oxalate crystals were found in the urine along with signs of concentrated urine. Increasing water intake and discussing diet changes with your vet is recommended to prevent stone formation.',
      confidence: 'high'
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

export function getMockXrayResponse(scenarioId) {
  return findScenarioResponse(XRAY_SCENARIOS, scenarioId, 'XRAY_NORMAL')
}

export function getMockBloodWorkResponse(scenarioId) {
  return findScenarioResponse(BLOOD_WORK_SCENARIOS, scenarioId, 'BLOOD_WORK_NORMAL')
}

export function getMockUrinalysisResponse(scenarioId) {
  return findScenarioResponse(URINALYSIS_SCENARIOS, scenarioId, 'URINALYSIS_NORMAL')
}

export function getMockLabResponse(scenarioId, labType = '') {
  const labTypeLower = labType.toLowerCase()
  if (labTypeLower.includes('x-ray') || labTypeLower.includes('xray') || labTypeLower.includes('radiograph')) {
    return getMockXrayResponse(scenarioId)
  }
  if (labTypeLower.includes('blood') || labTypeLower.includes('cbc') || labTypeLower.includes('chemistry')) {
    return getMockBloodWorkResponse(scenarioId)
  }
  if (labTypeLower.includes('urin')) {
    return getMockUrinalysisResponse(scenarioId)
  }
  // Fallback to photo response for generic lab (existing behavior)
  return getMockPhotoResponse(scenarioId)
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
