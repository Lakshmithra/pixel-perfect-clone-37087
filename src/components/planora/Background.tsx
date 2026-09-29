import { motion } from "framer-motion";
import { useMemo } from "react";

const SPARK_COUNT = 26;

export function Background() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARK_COUNT }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        size: 2 + (i % 4),
        delay: (i % 9) * 0.6,
        duration: 4 + (i % 5),
      })),
    [],
  );

  const clouds = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        top: 8 + i * 18,
        scale: 0.7 + i * 0.25,
        duration: 60 + i * 22,
        delay: i * -14,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-top via-background to-sky-bottom opacity-80" />
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="absolute h-24 w-64 rounded-full bg-primary/10 blur-3xl"
          style={{ top: `${c.top}%`, scale: c.scale }}
          initial={{ x: "-30vw" }}
          animate={{ x: "110vw" }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-gold"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0, 1, 0], y: [0, -24, -48], scale: [0.6, 1.2, 0.5] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-rose/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-magic/20 blur-3xl" />
    </div>
  );
}
