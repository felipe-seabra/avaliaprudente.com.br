import { OnboardingClient } from './onboarding-client'

export const metadata = {
  title: 'Onboarding de Negócio | Avalia Prudente',
  description: 'Complete o cadastro da sua empresa para começar.',
  robots: { index: false, follow: false },
}

export default function OnboardingPage() {
  return <OnboardingClient />
}
