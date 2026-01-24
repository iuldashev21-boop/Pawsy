import { useOnboarding } from '../../context/OnboardingContext'
import { SuccessToast } from './SuccessCelebration'

function CelebrationToast() {
  const { celebration, clearCelebration } = useOnboarding()

  return (
    <SuccessToast
      show={celebration.show}
      message={celebration.message}
      onClose={clearCelebration}
    />
  )
}

export default CelebrationToast
