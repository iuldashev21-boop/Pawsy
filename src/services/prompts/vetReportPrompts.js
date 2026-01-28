/**
 * Vet Report AI Agent Prompts and Schema
 *
 * Generates a professional, shareable health summary formatted for veterinary
 * professionals. Uses SOAP-style format with medical terminology.
 */

// ---------------------------------------------------------------------------
// Vet Report System Prompt
// ---------------------------------------------------------------------------

export function buildVetReportSystemPrompt(dog, healthData, dateRange) {
  const dogName = dog?.name || 'Patient'
  const age = healthData.age || 'Unknown age'
  const breed = dog?.breed || 'Unknown breed'
  const weight = dog?.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Not recorded'

  // Build health data sections for the prompt
  const medicationsSection = healthData.medications?.length > 0
    ? healthData.medications.map(m =>
        typeof m === 'string' ? `- ${m}` : `- ${m.name}: ${m.dosage || 'dosage unspecified'}`
      ).join('\n')
    : 'None on record'

  const conditionsSection = healthData.conditions?.length > 0
    ? healthData.conditions.map(c => `- ${c}`).join('\n')
    : 'None on record'

  const allergiesSection = healthData.allergies?.length > 0
    ? healthData.allergies.map(a => `- ${a}`).join('\n')
    : 'NKDA (No Known Drug Allergies)'

  // Format diagnostic data
  const xrayFindings = healthData.recentXrays?.length > 0
    ? healthData.recentXrays.map(x =>
        `${x.date}: ${x.bodyRegion} radiograph - ${x.impression}${x.keyFindings ? ` (${x.keyFindings})` : ''}`
      ).join('\n')
    : 'No imaging studies on file'

  const labFindings = healthData.recentBloodWork?.length > 0
    ? healthData.recentBloodWork.map(b => {
        const abnormal = b.abnormalValues ? ` - Abnormal: ${b.abnormalValues}` : ''
        return `${b.date}: ${b.panelType} - ${b.assessment}${abnormal}`
      }).join('\n')
    : 'No laboratory results on file'

  // Format clinical observations
  const observations = healthData.observations?.length > 0
    ? healthData.observations.map(o => `- ${o.date}: ${o.description}`).join('\n')
    : 'No clinical observations recorded'

  // Format active alerts
  const alertsSummary = healthData.activeAlerts?.length > 0
    ? healthData.activeAlerts.map(a => `- [${a.priority.toUpperCase()}] ${a.title}`).join('\n')
    : 'No active health alerts'

  const reportPeriod = dateRange
    ? `${dateRange.start} to ${dateRange.end}`
    : 'All available data'

  return `You are a veterinary documentation assistant generating a professional health report for a veterinary audience.

<role>
- Generate a structured clinical summary suitable for sharing with veterinary professionals
- Use appropriate medical terminology and SOAP-style formatting
- Include raw data values where available
- Annotate data sources (e.g., "per owner report", "lab result dated X")
- Maintain clinical objectivity
</role>

<patient_information>
Patient Name: ${dogName}
Species: Canine
Breed: ${breed}
Age: ${age}
Weight: ${weight}
Sex: ${dog?.sex || dog?.gender || 'Unknown'}
Microchip/ID: ${dog?.microchipId || 'Not on file'}
</patient_information>

<current_medications>
${medicationsSection}
</current_medications>

<known_conditions>
${conditionsSection}
</known_conditions>

<allergies>
${allergiesSection}
</allergies>

<diagnostic_imaging>
${xrayFindings}
</diagnostic_imaging>

<laboratory_results>
${labFindings}
</laboratory_results>

<clinical_observations>
${observations}
</clinical_observations>

<current_alerts>
${alertsSummary}
</current_alerts>

<report_parameters>
Report Period: ${reportPeriod}
Generated: ${new Date().toLocaleDateString()}
</report_parameters>

<instructions>
Generate a professional veterinary report following SOAP format:

SUBJECTIVE:
- Owner-reported history and concerns
- Behavioral observations
- Timeline of symptoms or changes

OBJECTIVE:
- Physical examination findings (from available data)
- Diagnostic results with values
- Current medications and dosages

ASSESSMENT:
- Clinical impressions
- Active problems list
- Differential considerations (if applicable)

PLAN:
- Recommended follow-up
- Monitoring parameters
- Owner instructions

Include a "Data Sources" section listing where information was obtained (AI analysis, owner report, uploaded lab results, etc.).

End with an AI disclosure statement.
</instructions>

<constraints>
- Use professional medical terminology appropriate for veterinary colleagues
- Include actual values and dates where available
- Clearly distinguish between AI-interpreted data and raw clinical data
- Do not fabricate findings - only report what is documented
- When data is limited, note "insufficient data" rather than speculating
- Include clear data provenance annotations
</constraints>

<output_format>
Generate a structured report that could be shared with or printed for a veterinary clinic.
Keep formatting clean and scannable.
Include dates and specific values wherever possible.
</output_format>`
}

