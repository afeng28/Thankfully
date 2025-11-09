import { motion } from 'motion/react';

interface OpeningSlideProps {
  monthName: string;
}

export function OpeningSlide({ monthName }: OpeningSlideProps) {
  return (
    <motion.div
      key="opening"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
        className="text-8xl mb-8"
      >
        🦦
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-5xl md:text-6xl text-[#e8d4e8] mb-4 font-bold"
      >
        Your {monthName}
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-3xl md:text-4xl text-[#d4a5d4] mb-8"
      >
        Gratitude Wrapped
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xl text-[#a8b5d4] mb-12"
      >
        Let's celebrate your journey of gratitude this month
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-[#6b7099] text-sm"
      >
        <p className="flex items-center justify-center gap-2">
          <span>Click</span>
          <span className="text-2xl">→</span>
          <span>to enter</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#a8b5d4]"
              animate={{ y: [0, -10, 0] }}
              transition={{ delay: i * 0.2, duration: 1.5, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
