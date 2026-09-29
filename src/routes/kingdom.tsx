import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import { Shell } from "@/components/planora/Shell";
import { EmptyState, GlassCard, QuestButton, SectionTitle, Spinner } from "@/components/planora/ui";
import {
  missedRecently,
  readiness,
  streakOf,
  subjectMinutes,
  todayMinutes,
  usePlanora,
} from "@/lib/planora/store";
import { callAI } from "@/lib/planora/ai";

export const Route = createFileRoute("/kingdom")({
  head: () => ({
    meta: [
      { title: "Your kingdom — Planora" },
      {
        name: "description",
        content:
          "A living castle scene: towers rise with study hours, torches light with streaks, fog clears when you return, and a treasure chest rewards your daily goal.",
      },
      { property: "og:title", content: "Your kingdom — Planora" },
      {
        property: "og:description",
        content: "Watch your castle grow tower by tower as you study.",
      },
    ],
  }),
  component: Kingdom,
});

const REWARDS = [
  "Bonus break: 20 extra minutes, guilt-free.",
  "A motivational scroll from the royal library.",
  "A free-time slot tonight — the crown insists.",
  "Double bricks on your next focus session.",
];

function Kingdom() {
  const { state, addReward, isNight } = usePlanora();
  const streak = streakOf(state.sessions);
  const missed = missedRecently(state.sessions);
  const goalMinutes = state.dailyHours * 60;
  const today = todayMinutes(state.sessions);
  const goalMet = today >= goalMinutes * 0.6;
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState<string | null>(null);

  async function openChest() {
    setSpinning(true);
    setReward(null);
    const base = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    const quote = await callAI("Give me a short motivational quote reward for a study kingdom");
    const text = `${base} — "${quote}"`;
    setReward(text);
    addReward(text);
    setSpinning(false);
  }

  if (state.subjects.length === 0) {
    return (
      <Shell>
        <EmptyState title="An empty plain" hint="Add subjects and towers will start rising here." />
      </Shell>
    );
  }

  const maxHours = Math.max(
    1,
    ...state.subjects.map((s) => subjectMinutes(state.sessions, s.id) / 60),
  );

  return (
    <Shell>
      <SectionTitle
        title="The Kingdom"
        subtitle={`${streak} day streak · ${state.bricks} bricks · ${(today / 60).toFixed(1)}h studied today`}
      />

      <GlassCard className="overflow-hidden p-0">
        <div className="relative">
          <svg
            viewBox="0 0 800 420"
            className="h-[320px] w-full md:h-[460px]"
            role="img"
            aria-label="Your castle kingdom"
          >
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isNight ? "oklch(0.2 0.09 285)" : "oklch(0.86 0.1 250)"}
                />
                <stop
                  offset="100%"
                  stopColor={isNight ? "oklch(0.32 0.11 320)" : "oklch(0.93 0.08 350)"}
                />
              </linearGradient>
              <radialGradient id="glowWin">
                <stop offset="0%" stopColor="var(--gold)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            <rect width="800" height="420" fill="url(#sky)" />

            {/* moon or sun */}
            <motion.circle
              cx={isNight ? 660 : 130}
              cy="80"
              r="34"
              fill="var(--gold)"
              opacity={0.9}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ filter: "drop-shadow(0 0 26px var(--gold))" }}
            />

            {/* stars at night */}
            {isNight &&
              Array.from({ length: 30 }, (_, i) => (
                <motion.circle
                  key={i}
                  cx={(i * 97) % 800}
                  cy={(i * 41) % 200}
                  r={1 + (i % 2)}
                  fill="white"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
                />
              ))}

            {/* dragon for long streaks */}
            {streak >= 7 && (
              <motion.g
                initial={{ x: -180 }}
                animate={{ x: 900, y: [0, -18, 0] }}
                transition={{
                  x: { duration: 18, repeat: Infinity, ease: "linear" },
                  y: { duration: 3, repeat: Infinity },
                }}
              >
                <path
                  d="M0 110 q26-22 54-8 q16-26 40-18 q-10 14 2 24 q26 4 34 22 q-30 6-48 0 q-22 14-48 2 q-18 6-34-4z"
                  fill="var(--magic)"
                  opacity="0.9"
                />
              </motion.g>
            )}

            {/* ground */}
            <path
              d="M0 340 Q400 300 800 344 L800 420 L0 420Z"
              fill="var(--primary)"
              opacity="0.35"
            />

            {/* towers per subject */}
            {state.subjects.map((s, i) => {
              const hours = subjectMinutes(state.sessions, s.id) / 60;
              const h = 60 + (hours / maxHours) * 180;
              const w = 74;
              const gap = 800 / (state.subjects.length + 1);
              const x = gap * (i + 1) - w / 2;
              const y = 342 - h;
              const ready = readiness(state.sessions, s);
              const litWindows = Math.round((ready / 100) * 3);
              return (
                <motion.g
                  key={s.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                >
                  <motion.rect
                    x={x}
                    width={w}
                    rx="8"
                    fill={`var(${s.colorVar})`}
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                    initial={{ height: 0, y: 342 }}
                    animate={{ height: h, y }}
                    transition={{ type: "spring", stiffness: 60, damping: 14, delay: i * 0.12 }}
                  />
                  {/* battlements */}
                  {[0, 1, 2, 3].map((b) => (
                    <rect
                      key={b}
                      x={x + 4 + b * 17}
                      y={y - 12}
                      width="12"
                      height="14"
                      fill={`var(${s.colorVar})`}
                      stroke="var(--gold)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* flag for streaks */}
                  {streak >= 3 && (
                    <g>
                      <rect x={x + w / 2 - 1} y={y - 52} width="2" height="40" fill="var(--gold)" />
                      <motion.path
                        d={`M${x + w / 2 + 1} ${y - 50} l26 8 l-26 8z`}
                        fill="var(--gold)"
                        animate={{ scaleX: [1, 0.82, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        style={{ originX: `${x + w / 2}px` }}
                      />
                    </g>
                  )}
                  {/* windows */}
                  {[0, 1, 2].map((k) => {
                    const lit = k < litWindows;
                    const wy = y + 26 + k * Math.max(26, (h - 50) / 3);
                    if (wy > 342 - 18) return null;
                    return (
                      <g key={k}>
                        {lit && (
                          <circle
                            cx={x + w / 2}
                            cy={wy + 8}
                            r="20"
                            fill="url(#glowWin)"
                            opacity="0.7"
                          />
                        )}
                        <rect
                          x={x + w / 2 - 9}
                          y={wy}
                          width="18"
                          height="20"
                          rx="9"
                          fill={lit ? "var(--gold)" : "oklch(0.2 0.05 290)"}
                        />
                      </g>
                    );
                  })}
                  <text
                    x={x + w / 2}
                    y="366"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="var(--foreground)"
                  >
                    {s.name.length > 12 ? s.name.slice(0, 11) + "…" : s.name}
                  </text>
                  <text
                    x={x + w / 2}
                    y="382"
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--muted-foreground)"
                  >
                    {hours.toFixed(1)}h · {ready}% ready
                  </text>
                  {/* cracks when days were missed */}
                  {missed > 0 &&
                    Array.from({ length: Math.min(missed, 3) }, (_, c) => (
                      <path
                        key={c}
                        d={`M${x + 12 + c * 22} ${y + 30} l6 18 l-5 10 l7 14`}
                        stroke="oklch(0.25 0.03 290 / 60%)"
                        strokeWidth="2"
                        fill="none"
                      />
                    ))}
                </motion.g>
              );
            })}

            {/* torches for streak days */}
            {Array.from({ length: Math.min(streak, 8) }, (_, i) => (
              <motion.g
                key={i}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
              >
                <rect x={60 + i * 88} y="330" width="4" height="22" fill="var(--gold-foreground)" />
                <circle
                  cx={62 + i * 88}
                  cy="326"
                  r="7"
                  fill="var(--gold)"
                  style={{ filter: "drop-shadow(0 0 10px var(--gold))" }}
                />
              </motion.g>
            ))}

            {/* fog for missed days */}
            {missed > 0 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: Math.min(0.55, missed * 0.18) }}
              >
                <motion.ellipse
                  cx="400"
                  cy="330"
                  rx="460"
                  ry="70"
                  fill="white"
                  animate={{ cx: [360, 440, 360] }}
                  transition={{ duration: 16, repeat: Infinity }}
                />
              </motion.g>
            )}
          </svg>

          <div className="flex flex-wrap items-center gap-3 border-t border-border/60 p-4">
            <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
              <Flame className="h-4 w-4 text-gold" /> {Math.min(streak, 8)} torches lit
            </span>
            {missed > 0 && (
              <span className="rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-semibold">
                {missed} missed day{missed > 1 ? "s" : ""} brought fog — study today to clear it
              </span>
            )}
            {streak >= 7 && (
              <span className="rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-semibold">
                A dragon circles your keep 🐉
              </span>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <GlassCard delay={0.1}>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Gift className="h-5 w-5 text-gold" /> Treasure chest
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {goalMet
              ? "Today's goal is met — the chest is unlocked. Spin the lucky wheel!"
              : `Study ${Math.max(0, Math.round(goalMinutes * 0.6 - today))} more minutes today to unlock the chest.`}
          </p>
          <motion.div
            className="mx-auto my-5 w-fit"
            animate={goalMet ? { y: [0, -6, 0], rotate: [-2, 2, -2] } : {}}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <svg width="120" height="96" viewBox="0 0 120 96" aria-hidden>
              <rect
                x="10"
                y="40"
                width="100"
                height="46"
                rx="8"
                fill="var(--gold)"
                opacity={goalMet ? 1 : 0.4}
              />
              <path d="M10 44 q50-34 100 0z" fill="var(--primary)" opacity={goalMet ? 0.9 : 0.4} />
              <rect x="52" y="52" width="16" height="20" rx="4" fill="var(--gold-foreground)" />
            </svg>
          </motion.div>
          <QuestButton
            variant="gold"
            disabled={!goalMet || spinning}
            onClick={openChest}
            className="w-full"
          >
            <Sparkles className="h-4 w-4" /> Spin the lucky wheel
          </QuestButton>
          {spinning && (
            <div className="mt-3">
              <Spinner label="The wheel spins…" />
            </div>
          )}
          <AnimatePresence>
            {reward && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 rounded-2xl bg-secondary/50 p-3 text-sm font-semibold"
              >
                {reward}
              </motion.p>
            )}
          </AnimatePresence>
        </GlassCard>

        <GlassCard delay={0.15}>
          <h2 className="font-display text-xl font-bold">Royal rewards log</h2>
          {state.rewards.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No rewards claimed yet. Meet a daily goal and the chest will open.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {state.rewards.map((r, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3">
                  <span className="text-xs font-bold text-muted-foreground">{r.date}</span>
                  <p>{r.text}</p>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </Shell>
  );
}
