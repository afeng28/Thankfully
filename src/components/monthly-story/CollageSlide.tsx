import { motion } from 'motion/react';
import { Calendar, Heart, TrendingUp, Flame } from 'lucide-react';
import { Button } from '../ui/button';

interface CollageSlideProps {
  monthName: string;
  daysLogged: number;
  displayStreak: number;
  stickerCount: number;
  themesCount: number;
  peopleCount: number;
  topThemes: string[];
  onClose: () => void;
}

export function CollageSlide({
  monthName,
  daysLogged,
  displayStreak,
  stickerCount,
  themesCount,
  peopleCount,
  topThemes,
  onClose
}: CollageSlideProps) {
  return (
    <motion.div
      key="collage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl md:text-5xl text-[#e8d4e8] mb-2 font-bold">
          {monthName} Wrapped
        </h2>
        <p className="text-xl text-[#a8b5d4]">
          Your month in gratitude
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#a8b5d4] to-[#c4a8d4] rounded-3xl p-6 flex flex-col items-center justify-center text-center"
        >
          <Calendar className="w-8 h-8 text-[#1a1d2e] mb-2" />
          <div className="text-4xl font-bold text-[#1a1d2e] mb-1">{daysLogged}</div>
          <div className="text-sm text-[#1a1d2e]">Days Logged</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#d4a5d4] to-[#a8b5d4] rounded-3xl p-6 flex flex-col items-center justify-center text-center"
        >
          <Flame className="w-8 h-8 text-[#1a1d2e] mb-2" />
          <div className="text-4xl font-bold text-[#1a1d2e] mb-1">{displayStreak}</div>
          <div className="text-sm text-[#1a1d2e]">Day Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#c4a8d4] to-[#d4a5d4] rounded-3xl p-6 flex flex-col items-center justify-center text-center"
        >
          <Heart className="w-8 h-8 text-[#1a1d2e] mb-2 fill-current" />
          <div className="text-4xl font-bold text-[#1a1d2e] mb-1">{stickerCount}</div>
          <div className="text-sm text-[#1a1d2e]">Thank Yous</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#a8b5d4] to-[#d4a5d4] rounded-3xl p-6 flex flex-col items-center justify-center text-center"
        >
          <TrendingUp className="w-8 h-8 text-[#1a1d2e] mb-2" />
          <div className="text-4xl font-bold text-[#1a1d2e] mb-1">{themesCount}</div>
          <div className="text-sm text-[#1a1d2e]">Themes</div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-[#2d3250] to-[#3d4260] rounded-3xl p-8 mb-6"
      >
        <h3 className="text-xl text-[#e8d4e8] mb-4 text-center">Top Gratitude Themes</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {topThemes.map((theme, index) => (
            <motion.div
              key={theme}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
              className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] text-[#1a1d2e] px-5 py-2 rounded-full capitalize font-semibold"
            >
              {theme}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] rounded-3xl p-8 text-center relative overflow-hidden"
      >
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-4 right-4 text-6xl opacity-20"
        >
          🦦
        </motion.div>

        <div className="relative z-10">
          <p className="text-3xl font-bold text-[#1a1d2e] mb-2">
            You're Amazing! ✨
          </p>
          <p className="text-lg text-[#1a1d2e]">
            You celebrated {peopleCount} special {peopleCount === 1 ? 'person' : 'people'} and found joy in {themesCount} different ways
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-center"
      >
        <Button
          onClick={onClose}
          className="bg-[#2d3250] hover:bg-[#3d4260] text-[#e8d4e8] rounded-full px-12 py-6 text-lg font-semibold"
          size="lg"
        >
          Back to Insights
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, type: "spring" }}
        className="fixed bottom-8 right-8 text-7xl"
      >
        🦦
      </motion.div>
    </motion.div>
  );
}
