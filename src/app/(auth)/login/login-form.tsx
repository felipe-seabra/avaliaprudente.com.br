'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
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

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        logError(error, 'Login')
        const normalized = parseError(error)
        toast.error(normalized.message)
        return
      }

      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      logError(err, 'Login unexpected')
      toast.error('Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-muted/50 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="space-y-1 pb-8 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Entrar</CardTitle>
        <CardDescription>
          Digite seu e-mail e senha para acessar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              name="email"
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              disabled={isLoading}
              autoComplete="email"
            />
            <div className="space-y-1">
              <InputField
                name="password"
                label="Senha"
                placeholder="••••••"
                type="password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:opacity-90 active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-2 pb-8 px-6">
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Esqueceu a senha?
          </Link>
          <Link
            href="/register"
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Criar conta
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
