import {
  Home,
  MessageCircle,
  Camera,
  Leaf,
  BookOpen,
  MapPin,
  Settings,
  MessagesSquare,
  Images,
  Heart,
} from 'lucide-react'

export const SIDEBAR_SECTIONS = [
  {
    title: 'Main',
    items: [
      { id: 'home', label: 'Home', icon: Home, path: '/dashboard', premium: false },
      { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/chat', premium: false },
      { id: 'photo', label: 'Photo AI', icon: Camera, path: '/photo', premium: false },
    ],
  },
  {
    title: 'Health',
    items: [
      { id: 'chat-history', label: 'Chat History', icon: MessagesSquare, path: '/chat-history', premium: true, featureId: 'chatHistory' },
      { id: 'photo-history', label: 'Photo History', icon: Images, path: '/photo-history', premium: true, featureId: 'photoHistory' },
      { id: 'health-hub', label: 'Health Hub', icon: Heart, path: '/health-hub', premium: true, featureId: 'healthHub' },
    ],
  },
  {
    title: 'Safety',
    items: [
      { id: 'toxic-checker', label: 'Toxic Checker', icon: Leaf, path: '/toxic-checker', premium: false },
      { id: 'first-aid', label: 'First Aid', icon: BookOpen, path: '/emergency-guides', premium: false },
      { id: 'emergency', label: 'Emergency', icon: MapPin, path: '/emergency-vet', premium: false },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', premium: false },
    ],
  },
]
