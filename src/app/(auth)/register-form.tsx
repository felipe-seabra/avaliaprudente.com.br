'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export function RegisterForm() {
  const router = useRouter()
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
          emailRedirectTo: `${APP_CONFIG.url}/auth/callback`,
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
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para começar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            <div className="flex items-start space-x-3 pt-4">
              <Checkbox
                id="acceptTerms"
                className="mt-0.5"
                checked={form.watch('acceptTerms')}
                onCheckedChange={(checked) => 
                  form.setValue('acceptTerms', checked === true, { shouldValidate: true })
                }
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="acceptTerms"
                  className="text-sm font-medium leading-normal cursor-pointer select-none text-foreground/90 dark:text-foreground/80"
                >
                  Eu li e aceito os{' '}
                  <Link href="/terms" target="_blank" className="text-primary hover:underline font-bold">
                    Termos de Uso
                  </Link>
                  {' '}da plataforma.
                </label>
                {form.formState.errors.acceptTerms && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full font-bold cursor-pointer" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:underline"
        >
          Já tem uma conta? Entrar
        </Link>
      </CardFooter>
    </Card>
  )
}
