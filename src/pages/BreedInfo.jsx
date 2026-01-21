import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  Search,
  Heart,
  Scale,
  Clock,
  AlertTriangle,
  ChevronRight,
  X,
  Activity,
  Thermometer,
  Eye,
  Bone
} from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'

// Breed database with health information
const BREED_DATA = [
  {
    id: 'labrador',
    name: 'Labrador Retriever',
    group: 'Sporting',
    size: 'Large',
    weight: '55-80 lbs',
    lifespan: '10-12 years',
    energy: 'High',
    image: '🦮',
    description: 'Friendly, active, and outgoing. America\'s most popular breed.',
    healthRisks: [
      { condition: 'Hip Dysplasia', severity: 'common', description: 'Joint condition causing lameness and arthritis' },
      { condition: 'Elbow Dysplasia', severity: 'common', description: 'Developmental abnormality of the elbow joint' },
      { condition: 'Obesity', severity: 'common', description: 'Labs love food - weight management is crucial' },
      { condition: 'Progressive Retinal Atrophy', severity: 'moderate', description: 'Degenerative eye disease leading to blindness' },
      { condition: 'Exercise-Induced Collapse', severity: 'moderate', description: 'Genetic condition causing collapse after exercise' },
    ],
    careNotes: 'Needs daily exercise and mental stimulation. Watch food intake closely. Regular joint supplements may help.',
  },
  {
    id: 'german-shepherd',
    name: 'German Shepherd',
    group: 'Herding',
    size: 'Large',
    weight: '50-90 lbs',
    lifespan: '9-13 years',
    energy: 'High',
    image: '🐕‍🦺',
    description: 'Intelligent, loyal, and versatile working dog.',
    healthRisks: [
      { condition: 'Hip Dysplasia', severity: 'common', description: 'Very common in the breed - affects mobility' },
      { condition: 'Degenerative Myelopathy', severity: 'moderate', description: 'Progressive spinal cord disease' },
      { condition: 'Bloat (GDV)', severity: 'serious', description: 'Life-threatening stomach condition' },
      { condition: 'Elbow Dysplasia', severity: 'common', description: 'Joint malformation causing lameness' },
      { condition: 'Allergies', severity: 'moderate', description: 'Skin and food allergies are common' },
    ],
    careNotes: 'Avoid exercise right after meals to reduce bloat risk. Regular hip/elbow screening recommended.',
  },
  {
    id: 'golden-retriever',
    name: 'Golden Retriever',
    group: 'Sporting',
    size: 'Large',
    weight: '55-75 lbs',
    lifespan: '10-12 years',
    energy: 'High',
    image: '🐕',
    description: 'Gentle, intelligent, and devoted family companion.',
    healthRisks: [
      { condition: 'Cancer', severity: 'serious', description: 'Higher cancer rates than most breeds' },
      { condition: 'Hip Dysplasia', severity: 'common', description: 'Joint condition common in large breeds' },
      { condition: 'Heart Disease', severity: 'moderate', description: 'Subvalvular aortic stenosis can occur' },
      { condition: 'Skin Conditions', severity: 'common', description: 'Hot spots and allergies are frequent' },
      { condition: 'Cataracts', severity: 'moderate', description: 'Eye condition that can cause vision loss' },
    ],
    careNotes: 'Regular vet checkups important for early cancer detection. Keep coat clean and dry to prevent hot spots.',
  },
  {
    id: 'french-bulldog',
    name: 'French Bulldog',
    group: 'Non-Sporting',
    size: 'Small',
    weight: '16-28 lbs',
    lifespan: '10-12 years',
    energy: 'Low-Medium',
    image: '🐶',
    description: 'Playful, adaptable, and charming companion dog.',
    healthRisks: [
      { condition: 'Brachycephalic Syndrome', severity: 'serious', description: 'Breathing difficulties due to flat face' },
      { condition: 'Spinal Issues', severity: 'common', description: 'IVDD and other back problems' },
      { condition: 'Allergies', severity: 'common', description: 'Food and environmental allergies' },
      { condition: 'Heat Sensitivity', severity: 'serious', description: 'Cannot regulate temperature well - heat stroke risk' },
      { condition: 'Eye Problems', severity: 'moderate', description: 'Cherry eye and corneal ulcers' },
    ],
    careNotes: 'Never exercise in heat. Keep in air conditioning. Watch for labored breathing. Avoid stairs and jumping.',
  },
  {
    id: 'bulldog',
    name: 'Bulldog (English)',
    group: 'Non-Sporting',
    size: 'Medium',
    weight: '40-50 lbs',
    lifespan: '8-10 years',
    energy: 'Low',
    image: '🐕',
    description: 'Calm, courageous, and friendly. Iconic wrinkled face.',
    healthRisks: [
      { condition: 'Brachycephalic Syndrome', severity: 'serious', description: 'Severe breathing issues common' },
      { condition: 'Hip Dysplasia', severity: 'common', description: 'Joint problems despite smaller size' },
      { condition: 'Skin Fold Infections', severity: 'common', description: 'Wrinkles need daily cleaning' },
      { condition: 'Heart Disease', severity: 'moderate', description: 'Pulmonic stenosis risk' },
      { condition: 'Heat Stroke', severity: 'serious', description: 'Very heat intolerant' },
    ],
    careNotes: 'Clean skin folds daily. Strict heat avoidance. May need surgery for breathing. No strenuous exercise.',
  },
  {
    id: 'poodle',
    name: 'Poodle (Standard)',
    group: 'Non-Sporting',
    size: 'Medium-Large',
    weight: '40-70 lbs',
    lifespan: '12-15 years',
    energy: 'High',
    image: '🐩',
    description: 'Highly intelligent, athletic, and hypoallergenic.',
    healthRisks: [
      { condition: 'Hip Dysplasia', severity: 'moderate', description: 'Less common than other large breeds' },
      { condition: 'Bloat (GDV)', severity: 'serious', description: 'Deep-chested breeds are at risk' },
      { condition: 'Addison\'s Disease', severity: 'moderate', description: 'Adrenal gland insufficiency' },
      { condition: 'Progressive Retinal Atrophy', severity: 'moderate', description: 'Can lead to blindness' },
      { condition: 'Epilepsy', severity: 'moderate', description: 'Seizure disorder in some lines' },
    ],
    careNotes: 'Regular grooming essential. Feed multiple small meals to reduce bloat risk. Mentally stimulating activities important.',
  },
  {
    id: 'beagle',
    name: 'Beagle',
    group: 'Hound',
    size: 'Small-Medium',
    weight: '20-30 lbs',
    lifespan: '12-15 years',
    energy: 'High',
    image: '🐕',
    description: 'Merry, curious, and friendly scent hound.',
    healthRisks: [
      { condition: 'Obesity', severity: 'common', description: 'Food-driven breed prone to weight gain' },
      { condition: 'Epilepsy', severity: 'moderate', description: 'More common than in many breeds' },
      { condition: 'Hypothyroidism', severity: 'moderate', description: 'Thyroid gland underactivity' },
      { condition: 'Intervertebral Disc Disease', severity: 'moderate', description: 'Back problems, especially if overweight' },
      { condition: 'Cherry Eye', severity: 'common', description: 'Third eyelid gland prolapse' },
    ],
    careNotes: 'Strict portion control essential. Keep secure - they follow their nose. Regular exercise prevents obesity.',
  },
  {
    id: 'rottweiler',
    name: 'Rottweiler',
    group: 'Working',
    size: 'Large',
    weight: '80-135 lbs',
    lifespan: '8-10 years',
    energy: 'Medium-High',
    image: '🐕‍🦺',
    description: 'Confident, loyal, and protective guardian breed.',
    healthRisks: [
      { condition: 'Hip Dysplasia', severity: 'common', description: 'Very common - screening recommended' },
      { condition: 'Elbow Dysplasia', severity: 'common', description: 'Joint malformation issues' },
      { condition: 'Osteosarcoma', severity: 'serious', description: 'Bone cancer - higher incidence than average' },
      { condition: 'Heart Disease', severity: 'moderate', description: 'Subaortic stenosis risk' },
      { condition: 'Bloat (GDV)', severity: 'serious', description: 'Large, deep-chested breeds at risk' },
    ],
    careNotes: 'Early health screening important. Avoid rapid growth in puppies. Multiple small meals reduce bloat risk.',
  },
  {
    id: 'yorkshire-terrier',
    name: 'Yorkshire Terrier',
    group: 'Toy',
    size: 'Toy',
    weight: '4-7 lbs',
    lifespan: '12-15 years',
    energy: 'Medium',
    image: '🐕',
    description: 'Feisty, affectionate, and sprightly toy breed.',
    healthRisks: [
      { condition: 'Luxating Patella', severity: 'common', description: 'Kneecap dislocation common in toy breeds' },
      { condition: 'Portosystemic Shunt', severity: 'serious', description: 'Liver blood vessel abnormality' },
      { condition: 'Tracheal Collapse', severity: 'moderate', description: 'Windpipe weakness causing coughing' },
      { condition: 'Dental Disease', severity: 'common', description: 'Small mouths prone to dental issues' },
      { condition: 'Hypoglycemia', severity: 'moderate', description: 'Low blood sugar, especially in puppies' },
    ],
    careNotes: 'Use harness instead of collar. Regular dental care essential. Feed frequent small meals to prevent low blood sugar.',
  },
  {
    id: 'dachshund',
    name: 'Dachshund',
    group: 'Hound',
    size: 'Small',
    weight: '11-32 lbs',
    lifespan: '12-16 years',
    energy: 'Medium',
    image: '🐕',
    description: 'Clever, lively, and courageous with iconic long body.',
    healthRisks: [
      { condition: 'Intervertebral Disc Disease', severity: 'serious', description: 'Very high risk due to long back' },
      { condition: 'Obesity', severity: 'common', description: 'Extra weight stresses the spine' },
      { condition: 'Dental Disease', severity: 'common', description: 'Prone to tooth and gum problems' },
      { condition: 'Epilepsy', severity: 'moderate', description: 'Seizures occur in some lines' },
      { condition: 'Eye Problems', severity: 'moderate', description: 'PRA and cataracts can occur' },
    ],
    careNotes: 'Prevent jumping on/off furniture. Use ramps. Keep weight strictly controlled. Support back when carrying.',
  },
  {
    id: 'boxer',
    name: 'Boxer',
    group: 'Working',
    size: 'Medium-Large',
    weight: '50-80 lbs',
    lifespan: '10-12 years',
    energy: 'High',
    image: '🐕',
    description: 'Fun-loving, bright, and active family companion.',
    healthRisks: [
      { condition: 'Cancer', severity: 'serious', description: 'Higher rates of various cancers' },
      { condition: 'Heart Disease', severity: 'serious', description: 'Boxer cardiomyopathy and aortic stenosis' },
      { condition: 'Hip Dysplasia', severity: 'moderate', description: 'Joint issues in some lines' },
      { condition: 'Bloat (GDV)', severity: 'serious', description: 'Deep chest puts them at risk' },
      { condition: 'Allergies', severity: 'common', description: 'Skin and food allergies frequent' },
    ],
    careNotes: 'Regular cardiac screening recommended. Avoid extreme temperatures. Multiple small meals to reduce bloat risk.',
  },
  {
    id: 'shih-tzu',
    name: 'Shih Tzu',
    group: 'Toy',
    size: 'Small',
    weight: '9-16 lbs',
    lifespan: '10-16 years',
    energy: 'Low-Medium',
    image: '🐶',
    description: 'Affectionate, playful, and outgoing companion.',
    healthRisks: [
      { condition: 'Brachycephalic Syndrome', severity: 'moderate', description: 'Breathing issues due to flat face' },
      { condition: 'Eye Problems', severity: 'common', description: 'Prominent eyes prone to injury and dry eye' },
      { condition: 'Dental Disease', severity: 'common', description: 'Small mouth causes crowding' },
      { condition: 'Hip Dysplasia', severity: 'moderate', description: 'Surprisingly common for size' },
      { condition: 'Ear Infections', severity: 'common', description: 'Floppy ears trap moisture' },
    ],
    careNotes: 'Keep face hair trimmed. Clean eye area daily. Regular dental care. Keep ears clean and dry.',
  },
]

