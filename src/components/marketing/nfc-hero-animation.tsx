'use client'

import React, { useEffect, useRef, useState } from 'react'
import { SmartphoneNfc, Zap, Star, ShieldCheck } from 'lucide-react'
import { BrandIcons } from '@/components/shared/brand-icons'
import { cn } from '@/lib/utils'

/**
 * NfcHeroAnimation Refinement
 * 
 * Final Realism Adjustments:
 * - Human Deceleration: Phone slows down significantly near the tag.
 * - Detection Pause: ~200ms delay between arrival and NFC response.
 * - Staggered UI Reveal: Header -> Content -> CTA load sequence.
 * - Subtle Motion: Reduced offsets, focus on opacity and micro-scaling.
 * - Cinematic Timing: Calm, confident 3.5s master timeline.
 */
export function NfcHeroAnimation() {
  const [hasPlayed, setHasPlayed] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          setHasPlayed(true)
          setAnimationKey(prev => prev + 1)
        }
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [hasPlayed])

  const handleInteraction = () => {
    if (hasPlayed) {
      setAnimationKey(prev => prev + 1)
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto py-12 perspective-2000 focus:outline-none"
      onMouseEnter={handleInteraction}
      onFocus={handleInteraction}
      tabIndex={0}
      role="img"
      aria-label="Animação cinematográfica demonstrando a tecnologia NFC da Avalia Prudente"
    >
      <style jsx>{`
        /* Master Timeline: 3.5s */
        
        /* 1. Phone Entry with Human Deceleration (0s -> 1.4s) */
        @keyframes phone-entry-cinematic {
          0% { 
            transform: translate3d(180px, 120px, 0) rotateX(15deg) rotateY(20deg) rotateZ(15deg); 
            opacity: 0; 
          }
          /* Deceleration starts at 25% (0.875s) and finishes smoothly at 40% (1.4s) */
          40%, 100% { 
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(-6deg); 
            opacity: 1; 
          }
        }

        /* 2. NFC Response (Starts at 46% ~1.6s, after 200ms pause) */
        @keyframes nfc-pulse-cinematic {
          0%, 46% { transform: scale(0.8); opacity: 0; }
          52% { transform: scale(1.1); opacity: 0.4; }
          65%, 100% { transform: scale(1.4); opacity: 0; }
        }

        /* 3. Subtle Haptic Vibration (Starts at 46% ~1.6s) */
        @keyframes phone-haptic-cinematic {
          0%, 46% { transform: translate3d(0, 0, 0); }
          48% { transform: translate3d(1px, -1px, 0); }
          50% { transform: translate3d(-1px, 1px, 0); }
          52% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        /* 4. Soft Screen Light Response (Starts at 46% ~1.6s) */
        @keyframes screen-light-cinematic {
          0%, 46% { opacity: 0; }
          48% { opacity: 0.2; }
          60%, 100% { opacity: 0; }
        }

        /* 5. Progressive UI Reveal - Base Fade */
        @keyframes ui-fade-cinematic {
          0%, 50% { opacity: 0; }
          60%, 100% { opacity: 1; }
        }

        /* 6. Staggered Elements - Header (52%) */
        @keyframes header-reveal-cinematic {
          0%, 52% { opacity: 0; transform: translateY(8px); }
          65%, 100% { opacity: 1; transform: translateY(0); }
        }

        /* 7. Staggered Elements - Content (58%) */
        @keyframes content-reveal-cinematic {
          0%, 58% { opacity: 0; transform: translateY(8px); }
          75%, 100% { opacity: 1; transform: translateY(0); }
        }

        /* 8. Staggered Elements - CTA (64%) */
        @keyframes cta-reveal-cinematic {
          0%, 64% { opacity: 0; transform: scale(0.98); }
          80%, 100% { opacity: 1; transform: scale(1); }
        }

        .animate-phone-master {
          animation: phone-entry-cinematic 3.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        .animate-haptic-master {
          animation: phone-haptic-cinematic 3.5s ease-in-out forwards;
        }

        .animate-pulse-master {
          animation: nfc-pulse-cinematic 3.5s ease-out forwards;
        }

        .animate-light-master {
          animation: screen-light-cinematic 3.5s ease-out forwards;
        }

        .animate-ui-master {
          animation: ui-fade-cinematic 3.5s ease-out forwards;
        }

        .animate-header-master {
          animation: header-reveal-cinematic 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-content-master {
          animation: content-reveal-cinematic 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-cta-master {
          animation: cta-reveal-cinematic 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-phone-master, .animate-haptic-master, .animate-pulse-master, .animate-light-master, .animate-ui-master, .animate-header-master, .animate-content-master, .animate-cta-master {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .opacity-0 {
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Background Glows */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 min-h-[600px]">
        
        {/* NFC Card - The "Anchor" */}
        <div className="relative z-10">
          <div className="w-60 h-84 rounded-[2.5rem] bg-zinc-900 border border-white/10 shadow-2xl flex flex-col items-center justify-between p-10 text-white transform-gpu rotate-y-[-12deg] rotate-x-[8deg] shadow-[30px_30px_60px_rgba(0,0,0,0.5)] transition-all duration-700 hover:rotate-y-[-15deg] hover:border-white/20 group">
            <div className="w-full flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 backdrop-blur-sm group-hover:bg-primary/10 transition-colors duration-500">
                <SmartphoneNfc size={28} className="text-primary/80 group-hover:text-primary transition-colors" />
              </div>
              <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary/20" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                {/* NFC Ripple effect */}
                {hasPlayed && (
                  <div key={animationKey} className="pointer-events-none">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-master" />
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-master [animation-delay:0.1s]" />
                  </div>
                )}
                
                <div className="relative h-24 w-24 rounded-full border border-primary/20 flex items-center justify-center bg-zinc-900/90 backdrop-blur-sm shadow-[0_0_40px_rgba(var(--primary),0.05)]">
                  <Zap className="h-10 w-10 text-primary/70" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <span className="block font-black text-sm uppercase tracking-[0.4em] text-white/80">Aproxime</span>
                <span className="block text-[11px] text-white/20 uppercase tracking-widest font-medium">NFC Ativo</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <div className="flex justify-between items-center px-2">
                 <div className="h-2 w-8 bg-white/5 rounded-full" />
                 <div className="h-2 w-12 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Card shadow on the "floor" */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-56 h-12 bg-black/50 blur-3xl rounded-full -z-10" />
        </div>

        {/* Smartphone Animation */}
        <div key={animationKey} className={cn(
          "relative z-20 transition-opacity duration-500",
          hasPlayed ? "animate-phone-master" : "opacity-0"
        )}>
          <div className={cn(hasPlayed && "animate-haptic-master")}>
            <div className="w-[300px] h-[620px] border-[12px] border-zinc-800/90 rounded-[3.5rem] bg-black shadow-2xl relative overflow-hidden ring-1 ring-white/10 transform-gpu">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-zinc-800/90 rounded-b-3xl z-50" />
              
              {/* Screen Content */}
              <div className="absolute inset-0 bg-zinc-950 flex flex-col">
                
                {/* Soft Screen Light Response */}
                <div className={cn(
                  "absolute inset-0 bg-primary/20 z-20 pointer-events-none opacity-0",
                  hasPlayed && "animate-light-master"
                )} />

                {/* Idle State / Lock Screen */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black z-10 flex items-center justify-center">
                   <div className="opacity-10 flex flex-col items-center gap-6">
                      <div className="w-24 h-24 rounded-[2.8rem] bg-white/5 border border-white/5 flex items-center justify-center">
                        <SmartphoneNfc className="w-10 h-10 text-white" />
                      </div>
                      <div className="h-1.5 w-24 bg-white/5 rounded-full" />
                   </div>
                </div>

                {/* Success/Review Page State */}
                <div className={cn(
                  "relative z-30 flex-1 flex flex-col bg-zinc-950",
                  hasPlayed ? "animate-ui-master" : "opacity-0"
                )}>
                  {/* Business Header */}
                  <div className={cn(
                    "pt-16 px-8 pb-8 bg-zinc-900/40 border-b border-white/5",
                    hasPlayed && "animate-header-master"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-inner">
                        <Star className="w-6 h-6 text-primary/60 fill-primary/40" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3.5 w-28 bg-white/80 rounded-full" />
                        <div className="h-2 w-16 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Rating Section */}
                  <div className={cn(
                    "p-8 space-y-8",
                    hasPlayed && "animate-content-master"
                  )}>
                    <div className="space-y-3">
                       <div className="h-4 w-full bg-white/5 rounded-lg" />
                       <div className="h-4 w-5/6 bg-white/5 rounded-lg" />
                    </div>

                    <div className="flex justify-center gap-2.5 py-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-10 h-10 text-primary/80 fill-primary/60 drop-shadow-[0_0_12px_rgba(var(--primary),0.2)]" />
                      ))}
                    </div>

                    <div className={cn(
                      "space-y-4",
                      hasPlayed && "animate-cta-master"
                    )}>
                      <div className="w-full h-14 bg-primary/90 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/10 border border-primary-foreground/5 hover:bg-primary transition-colors duration-500">
                        <span className="font-bold text-base text-white">Enviar Avaliação</span>
                      </div>
                      <div className="w-full h-14 border border-white/5 rounded-2xl flex items-center justify-center gap-3 bg-white/[0.03]">
                         <BrandIcons.Instagram className="w-5 h-5 text-white/60" />
                        <span className="font-semibold text-sm text-white/60">Seguir no Instagram</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer/Trust */}
                  <div className="mt-auto p-8 border-t border-white/5 bg-zinc-900/20">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary/60" />
                      </div>
                      <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Verificado Oficial</span>
                    </div>
                  </div>
                </div>

                {/* Light reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none z-40" />
              </div>
            </div>
          </div>
          
          {/* Phone shadow on the "floor" */}
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-72 h-14 bg-black/60 blur-[40px] rounded-full -z-10" />
        </div>
      </div>
    </div>
  )
}
