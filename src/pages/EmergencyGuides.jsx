import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  Heart,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  Zap,
  Bug,
  Scissors,
  Eye,
  Bone,
  Phone,
  MapPin,
  ArrowLeft
} from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'

// Emergency first aid guides
const EMERGENCY_GUIDES = [
  {
    id: 'cpr',
    title: 'CPR',
    subtitle: 'Cardiopulmonary resuscitation',
    icon: Heart,
    color: 'from-red-400 to-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    vetUrgency: 'immediate',
    vetUrgencyText: 'Call vet immediately - this is a life-threatening emergency',
    when: 'If your dog is not breathing and has no heartbeat',
    warning: 'Only perform CPR if there is no pulse. Check for breathing first.',
    steps: [
      { title: 'Check responsiveness', detail: 'Gently tap and call your dog\'s name. Check if they respond.' },
      { title: 'Check breathing', detail: 'Look for chest movement. Feel for breath from nostrils. Listen near the nose.' },
      { title: 'Check pulse', detail: 'Feel the inside of the upper thigh for femoral pulse. Check for 10 seconds.' },
      { title: 'Position your dog', detail: 'Lay them on their right side on a flat surface. Extend the head and neck.' },
      { title: 'Close the mouth', detail: 'Hold the muzzle closed with your hands.' },
      { title: 'Give rescue breaths', detail: 'Cover their nose with your mouth. Give 2 breaths, watching for chest rise.' },
      { title: 'Perform chest compressions', detail: 'For medium/large dogs: compress chest 1/3 to 1/2 depth. For small dogs: wrap hands around chest. Rate: 100-120 compressions per minute.' },
      { title: 'Continue CPR cycle', detail: '30 compressions, then 2 rescue breaths. Check for pulse every 2 minutes. Continue until breathing resumes or vet takes over.' },
    ],
  },
  {
    id: 'choking',
    title: 'Choking',
    subtitle: 'Airway obstruction',
    icon: Wind,
    color: 'from-orange-400 to-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    vetUrgency: 'immediate',
    vetUrgencyText: 'Call vet immediately if unable to clear airway',
    when: 'If your dog is pawing at mouth, gagging, or struggling to breathe',
    warning: 'Be careful not to push object further down. Only try removal if you can clearly see it.',
    steps: [
      { title: 'Stay calm', detail: 'Your dog will be panicked. Approach calmly to avoid bites.' },
      { title: 'Open the mouth', detail: 'Gently open mouth wide. Use one hand on upper jaw, one on lower.' },
      { title: 'Look for the object', detail: 'Use a flashlight if available. Only proceed if you can clearly see the object.' },
      { title: 'Try to remove (if visible)', detail: 'Use fingers or tweezers to carefully grasp and remove. Sweep from side to side.' },
      { title: 'Heimlich maneuver (if needed)', detail: 'For large dogs: Stand behind, wrap arms around belly, make fist below rib cage, thrust upward 5 times.' },
      { title: 'For small dogs', detail: 'Hold dog with back against your chest. Use 2 fingers to thrust upward below rib cage.' },
      { title: 'Check mouth again', detail: 'Look for dislodged object. Remove if visible.' },
      { title: 'Seek vet care', detail: 'Even if object removed, have vet check for internal damage.' },
    ],
  },
  {
    id: 'poisoning',
    title: 'Poisoning',
    subtitle: 'Toxic substance ingestion',
    icon: AlertTriangle,
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    vetUrgency: 'immediate',
    vetUrgencyText: 'Call poison control or vet immediately - time is critical',
    when: 'If your dog ate something toxic (chocolate, xylitol, chemicals, etc.)',
    warning: 'Do NOT induce vomiting unless instructed by a vet. Some substances cause more damage coming back up.',
    steps: [
      { title: 'Remove from source', detail: 'Get your dog away from any remaining toxic substance.' },
      { title: 'Do NOT induce vomiting yet', detail: 'Some toxins (caustic, petroleum) cause more damage if vomited.' },
      { title: 'Identify the toxin', detail: 'Save packaging, take photos. Note how much was ingested and when.' },
      { title: 'Call poison control', detail: 'ASPCA Poison Control: 888-426-4435 (fee applies). Have toxin info ready.' },
      { title: 'Follow their instructions', detail: 'They may advise inducing vomiting with hydrogen peroxide or going to vet immediately.' },
      { title: 'If instructed to induce vomiting', detail: '1 tsp 3% hydrogen peroxide per 10 lbs body weight. Max 3 tbsp. Give once only.' },
      { title: 'Monitor symptoms', detail: 'Watch for: vomiting, diarrhea, seizures, lethargy, drooling.' },
      { title: 'Get to vet', detail: 'Bring the toxin/packaging. Time is critical with many poisons.' },
    ],
  },
  {
    id: 'heatstroke',
    title: 'Heatstroke',
    subtitle: 'Overheating emergency',
    icon: Thermometer,
    color: 'from-amber-400 to-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    vetUrgency: 'immediate',
    vetUrgencyText: 'Get to vet ASAP - internal organ damage may not be visible',
    when: 'If your dog is panting heavily, drooling excessively, or collapsed in heat',
    warning: 'Do NOT use ice water - it can cause shock. Cool gradually.',
    steps: [
      { title: 'Move to shade/AC', detail: 'Get dog out of heat immediately. Find cool, shaded area or air conditioning.' },
      { title: 'Offer water', detail: 'Let them drink small amounts. Don\'t force water.' },
      { title: 'Apply cool water', detail: 'Use lukewarm to cool water (not ice cold). Focus on neck, armpits, groin.' },
      { title: 'Use wet towels', detail: 'Place cool wet towels on neck, armpits, between back legs. Replace frequently - they heat up fast.' },
      { title: 'Fan your dog', detail: 'Air movement helps cooling. Use fan or car AC.' },
      { title: 'Check temperature', detail: 'Normal is 101-102.5°F. Heatstroke is 104°F+. Stop cooling at 103°F.' },
      { title: 'Do NOT over-cool', detail: 'Stop active cooling when temp reaches 103°F to prevent hypothermia.' },
      { title: 'Get to vet', detail: 'Even if seems recovered. Internal organ damage may not be immediately visible.' },
    ],
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding',
    subtitle: 'Wound and trauma care',
    icon: Droplets,
    color: 'from-rose-400 to-rose-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    vetUrgency: 'immediate',
    vetUrgencyText: 'Call vet while applying pressure - transport when stable',
    when: 'If your dog has a wound that won\'t stop bleeding',
    warning: 'Apply direct pressure. Do not remove bandages if blood soaks through - add more on top.',
    steps: [
      { title: 'Stay calm', detail: 'Your dog will sense your stress. Stay calm to keep them calm.' },
      { title: 'Protect yourself', detail: 'Injured dogs may bite. Consider muzzle if needed.' },
      { title: 'Apply direct pressure', detail: 'Use clean cloth, gauze, or towel. Press firmly on wound.' },
      { title: 'Maintain pressure', detail: 'Keep steady pressure for 5-10 minutes. Don\'t peek - this resets clotting.' },
      { title: 'Don\'t remove bandages', detail: 'If blood soaks through, add more layers on top. Removing restarts bleeding.' },
      { title: 'Elevate if possible', detail: 'If limb injury, try to elevate above heart level.' },
      { title: 'For arterial bleeding', detail: 'Bright red, spurting blood. Apply pressure point between wound and heart.' },
      { title: 'Transport to vet', detail: 'Keep pressure on wound during transport. Call ahead so they\'re ready.' },
    ],
  },
  {
    id: 'seizure',
    title: 'Seizures',
    subtitle: 'Convulsion response',
    icon: Zap,
    color: 'from-indigo-400 to-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    vetUrgency: 'urgent',
    vetUrgencyText: 'Call vet after seizure ends, or immediately if it lasts 5+ minutes',
    when: 'If your dog is having a seizure (convulsing, stiff, unresponsive)',
    warning: 'Do NOT put anything in their mouth or restrain them. They cannot swallow their tongue.',
    steps: [
      { title: 'Stay calm', detail: 'Seizures look scary but most pass in 1-2 minutes.' },
      { title: 'Clear the area', detail: 'Move furniture and objects away. Protect from stairs and sharp corners.' },
      { title: 'Do NOT restrain', detail: 'Don\'t hold them down. This doesn\'t help and may cause injury.' },
      { title: 'Do NOT put hands near mouth', detail: 'They cannot swallow their tongue. You may be bitten.' },
      { title: 'Time the seizure', detail: 'Important for vet. Seizures over 5 minutes are emergencies.' },
      { title: 'Dim lights, reduce noise', detail: 'Sensory stimulation can worsen seizures.' },
      { title: 'After seizure', detail: 'Dog will be disoriented. Speak softly, keep calm environment. They may not recognize you briefly.' },
      { title: 'When to call vet', detail: 'First seizure ever, lasts over 5 min, multiple seizures, or doesn\'t recover normally.' },
    ],
  },
  {
    id: 'bee-sting',
    title: 'Bee Stings',
    subtitle: 'Insect sting reaction',
    icon: Bug,
    color: 'from-yellow-400 to-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    vetUrgency: 'monitor',
    vetUrgencyText: 'Call vet immediately if facial swelling or breathing difficulty',
    when: 'If your dog was stung by a bee, wasp, or other insect',
    warning: 'Watch for allergic reaction: facial swelling, difficulty breathing, collapse.',
    steps: [
      { title: 'Find the stinger', detail: 'Look for small black dot at sting site. May be on face, paw, or mouth.' },
      { title: 'Remove stinger', detail: 'Scrape sideways with credit card or fingernail. Don\'t squeeze or use tweezers.' },
      { title: 'Clean the area', detail: 'Wash with mild soap and water.' },
      { title: 'Apply cold compress', detail: 'Wrap ice in cloth. Apply for 10 minutes on, 10 off.' },
      { title: 'Baking soda paste', detail: 'Mix baking soda with water. Apply to reduce pain and itching.' },
      { title: 'Monitor for reaction', detail: 'Mild swelling at site is normal. Watch for spreading or severe swelling.' },
      { title: 'Emergency signs', detail: 'Call vet immediately if: face/throat swelling, difficulty breathing, vomiting, collapse.' },
      { title: 'Antihistamine', detail: 'Ask vet about Benadryl dosing (typically 1mg per lb). Only if no severe reaction.' },
    ],
  },
  {
    id: 'broken-nail',
    title: 'Broken Nail',
    subtitle: 'Nail injury care',
    icon: Scissors,
    color: 'from-teal-400 to-teal-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    vetUrgency: 'soon',
    vetUrgencyText: 'Schedule vet visit within 24 hours, or sooner if bleeding won\'t stop',
    when: 'If your dog has a broken, torn, or bleeding nail',
    warning: 'Nail injuries bleed a lot but are rarely serious. Stay calm.',
    steps: [
      { title: 'Restrain your dog', detail: 'Nail injuries are painful. You may need help holding them still.' },
      { title: 'Apply pressure', detail: 'Use clean cloth or gauze. Press firmly for 5-10 minutes.' },
      { title: 'Use styptic powder', detail: 'If available, apply to stop bleeding. Cornstarch works as backup.' },
      { title: 'Assess the damage', detail: 'Is nail partially attached? Completely torn? Just cracked?' },
      { title: 'If nail is loose', detail: 'It may need to be removed by vet to prevent further tearing.' },
      { title: 'Clean and bandage', detail: 'Once bleeding stops, clean with antiseptic. Wrap loosely with gauze.' },
      { title: 'Prevent licking', detail: 'Use e-collar if needed. Licking introduces bacteria.' },
      { title: 'See vet if needed', detail: 'If bleeding won\'t stop, nail is severely damaged, or signs of infection appear.' },
    ],
  },
  {
    id: 'eye-injury',
    title: 'Eye Injury',
    subtitle: 'Eye trauma response',
    icon: Eye,
    color: 'from-cyan-400 to-cyan-500',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    vetUrgency: 'immediate',
    vetUrgencyText: 'See vet immediately - vision can be saved with quick treatment',
    when: 'If your dog has an eye injury, foreign object, or chemical exposure',
    warning: 'Do NOT rub or apply pressure. Eye injuries can worsen quickly.',
    steps: [
      { title: 'Prevent rubbing', detail: 'Stop your dog from pawing at the eye. Use e-collar if available.' },
      { title: 'Keep calm and still', detail: 'Movement can worsen eye injuries.' },
      { title: 'For foreign objects', detail: 'If visible on surface, try to flush with saline or clean water.' },
      { title: 'For chemical exposure', detail: 'Flush eye with lukewarm water for 15-20 minutes.' },
      { title: 'Do NOT remove embedded objects', detail: 'If something is stuck in the eye, leave it. Cover loosely and go to vet.' },
      { title: 'Cover the eye', detail: 'Use damp cloth placed loosely over eye. Don\'t apply pressure.' },
      { title: 'Keep other eye open', detail: 'Covering both eyes increases dog\'s anxiety.' },
      { title: 'Get to vet immediately', detail: 'All eye injuries need professional care. Vision can be saved with quick treatment.' },
    ],
  },
  {
    id: 'fracture',
    title: 'Suspected Fracture',
    subtitle: 'Broken bone care',
    icon: Bone,
    color: 'from-slate-400 to-slate-500',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    vetUrgency: 'immediate',
    vetUrgencyText: 'Transport to vet as soon as safely possible',
    when: 'If your dog is limping severely, has visible deformity, or won\'t bear weight',
    warning: 'Do NOT try to set or splint the bone yourself. Minimize movement.',
    steps: [
      { title: 'Approach carefully', detail: 'Dogs in pain may bite. Move slowly, speak softly.' },
      { title: 'Don\'t force movement', detail: 'Let dog find comfortable position. Don\'t make them walk.' },
      { title: 'Assess visible injury', detail: 'Look for swelling, deformity, bone visible. Don\'t touch.' },
      { title: 'Immobilize if possible', detail: 'For leg injury, you can loosely wrap with towel to limit movement.' },
      { title: 'Do NOT apply splint', detail: 'Improper splinting causes more damage. Leave for vet.' },
      { title: 'Control bleeding', detail: 'If open fracture (bone visible), cover wound, apply gentle pressure around it.' },
      { title: 'Transport safely', detail: 'Use board or blanket as stretcher. Keep injured area still.' },
      { title: 'Get to vet', detail: 'X-rays needed to assess damage. Internal injuries may also be present.' },
    ],
  },
]

