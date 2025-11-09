import { useEffect } from 'react';
import { motion } from 'motion/react';
import type { MainGoal } from './OnboardingFlow';

interface Question1ScreenProps {
  onSelect: (goal: MainGoal) => void;
}

const options: Array<{ value: MainGoal; label: string; icon: string }> = [
  {
    value: 'begin_journey',
    label: 'Want to begin gratefulness journey',
    icon: '🌱'
  },
  {
    value: 'improve_mood',
    label: 'Want to improve mood and emotional awareness',
    icon: '😊'
  },
  {
    value: 'capture_memories',
    label: 'Capture meaningful memories',
    icon: '📸'
  }
];

export function Question1Screen({ onSelect }: Question1ScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full max-w-2xl px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-4xl md:text-5xl text-[#e8d4e8] mb-4 font-bold">
          What is your main reason for starting Thankfully?
        </h2>
        <p className="text-lg text-[#a8b5d4]">
          Choose the one that resonates most with you
        </p>
      </motion.div>

      <div className="space-y-4">
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.value)}
            className="w-full bg-[#2d3250] hover:bg-[#3d4260] border-2 border-transparent hover:border-[#a8b5d4] rounded-3xl p-6 text-left transition-all group"
          >
            <div className="flex items-center gap-4">
              <motion.span
                className="text-5xl"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                {option.icon}
              </motion.span>
              <span className="text-xl text-[#e8d4e8] group-hover:text-[#c4a8d4] transition-colors flex-1">
                {option.label}
              </span>
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#6b7099] group-hover:text-[#a8b5d4] transition-colors"
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </motion.svg>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-[#2d3250] rounded-full px-6 py-3">
          <span className="text-3xl">🦦</span>
          <p className="text-[#a8b5d4] text-sm">
            Don't worry, you can change this later
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
