import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Send, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/planora/Shell";
import { GlassCard, QuestButton, SectionTitle, Spinner } from "@/components/planora/ui";
import { usePlanora } from "@/lib/planora/store";
import { callAI } from "@/lib/planora/ai";
import type { ChatMessage } from "@/lib/planora/types";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "Wizard tutor — Planora" },
      {
        name: "description",
        content:
          "A friendly wizard tutor explains any topic step by step, asks questions back, and finds the gaps when you teach it back.",
      },
      { property: "og:title", content: "Wizard tutor — Planora" },
      {
        property: "og:description",
        content: "Step-by-step explanations and a Teach me back mode that finds your gaps.",
      },
    ],
  }),
  component: Tutor,
});

function Tutor() {
  const { state } = usePlanora();
  const [mode, setMode] = useState<"explain" | "teach">("explain");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "wizard",
      text: "Greetings! I am Merlo, keeper of the Planora library. Name a topic and I will explain it in three clear turns — or switch to Teach me back and explain it to me instead.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text }]);
    setBusy(true);
    const prompt =
      mode === "teach"
        ? `Teach me back mode. The student explained: ${text}. Find the gaps.`
        : `Explain step by step for a ${state.course || "university"} student: ${text}`;
    const reply = await callAI(prompt);
    setMessages((m) => [...m, { id: `w${Date.now()}`, role: "wizard", text: reply }]);
    setBusy(false);
  }

  return (
    <Shell>
      <SectionTitle
        title="Merlo, the wizard tutor"
        subtitle="Ask for an explanation, or teach a topic back and let Merlo hunt the gaps."
      />

      <div className="mb-4 flex gap-2">
        <QuestButton variant={mode === "explain" ? "royal" : "ghost"} onClick={() => setMode("explain")}>
          <Wand2 className="h-4 w-4" /> Explain to me
        </QuestButton>
        <QuestButton variant={mode === "teach" ? "gold" : "ghost"} onClick={() => setMode("teach")}>
          <GraduationCap className="h-4 w-4" /> Teach me back
        </QuestButton>
      </div>

      <GlassCard className="flex h-[62vh] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
              >
                {m.role === "wizard" && (
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="glow-gold h-10 w-10 shrink-0 rounded-full bg-gold/25 p-2"
                  >
                    <Sparkles className="h-6 w-6 text-gold" />
                  </motion.div>
                )}
                <p
                  className={`max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm ${
                    m.role === "user"
                      ? "gradient-magic text-primary-foreground"
                      : "bg-secondary/50 text-foreground"
                  }`}
                >
                  {m.text}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && (
            <div className="pl-14">
              <Spinner label="Merlo consults the scrolls…" />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "teach"
                ? "Explain a topic in your own words…"
                : "Ask about a topic, e.g. SN1 vs SN2 reactions"
            }
            className="flex-1 rounded-full border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <QuestButton type="submit" disabled={busy || !input.trim()}>
            <Send className="h-4 w-4" /> Send
          </QuestButton>
        </form>
      </GlassCard>
    </Shell>
  );
}
