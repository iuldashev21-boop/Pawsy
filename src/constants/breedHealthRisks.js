/**
 * Breed-specific health risk data.
 *
 * Each breed maps to an array of conditions with:
 *   - name: condition name
 *   - ageRangeYears: { min, max } typical onset window
 *   - severity: 'low' | 'moderate' | 'high'
 *   - description: short plain-language explanation
 */

export const BREED_HEALTH_RISKS = {
  'Labrador Retriever': [
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'high',
      description: 'Abnormal hip joint development causing pain and mobility issues.',
    },
    {
      name: 'Elbow Dysplasia',
      ageRangeYears: { min: 1, max: 4 },
      severity: 'moderate',
      description: 'Abnormal elbow joint development leading to lameness.',
    },
    {
      name: 'Obesity',
      ageRangeYears: { min: 2, max: 14 },
      severity: 'moderate',
      description: 'Prone to weight gain which stresses joints and organs.',
    },
    {
      name: 'Progressive Retinal Atrophy',
      ageRangeYears: { min: 3, max: 9 },
      severity: 'moderate',
      description: 'Gradual vision loss from retinal degeneration.',
    },
  ],

  'Golden Retriever': [
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'high',
      description: 'Abnormal hip joint development causing pain and mobility issues.',
    },
    {
      name: 'Cancer',
      ageRangeYears: { min: 6, max: 14 },
      severity: 'high',
      description: 'High predisposition to hemangiosarcoma and lymphoma.',
    },
    {
      name: 'Skin Allergies',
      ageRangeYears: { min: 1, max: 10 },
      severity: 'moderate',
      description: 'Atopic dermatitis and environmental allergies causing itching.',
    },
    {
      name: 'Heart Disease',
      ageRangeYears: { min: 5, max: 12 },
      severity: 'high',
      description: 'Subvalvular aortic stenosis and other cardiac conditions.',
    },
  ],

  'German Shepherd': [
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 7 },
      severity: 'high',
      description: 'Abnormal hip joint development, very common in the breed.',
    },
    {
      name: 'Degenerative Myelopathy',
      ageRangeYears: { min: 7, max: 14 },
      severity: 'high',
      description: 'Progressive spinal cord disease causing hind limb weakness.',
    },
    {
      name: 'Bloat (GDV)',
      ageRangeYears: { min: 2, max: 12 },
      severity: 'high',
      description: 'Life-threatening stomach dilation and torsion.',
    },
    {
      name: 'Exocrine Pancreatic Insufficiency',
      ageRangeYears: { min: 1, max: 5 },
      severity: 'moderate',
      description: 'Inability to properly digest food due to pancreatic enzyme deficiency.',
    },
  ],

  'French Bulldog': [
    {
      name: 'Brachycephalic Obstructive Airway Syndrome',
      ageRangeYears: { min: 0, max: 14 },
      severity: 'high',
      description: 'Breathing difficulties due to shortened skull structure.',
    },
    {
      name: 'Intervertebral Disc Disease',
      ageRangeYears: { min: 3, max: 10 },
      severity: 'high',
      description: 'Spinal disc herniation causing pain and possible paralysis.',
    },
    {
      name: 'Skin Fold Dermatitis',
      ageRangeYears: { min: 0, max: 14 },
      severity: 'moderate',
      description: 'Skin infections in facial and body folds.',
    },
    {
      name: 'Heat Sensitivity',
      ageRangeYears: { min: 0, max: 14 },
      severity: 'moderate',
      description: 'High risk of overheating due to compromised airways.',
    },
  ],

  'Poodle': [
    {
      name: 'Addison\'s Disease',
      ageRangeYears: { min: 2, max: 9 },
      severity: 'high',
      description: 'Adrenal gland insufficiency causing lethargy and vomiting.',
    },
    {
      name: 'Epilepsy',
      ageRangeYears: { min: 1, max: 5 },
      severity: 'moderate',
      description: 'Idiopathic seizures requiring long-term management.',
    },
    {
      name: 'Progressive Retinal Atrophy',
      ageRangeYears: { min: 3, max: 8 },
      severity: 'moderate',
      description: 'Gradual vision loss from retinal degeneration.',
    },
    {
      name: 'Bloat (GDV)',
      ageRangeYears: { min: 4, max: 12 },
      severity: 'high',
      description: 'Life-threatening stomach dilation, especially in Standard Poodles.',
    },
  ],

  'Beagle': [
    {
      name: 'Epilepsy',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'moderate',
      description: 'Breed-predisposed idiopathic seizures.',
    },
    {
      name: 'Hypothyroidism',
      ageRangeYears: { min: 4, max: 10 },
      severity: 'low',
      description: 'Underactive thyroid causing weight gain and lethargy.',
    },
    {
      name: 'Intervertebral Disc Disease',
      ageRangeYears: { min: 3, max: 8 },
      severity: 'moderate',
      description: 'Spinal disc issues due to body proportions.',
    },
    {
      name: 'Cherry Eye',
      ageRangeYears: { min: 0, max: 3 },
      severity: 'low',
      description: 'Prolapse of the third eyelid gland.',
    },
  ],

  'Bulldog': [
    {
      name: 'Brachycephalic Obstructive Airway Syndrome',
      ageRangeYears: { min: 0, max: 12 },
      severity: 'high',
      description: 'Severe breathing difficulties due to flat face structure.',
    },
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 8 },
      severity: 'high',
      description: 'Very high incidence of hip joint malformation.',
    },
    {
      name: 'Skin Fold Dermatitis',
      ageRangeYears: { min: 0, max: 12 },
      severity: 'moderate',
      description: 'Chronic skin infections in deep facial and body folds.',
    },
    {
      name: 'Cherry Eye',
      ageRangeYears: { min: 0, max: 3 },
      severity: 'low',
      description: 'Prolapse of the third eyelid gland.',
    },
  ],

  'Rottweiler': [
    {
      name: 'Osteosarcoma',
      ageRangeYears: { min: 5, max: 10 },
      severity: 'high',
      description: 'Aggressive bone cancer with high breed predisposition.',
    },
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'high',
      description: 'Common joint malformation in large breeds.',
    },
    {
      name: 'Aortic Stenosis',
      ageRangeYears: { min: 0, max: 4 },
      severity: 'high',
      description: 'Narrowing of the aortic valve causing heart strain.',
    },
    {
      name: 'Cruciate Ligament Rupture',
      ageRangeYears: { min: 2, max: 8 },
      severity: 'moderate',
      description: 'Knee ligament tear common in heavy breeds.',
    },
  ],

  'Dachshund': [
    {
      name: 'Intervertebral Disc Disease',
      ageRangeYears: { min: 3, max: 8 },
      severity: 'high',
      description: 'Very high risk of spinal disc herniation due to long body.',
    },
    {
      name: 'Obesity',
      ageRangeYears: { min: 2, max: 14 },
      severity: 'moderate',
      description: 'Weight gain worsens back problems significantly.',
    },
    {
      name: 'Patellar Luxation',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'moderate',
      description: 'Kneecap dislocation causing intermittent lameness.',
    },
    {
      name: 'Progressive Retinal Atrophy',
      ageRangeYears: { min: 4, max: 10 },
      severity: 'moderate',
      description: 'Gradual vision loss from retinal degeneration.',
    },
  ],

  'Siberian Husky': [
    {
      name: 'Cataracts',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'moderate',
      description: 'Hereditary juvenile cataracts common in the breed.',
    },
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 7 },
      severity: 'moderate',
      description: 'Hip joint malformation, moderate incidence.',
    },
    {
      name: 'Hypothyroidism',
      ageRangeYears: { min: 3, max: 8 },
      severity: 'low',
      description: 'Underactive thyroid causing coat and energy changes.',
    },
    {
      name: 'Corneal Dystrophy',
      ageRangeYears: { min: 2, max: 6 },
      severity: 'low',
      description: 'Abnormal corneal deposits affecting vision.',
    },
  ],

  'Boxer': [
    {
      name: 'Cancer',
      ageRangeYears: { min: 5, max: 12 },
      severity: 'high',
      description: 'High rates of mast cell tumors and lymphoma.',
    },
    {
      name: 'Aortic Stenosis',
      ageRangeYears: { min: 0, max: 5 },
      severity: 'high',
      description: 'Congenital heart defect narrowing the aortic valve.',
    },
    {
      name: 'Boxer Cardiomyopathy',
      ageRangeYears: { min: 2, max: 10 },
      severity: 'high',
      description: 'Breed-specific arrhythmogenic right ventricular cardiomyopathy.',
    },
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'moderate',
      description: 'Moderate incidence of hip joint malformation.',
    },
  ],

  'Great Dane': [
    {
      name: 'Bloat (GDV)',
      ageRangeYears: { min: 1, max: 10 },
      severity: 'high',
      description: 'Highest risk breed for life-threatening stomach torsion.',
    },
    {
      name: 'Dilated Cardiomyopathy',
      ageRangeYears: { min: 3, max: 8 },
      severity: 'high',
      description: 'Enlarged heart leading to heart failure.',
    },
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 5 },
      severity: 'high',
      description: 'Joint malformation aggravated by giant size.',
    },
    {
      name: 'Osteosarcoma',
      ageRangeYears: { min: 5, max: 10 },
      severity: 'high',
      description: 'Aggressive bone cancer common in giant breeds.',
    },
  ],

  'Doberman Pinscher': [
    {
      name: 'Dilated Cardiomyopathy',
      ageRangeYears: { min: 3, max: 10 },
      severity: 'high',
      description: 'Very high breed predisposition to enlarged heart.',
    },
    {
      name: 'Von Willebrand\'s Disease',
      ageRangeYears: { min: 0, max: 14 },
      severity: 'moderate',
      description: 'Inherited bleeding disorder affecting clotting.',
    },
    {
      name: 'Wobbler Syndrome',
      ageRangeYears: { min: 3, max: 9 },
      severity: 'high',
      description: 'Cervical vertebral instability causing gait abnormalities.',
    },
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'moderate',
      description: 'Moderate incidence of hip joint malformation.',
    },
  ],

  'Bernese Mountain Dog': [
    {
      name: 'Histiocytic Sarcoma',
      ageRangeYears: { min: 4, max: 10 },
      severity: 'high',
      description: 'Aggressive cancer with very high breed predisposition.',
    },
    {
      name: 'Hip Dysplasia',
      ageRangeYears: { min: 1, max: 5 },
      severity: 'high',
      description: 'Joint malformation common in large breeds.',
    },
    {
      name: 'Elbow Dysplasia',
      ageRangeYears: { min: 1, max: 4 },
      severity: 'moderate',
      description: 'Abnormal elbow joint development causing lameness.',
    },
    {
      name: 'Bloat (GDV)',
      ageRangeYears: { min: 2, max: 10 },
      severity: 'high',
      description: 'Large deep-chested breed at elevated risk.',
    },
  ],

  'Cavalier King Charles Spaniel': [
    {
      name: 'Mitral Valve Disease',
      ageRangeYears: { min: 1, max: 10 },
      severity: 'high',
      description: 'Nearly universal heart valve degeneration in the breed.',
    },
    {
      name: 'Syringomyelia',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'high',
      description: 'Fluid-filled cavities in spinal cord from skull malformation.',
    },
    {
      name: 'Patellar Luxation',
      ageRangeYears: { min: 1, max: 6 },
      severity: 'moderate',
      description: 'Kneecap dislocation causing intermittent lameness.',
    },
    {
      name: 'Keratoconjunctivitis Sicca',
      ageRangeYears: { min: 2, max: 8 },
      severity: 'low',
      description: 'Dry eye syndrome requiring ongoing treatment.',
    },
  ],
}

/**
 * Look up breed-specific health risks.
 * Returns an empty array for unrecognized breeds.
 */
export function getBreedRisks(breedName) {
  if (!breedName || typeof breedName !== 'string') return []
  return BREED_HEALTH_RISKS[breedName] || []
}
