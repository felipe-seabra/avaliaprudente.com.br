import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/account/settings/profile-form'
import { NotificationForm } from '@/components/account/settings/notification-form'
import { PrivacySection } from '@/components/account/settings/privacy-section'
import { DangerZone } from '@/components/account/settings/danger-zone'
import { LogoutButton } from '@/components/account/settings/logout-button'
import { Settings, User, Bell, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Configurações - Avalia Prudente',
  description: 'Gerencie seu perfil e preferências.',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return <div>Perfil não encontrado</div>
  }

  const notificationPrefs = (profile.notification_preferences as {
    email_official_responses?: boolean
    email_platform_updates?: boolean
  }) || {
    email_official_responses: true,
    email_platform_updates: false
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/account" />} className="font-medium cursor-pointer">
            Voltar para Avaliações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation (Visual only for now) */}
        <aside className="md:col-span-1 space-y-1">
          <nav className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-primary/10 text-primary rounded-lg">
              <User className="h-4 w-4" />
              Geral
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg cursor-not-allowed opacity-60">
              <Bell className="h-4 w-4" />
              Notificações
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg cursor-not-allowed opacity-60">
              <Shield className="h-4 w-4" />
              Segurança
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          <section id="profile">
            <ProfileForm 
              initialData={{ 
                fullName: profile.full_name || '', 
                email: profile.email || user.email || '' 
              }} 
            />
          </section>

          <section id="notifications">
            <NotificationForm 
              initialData={{
                email_official_responses: !!notificationPrefs.email_official_responses,
                email_platform_updates: !!notificationPrefs.email_platform_updates
              }} 
            />
          </section>

          <section id="privacy">
            <PrivacySection />
          </section>

          <section id="danger-zone">
            <DangerZone />
          </section>

          <div className="flex justify-center pt-8 border-t">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