// ---------------------------------------------------------------------------
// Vet Report Schema
// ---------------------------------------------------------------------------

export const vetReportSchema = {
  type: 'object',
  properties: {
    patient_header: {
      type: 'object',
      description: 'Patient identification header',
      properties: {
        name: { type: 'string', description: 'Patient name' },
        species: { type: 'string', description: 'Species (always Canine)' },
        breed: { type: 'string', description: 'Breed' },
        age: { type: 'string', description: 'Age in years/months' },
        weight: { type: 'string', description: 'Weight with units' },
        sex: { type: 'string', description: 'Sex/neuter status' },
      },
    },
    report_date: {
      type: 'string',
      description: 'Date report was generated (ISO format)',
    },
    report_period: {
      type: 'string',
      description: 'Time period covered by this report',
    },
    subjective: {
      type: 'object',
      description: 'SOAP Subjective section - owner reported history',
      properties: {
        chief_concerns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Main concerns or reasons for visit',
        },
        history: {
          type: 'string',
          description: 'Relevant medical history narrative',
        },
        behavioral_notes: {
          type: 'string',
          description: 'Owner-reported behavioral observations',
        },
      },
    },
    objective: {
      type: 'object',
      description: 'SOAP Objective section - clinical findings',
      properties: {
        current_medications: {
          type: 'array',
          description: 'Current medication list',
          items: {
            type: 'object',
            properties: {
              medication: { type: 'string', description: 'Medication name' },
              dosage: { type: 'string', description: 'Dosage and frequency' },
              indication: { type: 'string', description: 'Reason for medication' },
            },
          },
        },
        laboratory_findings: {
          type: 'array',
          description: 'Laboratory test results',
          items: {
            type: 'object',
            properties: {
              test_date: { type: 'string', description: 'Date of test' },
              test_type: { type: 'string', description: 'Type of test (CBC, Chem, etc.)' },
              summary: { type: 'string', description: 'Summary of findings' },
              abnormal_values: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of abnormal values',
              },
            },
          },
        },
        imaging_findings: {
          type: 'array',
          description: 'Imaging study results',
          items: {
            type: 'object',
            properties: {
              study_date: { type: 'string', description: 'Date of study' },
              study_type: { type: 'string', description: 'Type of imaging' },
              body_region: { type: 'string', description: 'Body region imaged' },
              findings: { type: 'string', description: 'Summary of findings' },
            },
          },
        },
        allergies: {
          type: 'array',
          items: { type: 'string' },
          description: 'Known allergies',
        },
      },
    },
    assessment: {
      type: 'object',
      description: 'SOAP Assessment section - clinical impressions',
      properties: {
        problem_list: {
          type: 'array',
          description: 'Active problem list',
          items: {
            type: 'object',
            properties: {
              problem: { type: 'string', description: 'Problem description' },
              status: {
                type: 'string',
                enum: ['active', 'stable', 'improving', 'worsening', 'resolved'],
                description: 'Current status',
              },
              onset: { type: 'string', description: 'When problem was first noted' },
            },
          },
        },
        clinical_impression: {
          type: 'string',
          description: 'Overall clinical assessment narrative',
        },
        differentials: {
          type: 'array',
          items: { type: 'string' },
          description: 'Differential diagnoses to consider',
        },
      },
    },
    plan: {
      type: 'object',
      description: 'SOAP Plan section - recommendations',
      properties: {
        follow_up: {
          type: 'array',
          items: { type: 'string' },
          description: 'Recommended follow-up actions',
        },
        monitoring: {
          type: 'array',
          items: { type: 'string' },
          description: 'Parameters to monitor',
        },
        owner_instructions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Instructions for the owner',
        },
      },
    },
    data_sources: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of data sources used to generate this report',
    },
    ai_disclosure: {
      type: 'string',
      description: 'AI-generated content disclosure statement',
    },
    generated_at: {
      type: 'string',
      description: 'ISO timestamp of report generation',
    },
  },
  required: ['patient_header', 'report_date', 'subjective', 'objective', 'assessment', 'plan', 'ai_disclosure'],
}
