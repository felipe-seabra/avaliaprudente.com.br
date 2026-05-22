'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateNotificationPreferences } from '@/app/account/settings/actions'
import { Loader2 } from 'lucide-react'

const notificationSchema = z.object({
  email_official_responses: z.boolean(),
  email_platform_updates: z.boolean(),
})

type NotificationInput = z.infer<typeof notificationSchema>

interface NotificationFormProps {
  initialData: NotificationInput
}

export function NotificationForm({ initialData }: NotificationFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<NotificationInput>({
    resolver: zodResolver(notificationSchema),
    defaultValues: initialData,
  })

  async function onSubmit(data: NotificationInput) {
    setIsLoading(true)
    try {
      const result = await updateNotificationPreferences(data)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Preferências atualizadas!')
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
        <CardTitle>Notificações</CardTitle>
        <CardDescription>
          Escolha como você deseja ser notificado sobre atividades na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email_official_responses"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">Respostas Oficiais</FormLabel>
                    <FormDescription>
                      Receba um e-mail quando uma empresa responder a uma de suas avaliações.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email_platform_updates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">Atualizações da Plataforma</FormLabel>
                    <FormDescription>
                      Receba novidades sobre novos recursos e melhorias no Avalia Prudente.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading || !form.formState.isDirty} className="font-bold">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Preferências
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
