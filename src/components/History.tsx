import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { ArrowLeft, ChevronRight, Image as ImageIcon, Video, X } from 'lucide-react';
import type { GratitudeEntry } from '../App';
import type { View } from '../App';

interface HistoryProps {
  entries: GratitudeEntry[];
  onNavigate: (view: View) => void;
  onRestartOnboarding: () => void;
}

export function History({ entries, onNavigate, onRestartOnboarding }: HistoryProps) {
  const [selectedEntry, setSelectedEntry] = useState<GratitudeEntry | null>(null);
  const [viewingMedia, setViewingMedia] = useState<string | null>(null);

  const isVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPreview = (entry: GratitudeEntry) => {
    if (entry.answers.length > 0) {
      const firstAnswer = entry.answers[0].answer;
      return firstAnswer.length > 60 ? firstAnswer.substring(0, 60) + '...' : firstAnswer;
    }
    return '';
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto pt-20 sm:pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => onNavigate('insights')}
          variant="ghost"
          className="text-[#a8b5d4] hover:bg-[#2d3250]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-[#e8d4e8]"
      >
        Your History
      </motion.h2>

      {/* Entry list */}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => setSelectedEntry(entry)}
              className="w-full bg-[#2d3250] hover:bg-[#3d4260] rounded-3xl p-6 text-left transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                {entry.mediaUrl && (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black flex-shrink-0">
                    {isVideoUrl(entry.mediaUrl) ? (
                      <div className="relative w-full h-full">
                        <video
                          src={entry.mediaUrl}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={entry.mediaUrl}
                        alt="Entry media"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[#a8b5d4] mb-2">{formatDate(entry.date)}</p>
                  <p className="text-[#e8d4e8] opacity-70">{getPreview(entry)}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-[#6b7099] group-hover:text-[#a8b5d4] transition-colors flex-shrink-0" />
              </div>
            </button>
          </motion.div>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6b7099]">No entries yet. Start your gratitude journey today!</p>
          </div>
        )}
      </div>

      {/* Entry detail modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEntry(null)}
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
                <h3 className="text-[#e8d4e8]">{formatDate(selectedEntry.date)}</h3>
                <Button
                  onClick={() => setSelectedEntry(null)}
                  variant="ghost"
                  className="text-[#a8b5d4] hover:bg-[#3d4260]"
                >
                  Close
                </Button>
              </div>

              {selectedEntry.mediaUrl && (
                <div className="mb-6">
                  <button
                    onClick={() => setViewingMedia(selectedEntry.mediaUrl!)}
                    className="w-full rounded-2xl overflow-hidden bg-black hover:opacity-90 transition-opacity"
                  >
                    {isVideoUrl(selectedEntry.mediaUrl) ? (
                      <div className="relative aspect-video">
                        <video
                          src={selectedEntry.mediaUrl}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/90 rounded-full p-4">
                            <Video className="w-8 h-8 text-[#1a1d2e]" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={selectedEntry.mediaUrl}
                        alt="Entry media"
                        className="w-full aspect-video object-contain"
                      />
                    )}
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {selectedEntry.answers.map((qa, index) => (
                  <div key={index}>
                    <p className="text-[#a8b5d4] mb-2">{qa.question}</p>
                    <p className="text-[#e8d4e8] bg-[#1a1d2e] rounded-2xl p-4">
                      {qa.answer}
                    </p>
                  </div>
                ))}
              </div>

              {selectedEntry.mentionedPeople.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#3d4260]">
                  <p className="text-[#a8b5d4] mb-3">People mentioned:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.mentionedPeople.map((person) => (
                      <span
                        key={person}
                        className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] text-[#1a1d2e] px-4 py-2 rounded-full"
                      >
                        💜 {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen media viewer */}
      <AnimatePresence>
        {viewingMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingMedia(null)}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          >
            <Button
              onClick={() => setViewingMedia(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3"
            >
              <X className="w-6 h-6" />
            </Button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full"
            >
              {isVideoUrl(viewingMedia) ? (
                <video
                  src={viewingMedia}
                  controls
                  autoPlay
                  className="w-full rounded-2xl"
                />
              ) : (
                <img
                  src={viewingMedia}
                  alt="Full size"
                  className="w-full rounded-2xl"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
