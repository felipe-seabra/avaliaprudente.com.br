'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Zap, Star, Check } from 'lucide-react'
import { BrandIcons } from '@/components/shared/brand-icons'
import { cn } from '@/lib/utils'

/**
 * NFC Hero Animation - FINAL PRODUCTION FIX
 * 
 * 1. THE ANCHOR: NFC Tag is a horizontal card, centered and always visible.
 * 2. REPLAY SYSTEM: Animation restarts on hover, focus, or viewport entry.
 * 3. COMPOSITION: Phone approaches from bottom-right and taps the tag center.
 * 4. PREMIUM: Matte dark materials, pulse effects, and haptic feedback simulation.
 */
export function NfcHeroAnimation() {
  const [inView, setInView] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          setAnimationKey(prev => prev + 1) // Trigger initial animation
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

  const restartAnimation = () => {
    if (inView) {
      setAnimationKey(prev => prev + 1)
    }
  }

  return (
    <div 
      ref={containerRef}
      onMouseEnter={restartAnimation}
      onFocus={restartAnimation}
      tabIndex={0}
      className="relative w-full max-w-lg mx-auto h-[280px] md:h-[320px] flex items-center justify-center overflow-visible select-none outline-none group cursor-pointer"
    >
      <style jsx>{`
        /* 
          ANIMATION TIMELINE (per animationKey)
          0.0s - 0.4s: Tag entry (only on first mount/inView)
          0.4s - 1.4s: Phone entry (diagonal approach)
          1.4s - 1.6s: Haptic bump + NFC Pulse
          1.6s - 2.1s: UI Reveal
        */

        @keyframes tag-fade {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes phone-approach {
          0% { transform: translate(140px, 180px) rotate(15deg); opacity: 0; }
          100% { transform: translate(32px, 64px) rotate(-4deg); opacity: 1; }
        }

        @keyframes nfc-pulse-ring {
          0% { transform: scale(1); opacity: 0; }
          50% { transform: scale(1.6); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes device-vibrate {
          0%, 100% { transform: translate(32px, 64px) rotate(-4deg); }
          20% { transform: translate(34px, 62px) rotate(-3.5deg); }
          40% { transform: translate(30px, 66px) rotate(-4.5deg); }
          60% { transform: translate(33px, 63px) rotate(-3.8deg); }
          80% { transform: translate(31px, 65px) rotate(-4.2deg); }
        }

        @keyframes tag-shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }

        @keyframes content-reveal {
          from { opacity: 0; filter: brightness(0.7); }
          to { opacity: 1; filter: brightness(1); }
        }

        @keyframes list-item-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-tag-fix {
          animation: tag-fade 0.5s ease-out forwards;
        }

        .animate-phone-fix {
          animation: phone-approach 1.0s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }

        .animate-haptic-fix {
          animation: device-vibrate 0.2s ease-in-out 1.2s;
        }

        .animate-pulse-fix {
          animation: nfc-pulse-ring 0.6s ease-out 1.2s forwards;
        }

        .animate-screen-fix {
          animation: content-reveal 0.4s ease-out 1.4s forwards;
        }

        .animate-ui-1-fix { animation: list-item-up 0.4s ease-out 1.6s forwards; opacity: 0; }
        .animate-ui-2-fix { animation: list-item-up 0.4s ease-out 1.8s forwards; opacity: 0; }
        .animate-ui-3-fix { animation: list-item-up 0.4s ease-out 2.0s forwards; opacity: 0; }

        @media (prefers-reduced-motion: reduce) {
          .animate-tag-fix, .animate-phone-fix, .animate-haptic-fix, .animate-pulse-fix, .animate-screen-fix, .animate-ui-1-fix, .animate-ui-2-fix, .animate-ui-3-fix {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* 1. THE ANCHOR: VERTICAL PREMIUM NFC TAG (Always Visible) */}
      <div className={cn(
        "absolute z-10 w-[130px] h-[200px] md:w-[150px] md:h-[230px] rounded-[2.5rem] bg-zinc-950 border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between py-10 md:py-12 transform-gpu overflow-hidden transition-all duration-700",
        inView ? "opacity-100 -translate-x-28 md:-translate-x-36 -translate-y-4 blur-[0.4px]" : "opacity-0"
      )}>
        {/* Card Material Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        
        {/* Branding Detail (Top) */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          <span className="text-[7px] md:text-[8px] uppercase font-black tracking-[0.4em] text-white/90">Avalia Prudente</span>
        </div>

        {/* NFC Zone (Center) */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative" key={`pulse-${animationKey}`}>
            {/* NFC Pulse Ring */}
            {inView && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-primary/20 rounded-full animate-pulse-fix" />
              </div>
            )}
            
            {/* Contactless Icon Simulation */}
            <div className="flex flex-col items-center gap-1 mb-4 opacity-20">
              <div className="w-10 h-[1.5px] rounded-full bg-white" style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }} />
              <div className="w-14 h-[1.5px] rounded-full bg-white" style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }} />
              <div className="w-18 h-[1.5px] rounded-full bg-white" style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }} />
            </div>

            <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-center shadow-inner relative z-10 backdrop-blur-sm">
              <Zap className="w-7 h-7 md:w-8 md:h-8 text-primary fill-primary/10" />
            </div>
          </div>
          <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 opacity-80">Tap to Review</div>
        </div>

        {/* Bottom Detail */}
        <div className="relative z-10 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
          <span className="text-[6px] md:text-[7px] uppercase font-bold text-zinc-500 tracking-[0.2em]">Premium Access</span>
        </div>

        {/* Premium Glossy Reflection */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-x-full top-0 h-full w-[200%] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-[-20deg] animate-[tag-shimmer_4s_infinite_linear]" />
        </div>
      </div>

      {/* 2. THE ACTOR: SMARTPHONE (Animated with Key Replay) */}
      <div 
        key={`phone-${animationKey}`}
        className={cn(
          "absolute z-20 w-[140px] h-[290px] md:w-[170px] md:h-[350px] transform-gpu pointer-events-none",
          inView ? "animate-phone-fix animate-haptic-fix" : "opacity-0"
        )}
      >
        {/* Device Frame */}
        <div className="w-full h-full rounded-[2.2rem] md:rounded-[2.8rem] bg-zinc-900 border-[6px] md:border-[8px] border-zinc-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/10">
          
          {/* Casting a shadow onto the tag */}
          <div className="absolute -left-16 top-0 w-24 h-full bg-black/60 blur-3xl rounded-full pointer-events-none z-0" />

          {/* Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 md:w-18 h-4 md:h-5 bg-zinc-800 rounded-b-xl z-50" />

          {/* Screen Content */}
          <div className="absolute inset-0 bg-black flex flex-col">
            
            {/* UI Reveal */}
            <div className={cn(
              "flex-1 flex flex-col bg-zinc-950 opacity-0",
              inView && "animate-screen-fix"
            )}>
              {/* Review Header */}
              <div className="pt-8 md:pt-10 px-4 pb-3 bg-zinc-900/50 border-b border-white/5 animate-ui-1-fix">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Star className="w-4 h-4 text-primary fill-primary/30" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-16 md:w-20 bg-white/90 rounded-full" />
                    <div className="h-1 w-10 md:w-12 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Interaction Content */}
              <div className="p-4 space-y-5">
                <div className="space-y-1.5 animate-ui-2-fix">
                  <div className="h-1.5 w-full bg-white/5 rounded-full" />
                  <div className="h-1.5 w-4/5 bg-white/5 rounded-full" />
                </div>

                {/* Star Selection */}
                <div className="flex justify-center gap-1.5 py-1 animate-ui-2-fix">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-primary fill-primary" />
                  ))}
                </div>

                {/* CTA Elements */}
                <div className="space-y-2 animate-ui-3-fix">
                  <div className="w-full h-8 md:h-9 bg-primary rounded-lg flex items-center justify-center font-bold text-[9px] md:text-[10px] text-white shadow-lg shadow-primary/20">
                    Enviar Avaliação
                  </div>
                  <div className="w-full h-8 md:h-9 border border-white/10 rounded-lg flex items-center justify-center gap-2 bg-white/5">
                    <BrandIcons.Instagram className="w-3 h-3 text-white/70" />
                    <span className="text-[8px] md:text-[9px] font-medium text-white/70">Seguir</span>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-auto p-4 border-t border-white/5 flex items-center justify-center gap-1.5 animate-ui-3-fix">
                <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-1.5 h-1.5 text-primary" />
                </div>
                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Oficial</span>
              </div>
            </div>

            {/* Premium Screen Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
          </div>
        </div>

        {/* Floating Phone Shadow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full h-8 bg-black/30 blur-2xl rounded-full -z-10" />
      </div>

      {/* Floor Shadow for Tag */}
      <div className={cn(
        "absolute bottom-[15%] left-1/2 w-32 h-6 bg-black/80 blur-3xl rounded-full -z-10 transition-all duration-700",
        inView ? "-translate-x-[calc(50%+112px)] md:-translate-x-[calc(50%+144px)]" : "-translate-x-1/2"
      )} />

      {/* Global Background Glow */}
      <div className="absolute inset-0 bg-primary/[0.03] blur-[80px] rounded-full -z-20 pointer-events-none" />
    </div>
  )
}
