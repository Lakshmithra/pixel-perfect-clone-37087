import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Plus, Sparkles, Sun, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Background } from "@/components/planora/Background";
import { Wordmark } from "@/components/planora/Logo";
import { GlassCard, QuestButton } from "@/components/planora/ui";
import { SUBJECT_COLORS, usePlanora } from "@/lib/planora/store";
import { dateKey } from "@/lib/planora/plan";
import type { PeakType, Subject } from "@/lib/planora/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Begin your quest — Planora" },
      {
        name: "description",
        content:
          "Answer four quest steps and Planora builds your personal AI study plan and your own study kingdom.",
      },
      { property: "og:title", content: "Begin your quest — Planora" },
      {
        property: "og:description",
        content: "Four quest steps to your AI study plan and a castle that grows as you learn.",
      },
    ],
  }),
  component: Onboarding,
});

const QUIZ: { q: string; a: string; b: string }[] = [
  { q: "It's 6am. Your mind is…", a: "Already sharp and curious", b: "Deeply asleep, thank you" },
  {
    q: "Best time to face the hardest chapter?",
    a: "Early, before the world wakes",
    b: "Late, when it's quiet",
  },
  { q: "After dinner you feel…", a: "Winding down", b: "Suddenly brilliant" },
  {
    q: "Your ideal revision snack hour?",
    a: "Morning tea and notes",
    b: "Midnight cocoa and notes",
  },
  { q: "Alarms are…", a: "A friend I trust", b: "A villain I negotiate with" },
];

const STEPS = ["Your name", "Your subjects", "Your hours", "Your peak hours"];

function Onboarding() {
  const navigate = useNavigate();
  const { state, update, loading } = usePlanora();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [hours, setHours] = useState(5);
  const [subjects, setSubjects] = useState<Subject[]>(state.subjects);
  const [answers, setAnswers] = useState<(0 | 1 | null)[]>(Array(QUIZ.length).fill(null));

  useEffect(() => {
    if (!loading && state.onboarded) navigate({ to: "/planner" });
  }, [loading, state.onboarded, navigate]);

  const sunriseScore = answers.filter((a) => a === 0).length;
  const peakType: PeakType = sunriseScore >= 3 ? "sunrise" : "moonlight";

  const canNext =
    step === 0
      ? name.trim().length > 0
      : step === 1
        ? subjects.length > 0 && subjects.every((s) => s.name.trim() && s.examDate)
        : step === 2
          ? hours > 0
          : answers.every((a) => a !== null);

  function finish() {
    update({
      onboarded: true,
      name: name.trim(),
      course: course.trim(),
      dailyHours: hours,
      peakType,
      subjects,
    });
    navigate({ to: "/planner" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <Background />
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Wordmark size={44} />
          <p className="text-sm text-muted-foreground">
            A study kingdom that grows with every hour you learn.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? "w-12 bg-gold glow-gold" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        <GlassCard className="overflow-hidden">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Quest step {step + 1} of 4
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-extrabold">
                    Who approaches the gates?
                  </h2>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-input bg-background/60 px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Your course (e.g. BSc Biotechnology)"
                    className="w-full rounded-2xl border border-input bg-background/60 px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-extrabold">Name your towers</h2>
                  <p className="text-sm text-muted-foreground">
                    Each subject becomes a tower in your kingdom.
                  </p>
                  <div className="space-y-3">
                    {subjects.map((s, i) => (
                      <div key={s.id} className="glass rounded-2xl p-3">
                        <div className="flex gap-2">
                          <input
                            value={s.name}
                            onChange={(e) =>
                              setSubjects((p) =>
                                p.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)),
                              )
                            }
                            placeholder="Subject"
                            className="flex-1 rounded-xl border border-input bg-background/60 px-3 py-2 text-sm outline-none"
                          />
                          <input
                            type="date"
                            value={s.examDate}
                            onChange={(e) =>
                              setSubjects((p) =>
                                p.map((x) =>
                                  x.id === s.id ? { ...x, examDate: e.target.value } : x,
                                ),
                              )
                            }
                            className="rounded-xl border border-input bg-background/60 px-3 py-2 text-sm outline-none"
                          />
                          <button
                            onClick={() => setSubjects((p) => p.filter((x) => x.id !== s.id))}
                            aria-label={`Remove ${s.name}`}
                            className="rounded-xl px-2 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {(["difficulty", "confidence"] as const).map((field) => (
                            <label key={field} className="text-xs font-semibold capitalize">
                              {field}: {s[field]}/5
                              <input
                                type="range"
                                min={1}
                                max={5}
                                value={s[field]}
                                onChange={(e) =>
                                  setSubjects((p) =>
                                    p.map((x) =>
                                      x.id === s.id ? { ...x, [field]: Number(e.target.value) } : x,
                                    ),
                                  )
                                }
                                className="mt-1 w-full accent-[var(--primary)]"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <QuestButton
                    variant="ghost"
                    onClick={() =>
                      setSubjects((p) => [
                        ...p,
                        {
                          id: `s${Date.now()}`,
                          name: "",
                          examDate: dateKey(14),
                          difficulty: 3,
                          confidence: 3,
                          colorVar: SUBJECT_COLORS[p.length % SUBJECT_COLORS.length]!,
                        },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4" /> Add subject
                  </QuestButton>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-extrabold">
                    How many hours can you ride?
                  </h2>
                  <p className="font-display text-5xl font-extrabold text-glow">{hours}h</p>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll spread these across study blocks, breaks and free time each day.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-extrabold">
                    Sunrise Knight or Moonlight Wizard?
                  </h2>
                  {QUIZ.map((item, i) => (
                    <div key={item.q} className="glass rounded-2xl p-3">
                      <p className="mb-2 text-sm font-semibold">{item.q}</p>
                      <div className="flex flex-wrap gap-2">
                        {([item.a, item.b] as const).map((opt, idx) => (
                          <button
                            key={opt}
                            onClick={() =>
                              setAnswers((p) => p.map((a, j) => (j === i ? (idx as 0 | 1) : a)))
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              answers[i] === idx
                                ? "gradient-magic text-primary-foreground"
                                : "border border-input hover:bg-accent/20"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {answers.every((a) => a !== null) && (
                    <p className="flex items-center gap-2 font-display text-lg font-bold text-glow">
                      {peakType === "sunrise" ? (
                        <Sun className="h-5 w-5 text-gold" />
                      ) : (
                        <Moon className="h-5 w-5 text-gold" />
                      )}
                      You are a {peakType === "sunrise" ? "Sunrise Knight" : "Moonlight Wizard"} —
                      peak hours {peakType === "sunrise" ? "6am–11am" : "6pm–11pm"}.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between gap-3">
            <QuestButton
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </QuestButton>
            <QuestButton
              variant={step === 3 ? "gold" : "royal"}
              disabled={!canNext}
              onClick={() => (step === 3 ? finish() : setStep((s) => s + 1))}
            >
              {step === 3 ? (
                <>
                  <Sparkles className="h-4 w-4" /> Enter my kingdom
                </>
              ) : (
                "Continue"
              )}
            </QuestButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
