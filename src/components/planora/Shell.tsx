import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarHeart, Castle, Moon, Sparkles, Sun, Timer, TrendingUp, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { Background } from "./Background";
import { Wordmark } from "./Logo";
import { usePlanora, streakOf } from "@/lib/planora/store";

const NAV = [
  { to: "/planner", label: "Planner", icon: CalendarHeart },
  { to: "/focus", label: "Focus", icon: Timer },
  { to: "/kingdom", label: "Kingdom", icon: Castle },
  { to: "/tutor", label: "Tutor", icon: Wand2 },
  { to: "/progress", label: "Progress", icon: TrendingUp },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { state, update, isNight } = usePlanora();
  const streak = streakOf(state.sessions);

  return (
    <div className="relative min-h-screen">
      <Background />
      <header className="sticky top-0 z-20 border-b border-border/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/planner" className="shrink-0">
            <Wordmark size={32} />
          </Link>
          <nav className="scrollbar-none order-3 -mx-1 flex w-full gap-1 overflow-x-auto md:order-2 md:mx-0 md:w-auto md:flex-1 md:justify-center">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent/20 hover:text-foreground"
                activeProps={{ className: "glass !text-foreground" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="order-2 ml-auto flex items-center gap-2 md:order-3">
            <span className="glass hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              {state.bricks} bricks · {streak}d streak
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => update({ theme: isNight ? "day" : "night" })}
              aria-label="Toggle day and night kingdom"
              className="glass rounded-full p-2.5"
            >
              {isNight ? <Moon className="h-4 w-4 text-gold" /> : <Sun className="h-4 w-4 text-gold" />}
            </motion.button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="mb-4 font-display text-sm text-muted-foreground">
          Your kingdom awaits, {state.name || "traveller"}.
        </p>
        {children}
      </main>
      <footer className="pb-10 text-center text-xs text-muted-foreground">
        Planora · a kingdom built one study brick at a time
      </footer>
    </div>
  );
}
