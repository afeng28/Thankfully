import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { ArrowLeft, Calendar as CalendarIcon, Users, TrendingUp, X } from 'lucide-react';
import type { GratitudeEntry } from '../App';
import type { View } from '../App';
import { ThanksButton } from './ThanksButton';
import { ThanksModal } from './ThanksModal';
import { getLastThanksSent, formatTimeSince } from '../lib/thanksHelper';
import { toast } from 'sonner';

interface InsightsProps {
  entries: GratitudeEntry[];
  onNavigate: (view: View) => void;
  onRestartOnboarding: () => void;
}

export function Insights({ entries, onNavigate, onRestartOnboarding }: InsightsProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState<GratitudeEntry[]>([]);
  const [thanksModalOpen, setThanksModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [lastThanksTimes, setLastThanksTimes] = useState<Record<string, string>>({});

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    let streak = 1;
    
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const current = new Date(sortedEntries[i].date);
      const next = new Date(sortedEntries[i + 1].date);
      
      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);
      
      const diffTime = current.getTime() - next.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Get unique people mentioned
  const getPeople = () => {
    const people = new Set<string>();
    entries.forEach(entry => {
      entry.mentionedPeople.forEach(person => people.add(person));
    });
    return Array.from(people);
  };

  // Get gratitude themes (most common words)
  const getThemes = () => {
    const wordCount: Record<string, number> = {};
    const skipWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'them', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how']);
    
    entries.forEach(entry => {
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

  const streak = calculateStreak();
  const people = getPeople();
  const themes = getThemes();

  useEffect(() => {
    const loadLastThanksTimes = async () => {
      const times: Record<string, string> = {};

      for (const person of people) {
        const lastThanks = await getLastThanksSent(person);
        if (lastThanks) {
          times[person] = formatTimeSince(lastThanks.sent_timestamp);
        }
      }

      setLastThanksTimes(times);
    };

    if (people.length > 0) {
      loadLastThanksTimes();
    }
  }, [people.join(',')]);

  const handleSayThanks = (person: string) => {
    setSelectedPerson(person);
    setThanksModalOpen(true);
  };

  const handleThanksSuccess = async () => {
    toast.success('Your gratitude has been shared!');

    if (selectedPerson) {
      const lastThanks = await getLastThanksSent(selectedPerson);
      if (lastThanks) {
        setLastThanksTimes(prev => ({
          ...prev,
          [selectedPerson]: formatTimeSince(lastThanks.sent_timestamp)
        }));
      }
    }
  };

  const handleCloseModal = () => {
    setThanksModalOpen(false);
    setSelectedPerson(null);
  };

  // Generate calendar for current month
  const generateCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar: Array<{ date: number | null; hasEntry: boolean; fullDate: Date | null }> = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push({ date: null, hasEntry: false, fullDate: null });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getDate() === day &&
               entryDate.getMonth() === month &&
               entryDate.getFullYear() === year;
      });
      calendar.push({ date: day, hasEntry, fullDate: date });
    }

    return calendar;
  };

  const handleDayClick = (fullDate: Date | null) => {
    if (!fullDate) return;

    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getDate() === fullDate.getDate() &&
             entryDate.getMonth() === fullDate.getMonth() &&
             entryDate.getFullYear() === fullDate.getFullYear();
    });

    if (dayEntries.length > 0) {
      setSelectedDate(fullDate);
      setSelectedDayEntries(dayEntries);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  const calendar = generateCalendar();
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto pt-20 sm:pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => onNavigate('dashboard')}
          variant="ghost"
          className="text-[#a8b5d4] hover:bg-[#2d3250]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={() => onNavigate('history')}
            variant="outline"
            className="border-[#3d4260] text-[#a8b5d4] hover:bg-[#2d3250] rounded-full"
          >
            History
          </Button>
          <Button
            onClick={() => onNavigate('weekly')}
            variant="outline"
            className="border-[#3d4260] text-[#a8b5d4] hover:bg-[#2d3250] rounded-full"
          >
            Weekly Summary
          </Button>
          <Button
            onClick={() => onNavigate('monthly')}
            variant="outline"
            className="border-[#3d4260] text-[#a8b5d4] hover:bg-[#2d3250] rounded-full"
          >
            Monthly Summary
          </Button>
        </div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-[#e8d4e8] text-center"
      >
        Your Insights
      </motion.h2>

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Gratitude Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#2d3250] rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <CalendarIcon className="w-6 h-6 text-[#a8b5d4]" />
            <h3 className="text-[#e8d4e8]">Gratitude Streak</h3>
          </div>
          <div className="space-y-4">
            <div className="text-5xl text-[#d4a5d4]">{streak} days</div>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-[#6b7099] text-sm text-center">
                  {day}
                </div>
              ))}
              {calendar.map((day, i) => (
                <button
                  key={i}
                  onClick={() => handleDayClick(day.fullDate)}
                  disabled={!day.hasEntry}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                    day.date === null
                      ? 'bg-transparent cursor-default'
                      : day.hasEntry
                      ? 'bg-[#a8b5d4] text-[#1a1d2e] hover:bg-[#b5c2e1] cursor-pointer'
                      : 'bg-[#1a1d2e] text-[#6b7099] cursor-default'
                  }`}
                >
                  {day.date}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* People Who Light Up Your Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#2d3250] rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-[#c4a8d4]" />
            <h3 className="text-[#e8d4e8]">People Who Light Up Your Days</h3>
          </div>
          <div className="space-y-3">
            {people.length > 0 ? (
              people.map((person, i) => (
                <motion.div
                  key={person}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-[#1a1d2e] rounded-full px-4 py-3 text-[#e8d4e8] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💜</span>
                    <span>{person}</span>
                  </div>
                  <ThanksButton
                    onClick={() => handleSayThanks(person)}
                    lastSentTime={lastThanksTimes[person]}
                  />
                </motion.div>
              ))
            ) : (
              <p className="text-[#6b7099]">No people mentioned yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Your Gratitude Themes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#2d3250] rounded-3xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-[#d4a5d4]" />
          <h3 className="text-[#e8d4e8]">Your Gratitude Themes</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {themes.length > 0 ? (
            themes.map((theme, i) => (
              <motion.div
                key={theme}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] text-[#1a1d2e] px-6 py-3 rounded-full capitalize"
              >
                {theme}
              </motion.div>
            ))
          ) : (
            <p className="text-[#6b7099]">Complete more entries to see your themes</p>
          )}
        </div>
      </motion.div>

      {/* Thanks Modal */}
      {selectedPerson && (
        <ThanksModal
          isOpen={thanksModalOpen}
          onClose={handleCloseModal}
          personName={selectedPerson}
          onSuccess={handleThanksSuccess}
        />
      )}

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDate && selectedDayEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDate(null)}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#2d3250] rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#e8d4e8] text-xl">{formatDate(selectedDate)}</h3>
                <Button
                  onClick={() => setSelectedDate(null)}
                  variant="ghost"
                  size="icon"
                  className="text-[#a8b5d4] hover:bg-[#3d4260]"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {selectedDayEntries.map((entry) => (
                  <div key={entry.id} className="bg-[#1a1d2e] rounded-3xl p-6">
                    {entry.mediaUrl && (
                      <div className="mb-4 rounded-2xl overflow-hidden bg-black">
                        {isVideoUrl(entry.mediaUrl) ? (
                          <video
                            src={entry.mediaUrl}
                            controls
                            className="w-full aspect-video object-contain"
                          />
                        ) : (
                          <img
                            src={entry.mediaUrl}
                            alt="Entry media"
                            className="w-full aspect-video object-contain"
                          />
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      {entry.answers.map((qa, index) => (
                        <div key={index}>
                          <p className="text-[#a8b5d4] text-sm mb-2">{qa.question}</p>
                          <p className="text-[#e8d4e8]">{qa.answer}</p>
                        </div>
                      ))}
                    </div>

                    {entry.mentionedPeople.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#2d3250]">
                        <p className="text-[#a8b5d4] text-sm mb-2">People mentioned:</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.mentionedPeople.map((person) => (
                            <span
                              key={person}
                              className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] text-[#1a1d2e] px-3 py-1 rounded-full text-sm"
                            >
                              💜 {person}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
