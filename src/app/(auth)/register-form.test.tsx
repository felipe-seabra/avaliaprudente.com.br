import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RegisterForm } from './register-form'

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
      signUp: vi.fn(),
    },
  }),
}))

describe('RegisterForm', () => {
  it('renders correctly', () => {
    render(<RegisterForm />)
    
    expect(screen.getAllByText(/Criar conta/i)[0]).toBeInTheDocument()
    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cadastrar/i })).toBeInTheDocument()
  })
})
