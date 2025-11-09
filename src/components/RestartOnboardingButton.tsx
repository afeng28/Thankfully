import { motion } from 'motion/react';
import { Button } from './ui/button';

interface RestartOnboardingButtonProps {
  onClick: () => void;
}

export function RestartOnboardingButton({ onClick }: RestartOnboardingButtonProps) {
  return (
    <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onClick}
          variant="outline"
          className="border-[#3d4260] text-[#a8b5d4] hover:bg-[#2d3250] rounded-full px-4 py-2 sm:px-6 text-sm font-medium transition-all pointer-events-auto min-h-[44px]"
          aria-label="Start onboarding to set up your preferences"
        >
          New here?
        </Button>
      </motion.div>
    </div>
  );
}
