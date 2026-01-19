# PAWSY Architecture

Technical architecture for PAWSY - a dog health hub + AI vet assistant.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.x |
| Build Tool | Vite | 7.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui | latest |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | latest |
| AI | Google Gemini API | 2.0 Flash |
| Routing | React Router | 7.x |

## Folder Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── card.jsx
│   │   ├── avatar.jsx
│   │   ├── dialog.jsx
│   │   ├── sheet.jsx
│   │   ├── toast.jsx
│   │   ├── textarea.jsx
│   │   ├── badge.jsx
│   │   └── progress.jsx
│   │
│   ├── common/                # Shared app components
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AnimatedPage.jsx
│   │
│   ├── layout/                # Layout structure
│   │   ├── AppShell.jsx       # Main app wrapper with nav
│   │   ├── Header.jsx
│   │   ├── BottomNav.jsx
│   │   └── PageContainer.jsx
│   │
│   ├── dog/                   # Dog-related components
│   │   ├── DogAvatar.jsx
│   │   ├── DogProfileCard.jsx
│   │   ├── DogForm.jsx
│   │   └── HealthOrb.jsx
│   │
│   ├── chat/                  # AI chat components
│   │   ├── ChatBubble.jsx
│   │   ├── ChatInput.jsx
│   │   ├── ChatHistory.jsx
│   │   └── PawTypingIndicator.jsx
│   │
│   └── photo/                 # Photo analysis components
│       ├── PhotoUploader.jsx
│       ├── ScanAnimation.jsx
│       └── AnalysisResult.jsx
│
├── pages/                     # Route-level components
│   ├── Landing.jsx
│   ├── SignUp.jsx
│   ├── Login.jsx
│   ├── AddDogProfile.jsx
│   ├── Dashboard.jsx
│   ├── Chat.jsx
│   ├── PhotoAnalysis.jsx
│   └── Settings.jsx
│
├── context/                   # React Context providers
│   ├── AuthContext.jsx
│   ├── DogContext.jsx
│   └── ChatContext.jsx
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.js
│   ├── useDog.js
│   ├── useChat.js
│   ├── useGemini.js
│   ├── usePhotoAnalysis.js
│   └── useLocalStorage.js
│
├── services/                  # External services & APIs
│   ├── api/
│   │   └── gemini.js          # Gemini API client
│   ├── storage/
│   │   └── localStorage.js    # Local persistence
│   └── prompts/
│       ├── chatPrompts.js     # AI system prompts
│       └── photoPrompts.js    # Photo analysis prompts
│
├── utils/                     # Utility functions
│   ├── constants.js
│   ├── formatters.js
│   └── validators.js
│
├── animations/                # Framer Motion configs
│   ├── variants.js            # Reusable animation variants
│   └── transitions.js         # Spring/timing configs
│
├── lib/
│   └── utils.js               # shadcn cn() helper
│
├── styles/
│   └── fonts.css              # Google Fonts imports
│
├── App.jsx                    # Root with providers
├── routes.jsx                 # Route definitions
├── main.jsx                   # Entry point
└── index.css                  # Tailwind + CSS variables
```

## State Management

### Approach: React Context + useReducer

For MVP scope, React Context provides sufficient state management without external dependencies.

### Context Architecture

```
<AuthProvider>           ← User session state
  <DogProvider>          ← Dog profiles + health data
    <ChatProvider>       ← Chat sessions + messages
      <RouterProvider>   ← App routes
    </ChatProvider>
  </DogProvider>
</AuthProvider>
```

### Context Pattern

```jsx
// Each context follows this pattern:
const DogContext = createContext(null);

function dogReducer(state, action) {
  switch (action.type) {
    case 'SET_DOGS': return { ...state, dogs: action.payload };
    case 'ADD_DOG': return { ...state, dogs: [...state.dogs, action.payload] };
    case 'SET_ACTIVE_DOG': return { ...state, activeDogId: action.payload };
    // ...
  }
}

