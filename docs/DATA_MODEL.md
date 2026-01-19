# PAWSY Data Model

Data structures and storage strategy for PAWSY.

## Storage Strategy

### MVP: localStorage

All data persisted to browser localStorage with structured keys.

| Key | Data |
|-----|------|
| `pawsy_user` | User profile |
| `pawsy_dogs` | Array of dog profiles |
| `pawsy_health_events` | Array of health events |
| `pawsy_chat_sessions` | Array of chat sessions |
| `pawsy_photo_analyses` | Array of photo analyses |

### Storage Limits

- localStorage limit: ~5-10MB per origin
- Sufficient for MVP with text data and compressed photos
- Photos should be resized to max 800px before storing

## Data Models

### User

```typescript
interface User {
  id: string;                    // UUID
  email: string;
  name: string;
  avatarUrl?: string;            // Base64 data URL
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  preferences: UserPreferences;
}

interface UserPreferences {
  notifications: boolean;
  measurementUnit: 'imperial' | 'metric';  // lbs vs kg
}
```

### DogProfile

```typescript
interface DogProfile {
  id: string;                    // UUID
  userId: string;                // Owner reference

  // Basic Info
  name: string;
  breed: string;
  dateOfBirth: string;           // ISO 8601 (YYYY-MM-DD)
  gender: 'male' | 'female';
  isNeutered: boolean;

  // Physical
  weight: number;
  weightUnit: 'kg' | 'lbs';
  size: 'small' | 'medium' | 'large' | 'giant';
  coatColor: string;

  // Health
  allergies: string[];           // ["chicken", "grain", "beef"]
  chronicConditions: string[];   // ["hip dysplasia", "diabetes"]
  medications: Medication[];
  vaccinations: Vaccination[];

  // Diet
  dietType: 'dry' | 'wet' | 'raw' | 'mixed' | 'prescription';
  feedingSchedule: string;       // "twice daily"
  foodBrand?: string;

  // Media
  photoUrl?: string;             // Base64 data URL

  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;                // "10mg"
  frequency: string;             // "twice daily"
  startDate: string;
  endDate?: string;              // null if ongoing
  notes?: string;
}

interface Vaccination {
  id: string;
  name: string;                  // "Rabies", "DHPP", "Bordetella"
  dateGiven: string;
  nextDueDate?: string;
  veterinarian?: string;
}
```

### HealthEvent

```typescript
interface HealthEvent {
  id: string;
  dogId: string;
  userId: string;

  type: HealthEventType;
  title: string;                 // "Vomiting episode"
  description: string;           // Details

  severity?: 'mild' | 'moderate' | 'severe';

  // For vet visits
  vetName?: string;
  diagnosis?: string;
  prescription?: string;

  // Linked data
  photoIds?: string[];           // References to PhotoAnalysis
  chatSessionId?: string;        // If created from chat

  // Timestamps
  occurredAt: string;            // When it happened
  createdAt: string;             // When recorded
  resolvedAt?: string;           // When issue resolved

  tags: string[];                // ["vomiting", "digestive", "urgent"]
}

type HealthEventType =
  | 'symptom'         // Illness symptoms
  | 'vet_visit'       // Vet appointments
  | 'vaccination'     // Vaccines administered
  | 'medication'      // Medication changes
  | 'behavior'        // Behavioral changes
  | 'weight'          // Weight measurements
  | 'photo_analysis'  // AI photo analysis
  | 'other';
```

### ChatSession

```typescript
interface ChatSession {
  id: string;
  userId: string;
  dogId: string;

  title: string;                 // Auto-generated from first message
  messages: ChatMessage[];

  // Snapshot of dog data at chat time (for context)
  dogContextSnapshot: {
    name: string;
    breed: string;
    age: string;                 // "2 years, 3 months"
    weight: number;
    allergies: string[];
    recentEvents: string[];      // Last 5 event summaries
  };

  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;

  // User feedback
  wasHelpful?: boolean;

  // Attachments
  attachedPhotoId?: string;      // If photo was shared in chat
}
```

### PhotoAnalysis

