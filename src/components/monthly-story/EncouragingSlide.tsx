import { motion } from 'motion/react';

interface EncouragingSlideProps {
  daysLogged: number;
  displayStreak: number;
  themesCount: number;
  peopleCount: number;
}

export function EncouragingSlide({
  daysLogged,
  displayStreak,
  themesCount,
  peopleCount
}: EncouragingSlideProps) {
  const generateMessage = () => {
    const messages = [];

    if (daysLogged >= 20) {
      messages.push("Your dedication to gratitude this month has been extraordinary!");
    } else if (daysLogged >= 10) {
      messages.push("You've shown wonderful commitment to your gratitude practice!");
    } else if (daysLogged >= 5) {
      messages.push("You're building a beautiful gratitude habit!");
    } else {
      messages.push("Every moment of gratitude counts!");
    }

    if (displayStreak >= 7) {
      messages.push(`Maintaining a ${displayStreak}-day streak shows true dedication.`);
    }

    if (themesCount > 5) {
      messages.push(`You've explored ${themesCount} different themes of gratitude.`);
    }

    if (peopleCount > 0) {
      messages.push(`You've recognized ${peopleCount} special ${peopleCount === 1 ? 'person' : 'people'} in your life.`);
    }

    messages.push("These aren't just numbers—they're moments of awareness, connection, and joy.");

    return messages;
  };

  const messages = generateMessage();

  return (
    <motion.div
      key="encouraging"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
        className="mb-8"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-9xl"
        >
          🦦
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl md:text-5xl text-[#e8d4e8] mb-8 font-bold"
      >
        You're Cultivating Something Extraordinary!
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-[#2d3250] to-[#3d4260] rounded-3xl p-8 md:p-12 mb-8"
      >
        <div className="space-y-6 text-[#e8d4e8] text-lg md:text-xl leading-relaxed">
          {messages.map((message, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.15 }}
            >
              {message}
            </motion.p>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 + messages.length * 0.15 }}
        className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] rounded-3xl p-8"
      >
        <p className="text-[#1a1d2e] text-2xl font-bold mb-2">
          Keep Shining! ✨
        </p>
        <p className="text-[#1a1d2e] text-lg">
          Your gratitude practice is making a real difference in your life
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 + messages.length * 0.15 + 0.3 }}
        className="mt-8"
      >
        <div className="inline-flex items-center gap-3 text-[#a8b5d4]">
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.1, type: "spring" }}
              className="text-3xl"
            >
              ⭐
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
