'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string) => void
  onRemove: () => void
  folder: string // e.g., 'logos'
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait'
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder,
  className,
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. O limite é 2MB.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use JPG, PNG, WebP ou SVG.')
      return
    }

    setIsUploading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Usuário não autenticado')

      const userId = userData.user.id
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${userId}/${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('Imagem enviada com sucesso!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao enviar imagem: ' + message)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4 w-full', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <div className={cn(
            'relative overflow-hidden rounded-2xl border bg-muted',
            aspectRatio === 'square' && 'aspect-square',
            aspectRatio === 'video' && 'aspect-video',
            aspectRatio === 'portrait' && 'aspect-[3/4]'
          )}>
            <Image
              src={value}
              alt="Upload"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerUpload}
          disabled={isUploading}
          className={cn(
            'flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl transition-all hover:bg-muted/50 hover:border-primary/50 group cursor-pointer',
            aspectRatio === 'square' && 'aspect-square',
            aspectRatio === 'video' && 'aspect-video',
            aspectRatio === 'portrait' && 'aspect-[3/4]',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Clique para enviar</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WebP até 2MB</p>
            </>
          )}
        </button>
      )}
    </div>
  )
}