```typescript
interface PhotoAnalysis {
  id: string;
  userId: string;
  dogId: string;

  // Image
  imageData: string;             // Base64 encoded
  imageMimeType: string;         // "image/jpeg", "image/png"

  // User input
  userDescription: string;       // "red bump on left ear"
  affectedArea: string;          // "ear", "paw", "skin", "eye", "mouth"

  // AI Analysis Result
  aiAnalysis: {
    summary: string;             // Brief overview
    possibleConditions: string[]; // ["hot spot", "allergic reaction", "insect bite"]
    severity: 'low' | 'medium' | 'high' | 'urgent';
    recommendations: string[];   // Action items
    shouldSeeVet: boolean;
    urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  };

  // Auto-created health event
  healthEventId?: string;

  // If discussed in chat
  chatSessionId?: string;

  createdAt: string;
}
```

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA RELATIONSHIPS                          │
└─────────────────────────────────────────────────────────────────┘

                           ┌─────────┐
                           │  User   │
                           │         │
                           │ id (PK) │
                           └────┬────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           │ 1:N                │ 1:N                │ 1:N
           ▼                    ▼                    ▼
     ┌───────────┐       ┌───────────┐       ┌───────────┐
     │    Dog    │       │   Chat    │       │   Photo   │
     │  Profile  │       │  Session  │       │  Analysis │
     │           │       │           │       │           │
     │  id (PK)  │◀──────│  dogId    │       │  id (PK)  │
     │  userId   │       │  userId   │       │  dogId    │
     └─────┬─────┘       └─────┬─────┘       │  userId   │
           │                   │             └─────┬─────┘
           │ 1:N               │                   │
           ▼                   │                   │
     ┌───────────┐             │                   │
     │  Health   │◀────────────┴───────────────────┘
     │   Event   │        References via IDs
     │           │
     │  id (PK)  │
     │  dogId    │
     │ photoIds[]│
     │ chatId?   │
     └───────────┘
```

## Storage Service

```javascript
// services/storage/localStorage.js

const PREFIX = 'pawsy_';