const VET_URGENCY_STYLES = {
  immediate: {
    container: 'bg-red-50 border border-red-200',
    icon: 'text-red-500',
    heading: 'text-red-700',
    body: 'text-red-600',
    label: 'Call Vet Immediately',
  },
  urgent: {
    container: 'bg-orange-50 border border-orange-200',
    icon: 'text-orange-500',
    heading: 'text-orange-700',
    body: 'text-orange-600',
    label: 'Contact Vet Soon',
  },
  soon: {
    container: 'bg-yellow-50 border border-yellow-200',
    icon: 'text-yellow-600',
    heading: 'text-yellow-700',
    body: 'text-yellow-600',
    label: 'Schedule Vet Visit',
  },
  monitor: {
    container: 'bg-blue-50 border border-blue-200',
    icon: 'text-blue-500',
    heading: 'text-blue-700',
    body: 'text-blue-600',
    label: 'Monitor & Call If Needed',
  },
}

function GuideListView({ onSelectGuide }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <PawsyMascot mood="concerned" size={36} />
            <div>
              <h1
                className="text-lg font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                First Aid Guides
              </h1>
              <p className="text-xs text-[#6B6B6B]">Step-by-step emergency help</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Emergency banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#EF5350] to-[#E53935] rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-white" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">In an emergency?</p>
              <p className="text-white/80 text-xs">First aid helps, but always get to a vet</p>
            </div>
            <Link to="/emergency-vet">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-white rounded-lg text-red-600 text-sm font-semibold"
              >
                Find Vet
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Guide grid */}
        <div className="grid grid-cols-2 gap-3">
          {EMERGENCY_GUIDES.map((guide, index) => {
            const Icon = guide.icon
            return (
              <motion.button
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectGuide(guide)}
                className={`${guide.bgColor} ${guide.borderColor} border rounded-xl p-4 text-left`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3
                  className={`font-bold text-sm ${guide.textColor}`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {guide.title}
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{guide.subtitle}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[#9E9E9E] text-center mt-8">
          These guides are for reference only. Always seek professional veterinary care in emergencies.
        </p>
      </main>

      <BottomNav />
    </div>
  )
}

function GuideDetailView({ guide, onBack }) {
  const Icon = guide.icon
  const urgency = VET_URGENCY_STYLES[guide.vetUrgency]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className={`sticky top-0 z-40 bg-gradient-to-br ${guide.color}`}>
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-lg font-bold text-white"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {guide.title}
              </h1>
              <p className="text-xs text-white/80">{guide.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* When to use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${guide.bgColor} ${guide.borderColor} border rounded-xl p-4 mb-4`}
        >
          <h3 className={`text-sm font-semibold ${guide.textColor} mb-1`}>When to use this guide</h3>
          <p className="text-sm text-[#6B6B6B]">{guide.when}</p>
        </motion.div>

        {/* Vet Urgency Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-xl p-4 mb-4 ${urgency.container}`}
        >
          <div className="flex items-start gap-3">
            <Phone className={`w-5 h-5 flex-shrink-0 mt-0.5 ${urgency.icon}`} />
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${urgency.heading}`}>
                {urgency.label}
              </h3>
              <p className={`text-sm ${urgency.body}`}>{guide.vetUrgencyText}</p>
            </div>
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-700 mb-1">Important</h3>
              <p className="text-sm text-amber-600">{guide.warning}</p>
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          {guide.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E8E8]/50"
            >
              <div className="flex gap-3">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${guide.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#3D3D3D] text-sm">{step.title}</h4>
                  <p className="text-sm text-[#6B6B6B] mt-1">{step.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emergency button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Link to="/emergency-vet">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#EF5350] to-[#E53935] text-white font-bold rounded-xl shadow-lg"
            >
              <MapPin className="w-5 h-5" />
              Find Emergency Vet Near Me
            </motion.button>
          </Link>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-xs text-[#9E9E9E] text-center mt-6">
          This guide is for reference only and does not replace professional veterinary care.
        </p>
      </main>

      <BottomNav />
    </div>
  )
}

function EmergencyGuides() {
  const [selectedGuide, setSelectedGuide] = useState(null)

  if (!selectedGuide) {
    return <GuideListView onSelectGuide={setSelectedGuide} />
  }

  return <GuideDetailView guide={selectedGuide} onBack={() => setSelectedGuide(null)} />
}

export default EmergencyGuides
