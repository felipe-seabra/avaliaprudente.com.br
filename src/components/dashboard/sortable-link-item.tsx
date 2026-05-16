'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageLink } from '@/core/domain/entities'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Trash2, 
  GripVertical,
} from 'lucide-react'

interface SortableLinkItemProps {
  link: PageLink
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<PageLink>) => void
}

export function SortableLinkItem({ link, onDelete, onUpdate }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="group overflow-hidden">
        <div className="p-4 flex gap-4 items-start">
          <div 
            {...attributes} 
            {...listeners}
            className="mt-2 cursor-grab text-muted-foreground/30 hover:text-muted-foreground transition-colors active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground/50">Título do Botão</Label>
                <Input 
                  value={link.title}
                  onChange={(e) => onUpdate(link.id, { title: e.target.value })}
                  className="h-8 border-none px-0 focus-visible:ring-0 text-base font-semibold"
                />
              </div>
              <div className="pt-2">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDelete(link.id)}
                  >
                   <Trash2 className="h-4 w-4" />
                 </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground/50">URL / Destino</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder={link.type === 'whatsapp' ? 'Ex: https://wa.me/...' : 'https://...'}
                  value={link.url}
                  onChange={(e) => onUpdate(link.id, { url: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
