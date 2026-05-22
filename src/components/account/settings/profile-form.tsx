'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { InputField } from '@/components/shared/input-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile } from '@/app/account/settings/actions'
import { Loader2 } from 'lucide-react'

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
})

type ProfileInput = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData: {
    fullName: string
    email: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
    },
  })

  async function onSubmit(data: ProfileInput) {
    setIsLoading(true)
    try {
      const result = await updateProfile(data)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Perfil atualizado com sucesso!')
        form.reset(data) // Reset dirty state
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil Público</CardTitle>
        <CardDescription>
          Como seu nome aparecerá em suas avaliações públicas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              name="fullName"
              label="Nome de Exibição"
              placeholder="Seu nome completo ou apelido"
              disabled={isLoading}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                E-mail
              </label>
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                {initialData.email}
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                O e-mail é gerenciado pelo seu provedor de autenticação e não pode ser alterado aqui.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading || !form.formState.isDirty} className="font-bold">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
