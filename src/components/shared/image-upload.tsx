'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Upload, RefreshCw, Trash2 } from 'lucide-react'
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

  // Optimization: Resize and Compress image using Canvas
  const optimizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'image/svg+xml') {
        resolve(file)
        return
      }

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxDimension = 512

          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width
              width = maxDimension
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Image optimization failed'))
            },
            'image/webp',
            0.8
          )
        }
      }
      reader.onerror = reject
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      toast.success('Logo atualizado com sucesso!')
    } catch (error: unknown) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao enviar imagem: ' + message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4 w-full flex flex-col items-center', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />

      <div className={cn(
        'relative group overflow-hidden rounded-2xl border-2 border-muted transition-all hover:border-primary/20 shadow-sm bg-background flex items-center justify-center',
        aspectRatio === 'square' && 'h-32 w-32 md:h-40 md:w-40',
        aspectRatio === 'video' && 'aspect-video w-full',
        aspectRatio === 'portrait' && 'aspect-[3/4] w-full',
        isUploading && 'opacity-50 grayscale'
      )}>
        {value ? (
          <>
            <Image
              src={value}
              alt="Logo"
              fill
              className="object-contain p-3 transition-transform group-hover:scale-105"
            />
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">
                  Clique para<br/>enviar logo
                </p>
              </>
            )}
          </div>
        )}
        
        {/* Overlay trigger for upload when logo exists */}
        {value && !isUploading && (
          <button 
            onClick={triggerUpload}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <RefreshCw className="h-8 w-8 text-white animate-in zoom-in-50 duration-300" />
          </button>
        )}
      </div>

      {/* Explicit Actions */}
      <div className="flex flex-col w-full gap-2">
        {!value ? (
          <Button 
            type="button" 
            className="w-full font-bold gap-2 cursor-pointer" 
            onClick={triggerUpload}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            Selecionar Logo
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1 font-bold gap-2 cursor-pointer border-2" 
              onClick={triggerUpload}
              disabled={isUploading}
            >
              <RefreshCw className={cn("h-4 w-4", isUploading && "animate-spin")} />
              Trocar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              size="icon"
              className="w-10 h-10 rounded-xl cursor-pointer shadow-md" 
              onClick={onRemove}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-[9px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
          Máx 300KB • Recomendado 512x512px
        </p>
      </div>
    </div>
  )
}
