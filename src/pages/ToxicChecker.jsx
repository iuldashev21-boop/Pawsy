import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  Search,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Leaf,
  Apple,
  Coffee,
  Pill,
  X,
  ChevronRight,
  MapPin
} from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'
import { useOnboarding } from '../context/OnboardingContext'

// Toxicity database
const TOXIC_ITEMS = [
  // Foods - Toxic
  { name: 'Chocolate', category: 'food', toxicity: 'toxic', icon: '🍫',
    description: 'Contains theobromine which dogs cannot metabolize. Dark chocolate is most dangerous.',
    quantityNote: 'Small amount (1-2 bites): monitor closely. Large amount or dark chocolate: emergency',
    symptoms: ['Vomiting', 'Diarrhea', 'Rapid breathing', 'Seizures'],
    action: 'Contact vet immediately if large amount consumed' },
  { name: 'Grapes', category: 'food', toxicity: 'toxic', icon: '🍇',
    description: 'Can cause acute kidney failure in dogs. Raisins are equally dangerous.',
    quantityNote: 'Even 1-2 grapes can be toxic for small dogs. Any amount is concerning',
    symptoms: ['Vomiting', 'Lethargy', 'Kidney failure'],
    action: 'Seek emergency vet care - even small amounts are dangerous' },
  { name: 'Raisins', category: 'food', toxicity: 'toxic', icon: '🍇',
    description: 'Concentrated form of grapes, extremely toxic to dogs.',
    quantityNote: 'A single raisin can be dangerous. Treat any amount as an emergency',
    symptoms: ['Vomiting', 'Lethargy', 'Kidney failure'],
    action: 'Seek emergency vet care immediately' },
  { name: 'Onions', category: 'food', toxicity: 'toxic', icon: '🧅',
    description: 'Contains compounds that damage red blood cells causing anemia.',
    quantityNote: 'Small bite: likely okay. More than 0.5% of body weight: toxic',
    symptoms: ['Weakness', 'Vomiting', 'Breathing problems', 'Pale gums'],
    action: 'Contact vet - toxicity can be delayed' },
  { name: 'Garlic', category: 'food', toxicity: 'toxic', icon: '🧄',
    description: 'More potent than onions. Even small amounts can cause issues.',
    quantityNote: '1 clove per 10 lbs body weight is toxic. Less may still cause issues',
    symptoms: ['Weakness', 'Lethargy', 'Pale gums'],
    action: 'Contact vet if significant amount consumed' },
  { name: 'Xylitol', category: 'food', toxicity: 'toxic', icon: '🍬',
    description: 'Artificial sweetener found in sugar-free products. Extremely dangerous.',
    quantityNote: 'Extremely toxic - even a small amount (1-2 pieces of gum) is an emergency',
    symptoms: ['Vomiting', 'Seizures', 'Liver failure', 'Hypoglycemia'],
    action: 'Emergency - seek immediate vet care' },
  { name: 'Macadamia Nuts', category: 'food', toxicity: 'toxic', icon: '🥜',
    description: 'Causes weakness and vomiting. Often combined with chocolate.',
    quantityNote: '1 nut per 2 lbs body weight causes symptoms. Less is still concerning',
    symptoms: ['Weakness', 'Vomiting', 'Tremors', 'Hyperthermia'],
    action: 'Contact vet - usually not fatal but needs monitoring' },
  { name: 'Avocado', category: 'food', toxicity: 'caution', icon: '🥑',
    description: 'Contains persin. The pit is also a choking hazard.',
    quantityNote: 'Small amount of flesh: usually fine. Pit or large amounts: concerning',
    symptoms: ['Vomiting', 'Diarrhea'],
    action: 'Monitor - small amounts usually okay' },
  { name: 'Alcohol', category: 'food', toxicity: 'toxic', icon: '🍺',
    description: 'Dogs are very sensitive to ethanol. Even small amounts are dangerous.',
    quantityNote: 'Any amount is dangerous. A few laps of beer can affect small dogs',
    symptoms: ['Vomiting', 'Disorientation', 'Difficulty breathing', 'Coma'],
    action: 'Seek emergency vet care' },
  { name: 'Caffeine', category: 'food', toxicity: 'toxic', icon: '☕',
    description: 'Found in coffee, tea, energy drinks. Similar effects to chocolate.',
    quantityNote: 'A lap or two: monitor. Coffee grounds or caffeine pills: emergency',
    symptoms: ['Restlessness', 'Rapid breathing', 'Heart palpitations'],
    action: 'Contact vet based on amount consumed' },
  { name: 'Raw Yeast Dough', category: 'food', toxicity: 'toxic', icon: '🍞',
    description: 'Expands in stomach and produces alcohol as it ferments.',
    quantityNote: 'Even a small ball of dough can expand significantly in the stomach',
    symptoms: ['Bloating', 'Disorientation', 'Vomiting'],
    action: 'Seek vet care - can cause dangerous bloat' },

  // Foods - Safe
  { name: 'Carrots', category: 'food', toxicity: 'safe', icon: '🥕',
    description: 'Excellent low-calorie snack. Good for teeth.',
    symptoms: [],
    action: 'Safe to feed in moderation' },
  { name: 'Blueberries', category: 'food', toxicity: 'safe', icon: '🫐',
    description: 'Rich in antioxidants and vitamins. Great training treat.',
    symptoms: [],
    action: 'Safe to feed in moderation' },
  { name: 'Watermelon', category: 'food', toxicity: 'safe', icon: '🍉',
    description: 'Hydrating and nutritious. Remove seeds and rind.',
    symptoms: [],
    action: 'Safe - remove seeds and rind first' },
  { name: 'Apples', category: 'food', toxicity: 'safe', icon: '🍎',
    description: 'Good source of vitamins. Remove core and seeds.',
    symptoms: [],
    action: 'Safe - remove core and seeds (contain cyanide)' },
  { name: 'Bananas', category: 'food', toxicity: 'safe', icon: '🍌',
    description: 'High in potassium. Good occasional treat.',
    symptoms: [],
    action: 'Safe in moderation - high in sugar' },
  { name: 'Peanut Butter', category: 'food', toxicity: 'caution', icon: '🥜',
    description: 'Safe if xylitol-free. Check ingredients carefully.',
    symptoms: [],
    action: 'Check label for xylitol - if none, safe in moderation' },
  { name: 'Cooked Chicken', category: 'food', toxicity: 'safe', icon: '🍗',
    description: 'Great protein source. Remove bones.',
    symptoms: [],
    action: 'Safe - ensure bones are removed' },
  { name: 'Rice', category: 'food', toxicity: 'safe', icon: '🍚',
    description: 'Easy to digest. Good for upset stomachs.',
    symptoms: [],
    action: 'Safe - plain cooked rice is gentle on stomach' },
  { name: 'Pumpkin', category: 'food', toxicity: 'safe', icon: '🎃',
    description: 'Great for digestion. Use plain, not pie filling.',
    symptoms: [],
    action: 'Safe - plain pumpkin aids digestion' },

  // Plants - Toxic
  { name: 'Lily', category: 'plant', toxicity: 'toxic', icon: '🌸',
    description: 'Many lily varieties are extremely toxic to pets.',
    symptoms: ['Vomiting', 'Lethargy', 'Kidney failure'],
    action: 'Emergency vet care needed' },
  { name: 'Tulip', category: 'plant', toxicity: 'toxic', icon: '🌷',
    description: 'Bulbs are most toxic. Can cause cardiac issues.',
    symptoms: ['Drooling', 'Vomiting', 'Diarrhea', 'Heart problems'],
    action: 'Contact vet if bulb was ingested' },
  { name: 'Azalea', category: 'plant', toxicity: 'toxic', icon: '🌺',
    description: 'All parts are toxic. Can affect heart rhythm.',
    symptoms: ['Vomiting', 'Diarrhea', 'Weakness', 'Cardiac failure'],
    action: 'Seek emergency vet care' },
  { name: 'Sago Palm', category: 'plant', toxicity: 'toxic', icon: '🌴',
    description: 'Extremely toxic. Seeds are most dangerous.',
    symptoms: ['Vomiting', 'Seizures', 'Liver failure'],
    action: 'Emergency - can be fatal even with treatment' },
  { name: 'Oleander', category: 'plant', toxicity: 'toxic', icon: '🌸',
    description: 'Highly toxic. All parts of plant are dangerous.',
    symptoms: ['Drooling', 'Abdominal pain', 'Heart abnormalities'],
    action: 'Seek emergency vet care immediately' },
  { name: 'Daffodil', category: 'plant', toxicity: 'toxic', icon: '🌼',
    description: 'Bulbs are most toxic part.',
    symptoms: ['Vomiting', 'Diarrhea', 'Convulsions'],
    action: 'Contact vet - especially if bulb ingested' },
  { name: 'Aloe Vera', category: 'plant', toxicity: 'caution', icon: '🌱',
    description: 'Can cause vomiting and diarrhea if ingested.',
    symptoms: ['Vomiting', 'Diarrhea', 'Lethargy'],
    action: 'Monitor - contact vet if symptoms persist' },
  { name: 'Pothos', category: 'plant', toxicity: 'caution', icon: '🌿',
    description: 'Causes oral irritation and swelling.',
    symptoms: ['Drooling', 'Mouth irritation', 'Difficulty swallowing'],
    action: 'Usually mild - monitor for breathing difficulty' },
  { name: 'Spider Plant', category: 'plant', toxicity: 'safe', icon: '🌿',
    description: 'Non-toxic to dogs. Safe houseplant choice.',
    symptoms: [],
    action: 'Safe plant to have around dogs' },
  { name: 'Boston Fern', category: 'plant', toxicity: 'safe', icon: '🌿',
    description: 'Non-toxic and safe for homes with pets.',
    symptoms: [],
    action: 'Safe plant for pet households' },
]

