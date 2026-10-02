'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, MessageCircle, Smartphone, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NfcHeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label="Demonstração de uma tag NFC conectando um celular a uma página de avaliação"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        'relative mx-auto flex h-[330px] w-full max-w-2xl items-center justify-center overflow-visible outline-none md:h-[390px]',
        visible && 'nfc-hero-visible',
      )}
    >
      <style jsx>{`
        .nfc-tag,
        .nfc-phone {
          will-change: transform;
        }

        @keyframes tag-enter {
          from { opacity: 0; transform: translate3d(-18px, 10px, 0) rotate(-5deg); }
          to { opacity: 1; transform: translate3d(0, 0, 0) rotate(-3deg); }
        }

        @keyframes phone-enter {
          from { opacity: 0; transform: translate3d(115px, 95px, 0) rotate(12deg) scale(.96); }
          to { opacity: 1; transform: translate3d(58px, 34px, 0) rotate(-7deg) scale(1); }
        }

        @keyframes phone-float {
          0%, 100% { transform: translate3d(58px, 34px, 0) rotate(-7deg); }
          50% { transform: translate3d(58px, 28px, 0) rotate(-6deg); }
        }

        @keyframes phone-hover {
          0% { transform: translate3d(58px, 34px, 0) rotate(-7deg); }
          100% { transform: translate3d(22px, 12px, 0) rotate(-3deg); }
        }

        @keyframes signal {
          0% { opacity: 0; transform: scale(.55); }
          35% { opacity: .65; }
          100% { opacity: 0; transform: scale(1.65); }
        }

        @keyframes screen-glow {
          0%, 100% { opacity: .35; }
          50% { opacity: .8; }
        }

        .nfc-hero-visible .nfc-tag {
          animation: tag-enter .7s cubic-bezier(.22, 1, .36, 1) both;
        }

        .nfc-hero-visible .nfc-phone {
          animation:
            phone-enter .9s cubic-bezier(.22, 1, .36, 1) .15s both,
            phone-float 4s ease-in-out 1.1s infinite;
        }

        .nfc-hero-visible .signal-ring {
          animation: signal 2.2s ease-out infinite;
        }

        .nfc-hero-visible .signal-ring:nth-child(2) {
          animation-delay: .75s;
        }

        .nfc-hero-visible .screen-glow {
          animation: screen-glow 2.4s ease-in-out infinite;
        }

        .nfc-hero-visible .nfc-phone-hover {
          animation: phone-hover .45s cubic-bezier(.22, 1, .36, 1) forwards;
        }

        @media (min-width: 768px) {
          .nfc-hero-visible .nfc-phone {
            animation:
              phone-enter .9s cubic-bezier(.22, 1, .36, 1) .15s both,
              phone-float 4s ease-in-out 1.1s infinite;
          }

          .nfc-hero-visible .nfc-phone-hover {
            animation: phone-hover .45s cubic-bezier(.22, 1, .36, 1) forwards;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nfc-hero-visible .nfc-tag,
          .nfc-hero-visible .nfc-phone,
          .nfc-hero-visible .signal-ring,
          .nfc-hero-visible .screen-glow,
          .nfc-hero-visible .nfc-phone-hover {
            animation: none !important;
          }

          .nfc-hero-visible .nfc-tag {
            opacity: 1;
            transform: rotate(-3deg);
          }

          .nfc-hero-visible .nfc-phone {
            opacity: 1;
            transform: translate3d(58px, 34px, 0) rotate(-7deg);
          }
        }
      `}</style>

      <div className="absolute inset-0 -z-10 rounded-full bg-primary/[0.035] blur-3xl" />

      <div
        className={cn(
          'nfc-tag absolute z-10 h-[190px] w-[125px] overflow-hidden rounded-[26px] border border-white/15 bg-zinc-950 shadow-[0_28px_70px_-25px_rgba(0,0,0,.8)] transition-transform duration-500 md:h-[230px] md:w-[150px]',
          active && 'scale-[1.035] shadow-[0_32px_85px_-20px_rgba(0,0,0,.9)]',
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,.16),transparent_35%),linear-gradient(145deg,rgba(255,255,255,.08),transparent_45%,rgba(0,0,0,.65))]" />
        <div className="relative flex h-full flex-col items-center justify-between px-5 py-7 text-center md:px-6 md:py-9">
          <div>
            <div className="mx-auto mb-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_14px_rgba(124,58,237,.9)]" />
            <span className="text-[7px] font-black uppercase tracking-[.32em] text-white/60 md:text-[8px]">
              Avalia Prudente
            </span>
          </div>

          <div className="relative flex flex-col items-center">
            <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[.04] shadow-inner md:h-16 md:w-16">
              <Zap className="h-7 w-7 text-primary md:h-8 md:w-8" />
              <span className="signal-ring absolute inset-0 rounded-2xl border border-primary/60" />
              <span className="signal-ring absolute inset-0 rounded-2xl border border-primary/30" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[.24em] text-white/65 md:text-[9px]">
              Aproxime para avaliar
            </span>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[6px] font-bold uppercase tracking-[.18em] text-white/35 md:text-[7px]">
            NFC inteligente
          </span>
        </div>
      </div>

      <div
        className={cn(
          'nfc-phone absolute z-20 h-[270px] w-[136px] rounded-[34px] border-[6px] border-zinc-800 bg-zinc-950 shadow-[0_35px_75px_-18px_rgba(0,0,0,.9)] ring-1 ring-white/10 transition-transform duration-500 md:h-[330px] md:w-[166px] md:rounded-[42px]',
          active && 'nfc-phone-hover',
        )}
      >
        <div className="absolute left-1/2 top-0 z-30 h-5 w-16 -translate-x-1/2 rounded-b-2xl bg-zinc-800 md:h-6 md:w-20" />

        <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-zinc-950 md:rounded-[35px]">
          <div className="screen-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(124,58,237,.22),transparent_38%)]" />

          <div className="relative flex h-full flex-col px-4 pb-4 pt-12 md:px-5 md:pb-5 md:pt-14">
            <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
                <Star className="h-4 w-4 fill-primary text-primary" />
              </div>
              <div>
                <div className="h-2 w-16 rounded-full bg-white/85 md:w-20" />
                <div className="mt-1.5 h-1.5 w-10 rounded-full bg-white/15 md:w-12" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-3 md:p-4">
              <div className="mb-3 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3.5 w-3.5 fill-primary text-primary md:h-4 md:w-4" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-white/10" />
                <div className="h-1.5 w-4/5 rounded-full bg-white/10" />
              </div>
              <div className="mt-4 flex h-8 items-center justify-center gap-2 rounded-xl bg-primary text-[8px] font-bold text-white md:h-9 md:text-[9px]">
                <MessageCircle className="h-3 w-3" />
                Enviar avaliação
              </div>
            </div>

            <div className="mt-auto flex items-center justify-center gap-1.5 border-t border-white/10 pt-3">
              <Check className="h-3 w-3 text-primary" />
              <span className="text-[7px] font-bold uppercase tracking-[.15em] text-white/35">
                Reputação digital
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-5 left-1/2 h-7 w-24 -translate-x-1/2 rounded-full bg-black/35 blur-xl" />
      </div>

      <div
        className={cn(
          'absolute bottom-5 left-1/2 -z-10 h-8 w-56 -translate-x-1/2 rounded-full bg-black/30 blur-2xl transition-all duration-500',
          active && 'scale-110 opacity-70',
        )}
      />

      <div
        className={cn(
          'absolute bottom-1 left-1/2 z-30 -translate-x-1/2 rounded-full border border-border/60 bg-background/90 px-4 py-2 text-[9px] font-bold uppercase tracking-[.2em] text-muted-foreground shadow-lg backdrop-blur-md transition-all duration-500',
          active ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70',
        )}
      >
        Aproxime o celular • avalie • conecte
      </div>

      <div className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[.28em] text-muted-foreground/50">
        NFC → experiência digital
      </div>

      <Smartphone className="sr-only" aria-hidden="true" />
    </div>
  )
}
