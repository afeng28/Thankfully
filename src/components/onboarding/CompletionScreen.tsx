import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

interface CompletionScreenProps {
  onContinue: () => void;
}

export function CompletionScreen({ onContinue }: CompletionScreenProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
        className="text-8xl mb-8"
      >
        🦦
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h1 className="text-5xl md:text-6xl text-[#e8d4e8] mb-6 font-medium">
          You're all set!
        </h1>
        <p className="text-xl md:text-2xl text-[#a8b5d4] leading-relaxed">
          Let's start your gratitude journey
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onContinue}
          className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] hover:from-[#b5c2e1] hover:to-[#d1b5e1] text-[#1a1d2e] rounded-full px-12 py-7 text-xl font-medium shadow-lg transform hover:scale-105 transition-all"
          size="lg"
        >
          Begin Your Journey
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <p className="text-[#6b7099] text-sm">
          Press Enter to continue
        </p>
      </motion.div>
    </motion.div>
  );
}
