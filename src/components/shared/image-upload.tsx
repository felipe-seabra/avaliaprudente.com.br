'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Upload, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react'
import { optimizeImage } from '@/lib/image-utils'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | null
  onChange?: (url: string) => void
  onRemove: () => void
  onFileSelect?: (file: File | null) => void
  folder?: string // e.g., 'logos'
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait'
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  onFileSelect,
  folder = 'logos',
  className,
  aspectRatio = 'square',
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Cleanup local preview URL on unmount or change
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const absoluteMax = 5 * 1024 * 1024 // 5MB before optimization
    if (file.size > absoluteMax) {
      toast.error('Arquivo muito pesado. Utilize uma imagem de até 5MB.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use JPG, PNG, WebP ou SVG.')
      return
    }

    // If onFileSelect is provided, we are in deferred mode
    if (onFileSelect) {
      const previewUrl = URL.createObjectURL(file)
      if (localPreview) URL.revokeObjectURL(localPreview)
      setLocalPreview(previewUrl)
      onFileSelect(file)
      return
    }

    // Immediate upload mode (Legacy support)
    if (!onChange) return

    setIsUploading(true)
    try {
      const optimizedBlob = await optimizeImage(file)
      
      const maxFinalSize = 300 * 1024 // 300KB
      if (optimizedBlob.size > maxFinalSize) {
        toast.error('Logo muito grande após otimização. Utilize um arquivo mais leve (máx 300KB).')
        setIsUploading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Usuário não autenticado')

      const userId = userData.user.id
      const fileExt = file.type === 'image/svg+xml' ? 'svg' : 'webp'
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, optimizedBlob, {
          contentType: file.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/webp',
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('Imagem carregada com sucesso!')
    } catch (error: unknown) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao enviar imagem: ' + message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(null)
    }
    if (onFileSelect) {
      onFileSelect(null)
    }
    onRemove()
  }

  const triggerUpload = () => {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }

  const displayImage = localPreview || (value && value !== 'pending' ? value : null)

  return (
    <div className={cn('space-y-4 w-full flex flex-col items-center', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div 
        onClick={triggerUpload}
        className={cn(
          'relative group overflow-hidden rounded-2xl border-2 border-dashed border-muted transition-all hover:border-primary/40 shadow-sm bg-muted/30 flex items-center justify-center cursor-pointer',
          aspectRatio === 'square' && 'h-32 w-32 md:h-40 md:w-40',
          aspectRatio === 'video' && 'aspect-video w-full',
          aspectRatio === 'portrait' && 'aspect-[3/4] w-full',
          (isUploading || disabled) && 'opacity-50 grayscale cursor-not-allowed',
          displayImage && 'border-solid border-muted hover:border-primary/20 bg-background'
        )}
      >
        {displayImage ? (
          <>
            <Image
              src={displayImage}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 128px, 160px"
              className="object-contain p-3 transition-transform group-hover:scale-105"
            />
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isUploading && !disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <RefreshCw className="h-8 w-8 text-white animate-in zoom-in-50 duration-300" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Trocar Imagem</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">
                  Clique ou arraste<br/>para enviar
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Explicit Actions */}
      <div className="flex flex-col w-full gap-2">
        {!displayImage ? (
          <Button 
            type="button" 
            variant="outline"
            className="w-full font-bold gap-2 cursor-pointer border-2 hover:bg-primary/5" 
            onClick={triggerUpload}
            disabled={isUploading || disabled}
          >
            <ImageIcon className="h-4 w-4" />
            Selecionar Imagem
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1 font-bold gap-2 cursor-pointer border-2" 
              onClick={triggerUpload}
              disabled={isUploading || disabled}
            >
              <RefreshCw className={cn("h-4 w-4", isUploading && "animate-spin")} />
              Trocar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              size="icon"
              className="w-10 h-10 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all" 
              onClick={handleRemove}
              disabled={isUploading || disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-[9px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
          JPG, PNG ou WebP • Máx 300KB
        </p>
      </div>
    </div>
  )
}
