'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Loader2, 
  Star, 
  Sparkles,
  CheckCircle2,
  XCircle,
  Wand2,
  Camera
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { InputField } from '@/components/shared/input-field'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/shared/image-upload'
import { createClient } from '@/lib/supabase/client'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'
import { slugify, isValidSlug } from '@/lib/utils'
import { APP_CONFIG } from '@/lib/constants'
import { parseError, logError } from '@/lib/error-handler'
import { optimizeImage } from '@/lib/image-utils'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

const onboardingSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').refine(isValidSlug, 'Slug inválido ou reservado'),
  logo_url: z.string().optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de uso empresarial',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type OnboardingInput = z.infer<typeof onboardingSchema>

export function OnboardingClient() {
  const router = useRouter()
  const [step, setStep] = useState<'business' | 'security' | 'terms'>('business')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'available' | 'unavailable' | 'idle'>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [user, setUser] = useState<User | null>(null)
  
  const supabase = useMemo(() => createClient(), [])
  const repository = useMemo(() => new BusinessRepository(), [])

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      slug: '',
      logo_url: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'customer' || profile?.role === 'admin' || profile?.role === 'super_admin') {
        // Already a customer or admin, check if they have businesses
        const businesses = await repository.getAll()
        if (businesses.length > 0) {
          router.push('/dashboard')
          return
        }
      }
    }
    checkUser()
  }, [supabase, router, repository])

  const watchedName = form.watch('name')
  const watchedSlug = form.watch('slug')

  useEffect(() => {
    if (watchedName && !form.formState.touchedFields.slug && step === 'business') {
      form.setValue('slug', slugify(watchedName))
    }
  }, [watchedName, form, step])

  useEffect(() => {
    const checkSlug = async () => {
      if (!watchedSlug || watchedSlug.length < 2 || step !== 'business') {
        setSlugStatus('idle')
        return
      }

      setIsCheckingSlug(true)
      try {
        const available = await repository.isSlugAvailable(watchedSlug)
        setSlugStatus(available ? 'available' : 'unavailable')
      } catch (error) {
        console.error('Error checking slug:', error)
      } finally {
        setIsCheckingSlug(false)
      }
    }

    const timer = setTimeout(checkSlug, 500)
    return () => clearTimeout(timer)
  }, [watchedSlug, repository, step])

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof OnboardingInput)[] = []
    
    if (step === 'business') {
      fieldsToValidate = ['name', 'slug']
      const isValid = await form.trigger(fieldsToValidate)
      if (isValid && slugStatus === 'available') {
        setStep('security')
      } else if (slugStatus === 'unavailable') {
        toast.error('Este link já está em uso.')
      }
    } else if (step === 'security') {
      fieldsToValidate = ['password', 'confirmPassword']
      const isValid = await form.trigger(fieldsToValidate)
      if (isValid) {
        setStep('terms')
      }
    }
  }

  const handleSuggest = async () => {
    if (!watchedSlug) return
    setIsCheckingSlug(true)
    try {
      const suggested = await repository.getAvailableSlug(watchedSlug)
      form.setValue('slug', suggested, { shouldValidate: true })
    } finally {
      setIsCheckingSlug(false)
    }
  }

  async function uploadLogo(businessId: string, file: File): Promise<string> {
    if (!user) throw new Error('User not authenticated')
    const { webp, png } = await optimizeImage(file)
    const userId = user.id
    const isSvg = file.type === 'image/svg+xml'
    const fileExt = isSvg ? 'svg' : 'webp'
    const baseName = `${Math.random().toString(36).substring(2)}-${Date.now()}`
    const fileName = `${baseName}.${fileExt}`
    const filePath = `${userId}/logos/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('business-assets')
      .upload(filePath, webp, {
        contentType: isSvg ? 'image/svg+xml' : 'image/webp',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    if (!isSvg && png) {
      const ogFileName = `${baseName}-og.png`
      const ogFilePath = `${userId}/logos/${ogFileName}`
      await supabase.storage
        .from('business-assets')
        .upload(ogFilePath, png, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('business-assets')
      .getPublicUrl(filePath)

    await repository.update(businessId, { logo_url: publicUrl })
    return publicUrl
  }

  const onSubmit = async (data: OnboardingInput) => {
    setIsLoading(true)
    try {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.password
      })
      if (passwordError) throw passwordError

      const newBusiness = await repository.create({
        name: data.name,
        slug: data.slug.toLowerCase(),
        logo_url: ''
      })

      if (selectedFile) {
        try {
          await uploadLogo(newBusiness.id, selectedFile)
        } catch (err) {
          console.error('Logo upload error:', err)
        }
      }

      const res = await fetch('/api/auth/upgrade', { method: 'POST' })
      if (!res.ok) {
        const upgradeData = await res.json()
        throw new Error(upgradeData.error || 'Erro ao atualizar papel do usuário')
      }

      toast.success('Bem-vindo ao Avalia Prudente!', {
        description: 'Seu cadastro empresarial foi concluído com sucesso.'
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      logError(error, 'Onboarding Submit')
      const normalized = parseError(error)
      toast.error(normalized.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
             <Star className="text-white fill-white h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gradient">Configuração de Negócio</h1>
          <p className="text-muted-foreground max-w-sm">
            Falta pouco! Complete os dados da sua empresa para acessar o dashboard.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { id: 'business', icon: Building2, label: 'Empresa' },
            { id: 'security', icon: Lock, label: 'Segurança' },
            { id: 'terms', icon: ShieldCheck, label: 'Termos' },
          ].map((s, i) => {
            const isActive = step === s.id
            const isDone = (step === 'security' && s.id === 'business') || (step === 'terms' && (s.id === 'business' || s.id === 'security'))
            
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-primary text-white shadow-md scale-110' : (isDone ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground')
                  }`}>
                    {isDone ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className={`h-[2px] w-12 rounded-full ${isDone ? 'bg-green-500' : 'bg-muted'}`} />}
              </React.Fragment>
            )
          })}
        </div>

        <Card className="border-muted/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-muted/10 pb-8 pt-10 px-8">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              {step === 'business' && 'Dados da Empresa'}
              {step === 'security' && 'Segurança da Conta'}
              {step === 'terms' && 'Termos de Uso'}
            </CardTitle>
            <CardDescription>
              {step === 'business' && 'Como os clientes encontrarão sua página pública.'}
              {step === 'security' && 'Crie uma senha para acessar sua conta de qualquer lugar.'}
              {step === 'terms' && 'Aceite nossas diretrizes para começar a operar.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 'business' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-40 shrink-0 space-y-2">
                       <FormField
                        control={form.control}
                        name="logo_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                               <Camera className="h-4 w-4 text-primary" />
                               Logo da Marca
                            </FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value}
                                onFileSelect={(file) => {
                                  setSelectedFile(file)
                                  field.onChange(file ? 'pending' : '')
                                }}
                                onRemove={() => {
                                  setSelectedFile(null)
                                  field.onChange('')
                                }}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormDescription className="text-[10px]">Sugestão: 512x512px</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex-1 space-y-5">
                      <InputField
                        name="name"
                        label="Nome do Negócio"
                        placeholder="Ex: Café Bela Vista"
                        disabled={isLoading}
                        autoComplete="organization"
                      />
                      <div className="relative">
                        <InputField
                          name="slug"
                          label="URL Personalizada (Slug)"
                          placeholder="ex: cafe-bela-vista"
                          disabled={isLoading}
                          description={`Seu link será: www.avaliaprudente.com.br/r/${watchedSlug || 'seu-slug'}`}
                        />
                        <div className="absolute top-9 right-3 flex items-center gap-2">
                          {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          {!isCheckingSlug && slugStatus === 'available' && watchedSlug.length >= 2 && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {!isCheckingSlug && slugStatus === 'unavailable' && (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-primary hover:text-primary-foreground hover:bg-primary"
                                onClick={handleSuggest}
                                title="Sugerir disponível"
                              >
                                <Wand2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 'security' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4 items-start">
                       <div className="p-2 bg-primary/10 rounded-xl">
                          <Sparkles className="h-5 w-5 text-primary" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-primary">Login Multi-canal</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                             Mesmo usando Google, você poderá entrar usando seu e-mail e esta senha em qualquer dispositivo.
                          </p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        name="password"
                        label="Nova Senha"
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <InputField
                        name="confirmPassword"
                        label="Confirmar Senha"
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}

                {step === 'terms' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 border-2 border-primary/10 bg-primary/5 rounded-2xl transition-all hover:border-primary/20">
                        <Checkbox
                          id="acceptTerms"
                          className="mt-1 h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          checked={form.watch('acceptTerms')}
                          onCheckedChange={(checked) => 
                            form.setValue('acceptTerms', checked === true, { shouldValidate: true })
                          }
                          disabled={isLoading}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="acceptTerms"
                            className="text-sm font-bold leading-normal cursor-pointer select-none"
                          >
                            Aceito os Termos de Uso Empresarial
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Ao continuar, você concorda com nossas políticas de privacidade, moderação e faturamento do Avalia Prudente.
                          </p>
                          <Link href="/terms" target="_blank" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                            Ler termos completos <ArrowRight className="h-3 w-3" />
                          </Link>
                          {form.formState.errors.acceptTerms && (
                            <p className="text-[0.8rem] font-medium text-destructive mt-1">
                              {form.formState.errors.acceptTerms.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 flex justify-between items-center border-t border-muted">
                   {step !== 'business' ? (
                     <Button 
                       type="button" 
                       variant="ghost" 
                       onClick={() => setStep(step === 'terms' ? 'security' : 'business')}
                       disabled={isLoading}
                       className="font-bold"
                     >
                        Voltar
                     </Button>
                   ) : <div />}

                   {step === 'terms' ? (
                     <Button 
                       type="submit" 
                       className="px-8 h-12 font-black text-base shadow-xl shadow-primary/20 animate-pulse hover:animate-none transition-all"
                       disabled={isLoading}
                     >
                       {isLoading ? (
                         <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Finalizando...
                         </span>
                       ) : 'Concluir Cadastro'}
                     </Button>
                   ) : (
                     <Button 
                       type="button" 
                       onClick={handleNextStep}
                       disabled={isLoading || (step === 'business' && (isCheckingSlug || slugStatus !== 'available'))}
                       className="px-8 h-12 font-bold gap-2"
                     >
                        Próximo Passo
                        <ArrowRight className="h-4 w-4" />
                     </Button>
                   )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-tighter">
          Ambiente Seguro & Criptografado • {APP_CONFIG.name} v{APP_CONFIG.version}
        </p>
      </div>
    </div>
  )
}