export function DogProvider({ children }) {
  const [state, dispatch] = useReducer(dogReducer, initialState);
  // Auto-persist to localStorage on changes
  return <DogContext.Provider value={{ state, dispatch }}>{children}</DogContext.Provider>;
}
```

## Routing

### React Router v7 with Lazy Loading

```jsx
// routes.jsx
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
// ...

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Landing /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/login', element: <Login /> },

  // Protected routes (wrapped in AppShell)
  {
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { path: '/add-dog', element: <AddDogProfile /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/chat', element: <Chat /> },
      { path: '/photo', element: <PhotoAnalysis /> },
      { path: '/settings', element: <Settings /> },
    ]
  }
]);
```

### User Flow

```
/              Landing page (hero, CTA)
    ↓
/signup        Create account
    ↓
/add-dog       Add first dog profile + photo
    ↓
/dashboard     Main hub (health orb, quick actions)
    ↓
/chat          AI vet assistant conversation
/photo         Photo analysis upload
/settings      Manage profile & dogs
```

## Data Flow: AI Personalization

The key architectural challenge is flowing dog context to AI for personalized responses.

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI CONTEXT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  DogContext  │────▶│  useChat()   │────▶│ buildSystemPrompt()  │
│              │     │              │     │                      │
│ • profile    │     │ gets active  │     │ "You are Pawsy...    │
│ • allergies  │     │ dog + events │     │  Dog: {name}         │
│ • conditions │     │              │     │  Breed: {breed}      │
│ • events     │     │              │     │  Allergies: {list}   │
└──────────────┘     └──────────────┘     │  Recent: {events}"   │
                                          └──────────┬───────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │   Gemini API Call    │
                                          │                      │
                                          │ systemInstruction +  │
                                          │ user message         │
                                          └──────────┬───────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │ Personalized Response│
                                          │                      │
                                          │ "Since {name} has    │
                                          │  chicken allergies..." │
                                          └──────────────────────┘
```

### useChat Hook

```jsx
export function useChat() {
  const { state: dogState } = useDogContext();
  const { state: chatState, dispatch } = useChatContext();

  const activeDog = dogState.dogs.find(d => d.id === dogState.activeDogId);
  const recentEvents = dogState.healthEvents
    .filter(e => e.dogId === dogState.activeDogId)
    .slice(-10);

  const sendMessage = async (userMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', content: userMessage } });

    const systemPrompt = buildSystemPrompt(activeDog, recentEvents);
    const response = await geminiService.chat(systemPrompt, userMessage);

    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', content: response } });
  };

  return { messages: chatState.messages, sendMessage, activeDog };
}
```

## Gemini API Integration

### Client Setup

```jsx
// services/api/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const geminiService = {
  async chat(systemPrompt, userMessage) {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(userMessage);
    return result.response.text();
  },

  async analyzePhoto(imageBase64, mimeType, prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: imageBase64 } }
    ]);
    return result.response.text();
  }
};
```

### Environment Variables

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

> **Security Note**: For MVP, the API key is exposed client-side. Production should proxy through a backend or use Firebase AI Logic.

## Authentication (MVP)

Simple localStorage-based auth that can be upgraded to Firebase/Supabase later.

```jsx
// context/AuthContext.jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('pawsy_user'));
  });

  const signup = (email, name) => {
    const newUser = { id: crypto.randomUUID(), email, name, createdAt: new Date().toISOString() };
    localStorage.setItem('pawsy_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('pawsy_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## shadcn/ui Setup

### Installation

```bash
npx shadcn@latest init
npx shadcn@latest add button input card avatar dialog sheet toast textarea badge progress
```

### Path Alias (vite.config.js)

```js
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Utility Function

```js
// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

## Performance Considerations

1. **Lazy Loading**: All pages are code-split with `React.lazy()`
2. **Image Optimization**: Dog photos stored as optimized base64 or compressed
3. **Animation Performance**: Framer Motion with `will-change` hints
4. **Bundle Size**: Tree-shaking enabled for Tailwind and Lucide icons

## Future Migration Path

### Backend Integration

When ready to add a backend:

1. **Auth**: Replace localStorage auth with Firebase Auth or Supabase Auth
2. **Database**: Export localStorage data to PostgreSQL/Firestore
3. **API Proxy**: Move Gemini calls to serverless functions
4. **File Storage**: Move dog photos to cloud storage (S3, Cloud Storage)

The storage service abstraction makes this migration straightforward:

```jsx
// Current
import { storage } from './services/storage/localStorage';

// Future
import { storage } from './services/storage/supabase';
// Same API, different implementation
```
