/**
 * Clinical Profile AI Agent Prompts and Schema
 *
 * Generates a comprehensive clinical narrative synthesizing all health data
 * for a dog. Premium feature that aggregates chat history, diagnostics,
 * lab results, and health events into an AI-written clinical summary.
 */

// ---------------------------------------------------------------------------
// Clinical Profile System Prompt
// ---------------------------------------------------------------------------

export function buildClinicalProfileSystemPrompt(dog, healthData) {
  const dogName = dog?.name || 'Unknown'
  const age = healthData.age || 'Unknown age'
  const breed = dog?.breed || 'Unknown breed'
  const weight = dog?.weight ? `${dog.weight} ${dog.weightUnit || 'lbs'}` : 'Unknown'

  // Build health data context sections
  const conditionsSection = healthData.conditions?.length > 0
    ? `Known Conditions: ${healthData.conditions.join(', ')}`
    : 'No known conditions'

  const medicationsSection = healthData.medications?.length > 0
    ? `Current Medications: ${healthData.medications.map(m =>
        typeof m === 'string' ? m : `${m.name} (${m.dosage || 'dosage unknown'})`
      ).join(', ')}`
    : 'No current medications'

  const allergiesSection = healthData.allergies?.length > 0
    ? `Known Allergies: ${healthData.allergies.join(', ')}`
    : 'No known allergies'

  // Recent health events
  const recentEventsSection = healthData.recentEvents?.length > 0
    ? healthData.recentEvents.map(e =>
        `- ${e.date}: ${e.type} - ${e.description}`
      ).join('\n')
    : 'No recent health events recorded'

  // Recent diagnostics
  const recentXraysSection = healthData.recentXrays?.length > 0
    ? healthData.recentXrays.map(x =>
        `- ${x.date}: ${x.bodyRegion} X-ray - ${x.impression}${x.keyFindings ? ` (${x.keyFindings})` : ''}`
      ).join('\n')
    : 'No recent X-ray results'

  const recentBloodWorkSection = healthData.recentBloodWork?.length > 0
    ? healthData.recentBloodWork.map(b =>
        `- ${b.date}: ${b.panelType} - ${b.assessment}${b.abnormalValues ? ` (Abnormal: ${b.abnormalValues})` : ''}`
      ).join('\n')
    : 'No recent blood work results'

  const recentLabsSection = healthData.recentLabs?.length > 0
    ? healthData.recentLabs.map(l =>
        `- ${l.date}: ${l.labType} - ${l.assessment}`
      ).join('\n')
    : 'No other recent lab results'

  // Pet facts (symptoms, conditions from chat)
  const petFactsSection = healthData.petFacts?.length > 0
    ? healthData.petFacts.slice(0, 15).map(f =>
        `- [${f.severity}] ${f.fact} (${f.category})`
      ).join('\n')
    : 'No health observations recorded'

  // Active alerts
  const alertsSection = healthData.activeAlerts?.length > 0
    ? healthData.activeAlerts.map(a =>
        `- [${a.priority}] ${a.title}: ${a.message}`
      ).join('\n')
    : 'No active health alerts'

  return `You are Pawsy, a veterinary clinical documentation assistant generating a comprehensive health profile.

<role>
- Synthesize all available health data into a clear clinical narrative
- Highlight active concerns and monitoring needs
- Provide actionable recommendations based on the complete health picture
- Write for a pet owner audience while maintaining clinical accuracy
</role>

<dog_profile>
Name: ${dogName}
Breed: ${breed}
Age: ${age}
Weight: ${weight}
Sex: ${dog?.sex || dog?.gender || 'Unknown'}

${conditionsSection}
${medicationsSection}
${allergiesSection}
</dog_profile>

<health_events>
${recentEventsSection}
</health_events>

<diagnostic_history>
X-Ray Results:
${recentXraysSection}

Blood Work:
${recentBloodWorkSection}

Other Lab Results:
${recentLabsSection}
</diagnostic_history>

<health_observations>
${petFactsSection}
</health_observations>

<active_alerts>
${alertsSection}
</active_alerts>

<instructions>
Generate a comprehensive clinical profile that:

1. OVERVIEW: Write a 2-3 sentence snapshot of ${dogName}'s overall health status
2. ACTIVE_CONCERNS: List any current health issues requiring attention (from alerts, abnormal labs, recent symptoms)
3. RECENT_DIAGNOSTICS: Summarize recent diagnostic findings and their clinical significance
4. CHRONIC_MANAGEMENT: Address ongoing conditions, medications, and monitoring needs
5. BREED_CONSIDERATIONS: Note breed-specific health risks relevant to ${dogName}'s age
6. RECOMMENDATIONS: Provide 3-5 actionable next steps for the owner

Focus on clinical relevance - don't just list data, interpret it meaningfully.
Connect related findings (e.g., elevated BUN + decreased appetite = possible kidney concern).
Prioritize concerning findings but also acknowledge positive health indicators.
</instructions>

<constraints>
- Write in a warm, professional tone suitable for pet owners
- Never provide definitive diagnoses - use phrases like "may indicate", "suggests"
- Always recommend veterinary consultation for concerning findings
- Be honest about data limitations when information is sparse
- Acknowledge what's going well, not just problems
</constraints>

<output_format>
Structure your response as a clinical narrative, not a bulleted list.
Each section should flow naturally into the next.
Keep the total length under 800 words - be concise but comprehensive.
</output_format>

<example_response>
{
  "overview": "Max is a generally healthy 4-year-old Golden Retriever with well-managed seasonal allergies. His recent blood work shows excellent organ function, though his weight has increased slightly over the past 6 months, warranting attention.",
  "active_concerns": [
    {
      "concern": "Gradual weight gain",
      "severity": "moderate",
      "details": "5% weight increase over 6 months (68 to 72 lbs). May be contributing to reduced exercise tolerance noted in recent observations.",
      "recommendation": "Discuss diet adjustment with veterinarian; consider measuring food portions more precisely"
    }
  ],
  "recent_diagnostics_summary": "March 2024 CBC and chemistry panel showed all values within normal ranges. Liver and kidney function excellent. No concerning trends compared to previous annual labs.",
  "chronic_management": "Seasonal allergies are well-controlled with current antihistamine protocol. No flare-ups noted since adjusting to the current medication dosage in January.",
  "breed_considerations": "As a Golden Retriever entering middle age, Max should be monitored for early signs of hip dysplasia and cardiac changes. Annual hip radiographs and cardiac auscultation recommended.",
  "recommendations": [
    "Schedule weight management consultation with veterinarian",
    "Continue current allergy medication through spring season",
    "Consider joint supplement given breed predisposition",
    "Update vaccinations at next annual visit (due in 2 months)",
    "Monitor for any changes in exercise tolerance or mobility"
  ],
  "confidence": "high",
  "data_quality_notes": "This profile is based on 12 months of health data including 2 lab panels, 1 X-ray study, and 15 chat observations."
}
</example_response>`
}

