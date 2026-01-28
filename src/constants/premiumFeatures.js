import { ClipboardList, FileText, Pill, Activity, Dna, MessageCircle, Camera, FileSearch } from 'lucide-react'

const premiumFeatures = [
  {
    id: 'unlimitedChat',
    label: 'Unlimited Chat',
    description: 'Personalized AI health conversations',
    icon: MessageCircle,
    color: '#7EC8C8',
    bgGradient: 'linear-gradient(135deg, #EFF9FA 0%, #E2F4F5 100%)',
    iconBg: 'linear-gradient(135deg, rgba(126,200,200,0.2) 0%, rgba(95,179,179,0.15) 100%)',
    personalizedText: (dogName) =>
      `Chat with Pawsy about ${dogName || 'your dog'}'s health as much as you need — no daily limits. Every conversation is saved so you can revisit past advice, and Pawsy automatically tracks symptoms and updates ${dogName || 'your dog'}'s health profile for a truly personalized experience.`,
    placement: 'sidebar',
  },
  {
    id: 'unlimitedPhoto',
    label: 'Unlimited Photos',
    description: 'AI-powered visual health screening',
    icon: Camera,
    color: '#E8924F',
    bgGradient: 'linear-gradient(135deg, #FFF5ED 0%, #FFE8D6 100%)',
    iconBg: 'linear-gradient(135deg, rgba(232,146,79,0.2) 0%, rgba(212,133,74,0.15) 100%)',
    personalizedText: (dogName) =>
      `Scan ${dogName || 'your dog'}'s skin, eyes, teeth, and more — no daily limits. Every analysis is saved to ${dogName || 'your dog'}'s health profile, so Pawsy can track changes over time and give smarter, more personalized recommendations.`,
    placement: 'sidebar',
  },
  {
    id: 'clinicalProfile',
    label: 'Clinical Profile',
    description: 'Complete health record',
    icon: ClipboardList,
    color: '#5B8DEF',
    bgGradient: 'linear-gradient(135deg, #EBF1FF 0%, #D6E4FF 100%)',
    iconBg: 'linear-gradient(135deg, rgba(91,141,239,0.2) 0%, rgba(66,115,220,0.15) 100%)',
    personalizedText: (dogName) =>
      `Build ${dogName || 'your dog'}'s complete clinical profile — conditions, medications, and vet history in one place`,
    placement: 'petCard',
  },
  {
    id: 'vetReport',
    label: 'Vet Report',
    description: 'Shareable health summary',
    icon: FileText,
    color: '#7C6BC4',
    bgGradient: 'linear-gradient(135deg, #F0EDFF 0%, #E0DAFF 100%)',
    iconBg: 'linear-gradient(135deg, rgba(124,107,196,0.2) 0%, rgba(104,87,176,0.15) 100%)',
    personalizedText: (dogName) =>
      `Generate a shareable vet report for ${dogName || 'your dog'} — ready to print or send to your veterinarian`,
    placement: 'petCard',
  },
  {
    id: 'medicationManager',
    label: 'Medication Manager',
    description: 'Track meds & reminders',
    icon: Pill,
    color: '#E8924F',
    bgGradient: 'linear-gradient(135deg, #FFF5ED 0%, #FFE8D6 100%)',
    iconBg: 'linear-gradient(135deg, rgba(232,146,79,0.2) 0%, rgba(212,133,74,0.15) 100%)',
    personalizedText: (dogName) =>
      `Track ${dogName || 'your dog'}'s medications and never miss a dose`,
    placement: 'grid',
  },
  {
    id: 'healthTimeline',
    label: 'Health Timeline',
    description: 'Visual health history',
    icon: Activity,
    color: '#4A9E9E',
    bgGradient: 'linear-gradient(135deg, #EFF9FA 0%, #E2F4F5 100%)',
    iconBg: 'linear-gradient(135deg, rgba(126,200,200,0.2) 0%, rgba(90,175,175,0.15) 100%)',
    personalizedText: (dogName) =>
      `See ${dogName || 'your dog'}'s complete health journey — symptoms, vet visits, and milestones on one timeline`,
    placement: 'grid',
  },
  {
    id: 'breedInsights',
    label: 'Breed & Age Insights',
    description: 'Personalized risk alerts',
    icon: Dna,
    color: '#43A047',
    bgGradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    iconBg: 'linear-gradient(135deg, rgba(102,187,106,0.2) 0%, rgba(76,175,80,0.15) 100%)',
    personalizedText: (dogName, breed) =>
      `Discover health risks specific to ${breed || 'your breed'} and get proactive care tips for ${dogName || 'your dog'}`,
    placement: 'grid',
  },
  {
    id: 'labAnalysis',
    label: 'Lab Analysis',
    description: 'AI-powered lab interpretation',
    icon: FileSearch,
    color: '#5FB3B3',
    bgGradient: 'linear-gradient(135deg, #EFF9FA 0%, #E2F4F5 100%)',
    iconBg: 'linear-gradient(135deg, rgba(95,179,179,0.2) 0%, rgba(126,200,200,0.15) 100%)',
    personalizedText: (dogName) =>
      `Upload ${dogName || 'your dog'}'s X-rays, blood work, and lab reports for AI-powered interpretation and actionable insights`,
    placement: 'grid',
  },
]

export function getFeatureById(id) {
  return premiumFeatures.find((f) => f.id === id)
}

export function getFeaturesByPlacement(placement) {
  return premiumFeatures.filter((f) => f.placement === placement)
}

export default premiumFeatures
