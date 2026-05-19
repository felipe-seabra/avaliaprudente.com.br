'use client'

import React from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations/auth'
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

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${APP_CONFIG.url}/reset-password`,
      })

      if (error) {
        logError(error, 'Forgot Password')
        const normalized = parseError(error)
        toast.error(normalized.message)
        return
      }

      toast.success('E-mail enviado!', {
        description: 'Verifique sua caixa de entrada para resetar sua senha.',
      })
    } catch (err) {
      logError(err, 'Forgot Password unexpected')
      toast.error('Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-muted/50 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="space-y-1 pb-8 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Esqueci minha senha</CardTitle>
        <CardDescription>
          Digite seu e-mail para receber as instruções de recuperação.
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
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:opacity-90 active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar e-mail'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pb-8 pt-2">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  )
}
