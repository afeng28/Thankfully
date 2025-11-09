import { motion } from 'motion/react';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import type { GratitudeEntry } from '../App';

interface WeeklySummaryProps {
  entries: GratitudeEntry[];
  onClose: () => void;
}

export function WeeklySummary({ entries, onClose }: WeeklySummaryProps) {

  const getWeekEntries = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return entries.filter(entry => new Date(entry.date) >= weekAgo);
  };

  const weekEntries = getWeekEntries();
  // Count unique days (not number of entries)
  const uniqueDays = new Set(weekEntries.map(entry => {
    const date = new Date(entry.date);
    return date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
  }));
  const daysLogged = uniqueDays.size;

  const getTopThemes = () => {
    const wordCount: Record<string, number> = {};
    const skipWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'them', 'this', 'that', 'these', 'those']);

    weekEntries.forEach(entry => {
      entry.answers.forEach(({ answer }) => {
        const words = answer.toLowerCase().split(/\s+/);
        words.forEach(word => {
          const cleaned = word.replace(/[^a-z]/g, '');
          if (cleaned.length > 3 && !skipWords.has(cleaned)) {
            wordCount[cleaned] = (wordCount[cleaned] || 0) + 1;
          }
        });
      });
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  };

  const topThemes = getTopThemes();

  const getJoyfulActivities = () => {
    const activities: string[] = [];
    weekEntries.forEach(entry => {
      entry.answers.forEach(({ answer }) => {
        if (answer.length > 20) {
          activities.push(answer);
        }
      });
    });
    return activities.slice(0, 3);
  };

  const joyfulActivities = getJoyfulActivities();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1d2e] via-[#25283d] to-[#2d3250] z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl text-[#e8d4e8]"
          >
            Your Week in Gratitude
          </motion.h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-[#a8b5d4] hover:bg-[#2d3250]"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Days Logged */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#2d3250] rounded-3xl p-8 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
              className="text-8xl mb-4 text-[#d4a5d4]"
            >
              {daysLogged}
            </motion.div>
            <p className="text-2xl text-[#e8d4e8] mb-2">Days of Gratitude</p>
            <p className="text-[#a8b5d4]">logged this week</p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-5xl"
            >
              ✨
            </motion.div>
          </motion.div>

          {/* Top Gratitude Themes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#2d3250] rounded-3xl p-8"
          >
            <h3 className="text-xl text-[#e8d4e8] mb-6 flex items-center gap-3">
              <span className="text-3xl">💫</span>
              Your Gratitude Themes
            </h3>
            <div className="flex flex-wrap gap-3">
              {topThemes.map((theme, index) => (
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] text-[#1a1d2e] px-6 py-3 rounded-full text-lg capitalize font-medium"
                >
                  {theme}
                </motion.div>
              ))}
              {topThemes.length === 0 && (
                <p className="text-[#6b7099]">Complete more entries to discover your themes</p>
              )}
            </div>
          </motion.div>

          {/* Joyful Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#2d3250] to-[#25283d] rounded-3xl p-8"
          >
            <h3 className="text-xl text-[#e8d4e8] mb-4 flex items-center gap-3">
              <span className="text-3xl">🌟</span>
              What Brought You Joy
            </h3>
            {joyfulActivities.length > 0 ? (
              <>
                <p className="text-[#a8b5d4] mb-6">These moments lit up your week. Keep making time for what matters!</p>
                <div className="space-y-3">
                  {joyfulActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-[#1a1d2e] rounded-2xl p-4 text-[#e8d4e8] italic"
                    >
                      "{activity}"
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[#6b7099]">Complete more entries to see what brought you joy this week!</p>
            )}
          </motion.div>

          {/* Encouragement Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] rounded-3xl p-8 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl mb-4"
            >
              🦦
            </motion.div>
            <h3 className="text-2xl text-[#1a1d2e] mb-3 font-semibold">You're Creating Something Beautiful!</h3>
            <p className="text-[#1a1d2e] text-lg max-w-2xl mx-auto">
              This week, you took time to notice the good around you. These themes and connections show what truly matters in your life. Keep nurturing this beautiful practice!
            </p>
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={onClose}
            className="bg-[#2d3250] hover:bg-[#3d4260] text-[#e8d4e8] rounded-full px-8 py-6 text-lg"
          >
            Back to Insights
          </Button>
        </div>
      </div>
    </div>
  );
}
