'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { InputField } from '@/components/shared/input-field'
import { parseError, logError } from '@/lib/error-handler'

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        logError(error, 'Reset Password')
        const normalized = parseError(error)
        toast.error(normalized.message)
        return
      }

      toast.success('Senha atualizada com sucesso!')
      router.push('/login')
    } catch (err) {
      logError(err, 'Reset Password unexpected')
      toast.error('Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-muted/50 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="space-y-1 pb-8 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Nova senha</CardTitle>
        <CardDescription>Digite sua nova senha abaixo para recuperar o acesso.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              name="password"
              label="Nova senha"
              placeholder="••••••"
              type="password"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <InputField
              name="confirmPassword"
              label="Confirmar senha"
              placeholder="••••••"
              type="password"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:opacity-90 active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