// ---------------------------------------------------------------------------
// Clinical Profile Schema
// ---------------------------------------------------------------------------

export const clinicalProfileSchema = {
  type: 'object',
  properties: {
    overview: {
      type: 'string',
      description: 'A 2-3 sentence snapshot of overall health status',
    },
    health_score: {
      type: 'string',
      enum: ['excellent', 'good', 'fair', 'needs_attention', 'concerning'],
      description: 'Overall health assessment score',
    },
    active_concerns: {
      type: 'array',
      description: 'Current health issues requiring attention',
      items: {
        type: 'object',
        properties: {
          concern: {
            type: 'string',
            description: 'Brief name of the health concern',
          },
          severity: {
            type: 'string',
            enum: ['low', 'moderate', 'high', 'critical'],
            description: 'Severity level of this concern',
          },
          details: {
            type: 'string',
            description: 'Explanation of the concern with supporting data',
          },
          recommendation: {
            type: 'string',
            description: 'Specific action to address this concern',
          },
        },
        required: ['concern', 'severity', 'details'],
      },
    },
    recent_diagnostics_summary: {
      type: 'string',
      description: 'Summary of recent diagnostic findings and their clinical significance',
    },
    chronic_management: {
      type: 'string',
      description: 'Status of ongoing conditions, medications, and monitoring needs',
    },
    breed_considerations: {
      type: 'string',
      description: 'Breed-specific health risks relevant to this dogs age',
    },
    positive_indicators: {
      type: 'array',
      items: { type: 'string' },
      description: 'Positive health findings and well-managed aspects',
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable next steps for the owner (3-5 items)',
    },
    upcoming_care: {
      type: 'array',
      description: 'Upcoming preventive care or follow-up items',
      items: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            description: 'What needs to be done',
          },
          timeframe: {
            type: 'string',
            description: 'When it should be done (e.g., "within 2 weeks", "at next annual visit")',
          },
          priority: {
            type: 'string',
            enum: ['routine', 'soon', 'urgent'],
            description: 'How soon this should be addressed',
          },
        },
        required: ['item', 'timeframe'],
      },
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
      description: 'Confidence in this profile based on available data',
    },
    data_quality_notes: {
      type: 'string',
      description: 'Notes about data completeness and limitations',
    },
    generated_at: {
      type: 'string',
      description: 'ISO timestamp of when this profile was generated',
    },
  },
  required: ['overview', 'health_score', 'recommendations', 'confidence'],
}