const TOXICITY_CONFIG = {
  toxic: {
    color: 'red',
    icon: XCircle,
    label: 'Toxic',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    iconColor: 'text-red-500',
  },
  caution: {
    color: 'yellow',
    icon: AlertCircle,
    label: 'Use Caution',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    iconColor: 'text-yellow-500',
  },
  safe: {
    color: 'green',
    icon: CheckCircle,
    label: 'Safe',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    iconColor: 'text-green-500',
  },
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'food', label: 'Foods', icon: Apple },
  { id: 'plant', label: 'Plants', icon: Leaf },
]

function ToxicChecker() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const { completeStep, progress } = useOnboarding()

  // Handle item selection and mark onboarding step complete
  const handleSelectItem = (item) => {
    setSelectedItem(item)
    if (!progress.checkedFood) {
      completeStep('checkedFood')
    }
  }

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return TOXIC_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  // Group items by toxicity for display
  const groupedItems = useMemo(() => {
    const groups = { toxic: [], caution: [], safe: [] }
    filteredItems.forEach(item => {
      groups[item.toxicity].push(item)
    })
    return groups
  }, [filteredItems])

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
            <PawsyMascot mood="listening" size={36} />
            <div>
              <h1
                className="text-lg font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Is This Toxic?
              </h1>
              <p className="text-xs text-[#6B6B6B]">Food & plant safety checker</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search foods or plants..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261]/40 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#E8E8E8]"
            >
              <X className="w-4 h-4 text-[#9E9E9E]" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mb-6">
          {CATEGORY_FILTERS.map(filter => {
            const Icon = filter.icon
            const isActive = selectedCategory === filter.id
            return (
              <motion.button
                key={filter.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white shadow-md'
                    : 'bg-white text-[#6B6B6B] border border-[#E8E8E8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </motion.button>
            )
          })}
        </div>

        {/* Results */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#E8E8E8]/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#9E9E9E]" />
            </div>
            <p className="text-[#6B6B6B]">No items found</p>
            <p className="text-sm text-[#9E9E9E] mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Toxic items */}
            {groupedItems.toxic.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-red-700">Toxic ({groupedItems.toxic.length})</h3>
                </div>
                <div className="space-y-2">
                  {groupedItems.toxic.map(item => (
                    <ItemCard key={item.name} item={item} onClick={() => handleSelectItem(item)} />
                  ))}
                </div>
              </div>
            )}

            {/* Caution items */}
            {groupedItems.caution.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-sm font-semibold text-yellow-700">Use Caution ({groupedItems.caution.length})</h3>
                </div>
                <div className="space-y-2">
                  {groupedItems.caution.map(item => (
                    <ItemCard key={item.name} item={item} onClick={() => handleSelectItem(item)} />
                  ))}
                </div>
              </div>
            )}

            {/* Safe items */}
            {groupedItems.safe.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm font-semibold text-green-700">Safe ({groupedItems.safe.length})</h3>
                </div>
                <div className="space-y-2">
                  {groupedItems.safe.map(item => (
                    <ItemCard key={item.name} item={item} onClick={() => handleSelectItem(item)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-[#9E9E9E] text-center mt-8">
          This list is not exhaustive. When in doubt, always consult your vet.
        </p>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

function ItemCard({ item, onClick }) {
  const config = TOXICITY_CONFIG[item.toxicity]
  const Icon = config.icon

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl ${config.bg} ${config.border} border transition-all`}
    >
      <span className="text-2xl">{item.icon}</span>
      <div className="flex-1 text-left">
        <h4 className={`font-semibold text-sm ${config.text}`}>{item.name}</h4>
        <p className="text-xs text-[#6B6B6B] line-clamp-1">{item.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <ChevronRight className="w-4 h-4 text-[#9E9E9E]" />
      </div>
    </motion.button>
  )
}

function ItemDetailModal({ item, onClose }) {
  const config = TOXICITY_CONFIG[item.toxicity]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className={`${config.bg} p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{item.icon}</span>
              <div>
                <h2
                  className={`text-xl font-bold ${config.text}`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {item.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                  <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-5 h-5 text-[#6B6B6B]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-[#3D3D3D] mb-2">About</h3>
            <p className="text-sm text-[#6B6B6B]">{item.description}</p>
          </div>

          {item.quantityNote && (
            <div className="bg-[#FFF5ED] border border-[#F4A261]/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#E8924F] mb-1 flex items-center gap-2">
                <span className="text-base">📏</span>
                Amount Matters
              </h3>
              <p className="text-sm text-[#6B6B6B]">{item.quantityNote}</p>
            </div>
          )}

          {item.symptoms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#3D3D3D] mb-2">Symptoms to Watch For</h3>
              <div className="flex flex-wrap gap-2">
                {item.symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-[#FDF8F3] rounded-full text-xs text-[#6B6B6B]"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={`p-4 rounded-xl ${config.bg} ${config.border} border`}>
            <h3 className={`text-sm font-semibold ${config.text} mb-1`}>What To Do</h3>
            <p className="text-sm text-[#6B6B6B]">{item.action}</p>
          </div>

          {item.toxicity === 'toxic' && (
            <Link to="/emergency-vet" onClick={onClose}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#EF5350] to-[#E53935] text-white font-bold rounded-xl shadow-lg"
              >
                <MapPin className="w-5 h-5" />
                Find Emergency Vet
              </motion.button>
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ToxicChecker
