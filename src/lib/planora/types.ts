export type PeakType = "sunrise" | "moonlight";
export type Energy = "low" | "medium" | "high";

export interface Subject {
  id: string;
  name: string;
  examDate: string; // yyyy-mm-dd
  difficulty: number; // 1-5
  confidence: number; // 1-5
  colorVar: string; // css var token name, e.g. "--chart-1"
}

export interface StudySession {
  id: string;
  subjectId: string;
  minutes: number;
  date: string; // yyyy-mm-dd
  distractions?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "wizard";
  text: string;
}

export interface PlanoraState {
  onboarded: boolean;
  name: string;
  course: string;
  dailyHours: number;
  peakType: PeakType;
  subjects: Subject[];
  sessions: StudySession[];
  bricks: number;
  energy: Energy;
  restDays: string[];
  rewards: { date: string; text: string }[];
  theme: "auto" | "day" | "night";
}

export interface Block {
  id: string;
  start: number; // hour float
  end: number;
  kind: "study" | "break" | "free" | "sleep";
  subjectId?: string;
  label: string;
  reason: string;
}
