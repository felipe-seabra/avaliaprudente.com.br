/**
 * Reviewer Reputation & Badge System Logic
 * Derived from approved review counts and user roles.
 */

export type ReputationLevel = 
  | 'none' 
  | 'recurrent' 
  | 'active' 
  | 'specialist' 
  | 'elite' 
  | 'reference' 
  | 'team';

export interface ReputationBadge {
  level: ReputationLevel;
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'premium';
  className: string;
  tooltip: string;
}

/**
 * Determines the reputation badge based on approved review count and user role.
 * 
 * Progression:
 * - 0-4 reviews: No badge
 * - 5+ reviews: Avaliador Recorrente
 * - 15+ reviews: Colaborador Ativo
 * - 30+ reviews: Especialista da Comunidade
 * - 75+ reviews: Avaliador Elite
 * - 150+ reviews: Referência da Plataforma
 * 
 * Special:
 * - Admin/Super Admin: Equipe Avalia Prudente
 */
export function getReputationBadge(count: number, role?: string): ReputationBadge | null {
  // 1. Admin & Super Admin Override
  if (role === 'admin' || role === 'super_admin') {
    return {
      level: 'team',
      label: 'Equipe Avalia Prudente',
      variant: 'premium',
      className: 'bg-primary/10 text-primary border-primary/20 font-bold',
      tooltip: 'Membro oficial da equipe Avalia Prudente.'
    };
  }

  // 2. Dynamic Progression
  if (count >= 150) {
    return {
      level: 'reference',
      label: 'Referência da Plataforma',
      variant: 'premium',
      className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      tooltip: `Este usuário publicou ${count} avaliações verificadas.`
    };
  }

  if (count >= 75) {
    return {
      level: 'elite',
      label: 'Avaliador Elite',
      variant: 'premium',
      className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
      tooltip: `Este usuário publicou ${count} avaliações verificadas.`
    };
  }

  if (count >= 30) {
    return {
      level: 'specialist',
      label: 'Especialista da Comunidade',
      variant: 'secondary',
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      tooltip: `Este usuário publicou ${count} avaliações verificadas.`
    };
  }

  if (count >= 15) {
    return {
      level: 'active',
      label: 'Colaborador Ativo',
      variant: 'secondary',
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      tooltip: `Este usuário publicou ${count} avaliações verificadas.`
    };
  }

  if (count >= 5) {
    return {
      level: 'recurrent',
      label: 'Avaliador Recorrente',
      variant: 'outline',
      className: 'bg-muted/50 text-muted-foreground border-border/60',
      tooltip: `Este usuário publicou ${count} avaliações verificadas.`
    };
  }

  return null;
}
