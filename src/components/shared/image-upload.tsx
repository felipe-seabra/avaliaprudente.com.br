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

  // Optimization: Resize and Compress image using Canvas
  const optimizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // SVG doesn't need canvas optimization, just return as is if small enough
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

          // Resize logic
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
          
          // Export as WebP with 0.8 quality for best balance
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

    // Pre-optimization size check (soft limit)
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
      // Optimize image
      const optimizedBlob = await optimizeImage(file)
      
      // Post-optimization size check (strict limit)
      const maxFinalSize = 300 * 1024 // 300KB
      if (optimizedBlob.size > maxFinalSize) {
        toast.error('Logo muito grande após otimização. Utilize um arquivo mais leve (máx 300KB).')
        setIsUploading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Usuário não autenticado')

      const userId = userData.user.id
      // Change extension to .webp for optimized images, keep .svg for SVGs
      const fileExt = file.type === 'image/svg+xml' ? 'svg' : 'webp'
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
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
      toast.success('Logo enviado e otimizado com sucesso!')
    } catch (error: unknown) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao enviar imagem: ' + message)
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
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
            'relative overflow-hidden rounded-2xl border bg-muted shadow-inner',
            aspectRatio === 'square' && 'aspect-square',
            aspectRatio === 'video' && 'aspect-video',
            aspectRatio === 'portrait' && 'aspect-[3/4]'
          )}>
            <Image
              src={value}
              alt="Upload"
              fill
              className="object-contain p-2 transition-transform group-hover:scale-105"
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
            'flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl transition-all hover:bg-muted/50 hover:border-primary/50 group cursor-pointer bg-background',
            aspectRatio === 'square' && 'aspect-square',
            aspectRatio === 'video' && 'aspect-video',
            aspectRatio === 'portrait' && 'aspect-[3/4]',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Otimizando...</p>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-bold">Clique para enviar</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-tight">PNG, JPG ou WebP até 300KB</p>
            </>
          )}
        </button>
      )}
    </div>
  )
}