const SEVERITY_CONFIG = {
  common: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Common' },
  moderate: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Moderate Risk' },
  serious: { color: 'text-red-600', bg: 'bg-red-100', label: 'Serious' },
}

const SIZE_FILTERS = [
  { id: 'all', label: 'All Sizes' },
  { id: 'Toy', label: 'Toy' },
  { id: 'Small', label: 'Small' },
  { id: 'Medium', label: 'Medium' },
  { id: 'Large', label: 'Large' },
]

function BreedInfo() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [selectedBreed, setSelectedBreed] = useState(null)

  // Filter breeds
  const filteredBreeds = useMemo(() => {
    return BREED_DATA.filter(breed => {
      const matchesSearch = breed.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSize = sizeFilter === 'all' || breed.size.includes(sizeFilter)
      return matchesSearch && matchesSize
    })
  }, [searchQuery, sizeFilter])

  // Detail modal
  if (selectedBreed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBreed(null)}
              className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
            </motion.button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedBreed.image}</span>
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {selectedBreed.name}
                </h1>
                <p className="text-xs text-[#6B6B6B]">{selectedBreed.group} Group</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6">
          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-2 mb-6"
          >
            <div className="bg-white rounded-xl p-3 text-center border border-[#E8E8E8]/50">
              <Scale className="w-4 h-4 text-[#F4A261] mx-auto mb-1" />
              <p className="text-xs text-[#6B6B6B]">Weight</p>
              <p className="text-xs font-semibold text-[#3D3D3D]">{selectedBreed.weight}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-[#E8E8E8]/50">
              <Clock className="w-4 h-4 text-[#F4A261] mx-auto mb-1" />
              <p className="text-xs text-[#6B6B6B]">Lifespan</p>
              <p className="text-xs font-semibold text-[#3D3D3D]">{selectedBreed.lifespan}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-[#E8E8E8]/50">
              <Activity className="w-4 h-4 text-[#F4A261] mx-auto mb-1" />
              <p className="text-xs text-[#6B6B6B]">Energy</p>
              <p className="text-xs font-semibold text-[#3D3D3D]">{selectedBreed.energy}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-[#E8E8E8]/50">
              <Bone className="w-4 h-4 text-[#F4A261] mx-auto mb-1" />
              <p className="text-xs text-[#6B6B6B]">Size</p>
              <p className="text-xs font-semibold text-[#3D3D3D]">{selectedBreed.size}</p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-[#E8E8E8]/50 mb-4"
          >
            <p className="text-sm text-[#6B6B6B]">{selectedBreed.description}</p>
          </motion.div>

          {/* Health Risks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-[#E8E8E8]/50 mb-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#F4A261]" />
              <h3
                className="font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Common Health Concerns
              </h3>
            </div>
            <div className="space-y-3">
              {selectedBreed.healthRisks.map((risk, idx) => {
                const config = SEVERITY_CONFIG[risk.severity]
                return (
                  <div key={idx} className="border-b border-[#E8E8E8]/50 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-[#3D3D3D]">{risk.condition}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B]">{risk.description}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Care Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#7EC8C8]/10 to-[#5FB3B3]/10 rounded-xl p-4 border border-[#7EC8C8]/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-[#7EC8C8]" />
              <h3
                className="font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Care Notes
              </h3>
            </div>
            <p className="text-sm text-[#6B6B6B]">{selectedBreed.careNotes}</p>
          </motion.div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Link to="/chat">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-lg"
              >
                Ask Pawsy About {selectedBreed.name}s
              </motion.button>
            </Link>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBreed(null)}
              className="w-full py-3 text-[#6B6B6B] font-semibold rounded-xl border-2 border-[#E8E8E8]"
            >
              Back to Breed List
            </motion.button>
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  // List view
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
            <PawsyMascot mood="happy" size={36} />
            <div>
              <h1
                className="text-lg font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Breed Health Info
              </h1>
              <p className="text-xs text-[#6B6B6B]">Learn about breed-specific health</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search breeds..."
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

        {/* Size filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {SIZE_FILTERS.map(filter => (
            <motion.button
              key={filter.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSizeFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                sizeFilter === filter.id
                  ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white shadow-md'
                  : 'bg-white text-[#6B6B6B] border border-[#E8E8E8]'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        {/* Breed list */}
        {filteredBreeds.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#E8E8E8]/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#9E9E9E]" />
            </div>
            <p className="text-[#6B6B6B]">No breeds found</p>
            <p className="text-sm text-[#9E9E9E] mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBreeds.map((breed, index) => (
              <motion.button
                key={breed.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedBreed(breed)}
                className="w-full bg-white rounded-xl p-4 border border-[#E8E8E8]/50 shadow-sm flex items-center gap-4"
              >
                <span className="text-3xl">{breed.image}</span>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-[#3D3D3D]">{breed.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#6B6B6B]">{breed.size}</span>
                    <span className="text-[#E8E8E8]">•</span>
                    <span className="text-xs text-[#6B6B6B]">{breed.lifespan}</span>
                    <span className="text-[#E8E8E8]">•</span>
                    <span className="text-xs text-[#9E9E9E]">{breed.healthRisks.length} health concerns</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
              </motion.button>
            ))}
          </div>
        )}

        {/* Note */}
        <p className="text-xs text-[#9E9E9E] text-center mt-8">
          Health information is for reference. Individual dogs may vary. Consult your vet for personalized advice.
        </p>
      </main>

      <BottomNav />
    </div>
  )
}

export default BreedInfo
