'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
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
  const observerRef = useRef<IntersectionObserver | null>(null)

  const triggerAnimation = useCallback(() => {
    if (!hasPlayed) {
      setHasPlayed(true)
      setAnimationKey(prev => prev + 1)
    }
  }, [hasPlayed])

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!hasPlayed) triggerAnimation()
    }, 1000)

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          triggerAnimation()
          if (observerRef.current) observerRef.current.disconnect()
        }
      },
      { 
        threshold: 0,
        rootMargin: '50px' 
      }
    )

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current)
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [hasPlayed, triggerAnimation])

  const handleInteraction = () => {
    // Only replay on explicit interaction if it has already played
    // and only for mouse devices to avoid touch-flicker
    if (hasPlayed && window.matchMedia('(pointer: fine)').matches) {
      setAnimationKey(prev => prev + 1)
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto py-4 md:py-8 perspective-2000 focus:outline-none overflow-visible"
      onMouseEnter={handleInteraction}
      onFocus={handleInteraction}
      tabIndex={0}
      role="img"
      aria-label="Animação cinematográfica demonstrando a tecnologia NFC da Avalia Prudente"
    >
      <style jsx>{`
        :root {
          --phone-w: 180px;
          --phone-h: 370px;
          --card-w: 140px;
          --card-h: 196px;
          --entry-x: 40px;
          --entry-y: 20px;
          --entry-rot-x: 8deg;
          --entry-rot-y: 10deg;
          --entry-rot-z: 8deg;
          --final-rot-z: -3deg;
        }

        @media (min-width: 768px) {
          :root {
            --phone-w: 240px;
            --phone-h: 496px;
            --card-w: 190px;
            --card-h: 266px;
            --entry-x: 120px;
            --entry-y: 80px;
            --entry-rot-x: 12deg;
            --entry-rot-y: 15deg;
            --entry-rot-z: 12deg;
            --final-rot-z: -5deg;
          }
        }

        /* Master Timeline: 3.5s */
        
        @keyframes phone-entry-cinematic {
          0% { 
            transform: translate3d(var(--entry-x), var(--entry-y), 0) rotateX(var(--entry-rot-x)) rotateY(var(--entry-rot-y)) rotateZ(var(--entry-rot-z)); 
            opacity: 0; 
          }
          30%, 100% { 
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(var(--final-rot-z)); 
            opacity: 1; 
          }
        }

        @keyframes nfc-pulse-cinematic {
          0%, 40% { transform: scale(0.8); opacity: 0; }
          46% { transform: scale(1.1); opacity: 0.4; }
          60%, 100% { transform: scale(1.4); opacity: 0; }
        }

        @keyframes phone-haptic-cinematic {
          0%, 40% { transform: translate3d(0, 0, 0); }
          42% { transform: translate3d(1px, -1px, 0); }
          44% { transform: translate3d(-1px, 1px, 0); }
          46%, 100% { transform: translate3d(0, 0, 0); }
        }

        @keyframes screen-light-cinematic {
          0%, 40% { opacity: 0; }
          42% { opacity: 0.15; }
          55%, 100% { opacity: 0; }
        }

        @keyframes ui-fade-cinematic {
          0%, 42% { opacity: 0; }
          52%, 100% { opacity: 1; }
        }

        @keyframes header-reveal-cinematic {
          0%, 44% { opacity: 0; transform: translateY(6px); }
          56%, 100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes content-reveal-cinematic {
          0%, 50% { opacity: 0; transform: translateY(6px); }
          64%, 100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes cta-reveal-cinematic {
          0%, 58% { opacity: 0; transform: scale(0.98); }
          74%, 100% { opacity: 1; transform: scale(1); }
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
        }
      `}</style>

      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-48 md:h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 min-h-[400px] md:min-h-[500px]">
        
        {/* NFC Card - The "Anchor" */}
        <div className="relative z-10 transition-transform duration-700">
          <div 
            style={{ width: 'var(--card-w)', height: 'var(--card-h)' }}
            className="rounded-[1.5rem] md:rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl flex flex-col items-center justify-between p-5 md:p-8 text-white transform-gpu rotate-y-[-12deg] rotate-x-[8deg] shadow-[20px_20px_40px_rgba(0,0,0,0.5)] transition-all duration-700 hover:rotate-y-[-15deg] hover:border-white/20 group"
          >
            <div className="w-full flex justify-between items-start">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 backdrop-blur-sm group-hover:bg-primary/10 transition-colors duration-500">
                <SmartphoneNfc className="w-5 h-5 md:w-6 md:h-6 text-primary/80 group-hover:text-primary transition-colors" />
              </div>
              <div className="h-1 w-10 md:w-16 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary/20" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 md:gap-6">
              <div className="relative">
                {/* NFC Ripple effect */}
                {hasPlayed && (
                  <div key={animationKey} className="pointer-events-none">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-master" />
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-master [animation-delay:0.1s]" />
                  </div>
                )}
                
                <div className="relative h-12 w-12 md:h-20 md:w-20 rounded-full border border-primary/20 flex items-center justify-center bg-zinc-900/90 backdrop-blur-sm shadow-[0_0_30px_rgba(var(--primary),0.05)]">
                  <Zap className="h-6 w-6 md:h-8 md:h-8 text-primary/70" />
                </div>
              </div>
              <div className="space-y-0.5 md:space-y-1 text-center">
                <span className="block font-black text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/80">Aproxime</span>
                <span className="block text-[8px] md:text-[10px] text-white/20 uppercase tracking-widest font-medium">NFC Ativo</span>
              </div>
            </div>

            <div className="w-full space-y-2 md:space-y-3">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <div className="flex justify-between items-center px-2">
                 <div className="h-1 w-5 md:h-1.5 md:w-6 bg-white/5 rounded-full" />
                 <div className="h-1 w-8 md:h-1.5 md:w-10 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Card shadow on the "floor" */}
          <div className="absolute -bottom-6 md:-bottom-10 left-1/2 -translate-x-1/2 w-32 md:w-48 h-6 md:h-8 bg-black/50 blur-xl md:blur-2xl rounded-full -z-10" />
        </div>

        {/* Smartphone Animation */}
        <div key={animationKey} className={cn(
          "relative z-20 transition-opacity duration-700",
          hasPlayed ? "animate-phone-master opacity-100" : "opacity-0"
        )}>
          <div className={cn(hasPlayed && "animate-haptic-master")}>
            <div 
              style={{ width: 'var(--phone-w)', height: 'var(--phone-h)' }}
              className="border-[6px] md:border-[10px] border-zinc-800/90 rounded-[2rem] md:rounded-[3rem] bg-black shadow-2xl relative overflow-hidden ring-1 ring-white/10 transform-gpu"
            >
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 md:w-28 h-5 md:h-7 bg-zinc-800/90 rounded-b-xl md:rounded-b-2xl z-50" />
              
              {/* Screen Content */}
              <div className="absolute inset-0 bg-zinc-950 flex flex-col">
                
                {/* Soft Screen Light Response */}
                <div className={cn(
                  "absolute inset-0 bg-primary/20 z-20 pointer-events-none opacity-0",
                  hasPlayed && "animate-light-master"
                )} />

                {/* Idle State / Lock Screen */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black z-10 flex items-center justify-center">
                   <div className="opacity-10 flex flex-col items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2.2rem] bg-white/5 border border-white/5 flex items-center justify-center">
                        <SmartphoneNfc className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <div className="h-1 w-12 md:w-20 bg-white/5 rounded-full" />
                   </div>
                </div>

                {/* Success/Review Page State */}
                <div className={cn(
                  "relative z-30 flex-1 flex flex-col bg-zinc-950 opacity-0",
                  hasPlayed && "animate-ui-master"
                )}>
                  {/* Business Header */}
                  <div className={cn(
                    "pt-8 md:pt-14 px-5 md:px-7 pb-5 md:pb-7 bg-zinc-900/40 border-b border-white/5 opacity-0",
                    hasPlayed && "animate-header-master"
                  )}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-inner">
                        <Star className="w-4 h-4 md:w-5 md:h-5 text-primary/60 fill-primary/40" />
                      </div>
                      <div className="space-y-1 md:space-y-1.5">
                        <div className="h-2.5 md:h-3 w-16 md:w-24 bg-white/80 rounded-full" />
                        <div className="h-1 md:h-1.5 w-10 md:w-14 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Rating Section */}
                  <div className={cn(
                    "p-5 md:p-7 space-y-5 md:space-y-7 opacity-0",
                    hasPlayed && "animate-content-master"
                  )}>
                    <div className="space-y-2 md:space-y-2.5">
                       <div className="h-3 md:h-3.5 w-full bg-white/5 rounded-lg" />
                       <div className="h-3 md:h-3.5 w-5/6 bg-white/5 rounded-lg" />
                    </div>

                    <div className="flex justify-center gap-1.5 md:gap-2 py-3 md:py-5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-5 h-5 md:w-8 md:h-8 text-primary/80 fill-primary/60 drop-shadow-[0_0_10px_rgba(var(--primary),0.2)]" />
                      ))}
                    </div>

                    <div className={cn(
                      "space-y-2.5 md:space-y-3 opacity-0",
                      hasPlayed && "animate-cta-master"
                    )}>
                      <div className="w-full h-10 md:h-12 bg-primary/90 rounded-lg md:rounded-xl flex items-center justify-center gap-2 md:gap-2 shadow-lg shadow-primary/10 border border-primary-foreground/5 hover:bg-primary transition-colors duration-500">
                        <span className="font-bold text-[11px] md:text-sm text-white">Enviar Avaliação</span>
                      </div>
                      <div className="w-full h-10 md:h-12 border border-white/5 rounded-lg md:rounded-xl flex items-center justify-center gap-2 md:gap-2 bg-white/[0.03]">
                         <BrandIcons.Instagram className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/60" />
                        <span className="font-semibold text-[10px] md:text-xs text-white/60">Seguir no Instagram</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer/Trust */}
                  <div className="mt-auto p-5 md:p-7 border-t border-white/5 bg-zinc-900/20">
                    <div className="flex items-center justify-center gap-2 md:gap-2.5">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-2.5 md:w-3 h-2.5 md:h-3 text-primary/60" />
                      </div>
                      <span className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Verificado Oficial</span>
                    </div>
                  </div>
                </div>

                {/* Light reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none z-40" />
              </div>
            </div>
          </div>
          
          {/* Phone shadow on the "floor" */}
          <div className="absolute -bottom-8 md:-bottom-12 left-1/2 -translate-x-1/2 w-48 md:w-60 h-8 md:h-12 bg-black/60 blur-[25px] md:blur-[35px] rounded-full -z-10" />
        </div>
      </div>
    </div>
  )
}