export const storage = {
  // ─────────────────────────────────────────────
  // Generic Methods
  // ─────────────────────────────────────────────

  get(key) {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error writing ${key}:`, e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  // ─────────────────────────────────────────────
  // User
  // ─────────────────────────────────────────────

  getUser() {
    return this.get('user');
  },

  setUser(user) {
    return this.set('user', {
      ...user,
      updatedAt: new Date().toISOString()
    });
  },

  // ─────────────────────────────────────────────
  // Dogs
  // ─────────────────────────────────────────────

  getDogs() {
    return this.get('dogs') || [];
  },

  getDog(id) {
    return this.getDogs().find(d => d.id === id);
  },

  addDog(dog) {
    const dogs = this.getDogs();
    const newDog = {
      ...dog,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dogs.push(newDog);
    this.set('dogs', dogs);
    return newDog;
  },

  updateDog(id, updates) {
    const dogs = this.getDogs();
    const index = dogs.findIndex(d => d.id === id);
    if (index === -1) return null;

    dogs[index] = {
      ...dogs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.set('dogs', dogs);
    return dogs[index];
  },

  deleteDog(id) {
    const dogs = this.getDogs().filter(d => d.id !== id);
    this.set('dogs', dogs);
    // Also clean up related data
    this.deleteHealthEventsForDog(id);
    this.deleteChatSessionsForDog(id);
    this.deletePhotoAnalysesForDog(id);
  },

  // ─────────────────────────────────────────────
  // Health Events
  // ─────────────────────────────────────────────

  getHealthEvents(dogId = null) {
    const events = this.get('health_events') || [];
    return dogId ? events.filter(e => e.dogId === dogId) : events;
  },

  getRecentHealthEvents(dogId, limit = 10) {
    return this.getHealthEvents(dogId)
      .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
      .slice(0, limit);
  },

  addHealthEvent(event) {
    const events = this.get('health_events') || [];
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    this.set('health_events', events);
    return newEvent;
  },

  updateHealthEvent(id, updates) {
    const events = this.get('health_events') || [];
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;

    events[index] = { ...events[index], ...updates };
    this.set('health_events', events);
    return events[index];
  },

  deleteHealthEventsForDog(dogId) {
    const events = this.get('health_events') || [];
    this.set('health_events', events.filter(e => e.dogId !== dogId));
  },

  // ─────────────────────────────────────────────
  // Chat Sessions
  // ─────────────────────────────────────────────

  getChatSessions(dogId = null) {
    const sessions = this.get('chat_sessions') || [];
    return dogId ? sessions.filter(s => s.dogId === dogId) : sessions;
  },

  getChatSession(id) {
    return this.getChatSessions().find(s => s.id === id);
  },

  createChatSession(dogId, dogContext) {
    const sessions = this.get('chat_sessions') || [];
    const newSession = {
      id: crypto.randomUUID(),
      dogId,
      userId: this.getUser()?.id,
      title: 'New conversation',
      messages: [],
      dogContextSnapshot: dogContext,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    this.set('chat_sessions', sessions);
    return newSession;
  },

  addMessageToSession(sessionId, message) {
    const sessions = this.get('chat_sessions') || [];
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index === -1) return null;

    const newMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    sessions[index].messages.push(newMessage);
    sessions[index].updatedAt = new Date().toISOString();

    // Auto-generate title from first user message
    if (sessions[index].messages.length === 1 && message.role === 'user') {
      sessions[index].title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
    }

    this.set('chat_sessions', sessions);
    return newMessage;
  },

  deleteChatSessionsForDog(dogId) {
    const sessions = this.get('chat_sessions') || [];
    this.set('chat_sessions', sessions.filter(s => s.dogId !== dogId));
  },

  // ─────────────────────────────────────────────
  // Photo Analyses
  // ─────────────────────────────────────────────

  getPhotoAnalyses(dogId = null) {
    const analyses = this.get('photo_analyses') || [];
    return dogId ? analyses.filter(a => a.dogId === dogId) : analyses;
  },

  savePhotoAnalysis(analysis) {
    const analyses = this.get('photo_analyses') || [];
    const newAnalysis = {
      ...analysis,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    analyses.push(newAnalysis);
    this.set('photo_analyses', analyses);

    // Auto-create health event
    if (analysis.aiAnalysis) {
      const healthEvent = this.addHealthEvent({
        dogId: analysis.dogId,
        userId: analysis.userId,
        type: 'photo_analysis',
        title: `Photo analysis: ${analysis.affectedArea}`,
        description: analysis.aiAnalysis.summary,
        severity: analysis.aiAnalysis.severity === 'urgent' ? 'severe' :
                  analysis.aiAnalysis.severity === 'high' ? 'moderate' : 'mild',
        occurredAt: new Date().toISOString(),
        photoIds: [newAnalysis.id],
        tags: [analysis.affectedArea, 'photo-analysis'],
      });
      newAnalysis.healthEventId = healthEvent.id;
      // Update with health event reference
      const updated = this.get('photo_analyses');
      const idx = updated.findIndex(a => a.id === newAnalysis.id);
      updated[idx] = newAnalysis;
      this.set('photo_analyses', updated);
    }

    return newAnalysis;
  },

  deletePhotoAnalysesForDog(dogId) {
    const analyses = this.get('photo_analyses') || [];
    this.set('photo_analyses', analyses.filter(a => a.dogId !== dogId));
  },

  // ─────────────────────────────────────────────
  // Data Export (for migration)
  // ─────────────────────────────────────────────

  exportAllData() {
    return {
      user: this.getUser(),
      dogs: this.getDogs(),
      healthEvents: this.get('health_events') || [],
      chatSessions: this.get('chat_sessions') || [],
      photoAnalyses: this.get('photo_analyses') || [],
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  },

  importData(data) {
    if (data.user) this.set('user', data.user);
    if (data.dogs) this.set('dogs', data.dogs);
    if (data.healthEvents) this.set('health_events', data.healthEvents);
    if (data.chatSessions) this.set('chat_sessions', data.chatSessions);
    if (data.photoAnalyses) this.set('photo_analyses', data.photoAnalyses);
  },

  clearAllData() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(PREFIX))
      .forEach(key => localStorage.removeItem(key));
  },
};
```

## AI Context Building

```javascript
// services/prompts/chatPrompts.js

export function buildSystemPrompt(dog, healthEvents) {
  const age = calculateAge(dog.dateOfBirth);
  const recentEvents = healthEvents
    .slice(-10)
    .map(e => `- ${formatDate(e.occurredAt)}: ${e.title}`)
    .join('\n');

  return `You are Pawsy, a friendly and knowledgeable AI veterinary assistant. You provide helpful, empathetic advice about dog health while always recommending professional veterinary care for serious concerns.

## Dog Profile
- **Name**: ${dog.name}
- **Breed**: ${dog.breed}
- **Age**: ${age}
- **Gender**: ${dog.gender}${dog.isNeutered ? ' (neutered)' : ''}
- **Weight**: ${dog.weight} ${dog.weightUnit}
- **Size**: ${dog.size}

## Health Information
- **Known Allergies**: ${dog.allergies.length > 0 ? dog.allergies.join(', ') : 'None known'}
- **Chronic Conditions**: ${dog.chronicConditions.length > 0 ? dog.chronicConditions.join(', ') : 'None known'}
- **Current Medications**: ${dog.medications.length > 0 ? dog.medications.map(m => `${m.name} (${m.dosage})`).join(', ') : 'None'}
- **Diet**: ${dog.dietType} food${dog.foodBrand ? ` (${dog.foodBrand})` : ''}

## Recent Health Events
${recentEvents || 'No recent events recorded'}

## Guidelines
1. Always consider ${dog.name}'s specific profile when giving advice
2. Reference relevant health history when applicable
3. Be warm, reassuring, and informative
4. Recommend vet visits for anything concerning
5. Ask clarifying questions when needed
6. Never diagnose definitively - suggest possibilities
7. Consider breed-specific health traits for ${dog.breed}
8. Account for known allergies when suggesting treatments`;
}

export function buildPhotoAnalysisPrompt(dog, description, affectedArea) {
  return `Analyze this photo of a potential health concern for ${dog.name}, a ${calculateAge(dog.dateOfBirth)} old ${dog.breed}.

Known allergies: ${dog.allergies.join(', ') || 'None'}
Known conditions: ${dog.chronicConditions.join(', ') || 'None'}
Affected area: ${affectedArea}
Owner's description: "${description}"

Provide analysis in this JSON format:
{
  "summary": "Brief overview of what you observe",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "severity": "low|medium|high|urgent",
  "recommendations": ["action1", "action2"],
  "shouldSeeVet": true/false,
  "urgency": "routine|soon|urgent|emergency"
}

Be thorough but err on the side of caution. If anything looks concerning, recommend veterinary attention.`;
}

function calculateAge(dateOfBirth) {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const years = Math.floor((now - birth) / (365.25 * 24 * 60 * 60 * 1000));
  const months = Math.floor(((now - birth) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));

  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
```

## Sample Data

```javascript
// Example dog profile
const sampleDog = {
  id: "dog-123",
  userId: "user-456",
  name: "Luna",
  breed: "Golden Retriever",
  dateOfBirth: "2022-03-15",
  gender: "female",
  isNeutered: true,
  weight: 65,
  weightUnit: "lbs",
  size: "large",
  coatColor: "Golden",
  allergies: ["chicken"],
  chronicConditions: [],
  medications: [],
  vaccinations: [
    { id: "v1", name: "Rabies", dateGiven: "2023-03-15", nextDueDate: "2026-03-15" },
    { id: "v2", name: "DHPP", dateGiven: "2023-03-15", nextDueDate: "2024-03-15" }
  ],
  dietType: "dry",
  feedingSchedule: "twice daily",
  foodBrand: "Blue Buffalo",
  photoUrl: "data:image/jpeg;base64,...",
  createdAt: "2023-01-10T10:00:00Z",
  updatedAt: "2024-01-15T14:30:00Z"
};
```
