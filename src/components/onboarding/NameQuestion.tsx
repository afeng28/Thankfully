import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface NameQuestionProps {
  onSubmit: (name: string) => void;
}

export function NameQuestion({ onSubmit }: NameQuestionProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full max-w-2xl px-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
        className="text-8xl mb-8 text-center"
      >
        🦦
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12 text-center"
      >
        <h2 className="text-4xl md:text-5xl text-[#e8d4e8] mb-4 font-bold">
          What is your name?
        </h2>
        <p className="text-lg text-[#a8b5d4]">
          We'd love to personalize your experience
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your name"
          className="bg-[#2d3250] border-2 border-[#3d4260] focus:border-[#a8b5d4] text-[#e8d4e8] placeholder:text-[#6b7099] rounded-2xl px-6 py-7 text-xl text-center transition-colors"
          autoFocus
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] hover:from-[#b5c2e1] hover:to-[#d1b5e1] text-[#1a1d2e] rounded-full px-12 py-7 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            size="lg"
          >
            Continue
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-center"
        >
          <p className="text-[#6b7099] text-sm">
            Press Enter to continue
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
