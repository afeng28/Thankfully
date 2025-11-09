import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Cloud, Sparkles } from 'lucide-react';
import type { View } from '../App';

interface DashboardProps {
  userName: string;
  onStart: () => void;
  onNavigate: (view: View) => void;
  onRestartOnboarding: () => void;
  hasCompletedToday: boolean;
  hasAnyEntries: boolean;
}

export function Dashboard({ userName, onStart, onNavigate, onRestartOnboarding, hasCompletedToday, hasAnyEntries }: DashboardProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-4 py-8 z-50">
        <div className="max-w-6xl mx-auto flex justify-end">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={onRestartOnboarding}
              variant="outline"
              className="border-[#3d4260] text-[#a8b5d4] hover:bg-[#2d3250] rounded-full px-4 py-2 sm:px-6 text-sm font-medium transition-all min-h-[44px]"
              aria-label="Start onboarding to set up your preferences"
            >
              New here?
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main centered content area */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
      {/* Floating clouds */}
      <motion.div
        className="absolute top-32 left-10 text-[#9ca3af]/20"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud size={80} fill="currentColor" />
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-[#9ca3af]/15"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Cloud size={120} fill="currentColor" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-1/4 text-[#9ca3af]/10"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <Cloud size={100} fill="currentColor" />
      </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 inline-block"
          >
            <Sparkles className="w-16 h-16 text-[#d4a5d4]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-16 text-[#e8d4e8]"
          >
            Hi, {userName}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center gap-4"
          >
            {!hasCompletedToday ? (
              <Button
                onClick={onStart}
                className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] hover:from-[#b5c2e1] hover:to-[#d1b5e1] text-[#1a1d2e] px-12 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start gratefulness for today
              </Button>
            ) : (
              <>
                <Button
                  onClick={onStart}
                  variant="outline"
                  className="border-2 border-[#a8b5d4] text-[#a8b5d4] hover:bg-[#2d3250] px-8 py-6 rounded-full transition-all duration-300"
                >
                  Feeling extra grateful?
                </Button>
                {hasAnyEntries && (
                  <Button
                    onClick={() => onNavigate('insights')}
                    className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] hover:from-[#b5c2e1] hover:to-[#d1b5e1] text-[#1a1d2e] px-12 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    View Insights
                  </Button>
                )}
              </>
            )}
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
