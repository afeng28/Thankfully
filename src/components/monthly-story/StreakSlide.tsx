import { motion } from 'motion/react';

interface StreakSlideProps {
  displayStreak: number;
  isCurrentStreak: boolean;
  currentStreak: number;
  longestStreak: number;
}

export function StreakSlide({ displayStreak, isCurrentStreak, currentStreak, longestStreak }: StreakSlideProps) {
  const getMilestoneMessage = (streak: number) => {
    if (streak >= 30) return "Legendary dedication!";
    if (streak >= 21) return "Habit mastery unlocked!";
    if (streak >= 14) return "Two weeks of gratitude!";
    if (streak >= 7) return "One week strong!";
    if (streak >= 3) return "Building momentum!";
    return "Great start!";
  };

  return (
    <motion.div
      key="streak"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-4xl md:text-5xl text-[#e8d4e8] mb-4 font-bold">
          {isCurrentStreak ? "Current Streak" : "Longest Streak"}
        </h2>
        <p className="text-xl text-[#a8b5d4]">
          {isCurrentStreak ? "Keep it going!" : "Your best run this month"}
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
        className="relative mb-8"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-9xl mb-4"
          >
            🔥
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="absolute -top-4 -right-4 bg-[#d4a5d4] text-[#1a1d2e] rounded-full w-20 h-20 flex items-center justify-center font-bold text-3xl shadow-2xl"
          >
            {displayStreak}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-7xl md:text-8xl text-[#d4a5d4] font-bold mb-6"
      >
        {displayStreak} {displayStreak === 1 ? 'Day' : 'Days'}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-br from-[#2d3250] to-[#3d4260] rounded-3xl p-8 mb-6"
      >
        <p className="text-2xl text-[#e8d4e8] font-semibold mb-4">
          {getMilestoneMessage(displayStreak)}
        </p>

        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-3xl text-[#a8b5d4] font-bold">{currentStreak}</div>
            <div className="text-sm text-[#6b7099] mt-1">Current</div>
          </div>
          <div className="w-px bg-[#3d4260]" />
          <div className="text-center">
            <div className="text-3xl text-[#d4a5d4] font-bold">{longestStreak}</div>
            <div className="text-sm text-[#6b7099] mt-1">Longest</div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-[#a8b5d4] text-lg"
      >
        {isCurrentStreak
          ? "You're on fire! Keep logging to extend your streak."
          : "Amazing consistency! Start a new streak today."}
      </motion.p>

      {displayStreak >= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, type: "spring" }}
          className="mt-8 inline-block bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] text-[#1a1d2e] px-8 py-4 rounded-full font-bold text-xl"
        >
          🏆 Streak Champion
        </motion.div>
      )}
    </motion.div>
  );
}
