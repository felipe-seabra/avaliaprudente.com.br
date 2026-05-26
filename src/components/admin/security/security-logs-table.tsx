'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, ShieldAlert } from 'lucide-react'

interface AuditLog {
  id: string
  created_at: string
  actor_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  metadata: Record<string, unknown>
  profiles?: {
    email: string | null
    full_name: string | null
  }
}

interface SecurityLogsTableProps {
  logs: AuditLog[]
}

export function SecurityLogsTable({ logs }: SecurityLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  function getSeverity(action: string): 'info' | 'low' | 'medium' | 'high' | 'critical' {
    const a = action.toLowerCase()
    if (a.includes('fail') || a.includes('violation') || a.includes('unauthorized')) return 'high'
    if (a.includes('sudo') && a.includes('failed')) return 'critical'
    if (a.includes('delete') || a.includes('remove')) return 'medium'
    if (a.includes('update_role') || a.includes('sudo')) return 'medium'
    if (a.includes('security')) return 'medium'
    return 'info'
  }

  function sanitizeMetadata(metadata: Record<string, unknown>) {
    const sensitiveKeys = ['token', 'password', 'secret', 'cookie', 'ip', 'fingerprint', 'auth', 'key', 'signature']
    const sanitized = JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>
    
    const redact = (obj: Record<string, unknown>) => {
      if (!obj || typeof obj !== 'object') return
      Object.keys(obj).forEach(key => {
        const k = key.toLowerCase()
        if (sensitiveKeys.some(sk => k.includes(sk))) {
          obj[key] = '[REDACTED]'
        } else if (obj[key] !== null && typeof obj[key] === 'object') {
          redact(obj[key] as Record<string, unknown>)
        }
      })
    }
    
    redact(sanitized)
    return sanitized
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Data</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Ator</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum evento de segurança registrado.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const severity = getSeverity(log.action)
                return (
                  <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {severity === 'critical' && <ShieldAlert className="h-4 w-4 text-destructive animate-pulse" />}
                        {log.action}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{log.profiles?.full_name || 'Sistema'}</span>
                        <span className="text-[10px] text-muted-foreground">{log.profiles?.email || 'Ação Automatizada'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold bg-muted/50">
                        {log.resource_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={severity} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLog(log)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes do Evento
              {selectedLog && (
                <Badge variant="outline" className="ml-2">
                  {selectedLog.resource_type}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              ID do Evento: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Ação</span>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Severidade</span>
                  <div>
                    <SeverityBadge severity={getSeverity(selectedLog.action)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Ator</span>
                  <p className="text-sm">{selectedLog.profiles?.full_name || 'Sistema'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Data/Hora</span>
                  <p className="text-sm font-mono">{new Date(selectedLog.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Metadados (Sanitizados)</span>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(sanitizeMetadata(selectedLog.metadata), null, 2)}
                  </pre>
                </div>
              </div>

              {selectedLog.resource_id && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">ID do Recurso</span>
                  <p className="text-xs font-mono bg-muted/50 p-2 rounded">{selectedLog.resource_id}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    low: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    critical: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  }

  return (
    <Badge variant="outline" className={`${colors[severity] || colors.info} font-semibold capitalize text-[10px]`}>
      {severity}
    </Badge>
  )
}
