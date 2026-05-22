'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Shield, User, Crown, UserCheck, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoleManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  currentRole: string
  adminRole: string
  onSuccess: () => void
}

export function RoleManagementDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentRole,
  adminRole,
  onSuccess,
}: RoleManagementDialogProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdateRole = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar função')
      }

      toast.success('Função atualizada com sucesso')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar função'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSuperAdmin = adminRole === 'super_admin'

  const roles = [
    { value: 'reviewer', label: 'Avaliador', icon: User, description: 'Pode apenas fazer avaliações', color: 'text-muted-foreground' },
    { value: 'customer', label: 'Cliente', icon: UserCheck, description: 'Pode gerenciar empresas', color: 'text-green-600' },
    { value: 'admin', label: 'Administrador', icon: Shield, description: 'Acesso administrativo limitado', color: 'text-blue-600', disabled: !isSuperAdmin },
    { value: 'super_admin', label: 'Super Admin', icon: Crown, description: 'Acesso total e governança', color: 'text-purple-600', disabled: !isSuperAdmin },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Papel de Usuário</DialogTitle>
          <DialogDescription>
            Altere as permissões de <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Selecione o novo papel
          </Label>
          <div className="grid gap-2">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                disabled={role.disabled || isSubmitting}
                onClick={() => setSelectedRole(role.value)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                  "hover:bg-accent hover:border-accent-foreground/20",
                  selectedRole === role.value ? "bg-accent border-primary ring-1 ring-primary" : "bg-background border-border",
                  role.disabled && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                <div className={cn("mt-0.5 p-1 rounded-md bg-background border shadow-sm", role.color)}>
                  <role.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{role.label}</span>
                    {selectedRole === role.value && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {role.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md border border-dashed text-[11px] text-muted-foreground mt-2">
            <p className="font-bold flex items-center gap-1">
              <Shield className="h-3 w-3" /> Regras de Governança
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {isSuperAdmin ? (
                <li>Você tem autoridade total para gerenciar todos os papéis.</li>
              ) : (
                <>
                  <li>Como Admin, você só pode alternar entre Avaliador e Cliente.</li>
                  <li>Promoções para Admin requerem um Super Admin.</li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateRole} 
            disabled={isSubmitting || selectedRole === currentRole}
            className="font-bold"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
