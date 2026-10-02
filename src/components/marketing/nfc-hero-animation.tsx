'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ExternalLink, Radio, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NfcHeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(false)

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
      { threshold: 0.25 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label="Demonstração de uma pessoa aproximando o celular de uma tag NFC para abrir uma página de avaliação"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        'nfc-demo relative mx-auto flex h-[360px] w-full max-w-2xl items-center justify-center overflow-visible outline-none md:h-[430px]',
        visible && 'nfc-demo-visible',
        active && 'nfc-demo-active',
      )}
    >
      <style jsx>{`
        .nfc-stage {
          perspective: 1200px;
        }

        .nfc-tag,
        .nfc-phone,
        .nfc-shadow,
        .nfc-label,
        .nfc-wave {
          will-change: transform, opacity;
        }

        @keyframes tag-enter {
          from {
            opacity: 0;
            transform: translate3d(-18px, 18px, 0) rotateX(10deg) rotateZ(-5deg);
          }
          to {
            opacity: 1;
            transform: translate3d(-120px, 58px, 0) rotateX(10deg) rotateZ(-4deg);
          }
        }

        @keyframes phone-tap {
          0% {
            opacity: 0;
            transform: translate3d(155px, -78px, 0) rotateZ(11deg) scale(.96);
          }
          18% {
            opacity: 1;
            transform: translate3d(145px, -70px, 0) rotateZ(9deg) scale(.98);
          }
          48% {
            transform: translate3d(68px, -2px, 0) rotateZ(-4deg) scale(1);
          }
          61% {
            transform: translate3d(68px, -2px, 0) rotateZ(-4deg) scale(1);
          }
          72% {
            transform: translate3d(78px, 5px, 0) rotateZ(-5deg) scale(.995);
          }
          100% {
            opacity: 1;
            transform: translate3d(155px, -78px, 0) rotateZ(11deg) scale(.96);
          }
        }

        @keyframes phone-hover {
          0%, 100% {
            transform: translate3d(68px, -2px, 0) rotateZ(-4deg) scale(1);
          }
          50% {
            transform: translate3d(64px, -7px, 0) rotateZ(-3deg) scale(1.01);
          }
        }

        @keyframes wave {
          0%, 38% {
            opacity: 0;
            transform: translate3d(-4px, 0, 0) scaleX(.55);
          }
          46% {
            opacity: .85;
            transform: translate3d(0, 0, 0) scaleX(1);
          }
          55% {
            opacity: 0;
            transform: translate3d(8px, 0, 0) scaleX(1.18);
          }
          100% {
            opacity: 0;
            transform: translate3d(8px, 0, 0) scaleX(1.18);
          }
        }

        @keyframes wave-second {
          0%, 44% {
            opacity: 0;
            transform: translate3d(-4px, 0, 0) scaleX(.55);
          }
          52% {
            opacity: .55;
            transform: translate3d(0, 0, 0) scaleX(1);
          }
          61% {
            opacity: 0;
            transform: translate3d(8px, 0, 0) scaleX(1.18);
          }
          100% {
            opacity: 0;
            transform: translate3d(8px, 0, 0) scaleX(1.18);
          }
        }

        @keyframes idle-screen {
          0%, 43% { opacity: 1; transform: translateY(0); }
          48%, 100% { opacity: 0; transform: translateY(-5px); }
        }

        @keyframes detected-screen {
          0%, 43% { opacity: 0; transform: translateY(5px); }
          47%, 58% { opacity: 1; transform: translateY(0); }
          64%, 100% { opacity: 0; transform: translateY(-5px); }
        }

        @keyframes result-screen {
          0%, 57% { opacity: 0; transform: translateY(7px) scale(.98); }
          64%, 100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes check-pop {
          0%, 62% { opacity: 0; transform: scale(.65); }
          69% { opacity: 1; transform: scale(1.08); }
          74%, 100% { opacity: 1; transform: scale(1); }
        }

        @keyframes shadow-follow {
          0%, 100% {
            opacity: .22;
            transform: translate3d(48px, 100px, 0) scale(.9);
          }
          48%, 61% {
            opacity: .38;
            transform: translate3d(5px, 100px, 0) scale(1.05);
          }
        }

        @keyframes label-cycle {
          0%, 43% { opacity: 1; transform: translateY(0); }
          48%, 100% { opacity: 0; transform: translateY(-4px); }
        }

        @keyframes label-result {
          0%, 61% { opacity: 0; transform: translateY(4px); }
          67%, 100% { opacity: 1; transform: translateY(0); }
        }

        .nfc-demo-visible .nfc-tag {
          animation: tag-enter .9s cubic-bezier(.22, 1, .36, 1) both;
        }

        .nfc-demo-visible .nfc-phone {
          animation: phone-tap 6s cubic-bezier(.45, 0, .2, 1) .25s infinite;
        }

        .nfc-demo-visible .nfc-wave {
          animation: wave 6s ease-out .25s infinite;
        }

        .nfc-demo-visible .nfc-wave:nth-child(2) {
          animation-name: wave-second;
        }

        .nfc-demo-visible .nfc-shadow {
          animation: shadow-follow 6s ease-in-out .25s infinite;
        }

        .nfc-demo-visible .nfc-screen-idle {
          animation: idle-screen 6s linear .25s infinite;
        }

        .nfc-demo-visible .nfc-screen-detected {
          animation: detected-screen 6s linear .25s infinite;
        }

        .nfc-demo-visible .nfc-screen-result {
          animation: result-screen 6s linear .25s infinite;
        }

        .nfc-demo-visible .nfc-check {
          animation: check-pop 6s ease-out .25s infinite;
        }

        .nfc-demo-visible .nfc-label-idle {
          animation: label-cycle 6s linear .25s infinite;
        }

        .nfc-demo-visible .nfc-label-result {
          animation: label-result 6s linear .25s infinite;
        }

        .nfc-demo-active .nfc-tag {
          filter: brightness(1.08);
        }

        .nfc-demo-active .nfc-phone {
          filter: brightness(1.06) drop-shadow(0 26px 35px rgba(0,0,0,.55));
        }

        .nfc-demo-active .nfc-wave {
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .nfc-demo-visible .nfc-tag,
          .nfc-demo-visible .nfc-phone,
          .nfc-demo-visible .nfc-wave,
          .nfc-demo-visible .nfc-shadow,
          .nfc-demo-visible .nfc-screen-idle,
          .nfc-demo-visible .nfc-screen-detected,
          .nfc-demo-visible .nfc-screen-result,
          .nfc-demo-visible .nfc-check,
          .nfc-demo-visible .nfc-label-idle,
          .nfc-demo-visible .nfc-label-result {
            animation: none !important;
          }

          .nfc-demo-visible .nfc-tag {
            opacity: 1;
            transform: translate3d(-120px, 58px, 0) rotateX(10deg) rotateZ(-4deg);
          }

          .nfc-demo-visible .nfc-phone {
            opacity: 1;
            transform: translate3d(68px, -2px, 0) rotateZ(-4deg);
          }

          .nfc-demo-visible .nfc-screen-idle,
          .nfc-demo-visible .nfc-screen-detected {
            opacity: 0;
          }

          .nfc-demo-visible .nfc-screen-result,
          .nfc-demo-visible .nfc-label-result {
            opacity: 1;
          }

          .nfc-demo-visible .nfc-check {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 767px) {
          @keyframes tag-enter {
            from {
              opacity: 0;
              transform: translate3d(-10px, 16px, 0) rotateX(10deg) rotateZ(-4deg);
            }
            to {
              opacity: 1;
              transform: translate3d(-88px, 58px, 0) rotateX(10deg) rotateZ(-4deg);
            }
          }

          @keyframes phone-tap {
            0% {
              opacity: 0;
              transform: translate3d(105px, -72px, 0) rotateZ(11deg) scale(.92);
            }
            18% {
              opacity: 1;
              transform: translate3d(98px, -66px, 0) rotateZ(9deg) scale(.95);
            }
            48%, 61% {
              transform: translate3d(48px, 2px, 0) rotateZ(-4deg) scale(.94);
            }
            72% {
              transform: translate3d(55px, 8px, 0) rotateZ(-5deg) scale(.93);
            }
            100% {
              opacity: 1;
              transform: translate3d(105px, -72px, 0) rotateZ(11deg) scale(.92);
            }
          }
        }
      `}</style>

      <div className="nfc-stage absolute inset-0">
        <div className="absolute inset-0 rounded-full bg-primary/[0.045] blur-3xl" />

        <div className="nfc-shadow absolute left-1/2 top-1/2 h-10 w-44 -translate-x-1/2 rounded-full bg-black/60 blur-2xl" />

        <div className="nfc-tag absolute left-1/2 top-1/2 z-10 h-[150px] w-[205px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] border border-white/15 bg-zinc-950 shadow-[0_28px_70px_-25px_rgba(0,0,0,.9)] md:h-[175px] md:w-[240px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,.14),transparent_30%),linear-gradient(145deg,rgba(255,255,255,.08),transparent_48%,rgba(0,0,0,.72))]" />
          <div className="absolute inset-[1px] rounded-[23px] border border-white/[.04]" />

          <div className="relative flex h-full items-center gap-5 px-6 md:gap-7 md:px-8">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] border border-primary/30 bg-primary/[.08] shadow-[inset_0_0_30px_rgba(124,58,237,.08)] md:h-24 md:w-24">
              <Radio className="h-9 w-9 text-primary md:h-11 md:w-11" strokeWidth={1.5} />
              <span className="absolute inset-2 rounded-[17px] border border-primary/20" />
              <span className="absolute -inset-2 rounded-[26px] border border-primary/10" />
            </div>

            <div className="min-w-0">
              <div className="text-[7px] font-black uppercase tracking-[.3em] text-white/45 md:text-[8px]">
                Avalia Prudente
              </div>
              <div className="mt-2 text-sm font-semibold text-white md:text-base">
                Aproxime para avaliar
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[8px] font-medium text-white/35 md:text-[9px]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(124,58,237,.8)]" />
                NFC
              </div>
            </div>
          </div>
        </div>

        <div className="nfc-phone absolute left-1/2 top-1/2 z-20 h-[276px] w-[142px] -translate-x-1/2 -translate-y-1/2 rounded-[35px] border-[6px] border-zinc-800 bg-zinc-950 shadow-[0_35px_75px_-18px_rgba(0,0,0,.95)] ring-1 ring-white/10 md:h-[335px] md:w-[172px] md:rounded-[43px]">
          <div className="absolute left-1/2 top-0 z-30 h-5 w-16 -translate-x-1/2 rounded-b-2xl bg-zinc-800 md:h-6 md:w-20" />

          <div className="absolute inset-0 overflow-hidden rounded-[29px] bg-zinc-950 md:rounded-[36px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_8%,rgba(139,92,246,.22),transparent_32%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.08),transparent_22%,transparent_76%,rgba(255,255,255,.03))]" />

            <div className="nfc-screen-idle absolute inset-0 px-4 pb-5 pt-12 md:px-5 md:pb-6 md:pt-14">
              <div className="flex h-full flex-col">
                <div className="text-center text-[7px] font-semibold text-white/35 md:text-[8px]">
                  14:32
                </div>
                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.04] p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
                      <Radio className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 w-16 rounded-full bg-white/75" />
                      <div className="mt-1.5 h-1.5 w-10 rounded-full bg-white/15" />
                    </div>
                  </div>
                  <div className="mt-5 h-1.5 w-20 rounded-full bg-white/10" />
                  <div className="mt-2 h-1.5 w-14 rounded-full bg-white/10" />
                </div>
                <div className="mt-auto text-center text-[7px] font-semibold uppercase tracking-[.18em] text-white/30">
                  Aproxime para começar
                </div>
              </div>
            </div>

            <div className="nfc-screen-detected absolute inset-0 px-4 pb-5 pt-12 md:px-5 md:pb-6 md:pt-14">
              <div className="flex h-full flex-col justify-center">
                <div className="rounded-2xl border border-primary/25 bg-primary/[.08] p-3 shadow-[0_0_30px_rgba(124,58,237,.12)] md:p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <Radio className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-white md:text-[9px]">
                        Tag detectada
                      </div>
                      <div className="mt-1 text-[6px] text-white/40 md:text-[7px]">
                        Abrindo sua página de avaliação...
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/3 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="nfc-screen-result absolute inset-0 px-4 pb-5 pt-12 md:px-5 md:pb-6 md:pt-14">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  </div>
                  <div>
                    <div className="h-1.5 w-14 rounded-full bg-white/80" />
                    <div className="mt-1 h-1 w-9 rounded-full bg-white/15" />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-3 md:p-4">
                  <div className="text-[7px] font-semibold text-white/50 md:text-[8px]">
                    Como foi sua experiência?
                  </div>
                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-3 w-3 fill-primary text-primary md:h-3.5 md:w-3.5"
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex h-8 items-center justify-center gap-1.5 rounded-xl bg-primary text-[7px] font-bold text-white md:h-9 md:text-[8px]">
                    <ExternalLink className="h-3 w-3" />
                    Avaliar agora
                  </div>
                </div>

                <div className="nfc-check mt-auto flex items-center justify-center gap-1.5 text-[7px] font-bold uppercase tracking-[.15em] text-primary/80">
                  <Check className="h-3 w-3" />
                  Página aberta
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
          <span className="nfc-wave h-8 w-12 rounded-full border-y border-primary/70 blur-[.2px]" />
          <span className="nfc-wave h-12 w-16 rounded-full border-y border-primary/35 blur-[.2px]" />
        </div>

        <div className="nfc-label-idle absolute bottom-4 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-background/75 px-4 py-2 text-[8px] font-bold uppercase tracking-[.2em] text-muted-foreground shadow-lg backdrop-blur-md md:text-[9px]">
          1. Aproxime o celular
        </div>

        <div className="nfc-label-result absolute bottom-4 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/20 bg-primary/[.08] px-4 py-2 text-[8px] font-bold uppercase tracking-[.2em] text-primary shadow-lg backdrop-blur-md md:text-[9px]">
          2. Sua página abre na hora
        </div>
      </div>
    </div>
  )
}
