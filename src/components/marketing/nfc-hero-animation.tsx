'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Zap, Star, Check } from 'lucide-react'
import { BrandIcons } from '@/components/shared/brand-icons'
import { cn } from '@/lib/utils'

/**
 * NFC Hero Animation - FINAL RESTORATION
 * 
 * 1. THE ANCHOR: NFC Tag is visible at all times, centered and straight.
 * 2. THE MOTION: Phone enters from bottom-right, slows down, lands sensor-first on tag.
 * 3. VISUALS: Premium dark materials, purple accents, realistic shadows.
 * 4. HIERARCHY: Compact composition to support hero text.
 */
export function NfcHeroAnimation() {
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-md mx-auto h-[300px] md:h-[350px] flex items-center justify-center overflow-visible select-none"
    >
      <style jsx>{`
        /* 
          ANIMATION TIMELINE 
          0.0s - 0.6s: Tag settles (fade + slide)
          0.6s - 1.6s: Phone enters diagonally (bottom-right -> center-low)
          1.6s - 1.9s: Haptic bump + NFC Pulse
          1.9s - 2.4s: UI Reveal Stagger
        */

        @keyframes tag-entry {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes phone-entry {
          0% { transform: translate(80px, 120px) rotate(12deg); opacity: 0; }
          100% { transform: translate(0, 60px) rotate(-4deg); opacity: 1; }
        }

        @keyframes nfc-pulse {
          0% { transform: scale(1); opacity: 0; }
          50% { transform: scale(1.6); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes haptic-bump {
          0%, 100% { transform: translate(0, 60px) rotate(-4deg); }
          25% { transform: translate(1px, 58px) rotate(-3.5deg); }
          75% { transform: translate(-1px, 62px) rotate(-4.5deg); }
        }

        @keyframes screen-on {
          from { opacity: 0; filter: brightness(0.6); }
          to { opacity: 1; filter: brightness(1); }
        }

        @keyframes ui-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-tag {
          animation: tag-entry 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-phone {
          animation: phone-entry 1.0s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }

        .animate-haptic {
          animation: haptic-bump 0.1s ease-in-out 1.6s 2;
        }

        .animate-pulse {
          animation: nfc-pulse 0.6s ease-out 1.6s forwards;
        }

        .animate-screen {
          animation: screen-on 0.4s ease-out 1.9s forwards;
        }

        .animate-ui-1 { animation: ui-slide-up 0.4s ease-out 2.1s forwards; opacity: 0; }
        .animate-ui-2 { animation: ui-slide-up 0.4s ease-out 2.3s forwards; opacity: 0; }
        .animate-ui-3 { animation: ui-slide-up 0.4s ease-out 2.5s forwards; opacity: 0; }

        @media (prefers-reduced-motion: reduce) {
          .animate-tag, .animate-phone, .animate-haptic, .animate-pulse, .animate-screen, .animate-ui-1, .animate-ui-2, .animate-ui-3 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* 1. THE ANCHOR: PREMIUM NFC TAG */}
      <div className={cn(
        "relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-zinc-950 border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-white transform-gpu",
        inView ? "animate-tag" : "opacity-0"
      )}>
        {/* Glossy Overlay */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        {/* NFC Icon & Text */}
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative">
            {/* NFC Pulse Effect */}
            {inView && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-primary/40 rounded-full animate-pulse" />
              </div>
            )}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shadow-inner relative z-10">
              <Zap className="w-7 h-7 md:w-8 md:h-8 text-primary fill-primary/10" />
            </div>
          </div>
          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">NFC Ativo</div>
        </div>

        {/* Decorative Badge */}
        <div className="absolute bottom-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-[7px] md:text-[8px] uppercase font-bold text-zinc-400">Avalia Prudente</span>
        </div>

        {/* Physical Shadow on Floor */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-black/60 blur-2xl rounded-full -z-10" />
      </div>

      {/* 2. THE ACTOR: SMARTPHONE (10% Smaller) */}
      <div className={cn(
        "absolute z-20 w-[150px] h-[310px] md:w-[180px] md:h-[370px] transform-gpu pointer-events-none",
        inView ? "animate-phone animate-haptic" : "opacity-0"
      )}>
        {/* Device Frame */}
        <div className="w-full h-full rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900 border-[5px] md:border-[6px] border-zinc-800 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
          
          {/* Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-20 h-5 md:h-6 bg-zinc-800 rounded-b-xl z-50" />

          {/* Screen */}
          <div className="absolute inset-0 bg-black flex flex-col">
            
            {/* UI Reveal */}
            <div className={cn(
              "flex-1 flex flex-col bg-zinc-950 opacity-0",
              inView && "animate-screen"
            )}>
              {/* Review Header */}
              <div className="pt-8 md:pt-10 px-4 pb-3 bg-zinc-900/50 border-b border-white/5 animate-ui-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Star className="w-4 h-4 text-primary fill-primary/30" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 w-20 bg-white/90 rounded-full" />
                    <div className="h-1.5 w-12 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-5">
                <div className="space-y-1.5 animate-ui-2">
                  <div className="h-2 w-full bg-white/5 rounded-full" />
                  <div className="h-2 w-4/5 bg-white/5 rounded-full" />
                </div>

                {/* Star Selection */}
                <div className="flex justify-center gap-1.5 py-1 animate-ui-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-primary fill-primary" />
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2.5 animate-ui-3">
                  <div className="w-full h-8 md:h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-[10px] md:text-xs text-white shadow-lg shadow-primary/20">
                    Enviar Avaliação
                  </div>
                  <div className="w-full h-8 md:h-10 border border-white/10 rounded-lg flex items-center justify-center gap-2 bg-white/5">
                    <BrandIcons.Instagram className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-[9px] md:text-[10px] font-medium text-white/70">Seguir</span>
                  </div>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="mt-auto p-4 border-t border-white/5 flex items-center justify-center gap-1.5 animate-ui-3">
                <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-2 h-2 text-primary" />
                </div>
                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Oficial</span>
              </div>
            </div>

            {/* Reflection Layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
          </div>
        </div>

        {/* Smartphone Shadow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full h-8 bg-black/60 blur-2xl rounded-full -z-10" />
      </div>

      {/* Background Decorative Glow */}
      <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full -z-20 pointer-events-none" />
    </div>
  )
}
