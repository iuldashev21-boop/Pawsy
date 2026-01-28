/**
 * Specialized Lab Analysis JSON Schemas
 *
 * Following Google Gemini structured output best practices:
 * - Description fields on every property
 * - Enum for fixed value sets
 * - Required fields marked
 * - Nested objects for related fields
 */

// ---------------------------------------------------------------------------
// X-Ray Analysis Schema
// ---------------------------------------------------------------------------

export const xrayAnalysisSchema = {
  type: 'object',
  properties: {
    is_xray: {
      type: 'boolean',
      description: 'Whether the image is an X-ray/radiograph of a dog',
    },
    detected_species: {
      type: 'string',
      description: 'What species is shown if not a dog',
    },
    image_quality: {
      type: 'string',
      enum: ['good', 'acceptable', 'poor'],
      description: 'Quality of the radiograph for interpretation',
    },
    view_type: {
      type: 'string',
      enum: ['lateral', 'VD', 'DV', 'oblique', 'unknown'],
      description: 'Radiographic view/projection type',
    },
    body_region: {
      type: 'string',
      enum: ['thorax', 'abdomen', 'skull', 'spine', 'pelvis', 'limb', 'whole_body', 'unknown'],
      description: 'Body region shown in the radiograph',
    },
    overall_impression: {
      type: 'string',
      enum: ['normal', 'abnormal_non_urgent', 'abnormal_urgent', 'critical'],
      description: 'Overall clinical impression based on all findings',
    },
    findings: {
      type: 'array',
      description: 'List of distinct observations from the radiograph',
      items: {
        type: 'object',
        properties: {
          structure: {
            type: 'string',
            description: 'Anatomical structure observed',
          },
          observation: {
            type: 'string',
            description: 'What is seen at this structure',
          },
          significance: {
            type: 'string',
            enum: ['normal', 'abnormal', 'incidental', 'critical'],
            description: 'Clinical significance of this finding',
          },
          location: {
            type: 'string',
            description: 'Left/right/bilateral/midline location',
          },
        },
        required: ['structure', 'observation', 'significance'],
      },
    },
    bone_assessment: {
      type: 'string',
      description: 'Overall assessment of bone/skeletal structures',
    },
    soft_tissue_assessment: {
      type: 'string',
      description: 'Overall assessment of soft tissue structures',
    },
    joint_assessment: {
      type: 'string',
      description: 'Overall assessment of visible joint spaces',
    },
    foreign_body_detected: {
      type: 'boolean',
      description: 'Whether a radio-opaque foreign body is visible',
    },
    foreign_body_description: {
      type: 'string',
      description: 'Description of foreign body if detected',
    },
    differential_diagnoses: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of possible diagnoses based on findings',
    },
    additional_views_suggested: {
      type: 'array',
      items: { type: 'string' },
      description: 'Additional radiographic views that would be helpful',
    },
    recommended_actions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Recommended next steps',
    },
    summary: {
      type: 'string',
      description: 'Brief summary of the radiographic findings',
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
      description: 'Confidence level in the interpretation',
    },
  },
  required: ['is_xray', 'overall_impression', 'findings', 'summary', 'confidence'],
}

// ---------------------------------------------------------------------------
// Blood Work Analysis Schema
// ---------------------------------------------------------------------------

