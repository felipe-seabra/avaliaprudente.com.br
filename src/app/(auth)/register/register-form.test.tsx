import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RegisterForm } from './register-form'

// Mock the useRouter and useSearchParams hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
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
    expect(screen.getByLabelText('Confirmar Senha')).toBeInTheDocument()
    
    // We have both "Cadastrar" (submit) and "Cadastrar com Google"
    const submitButton = screen.getByRole('button', { name: /^Cadastrar$/i })
    expect(submitButton).toBeInTheDocument()
    expect(screen.getByText(/Cadastrar com Google/i)).toBeInTheDocument()
  })
})
