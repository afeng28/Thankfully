import { motion } from 'motion/react';
import type { ThemeBubble } from '../../lib/monthlyStoryData';

interface BubblesSlideProps {
  themeBubbles: ThemeBubble[];
}

export function BubblesSlide({ themeBubbles }: BubblesSlideProps) {
  const maxCount = Math.max(...themeBubbles.map(t => t.count), 1);

  const positions = [
    { top: '15%', left: '20%' },
    { top: '10%', left: '65%' },
    { top: '35%', left: '15%' },
    { top: '38%', left: '70%' },
    { top: '60%', left: '25%' },
    { top: '65%', left: '65%' },
    { top: '18%', left: '42%' },
    { top: '55%', left: '45%' }
  ];

  return (
    <motion.div
      key="bubbles"
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
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl text-[#e8d4e8] mb-4 font-bold">
          Your Gratitude Themes
        </h2>
        <p className="text-xl text-[#a8b5d4]">
          Bigger bubbles = mentioned more often
        </p>
      </motion.div>

      <div className="relative w-full h-[500px] md:h-[600px]">
        {themeBubbles.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#a8b5d4] text-center absolute inset-0 flex items-center justify-center"
          >
            Complete more entries to discover your themes
          </motion.p>
        ) : (
          themeBubbles.map((theme, index) => {
            const size = 90 + (theme.count / maxCount) * 140;
            const position = positions[index] || { top: '50%', left: '50%' };

            return (
              <motion.div
                key={theme.word}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.1 }}
                className="absolute rounded-full bg-gradient-to-br from-[#a8b5d4] to-[#c4a8d4] flex items-center justify-center shadow-2xl cursor-pointer"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: position.top,
                  left: position.left,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -5, 0]
                  }}
                  transition={{
                    duration: 2 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-[#1a1d2e] capitalize px-4 text-center break-words font-semibold"
                  style={{ fontSize: `${Math.max(14, size / 5.5)}px` }}
                >
                  {theme.word}
                </motion.div>
                <div
                  className="absolute -bottom-2 -right-2 bg-[#1a1d2e] text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold"
                >
                  {theme.count}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