export const bloodWorkAnalysisSchema = {
  type: 'object',
  properties: {
    is_blood_work: {
      type: 'boolean',
      description: 'Whether the image contains a blood work/lab panel report',
    },
    detected_panel_type: {
      type: 'string',
      enum: ['CBC', 'chemistry', 'CBC_and_chemistry', 'other'],
      description: 'Type of blood work panel detected',
    },
    readability: {
      type: 'string',
      enum: ['clear', 'partial', 'poor'],
      description: 'How readable the lab report is',
    },
    values: {
      type: 'array',
      description: 'Extracted lab values with reference ranges and status',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the lab marker',
          },
          value: {
            type: 'string',
            description: 'Measured value',
          },
          unit: {
            type: 'string',
            description: 'Unit of measurement',
          },
          reference_range: {
            type: 'string',
            description: 'Normal reference range',
          },
          status: {
            type: 'string',
            enum: ['normal', 'high', 'low', 'critical'],
            description: 'Status relative to reference range',
          },
          category: {
            type: 'string',
            enum: ['RBC', 'WBC', 'liver', 'kidney', 'electrolytes', 'other'],
            description: 'Organ system category',
          },
          interpretation: {
            type: 'string',
            description: 'Clinical interpretation of this value',
          },
        },
        required: ['name', 'value', 'status'],
      },
    },
    organ_system_summary: {
      type: 'array',
      description: 'Summary of findings grouped by organ system',
      items: {
        type: 'object',
        properties: {
          system: {
            type: 'string',
            description: 'Organ system name',
          },
          status: {
            type: 'string',
            enum: ['normal', 'needs_attention', 'concerning'],
            description: 'Overall status of this organ system',
          },
          notes: {
            type: 'string',
            description: 'Additional notes about this system',
          },
        },
        required: ['system', 'status'],
      },
    },
    medication_interactions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Potential medication effects on lab values',
    },
    abnormal_count: {
      type: 'integer',
      description: 'Total count of abnormal values',
    },
    overall_assessment: {
      type: 'string',
      enum: ['normal', 'needs_attention', 'concerning'],
      description: 'Overall assessment of the blood work',
    },
    key_findings: {
      type: 'array',
      items: { type: 'string' },
      description: 'Most important findings to highlight',
    },
    possible_conditions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Conditions that abnormal values may suggest',
    },
    recommended_actions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Recommended next steps',
    },
    summary: {
      type: 'string',
      description: 'Brief summary of the blood work findings',
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
      description: 'Confidence level in the interpretation',
    },
  },
  required: ['is_blood_work', 'overall_assessment', 'values', 'summary', 'confidence'],
}

// ---------------------------------------------------------------------------
// Urinalysis Analysis Schema
// ---------------------------------------------------------------------------

export const urinalysisAnalysisSchema = {
  type: 'object',
  properties: {
    is_urinalysis: {
      type: 'boolean',
      description: 'Whether the image contains a urinalysis report',
    },
    readability: {
      type: 'string',
      enum: ['clear', 'partial', 'poor'],
      description: 'How readable the urinalysis report is',
    },
    physical_properties: {
      type: 'object',
      description: 'Physical properties of the urine sample',
      properties: {
        color: {
          type: 'string',
          description: 'Urine color',
        },
        clarity: {
          type: 'string',
          enum: ['clear', 'slightly_cloudy', 'cloudy', 'turbid'],
          description: 'Urine clarity/turbidity',
        },
        specific_gravity: {
          type: 'string',
          description: 'Specific gravity value',
        },
        specific_gravity_status: {
          type: 'string',
          enum: ['dilute', 'normal', 'concentrated'],
          description: 'Interpretation of specific gravity',
        },
      },
    },
    chemical_analysis: {
      type: 'array',
      description: 'Chemical marker analysis from dipstick',
      items: {
        type: 'object',
        properties: {
          marker: {
            type: 'string',
            description: 'Name of the chemical marker',
          },
          value: {
            type: 'string',
            description: 'Measured value or result',
          },
          status: {
            type: 'string',
            enum: ['normal', 'abnormal', 'critical'],
            description: 'Whether the value is abnormal',
          },
          interpretation: {
            type: 'string',
            description: 'Clinical interpretation',
          },
        },
        required: ['marker', 'value', 'status'],
      },
    },
    sediment_findings: {
      type: 'array',
      description: 'Microscopic sediment examination findings',
      items: {
        type: 'object',
        properties: {
          element: {
            type: 'string',
            description: 'Type of sediment element (RBC, WBC, bacteria, crystals, casts)',
          },
          quantity: {
            type: 'string',
            description: 'Quantity or count',
          },
          status: {
            type: 'string',
            enum: ['normal', 'abnormal', 'significant'],
            description: 'Whether the finding is significant',
          },
          notes: {
            type: 'string',
            description: 'Additional notes (e.g., crystal type)',
          },
        },
        required: ['element', 'quantity', 'status'],
      },
    },
    hydration_assessment: {
      type: 'string',
      description: 'Assessment of hydration status based on urine concentration',
    },
    infection_indicators: {
      type: 'boolean',
      description: 'Whether findings suggest urinary tract infection',
    },
    overall_assessment: {
      type: 'string',
      enum: ['normal', 'needs_attention', 'concerning'],
      description: 'Overall assessment of the urinalysis',
    },
    key_findings: {
      type: 'array',
      items: { type: 'string' },
      description: 'Most important findings to highlight',
    },
    possible_conditions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Conditions that findings may suggest',
    },
    recommended_actions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Recommended next steps',
    },
    summary: {
      type: 'string',
      description: 'Brief summary of the urinalysis findings',
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
      description: 'Confidence level in the interpretation',
    },
  },
  required: ['is_urinalysis', 'overall_assessment', 'summary', 'confidence'],
}
