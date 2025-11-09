import { motion } from 'motion/react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface ThemesSlideProps {
  newThemes: string[];
  recurringThemes: string[];
}

export function ThemesSlide({ newThemes, recurringThemes }: ThemesSlideProps) {
  return (
    <motion.div
      key="themes"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl text-[#e8d4e8] mb-4 font-bold">
          Theme Discovery
        </h2>
        <p className="text-xl text-[#a8b5d4]">
          What you're grateful for this month
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#2d3250] to-[#3d4260] rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-[#d4a5d4]" />
            <h3 className="text-2xl text-[#e8d4e8] font-semibold">New This Month</h3>
          </div>

          {newThemes.length > 0 ? (
            <div className="space-y-3">
              {newThemes.map((theme, index) => (
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-[#1a1d2e] rounded-2xl px-5 py-4 text-[#e8d4e8] capitalize flex items-center gap-3"
                >
                  <span className="text-2xl">✨</span>
                  <span className="text-lg">{theme}</span>
                  <span className="ml-auto bg-[#d4a5d4] text-[#1a1d2e] px-3 py-1 rounded-full text-xs font-bold">
                    NEW
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-[#6b7099] text-center py-8">
              No new themes this month
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#3d4260] to-[#2d3250] rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-[#a8b5d4]" />
            <h3 className="text-2xl text-[#e8d4e8] font-semibold">Returning Favorites</h3>
          </div>

          {recurringThemes.length > 0 ? (
            <div className="space-y-3">
              {recurringThemes.map((theme, index) => (
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-[#1a1d2e] rounded-2xl px-5 py-4 text-[#e8d4e8] capitalize flex items-center gap-3"
                >
                  <span className="text-2xl">🔄</span>
                  <span className="text-lg">{theme}</span>
                  <span className="ml-auto bg-[#a8b5d4] text-[#1a1d2e] px-3 py-1 rounded-full text-xs font-bold">
                    AGAIN
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-[#6b7099] text-center py-8">
              No recurring themes yet
            </p>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-[#a8b5d4] text-lg">
          You discovered <span className="text-[#d4a5d4] font-bold">{newThemes.length}</span> new themes
          and revisited <span className="text-[#a8b5d4] font-bold">{recurringThemes.length}</span> favorites
        </p>
      </motion.div>
    </motion.div>
  );
}
