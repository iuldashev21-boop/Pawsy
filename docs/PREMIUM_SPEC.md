# Pawsy Premium Feature Specification

> **Version:** 1.0
> **Last Updated:** January 2026
> **Core Principle:** Personalization > More Features

---

## Table of Contents

1. [Overview](#1-overview)
2. [Pricing & Tiers](#2-pricing--tiers)
3. [Feature Specifications](#3-feature-specifications)
4. [Data Model](#4-data-model)
5. [Premium Onboarding Flow](#5-premium-onboarding-flow)
6. [AI Prompt Enhancements](#6-ai-prompt-enhancements)
7. [CTA Strategy](#7-cta-strategy)
8. [Implementation Phases](#8-implementation-phases)
9. [Technical Requirements](#9-technical-requirements)
10. [Success Metrics](#10-success-metrics)

---

## 1. Overview

### Vision

Premium Pawsy isn't about "more features" — it's about **dramatically better AI health advice** through deeper personalization. Free users get good advice. Premium users get advice that feels like it comes from a vet who's known their dog for years.

### Value Proposition

| Free User Experience | Premium User Experience |
|---------------------|------------------------|
| "Based on what you've told me..." | "Based on Bella's history with skin allergies and her Labrador genetics..." |
| Generic breed health info | "Bella is entering the age range where Labs often develop hip issues" |
| Forgets between sessions | "Last month you mentioned Bella had digestive issues — is this related?" |
| Limited daily interactions | Unlimited peace of mind |

### Key Differentiator

**Research shows 87.5% AI diagnostic accuracy** when given complete health profile data vs. basic signalment. Premium users provide richer data = dramatically better AI output.

---

## 2. Pricing & Tiers

### Tier Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         FREE                                     │
├─────────────────────────────────────────────────────────────────┤
│  • 5 AI chats/day (10 first day)                                │
│  • 3 photo scans/day (5 first day)                              │
│  • Basic profile (name, breed, age, weight, allergies)          │
│  • Toxic food checker (unlimited)                               │
│  • Emergency vet finder (unlimited)                             │
│  • First aid guides (unlimited)                                 │
│  • Session-only chat (no persistence)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PREMIUM - $4.99/month                        │
│                     or $39.99/year (33% off)                     │
├─────────────────────────────────────────────────────────────────┤
│  Everything in Free, plus:                                       │
│                                                                  │
│  UNLIMITED ACCESS                                                │
│  • Unlimited AI chats                                            │
│  • Unlimited photo scans                                         │
│                                                                  │
│  ENHANCED PERSONALIZATION                                        │
│  • Extended health profile (conditions, meds, diet, etc.)        │
│  • AI remembers conversation history                             │
│  • Health timeline with visual history                           │
│  • Breed + age specific proactive alerts                         │
│  • Symptom pattern detection                                     │
│                                                                  │
│  MULTI-DOG SUPPORT                                               │
│  • Household dashboard (all dogs at a glance)                    │
│  • Compare symptoms across dogs                                  │
│                                                                  │
│  VET INTEGRATION                                                 │
│  • Generate vet visit reports                                    │
│  • Export health history                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Pricing Rationale

- **$4.99/month**: Under the "coffee threshold" — less than a latte
- **$39.99/year**: ~$3.33/month encourages annual commitment
- **Comparison**: Vet visit = $50-100+, telehealth = $20-50/consult

---

## 3. Feature Specifications

### 3.1 Unlimited Usage

**What:** Remove daily limits for premium users

**Implementation:**
```javascript
// In UsageContext.jsx
const canChat = isPremium || chatsRemaining > 0
const canPhoto = isPremium || photosRemaining > 0
```

**UI Changes:**
- Hide UsageCounter for premium users
- Show "Premium" badge instead
- No UsageLimitModal triggers

---

### 3.2 Extended Health Profile

**What:** Additional data fields that improve AI accuracy

**New Profile Fields:**

| Field | Type | Options/Format | Impact on AI |
|-------|------|----------------|--------------|
| `isSpayedNeutered` | boolean | Yes/No/Unknown | Hormone-related conditions, cancer risks |
| `chronicConditions` | string[] | Multi-select + custom | Direct symptom interpretation |
| `medications` | object[] | `[{name, dosage, frequency}]` | Drug interactions, side effects |
| `dietType` | enum | dry, wet, raw, home-cooked, prescription | Nutritional advice, allergy investigation |
| `dietBrand` | string | Free text (optional) | Specific ingredient concerns |
| `activityLevel` | enum | low, moderate, high, very-high | Weight, joint, energy advice |
| `livingEnvironment` | enum | indoor-only, mostly-indoor, indoor-outdoor, mostly-outdoor | Parasite exposure, environmental risks |
| `socialExposure` | string[] | dog-parks, boarding, grooming, daycare, none | Infectious disease risks |
| `surgeryHistory` | object[] | `[{type, date, notes}]` | Mobility, anesthesia considerations |
| `vaccinationStatus` | object[] | `[{vaccine, date, nextDue}]` | Preventive care reminders |
| `behavioralNotes` | string[] | separation-anxiety, noise-phobia, aggression, none | Behavioral health context |
| `location` | object | `{region, climate}` or auto-detect | Regional disease risks |

**UI:** New "Health Profile" settings section (premium-only)

---

### 3.3 Chat History Persistence

**What:** Save all conversations, searchable by dog and date

**Data Structure:**
```javascript
// Per conversation
{
  id: "conv_uuid",
  odgId: "dog_uuid",
  userId: "user_uuid",
  createdAt: timestamp,
  updatedAt: timestamp,
  title: "Auto-generated or first message",
  messages: [
    {
      id: "msg_uuid",
      role: "user" | "assistant",
      content: "string",
      timestamp: timestamp,
      image: { hadImage: boolean },  // Don't persist actual images
      metadata: { ... }              // AI response metadata
    }
  ],
  tags: ["symptom:vomiting", "urgent"],  // Auto-generated
  summary: "AI-generated conversation summary"
}
```

**UI Features:**
- Chat history sidebar/drawer
- Search by keyword
- Filter by dog, date range, tags
- "Continue conversation" option
- Delete conversation option

**Privacy:**
- Images not persisted (storage/privacy)
- Mark that image "was shared" for context
- User can delete any conversation

---

### 3.4 Health Timeline

**What:** Visual history of health events for each dog

**Event Types:**
```javascript
{
  id: "event_uuid",
  dogId: "dog_uuid",
  type: "symptom" | "vet_visit" | "medication_change" | "photo_analysis" | "condition_added" | "weight_change",
  date: timestamp,
  title: "Vomiting episode",
  description: "Asked about vomiting after eating grass",
  severity: "low" | "medium" | "high" | "emergency",
  relatedConversationId: "conv_uuid",  // Link to chat
  metadata: { ... }
}
```

**UI:**
- Vertical timeline view
- Filter by event type
- Color-coded severity
- Click to see related conversation
- Add manual events (vet visits)

---

### 3.5 Breed + Age Proactive Alerts

**What:** Notifications based on breed genetic risks and age milestones

**Alert Types:**

| Trigger | Example Alert |
|---------|---------------|
| Breed + Age | "Bella (Labrador, 7) is entering the age where hip dysplasia screening is recommended" |
| Breed Risk | "As a Bulldog owner, watch for signs of breathing difficulties in hot weather" |
| Age Milestone | "Bella is now considered a senior dog (8+). Consider bi-annual vet checkups" |
| Seasonal | "Summer heat warning: Brachycephalic breeds need extra care" |

**Alert Rules Engine:**
```javascript
// Example rule
{
  id: "lab_hip_dysplasia",
  breeds: ["labrador", "golden_retriever", "german_shepherd"],
  ageRange: { min: 6, max: 8 },
  alert: {
    title: "Hip Dysplasia Screening",
    message: "{{dogName}} is at the age when {{breed}}s often develop hip issues...",
    action: "Learn more about hip dysplasia",
    priority: "medium"
  },
  frequency: "once"  // Show once per dog lifetime
}
```

**UI:**
- Alert cards on dashboard
- Alert history view
- Dismiss/snooze options
- "Learn more" links to breed health info

---

### 3.6 AI History Awareness

**What:** AI references past conversations for context

**Implementation:**

Before each AI call, inject relevant history:
```javascript
const relevantHistory = await getRelevantHistory(dogId, currentMessage)

// Inject into system prompt
<conversation_history>
Recent relevant interactions with ${dogName}:

${relevantHistory.map(h => `
- ${h.date}: ${h.summary}
  Key symptoms: ${h.symptoms.join(', ')}
  Outcome: ${h.outcome}
`).join('\n')}

Use this history to:
1. Reference past issues if potentially related
2. Note patterns across time
3. Avoid repeating advice already given
</conversation_history>
```

**History Retrieval Logic:**
1. Get last 5 conversations
2. Search for symptom-related conversations
3. Weight by recency and relevance
4. Cap at ~500 tokens of history context

---

### 3.7 Symptom Pattern Detection

**What:** AI identifies recurring symptoms over time

**Detection Logic:**
```javascript
// Track symptom mentions
{
  dogId: "dog_uuid",
  symptom: "ear_scratching",
  occurrences: [
    { date: "2026-01-01", conversationId: "conv_1" },
    { date: "2026-01-10", conversationId: "conv_2" },
    { date: "2026-01-18", conversationId: "conv_3" }
  ],
  pattern: {
    frequency: "3x in 30 days",
    trend: "recurring",
    lastAlerted: "2026-01-18"
  }
}
```

**Alert Triggers:**
- Same symptom 3+ times in 30 days
- Symptom severity increasing
- Related symptoms clustering

**AI Integration:**
```
<pattern_alert>
IMPORTANT: I've detected a recurring pattern:

${dogName} has had ${symptom} mentioned ${count} times in the past ${days} days:
${occurrences.map(o => `- ${o.date}: "${o.context}"`).join('\n')}

Consider mentioning this pattern and suggesting whether a vet visit might help
identify an underlying cause.
</pattern_alert>
```

---

### 3.8 Multi-Dog Household

**What:** Dashboard view of all dogs, compare symptoms

**UI Features:**
- Household overview card on dashboard
- Quick health status per dog (green/yellow/red)
- "Affecting multiple dogs?" toggle in chat
- Contagious illness detection ("Both dogs have similar symptoms")

**Data:**
```javascript
// Household context for AI
<household_context>
This user has ${dogs.length} dogs in their household:
${dogs.map(d => `- ${d.name} (${d.breed}, ${d.age})`).join('\n')}

If symptoms could be contagious or environmental, consider asking about the other dogs.
</household_context>
```

---

### 3.9 Vet Visit Report Generation

**What:** Generate professional summary for vet visits

**Report Contents:**
```markdown
# Health Summary for [Dog Name]

**Generated:** January 21, 2026
**Owner:** [User Name]

## Dog Profile
- Breed: Labrador Retriever
- Age: 5 years
- Weight: 65 lbs
- Spayed/Neutered: Yes
- Known Conditions: Seasonal allergies
- Current Medications: Apoquel 16mg daily

## Recent Health Concerns (Last 30 Days)

### Concern 1: Ear Scratching (Jan 15, 2026)
- Symptoms reported: Excessive scratching, head shaking
- Duration: 3 days at time of report
- AI Assessment: Possible ear infection or allergies
- Recommended: Vet examination

### Concern 2: Decreased Appetite (Jan 10, 2026)
- Symptoms reported: Skipped breakfast, ate half of dinner
- Duration: 2 days
- Resolution: Returned to normal eating

## Symptom Patterns Detected
- Ear scratching: 3 occurrences in past 30 days (recurring)

## Questions for Your Vet
1. Should we check for ear infection given recurring scratching?
2. Are the seasonal allergies potentially causing ear issues?

---
Generated by Pawsy | Not a substitute for veterinary care
```

**UI:**
- "Prepare for vet visit" button
- Select date range
- Preview and edit
- Export as PDF or share link

---

## 4. Data Model

### 4.1 User Model Updates

```javascript
// users collection
{
  id: "user_uuid",
  email: "user@example.com",
  createdAt: timestamp,

  // Premium fields
  subscription: {
    status: "free" | "premium" | "cancelled",
    plan: null | "monthly" | "annual",
    startDate: timestamp | null,
    endDate: timestamp | null,
    stripeCustomerId: "cus_xxx" | null,
    stripeSubscriptionId: "sub_xxx" | null
  },

  // Settings
  settings: {
    notifications: {
      healthAlerts: boolean,
      ageReminders: boolean,
      weeklyDigest: boolean
    }
  }
}
```

### 4.2 Dog Model Updates

```javascript
// dogs collection
{
  id: "dog_uuid",
  userId: "user_uuid",

  // Existing fields (free)
  name: string,
  breed: string,
  dateOfBirth: string | null,
  gender: "male" | "female",
  weight: number,
  weightUnit: "lbs" | "kg",
  size: "small" | "medium" | "large" | "giant",
  photoUrl: string | null,
  allergies: string[],

  // Premium profile fields
  premium: {
    isSpayedNeutered: boolean | null,
    chronicConditions: string[],
    medications: [{
      name: string,
      dosage: string,
      frequency: string,
      startDate: string | null
    }],
    dietType: "dry" | "wet" | "raw" | "home-cooked" | "prescription" | null,
    dietBrand: string | null,
    activityLevel: "low" | "moderate" | "high" | "very-high" | null,
    livingEnvironment: "indoor-only" | "mostly-indoor" | "indoor-outdoor" | "mostly-outdoor" | null,
    socialExposure: string[],
    surgeryHistory: [{
      type: string,
      date: string,
      notes: string | null
    }],
    vaccinationStatus: [{
      vaccine: string,
      date: string,
      nextDue: string | null
    }],
    behavioralNotes: string[],
    location: {
      region: string | null,
      climate: string | null
    } | null
  },

  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4.3 Conversation Model (Premium)

```javascript
// conversations collection
{
  id: "conv_uuid",
  dogId: "dog_uuid",
  userId: "user_uuid",

  title: string,           // Auto-generated from first message
  createdAt: timestamp,
  updatedAt: timestamp,

  messages: [{
    id: "msg_uuid",
    role: "user" | "assistant",
    content: string,
    timestamp: timestamp,
    image: {
      hadImage: boolean,
      wasAnalyzed: boolean
    } | null,
    metadata: {
      // AI response metadata
      urgency_level: string | null,
      symptoms_mentioned: string[],
      conditions_mentioned: string[],
      // etc.
    } | null
  }],

  // Auto-generated
  tags: string[],          // ["symptom:vomiting", "topic:diet"]
  summary: string | null,  // AI-generated summary

  // Analytics
  messageCount: number,
  lastMessageAt: timestamp
}
```

### 4.4 Health Event Model (Premium)

```javascript
// healthEvents collection
{
  id: "event_uuid",
  dogId: "dog_uuid",
  userId: "user_uuid",

  type: "symptom" | "vet_visit" | "medication_change" | "photo_analysis" | "condition_added" | "weight_change" | "manual",
  date: timestamp,

  title: string,
  description: string | null,
  severity: "low" | "medium" | "high" | "emergency" | null,

  // Links
  relatedConversationId: string | null,
  relatedPhotoAnalysisId: string | null,

  // Type-specific data
  metadata: {
    // For symptoms
    symptoms: string[],
    duration: string,
    outcome: string,

    // For vet visits
    vetName: string,
    diagnosis: string,
    treatment: string,
    followUp: string,

    // For medication changes
    medication: string,
    action: "started" | "stopped" | "dosage_changed",

    // etc.
  },

  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4.5 Alert Model (Premium)

```javascript
// alerts collection
{
  id: "alert_uuid",
  dogId: "dog_uuid",
  userId: "user_uuid",

  ruleId: string,          // Reference to alert rule
  type: "breed_risk" | "age_milestone" | "symptom_pattern" | "seasonal" | "reminder",

  title: string,
  message: string,
  priority: "low" | "medium" | "high",

  status: "active" | "dismissed" | "snoozed" | "actioned",
  snoozedUntil: timestamp | null,

  createdAt: timestamp,
  readAt: timestamp | null,
  actionedAt: timestamp | null
}
```

---

## 5. Premium Onboarding Flow

### 5.1 Upgrade Trigger Points

| Moment | Trigger | CTA Message |
|--------|---------|-------------|
| Hit usage limit | `chatsRemaining === 0` | "Need unlimited advice for [dog]?" |
| Low usage warning | `chatsRemaining <= 2` | "Running low on chats today" |
| After valuable chat | AI response quality high | "Get personalized advice like this, unlimited" |
| View chat history | Click history (locked) | "Premium keeps your health history" |
| Multi-dog attempt | Add 2nd dog (free works) | "Manage all your dogs in one place" |
| Breed health page | Viewing breed risks | "Get alerts specific to [dog]'s breed + age" |

### 5.2 Premium Profile Completion

After upgrade, prompt to complete extended profile:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Welcome to Premium!                                             │
│                                                                  │
│  Let's make Pawsy smarter about [Bella].                        │
│  The more I know, the better advice I can give.                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Complete Bella's Health Profile                           │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 25% complete               │ │
│  │                                                            │ │
│  │  ✓ Basic info (name, breed, age, weight)                   │ │
│  │  ○ Health status (conditions, medications)                 │ │
│  │  ○ Lifestyle (diet, activity, environment)                 │ │
│  │  ○ Medical history (surgeries, vaccinations)               │ │
│  │                                                            │ │
│  │  [Continue Setup]                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Skip for now - I'll ask later]                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Progressive Profile Prompts

Don't ask everything upfront. Prompt contextually:

| User Action | Prompt |
|-------------|--------|
| First chat about medication | "Add [dog]'s medications for safer advice" |
| Chat about diet/weight | "What does [dog] eat? This helps with nutrition advice" |
| Chat about outdoor activity | "Does [dog] go to dog parks? This affects disease risk" |
| After 1 week of use | "Add your location for regional health alerts" |
| Discuss preventive care | "Track [dog]'s vaccinations to get reminders" |

---

## 6. AI Prompt Enhancements

### 6.1 Premium System Prompt Additions

```javascript
// Add to buildChatSystemPrompt() for premium users

<premium_profile>
ENHANCED HEALTH PROFILE - Use this detailed data for personalized advice:

Spayed/Neutered: ${dog.premium.isSpayedNeutered ? 'Yes' : 'No'}

Chronic Conditions: ${dog.premium.chronicConditions.length > 0
  ? dog.premium.chronicConditions.join(', ')
  : 'None reported'}

Current Medications:
${dog.premium.medications.length > 0
  ? dog.premium.medications.map(m => `- ${m.name} ${m.dosage} (${m.frequency})`).join('\n')
  : 'None'}

Diet: ${dog.premium.dietType || 'Not specified'}${dog.premium.dietBrand ? ` (${dog.premium.dietBrand})` : ''}

Activity Level: ${dog.premium.activityLevel || 'Not specified'}

Living Environment: ${dog.premium.livingEnvironment || 'Not specified'}

Social Exposure: ${dog.premium.socialExposure.length > 0
  ? dog.premium.socialExposure.join(', ')
  : 'None/Unknown'}

Surgery History:
${dog.premium.surgeryHistory.length > 0
  ? dog.premium.surgeryHistory.map(s => `- ${s.type} (${s.date})`).join('\n')
  : 'None'}

Location/Climate: ${dog.premium.location?.region || 'Not specified'}

IMPORTANT: Reference this data naturally in your responses. For example:
- "Given that ${dog.name} is on ${medication}, I'd suggest..."
- "Since ${dog.name} has ${condition}, keep an eye out for..."
- "With ${dog.name}'s activity level being ${level}..."
</premium_profile>
```

### 6.2 History Context Injection

```javascript
// For premium users with chat history

<conversation_history>
PAST INTERACTIONS - Reference these naturally if relevant:

${recentConversations.map(conv => `
[${conv.date}] ${conv.title}
- Main concern: ${conv.mainSymptom || 'General question'}
- Key points: ${conv.summary}
- Outcome: ${conv.outcome || 'Ongoing'}
`).join('\n')}

DETECTED PATTERNS:
${patterns.map(p => `
- ${p.symptom}: Mentioned ${p.count} times in past ${p.days} days
`).join('\n')}

Use this history to:
1. Notice if current symptoms might be related to past issues
2. Avoid repeating the same basic questions if already answered
3. Reference past advice if relevant ("As I mentioned last time...")
4. Point out patterns ("I notice this is the third time...")
</conversation_history>
```

### 6.3 Breed + Age Context

```javascript
// Inject breed-specific risks for premium users

<breed_age_context>
BREED-SPECIFIC HEALTH CONSIDERATIONS for ${dog.breed} at ${dog.age}:

Common genetic predispositions:
${breedRisks.map(r => `- ${r.condition}: ${r.description}`).join('\n')}

Age-relevant notes:
- Life stage: ${lifeStage} (${lifeStageDescription})
- Recommended screenings at this age: ${recommendedScreenings.join(', ')}

${ageAlerts.length > 0 ? `
ACTIVE ALERTS:
${ageAlerts.map(a => `- ${a.message}`).join('\n')}
` : ''}

Reference breed tendencies when relevant, e.g.:
"As a ${dog.breed}, ${dog.name} may be more prone to..."
</breed_age_context>
```

---

## 7. CTA Strategy

### 7.1 CTA Placement Map

| Location | Trigger | CTA Type | Message |
|----------|---------|----------|---------|
| Chat header | Low usage (2 left) | Banner | "2 chats left today • Upgrade" |
| Chat header | Premium user | Badge | "Premium ✓" |
| Usage limit modal | 0 remaining | Modal | "Unlimited chats for [dog]" |
| Chat input | Premium feature mentioned | Inline hint | "Premium members get..." |
| Dashboard | Non-premium | Card | "Unlock [dog]'s full health profile" |
| Settings > Dog | Non-premium | Locked sections | "Premium: Health conditions, meds..." |
| Chat history | Non-premium | Locked feature | "Premium: Save & search past chats" |
| After good AI response | Premium conversion moment | Subtle hint | "Advice like this, unlimited →" |

### 7.2 CTA Components

```jsx
// Soft CTA - Inline hint
<PremiumHint
  variant="inline"
  feature="chat-history"
  message="Save this conversation"
/>

// Medium CTA - Banner
<PremiumBanner
  title="Running low on chats"
  subtitle="2 remaining today"
  cta="Upgrade"
  onUpgrade={handleUpgrade}
  dismissable
/>

// Hard CTA - Modal (at limit)
<UsageLimitModal
  type="chat"
  dogName="Bella"
  onUpgrade={handleUpgrade}
  onEmergency={handleEmergency}
/>

// Feature lock - Settings
<PremiumLock
  feature="extended-profile"
  title="Health Conditions & Medications"
  description="Help Pawsy give safer, more accurate advice"
  onUpgrade={handleUpgrade}
/>
```

### 7.3 Upgrade Flow

```
User clicks "Upgrade" anywhere
         ↓
┌─────────────────────────────────────────┐
│         Upgrade to Premium              │
│                                         │
│  Unlimited care for [Bella]             │
│                                         │
│  ✓ Unlimited AI chats & photo scans     │
│  ✓ Full health profile tracking         │
│  ✓ Chat history saved forever           │
│  ✓ Breed & age health alerts            │
│  ✓ AI that remembers Bella's history    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Monthly          $4.99/month    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Annual           $39.99/year    │    │
│  │                  Save 33%       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Continue to Payment]                  │
│                                         │
│  Cancel anytime • 7-day money back      │
│                                         │
└─────────────────────────────────────────┘
         ↓
    Stripe Checkout
         ↓
    Success → Premium Profile Setup
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Basic premium infrastructure and unlimited usage

| Task | Priority | Effort |
|------|----------|--------|
| Add `subscription` field to user model | P0 | S |
| Create `isPremium` helper/hook | P0 | S |
| Bypass usage limits for premium users | P0 | S |
| Update UsageCounter to show "Premium" badge | P0 | S |
| Create upgrade modal UI | P0 | M |
| Integrate Stripe/RevenueCat | P0 | L |
| Create premium settings page | P1 | M |

**Deliverable:** Users can upgrade and get unlimited usage

---

### Phase 2: Extended Profile (Week 3-4)

**Goal:** Richer dog profiles for premium users

| Task | Priority | Effort |
|------|----------|--------|
| Add premium fields to dog model | P0 | M |
| Create premium profile UI (settings) | P0 | L |
| Create premium onboarding flow | P0 | M |
| Update AI prompts to use premium data | P0 | M |
| Add progressive profile prompts | P1 | M |
| Profile completion percentage UI | P1 | S |

**Deliverable:** Premium users can add detailed health info, AI uses it

---

### Phase 3: History & Timeline (Week 5-6)

**Goal:** Persistent chat history and health timeline

| Task | Priority | Effort |
|------|----------|--------|
| Create conversations collection/storage | P0 | M |
| Save chat messages for premium users | P0 | M |
| Chat history UI (sidebar/drawer) | P0 | L |
| Search chat history | P1 | M |
| Create health events collection | P0 | M |
| Auto-create events from chats | P0 | M |
| Health timeline UI | P0 | L |
| Manual event creation | P1 | M |

**Deliverable:** Premium chats are saved, timeline shows health history

---

### Phase 4: Intelligence (Week 7-8)

**Goal:** AI history awareness and pattern detection

| Task | Priority | Effort |
|------|----------|--------|
| Build history retrieval for AI context | P0 | L |
| Inject history into AI prompts | P0 | M |
| Symptom tracking/extraction from chats | P0 | L |
| Pattern detection algorithm | P0 | L |
| Pattern alerts in AI responses | P0 | M |
| Test and tune AI with history | P0 | M |

**Deliverable:** AI references past conversations, detects patterns

---

### Phase 5: Proactive Features (Week 9-10)

**Goal:** Breed/age alerts and vet reports

| Task | Priority | Effort |
|------|----------|--------|
| Create alert rules database | P0 | M |
| Alert matching engine | P0 | M |
| Alerts UI on dashboard | P0 | M |
| Alert history and management | P1 | M |
| Vet report generation | P1 | L |
| Report export (PDF) | P2 | M |

**Deliverable:** Premium users get proactive health alerts

---

### Phase 6: Polish & Multi-Dog (Week 11-12)

**Goal:** Household features and UX polish

| Task | Priority | Effort |
|------|----------|--------|
| Household dashboard UI | P1 | M |
| Multi-dog symptom comparison | P1 | M |
| Household context in AI | P1 | M |
| Premium badge/branding throughout | P1 | S |
| CTA optimization based on data | P1 | M |
| Performance optimization | P1 | M |
| Bug fixes and polish | P0 | L |

**Deliverable:** Complete premium experience

---

## 9. Technical Requirements

### 9.1 Payment Integration

**Recommended:** RevenueCat (simpler) or Stripe (more control)

```javascript
// RevenueCat integration
import Purchases from 'react-native-purchases'

// Initialize
Purchases.configure({ apiKey: 'your_api_key' })

// Check status
const customerInfo = await Purchases.getCustomerInfo()
const isPremium = customerInfo.entitlements.active['premium']

// Purchase
await Purchases.purchasePackage(package)
```

**For web (Stripe):**
```javascript
// Stripe Checkout
const { error } = await stripe.redirectToCheckout({
  lineItems: [{ price: 'price_xxx', quantity: 1 }],
  mode: 'subscription',
  successUrl: `${window.location.origin}/premium/success`,
  cancelUrl: `${window.location.origin}/premium/cancel`,
})
```

### 9.2 Data Storage

**Phase 1 (MVP):** Continue with localStorage + memory
- Premium status in localStorage
- Extended profile in localStorage
- Chat history in memory (session only initially)

**Phase 2 (Production):** Firebase/Supabase
- Firestore for user data, dogs, conversations, events
- Firebase Auth for authentication
- Cloud Functions for background jobs (alerts, patterns)

### 9.3 AI Context Management

**Challenge:** History context adds tokens, increasing cost and latency

**Solutions:**
1. Summarize old conversations (store summary, not full text)
2. Cap history context at ~500 tokens
3. Use relevance scoring to select which history to include
4. Cache AI responses for identical queries

### 9.4 Performance Considerations

| Concern | Mitigation |
|---------|------------|
| History search slow | Index conversations, use Algolia/Typesense for search |
| AI latency with history | Pre-compute history summaries, lazy load |
| Storage costs | Don't store images, compress conversation data |
| Alert computation | Run breed/age checks daily, not per-request |

---

## 10. Success Metrics

### 10.1 Conversion Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Free → Premium conversion | 3-5% | Premium users / Total users |
| Trial → Paid (if trial offered) | 40-50% | Paid / Trial starts |
| Monthly → Annual upgrade | 30% | Annual / Total premium |

### 10.2 Engagement Metrics

| Metric | Free Baseline | Premium Target |
|--------|---------------|----------------|
| Chats per user per day | 2-3 | 5+ |
| Days active per month | 5-7 | 15+ |
| Profile completion | 40% | 80% |
| Chat history views | N/A | 3+ per week |

### 10.3 Retention Metrics

| Metric | Target |
|--------|--------|
| D7 retention (premium) | 70% |
| D30 retention (premium) | 50% |
| Monthly churn | <5% |
| Annual renewal rate | 60% |

### 10.4 Revenue Metrics

| Metric | Calculation |
|--------|-------------|
| MRR | Premium users × $4.99 (or $3.33 for annual) |
| ARPU | Total revenue / Total users |
| LTV | ARPU × Average lifespan |
| CAC | Marketing spend / New users |

---

## Appendix A: Breed Health Risk Database

Initial breeds to support with genetic risk data:

| Breed | Common Health Issues |
|-------|---------------------|
| Labrador Retriever | Hip dysplasia, elbow dysplasia, obesity |
| German Shepherd | Hip dysplasia, degenerative myelopathy |
| Golden Retriever | Cancer, hip dysplasia, heart disease |
| French Bulldog | Brachycephalic syndrome, spine issues |
| Bulldog | Breathing issues, skin fold infections |
| Poodle | Addison's disease, hip dysplasia, bloat |
| Beagle | Epilepsy, hypothyroidism, cherry eye |
| Rottweiler | Hip dysplasia, heart conditions, cancer |
| Yorkshire Terrier | Dental disease, liver shunt, luxating patella |
| Boxer | Cancer, heart conditions, hip dysplasia |
| Dachshund | IVDD, obesity, dental disease |
| Siberian Husky | Eye disorders, hip dysplasia, hypothyroidism |

---

## Appendix B: Age Milestone Alerts

| Age (Small/Medium) | Age (Large/Giant) | Milestone |
|-------------------|-------------------|-----------|
| 0-6 months | 0-6 months | Puppy vaccines, socialization window |
| 6-12 months | 6-12 months | Spay/neuter discussion, adult food transition |
| 1 year | 1 year | First annual exam, baseline bloodwork |
| 3 years | 2 years | Dental cleaning consideration |
| 7 years | 5 years | "Entering senior years" - bi-annual exams |
| 10 years | 7 years | Senior bloodwork panel, joint supplements |
| 12+ years | 9+ years | Geriatric care, quality of life monitoring |

---

## Appendix C: Regional Health Considerations

| Region | Key Concerns |
|--------|-------------|
| Southeast US | Heartworm (year-round), ticks (Ehrlichia) |
| Southwest US | Valley fever, rattlesnakes |
| Northeast US | Lyme disease, anaplasmosis |
| Midwest US | Blastomycosis, heartworm |
| Pacific Northwest | Salmon poisoning, leptospirosis |
| Mountain West | Altitude considerations, wildlife encounters |

---

*End of Specification*
