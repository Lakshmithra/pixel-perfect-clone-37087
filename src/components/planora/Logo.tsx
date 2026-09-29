import { motion } from "framer-motion";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      initial={{ rotate: -6, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 12 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="planora-castle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="60%" stopColor="var(--rose)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path
        d="M8 42V20l4-3 4 3v-5l4-3 4 3v-6l4-3 4 3v6l4-3 4 3v27z"
        fill="url(#planora-castle)"
        stroke="var(--gold)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect x="21" y="30" width="6" height="12" rx="3" fill="var(--gold)" opacity="0.85" />
      <motion.g
        animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        style={{ originX: "38px", originY: "10px" }}
      >
        <path d="M38 4l1.6 4.4L44 10l-4.4 1.6L38 16l-1.6-4.4L32 10l4.4-1.6z" fill="var(--gold)" />
      </motion.g>
    </motion.svg>
  );
}

export function Wordmark({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={size} />
      <span className="font-display text-2xl font-extrabold tracking-tight text-glow">Planora</span>
    </div>
  );
}
