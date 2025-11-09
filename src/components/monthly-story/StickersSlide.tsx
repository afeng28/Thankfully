import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface StickersSlideProps {
  stickerCount: number;
  people: string[];
}

export function StickersSlide({ stickerCount, people }: StickersSlideProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (stickerCount === 0) return;

    const duration = 1500;
    const steps = 30;
    const increment = stickerCount / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayCount(stickerCount);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [stickerCount]);

  const topRecipients = people.slice(0, 3);

  return (
    <motion.div
      key="stickers"
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
        className="mb-12"
      >
        <h2 className="text-4xl md:text-5xl text-[#e8d4e8] mb-4 font-bold">
          Thank You Notes Sent
        </h2>
        <p className="text-xl text-[#a8b5d4]">
          Spreading gratitude to others
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        className="relative mb-12"
      >
        <div className="text-9xl md:text-[12rem] text-[#d4a5d4] font-bold mb-4">
          {displayCount}
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] pointer-events-none"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="absolute text-5xl"
              style={{
                top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              💜
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {topRecipients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-br from-[#2d3250] to-[#3d4260] rounded-3xl p-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-[#d4a5d4] fill-current" />
            <h3 className="text-xl text-[#e8d4e8]">Top Recipients</h3>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {topRecipients.map((person, index) => (
              <motion.div
                key={person}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + index * 0.1, type: "spring" }}
                className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] text-[#1a1d2e] px-6 py-3 rounded-full font-semibold flex items-center gap-2"
              >
                <span className="text-2xl">💜</span>
                <span>{person}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-[#a8b5d4] text-lg mt-8"
      >
        You've brightened {people.length} {people.length === 1 ? "person's" : "people's"} day this month!
      </motion.p>
    </motion.div>
  );
}
