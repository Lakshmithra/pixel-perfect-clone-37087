import type { Block, Energy, PeakType, Subject } from "./types";

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function dateKey(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(dateStr: string) {
  const ms =
    new Date(dateStr + "T00:00:00").getTime() - new Date(todayKey() + "T00:00:00").getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

export function priorityOf(s: Subject) {
  const proximity = 1 / (daysUntil(s.examDate) + 3);
  return proximity * 120 * s.difficulty * (6 - s.confidence);
}

export function peakWindow(peak: PeakType): [number, number] {
  return peak === "sunrise" ? [6, 11] : [18, 23];
}

export function formatHour(h: number) {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(min).padStart(2, "0")} ${suffix}`;
}

const energyFactor: Record<Energy, number> = { low: 0.6, medium: 1, high: 1.3 };

export function generatePlan(opts: {
  subjects: Subject[];
  dailyHours: number;
  peakType: PeakType;
  energy: Energy;
  restDay: boolean;
}): Block[] {
  const { subjects, dailyHours, peakType, energy, restDay } = opts;
  const [peakStart, peakEnd] = peakWindow(peakType);
  const blocks: Block[] = [];
  let id = 0;
  const add = (b: Omit<Block, "id">) => blocks.push({ ...b, id: `b${id++}` });

  const sleepStart = peakType === "sunrise" ? 22 : 24.5;
  add({
    start: sleepStart,
    end: sleepStart + 7.5,
    kind: "sleep",
    label: "Sleep window",
    reason: `${peakType === "sunrise" ? "Sunrise Knights" : "Moonlight Wizards"} recover best with a fixed 7.5h window, so tomorrow's peak hours stay sharp.`,
  });

  if (restDay || subjects.length === 0) {
    add({
      start: peakStart,
      end: peakStart + 1,
      kind: "study",
      ...(subjects[0] ? { subjectId: subjects[0].id } : {}),
      label: subjects[0] ? `Light review — ${subjects[0].name}` : "Light review",
      reason: "A single gentle block on the nearest exam keeps momentum without spending energy.",
    });
    add({
      start: peakStart + 1,
      end: peakStart + 1.5,
      kind: "break",
      label: "Long walk",
      reason: "Movement clears fog faster than more reading on a rest day.",
    });
    add({
      start: 14,
      end: 18,
      kind: "free",
      label: "Free kingdom time",
      reason: "Protected rest today means no debt is added to exam-week plans.",
    });
    return blocks.sort((a, b) => a.start - b.start);
  }

  const ranked = [...subjects].sort((a, b) => priorityOf(b) - priorityOf(a));
  const totalHours = Math.max(1, Math.min(12, dailyHours * energyFactor[energy]));
  const blockLen = energy === "low" ? 0.75 : energy === "high" ? 1.25 : 1;
  const count = Math.max(1, Math.round(totalHours / blockLen));

  let cursor = peakStart;
  for (let i = 0; i < count; i++) {
    const subject = ranked[i % ranked.length]!;
    const inPeak = cursor >= peakStart && cursor + blockLen <= peakEnd;
    if (cursor >= sleepStart - 1) break;
    add({
      start: cursor,
      end: cursor + blockLen,
      kind: "study",
      subjectId: subject.id,
      label: subject.name,
      reason: `Exam in ${daysUntil(subject.examDate)} days, difficulty ${subject.difficulty}/5, confidence ${subject.confidence}/5 → ${
        inPeak
          ? "placed inside your peak hours so the hardest thinking lands when you are sharpest."
          : "placed outside peak hours because lighter recall work survives lower energy."
      }`,
    });
    cursor += blockLen;
    const breakLen = energy === "high" ? 0.25 : 0.5;
    if (i < count - 1) {
      add({
        start: cursor,
        end: cursor + breakLen,
        kind: "break",
        label: breakLen >= 0.5 ? "Break — water & stretch" : "Quick breath",
        reason: "Short recovery after focus keeps the next block from decaying into re-reading.",
      });
      cursor += breakLen;
    }
    if (cursor > peakEnd && cursor < 14) cursor = Math.max(cursor, 14);
  }

  add({
    start: Math.min(cursor + 0.5, sleepStart - 1.5),
    end: sleepStart,
    kind: "free",
    label: "Free time",
    reason: "An unclaimed evening protects motivation, which is the resource exams drain first.",
  });

  return blocks.sort((a, b) => a.start - b.start);
}
