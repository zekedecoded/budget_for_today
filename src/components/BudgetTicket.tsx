import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicket,
  faCoins,
  faArrowRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { ScratchPanel } from "./ScratchPanel";
import { ConfettiBurst } from "./ConfettiBurst";
import { BarcodeStripe } from "./BarcodeStripe";

function formatTicketDate(d: Date): string {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `${days[d.getDay()]} · ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")} ${d.getFullYear()}`;
}
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}
function budgetForDate(d: Date): number {
  const key = dateKey(d);
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const buckets = 11; // 50,60,...,150
  const idx = (hash >>> 0) % buckets;
  return 50 + idx * 10;
}
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const REVEAL_DURATION_MS = 900;

type Phase = "idle" | "scratching" | "done";

export function BudgetTicket() {
  const [now] = useState(() => new Date());
  const amount = budgetForDate(now);
  const [phase, setPhase] = useState<Phase>("idle");
  const timer = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const scratch = useCallback(() => {
    if (phase !== "idle") return;
    audioRef.current?.play().catch(() => {});
    if (prefersReducedMotion()) {
      setPhase("done");
      return;
    }
    setPhase("scratching");
    timer.current = window.setTimeout(
      () => setPhase("done"),
      REVEAL_DURATION_MS,
    );
  }, [phase]);

  const scratchAgain = useCallback(() => {
    setPhase("idle");
  }, []);

  const ticketNumber = `${now.getFullYear()}-${String(dayOfYear(now)).padStart(3, "0")}`;

  return (
    <main className="stage-glow flex min-h-full w-full items-center justify-center px-4 py-8">
      <section
        className="relative w-full max-w-[340px]"
        aria-label="Today's budget challenge ticket"
      >
        <span className="ticket-hole ticket-hole-left" aria-hidden="true" />
        <span className="ticket-hole ticket-hole-right" aria-hidden="true" />

        <div className="ticket-grain rounded-2xl border-2 border-[var(--gold)] bg-[var(--ticket)] px-5 pb-6 pt-7 shadow-[0_20px_44px_-20px_rgba(0,0,0,0.55)]">
          <div
            className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <FontAwesomeIcon icon={faTicket} />
            Ticket No. {ticketNumber}
          </div>

          <div className="ticket-perf my-4 -mx-5" aria-hidden="true" />

          <header className="text-center">
            <h1
              className="text-[22px] leading-none tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              Budget for Today
            </h1>
            <p
              className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/70"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {formatTicketDate(now)}
            </p>
          </header>

          <p
            className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/60"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Today&apos;s Spending Challenge
          </p>

          <div className="relative mt-4">
            <ScratchPanel amount={amount} phase={phase} onScratch={scratch} />
            {phase === "done" && <ConfettiBurst />}
          </div>

          <div className="mt-3 flex justify-center">
            {phase === "done" ? (
              <button
                type="button"
                onClick={scratchAgain}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/60 transition-colors hover:text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ticket)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <FontAwesomeIcon icon={faArrowRotateRight} />
                Scratch again
              </button>
            ) : (
              <p
                className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink)]/50"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Tap the panel to scratch
              </p>
            )}
          </div>

          <div className="ticket-perf my-4 -mx-5" aria-hidden="true" />

          <p
            className="flex items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <FontAwesomeIcon icon={faCoins} />I HOPE MAKATIPID NA KAYO YEY!
          </p>

          <div className="mt-4">
            <BarcodeStripe seed={dateKey(now)} />
          </div>
        </div>

        <audio ref={audioRef} src="/sounds/reveal.mp3" preload="none" />
      </section>
    </main>
  );
}
