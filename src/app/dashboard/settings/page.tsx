'use client'

import React, { useState } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/shared/input-field'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'
import { parseError, logError } from '@/lib/error-handler'

const settingsSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug inválido'),
})

type SettingsInput = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { currentBusiness, refreshBusinesses } = useBusiness()
  const [isLoading, setIsLoading] = useState(false)
  const repository = new BusinessRepository()

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: {
      name: currentBusiness?.name || '',
      slug: currentBusiness?.slug || '',
    },
  })

  async function onSubmit(data: SettingsInput) {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      if (data.slug !== currentBusiness.slug) {
        const existing = await repository.getBySlug(data.slug)
        if (existing) {
          form.setError('slug', { message: 'Este slug já está em uso' })
          return
        }
      }

      await repository.update(currentBusiness.id, data)
      toast.success('Configurações salvas com sucesso!')
      await refreshBusinesses()
    } catch (error: unknown) {
      logError(error, 'Update Business Settings')
      const normalized = parseError(error)
      toast.error('Erro ao salvar configurações', { description: normalized.message })
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-2xl font-bold">Nenhuma empresa selecionada</h1>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Empresa</h1>
        <p className="text-muted-foreground">
          Gerencie as informações básicas de {currentBusiness.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Estas informações são usadas para identificar sua empresa na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                name="name"
                label="Nome da Empresa"
                placeholder="Ex: Pizzaria do João"
                disabled={isLoading}
              />
              <InputField
                name="slug"
                label="Slug (URL amigável)"
                placeholder="ex: pizzaria-do-joao"
                disabled={true}
                description="O link da sua empresa é permanente para evitar a quebra de QR Codes e placas NFC já impressas."
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="cursor-pointer">
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
