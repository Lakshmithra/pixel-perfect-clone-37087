# 📚 Planora: AI-Powered Study Planner

> Plan smart. Stay focused. Watch your progress grow.

Planora is a web app prototype that creates personalized study schedules from a student's **exam dates, subjects, and available time**, and keeps them motivated with streaks, rewards, and a castle that grows as they study.

Built for **Kanal Hackathon** at **PSG College of Technology** | Problem Statement: *AI-Powered Study Planner*

---

## 🎯 The Problem

Students juggling multiple exams struggle to decide what to study first, stay focused, and stay consistent. Most planners are plain timetables that ignore how different students actually work.

## ✨ Our Solution

Planora plans around **who the student is** (morning or night person), **how they feel** (energy level), and **what's urgent** (exam proximity, difficulty, and confidence), then makes consistency rewarding through a game-like experience.

---

## 🚀 Features

### 📝 Onboarding
A short 4-step setup: name and course, subjects with exam dates, difficulty and confidence, daily study hours, and a 5-question **morning person or night person** quiz.

### 🗓️ Smart Planner
- AI-generated **day-by-day schedule** with study blocks, breaks, free time, and a sleep window
- Subjects are prioritized by **exam proximity × difficulty × low confidence**
- Hard subjects are placed in the student's **peak hours**
- Weekly view with **drag-and-drop** editing
- **"Explain my plan"**: short cause-and-effect reasons for each block
- **"Take a day off"**: automatically re-plans the remaining days
- **Energy selector** (low / medium / high): lightens or intensifies the plan

### 🎯 Focus Mode
- Pomodoro timer
- **Distraction locker**: a full-screen mode that warns and counts every tab switch
- Completing a session earns XP and adds a block to the castle

### 🤖 AI Helper
- **AI Tutor**: explains topics step by step and asks questions back
- **Notes Summarizer**: returns a summary, key points, and likely exam questions

### 🏆 Rewards
- A **castle that grows** by one block for every completed session
- Streak counter with a flame icon

### 📊 Dashboard
Charts for hours per subject, weekly consistency, distractions, and exam readiness per subject.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Storage | Browser localStorage |
| Built with | Lovable (AI app builder) |

---

## 🤖 Built with AI

This project was created for a hackathon focused on **AI prompting**. The whole app was generated from a single structured prompt that our team designed and refined:

1. We brainstormed features as a team and grouped them by theme.
2. We narrowed them to the features that best answer the problem statement.
3. We wrote one detailed prompt covering design, rules, and each page, and tuned it to fit the AI builder's limits.

---

## ⚠️ Prototype Notice

Planora is a **working prototype**, not a finished product:
- AI responses (tutor, explanations, summaries) are **simulated**, with a marked place to plug in a real AI API
- Data is saved **only in the browser** (no login or database)
- The app is pre-filled with sample data so every page looks complete on first open

---

## 💻 Run Locally

```bash
git clone https://github.com/[your-username]/[repo-name].git
cd [repo-name]
npm install
npm run dev
```

Open the local address shown in the terminal (usually `http://localhost:5173`).

---

## 🔮 Future Scope

- Connect a real AI model for live scheduling and tutoring
- Google Calendar sync
- Login and cloud data storage
- Subject-based castle towers and richer animations
- Wellness tracking (sleep, water, mood)
- Study groups and shared progress with friends

---

**Team Name:** [Cosmo four] | **College:** PSG College of Technology, Coimbatore
