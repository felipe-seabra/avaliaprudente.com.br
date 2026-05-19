import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './login-form'

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  }),
}))

describe('LoginForm', () => {
  it('renders correctly', () => {
    render(<LoginForm />)
    
    expect(screen.getAllByText('Entrar')[0]).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
