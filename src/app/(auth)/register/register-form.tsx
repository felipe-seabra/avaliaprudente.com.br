'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { InputField } from '@/components/shared/input-field'
import { parseError, logError } from '@/lib/error-handler'
import { APP_CONFIG } from '@/lib/constants'
import { Checkbox } from '@/components/ui/checkbox'
import { SocialAuth } from '@/components/shared/social-auth'

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const isBusinessMode = mode === 'business'
  
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${APP_CONFIG.url}/auth/callback${isBusinessMode ? '?next=/onboarding' : ''}`,
          data: {
            full_name: data.fullName,
            terms_accepted_at: new Date().toISOString(),
            terms_version: APP_CONFIG.currentTermsVersion,
          },
        },
      })

      if (error) {
        logError(error, 'Registration')
        const normalized = parseError(error)
        toast.error(normalized.message)
        return
      }

      toast.success('Cadastro realizado!', {
        description: 'Verifique seu e-mail para confirmar a conta.',
      })
      router.push('/login')
    } catch (err) {
      logError(err, 'Registration unexpected')
      toast.error('Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-muted/50 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="space-y-1 pb-8 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isBusinessMode ? 'Começar como Empresa' : 'Criar conta'}
        </CardTitle>
        <CardDescription>
          {isBusinessMode 
            ? 'Use o Google para acelerar seu cadastro empresarial. Você ainda criará uma senha segura depois.'
            : 'Preencha os campos abaixo para começar sua jornada.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              name="fullName"
              label="Nome Completo"
              placeholder="João Silva"
              disabled={isLoading}
              autoComplete="name"
            />
            <InputField
              name="email"
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              disabled={isLoading}
              autoComplete="email"
            />
            <InputField
              name="password"
              label="Senha"
              placeholder="••••••"
              type="password"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <InputField
              name="confirmPassword"
              label="Confirmar Senha"
              placeholder="••••••"
              type="password"
              disabled={isLoading}
              autoComplete="new-password"
            />
            
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="acceptTerms"
                className="mt-1 transition-all data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                checked={form.watch('acceptTerms')}
                onCheckedChange={(checked) => 
                  form.setValue('acceptTerms', checked === true, { shouldValidate: true })
                }
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="acceptTerms"
                  className="text-sm font-medium leading-normal cursor-pointer select-none text-foreground/90"
                >
                  Eu li e aceito os{' '}
                  <Link href="/terms" target="_blank" className="text-primary hover:underline font-bold transition-colors">
                    Termos de Uso
                  </Link>
                  {' '}da plataforma.
                </label>
                {form.formState.errors.acceptTerms && (
                  <p className="text-[0.8rem] font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                    {form.formState.errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-bold transition-all hover:opacity-90 active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
        </Form>
        <SocialAuth 
          isLoading={isLoading} 
          next={isBusinessMode ? '/onboarding' : '/dashboard'} 
          text={isBusinessMode ? 'Continuar com Google' : 'Cadastrar com Google'}
        />
      </CardContent>
      <CardFooter className="flex justify-center pb-8 pt-2">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          Já tem uma conta? <span className="text-primary hover:underline">Entrar</span>
        </Link>
      </CardFooter>
    </Card>
  )
}
