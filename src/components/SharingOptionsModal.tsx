import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Download, Copy, Sparkles, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';

interface SharingOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (method: 'text' | 'download' | 'copy') => void;
  selectedImageSrc?: string;
  selectedImageAlt?: string;
  onChangeSticker?: () => void;
}

export function SharingOptionsModal({ isOpen, onClose, onShare, selectedImageSrc, selectedImageAlt, onChangeSticker }: SharingOptionsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sharing-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#2d3250] rounded-3xl p-8 w-[300px] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4a5d4] flex-shrink-0" />
                <h2 id="sharing-modal-title" className="text-[#e8d4e8] text-base font-medium">
                  Share Your Thanks
                </h2>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-[#a8b5d4] hover:bg-[#3d4260] min-w-[36px] min-h-[36px] flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {selectedImageSrc && (
              <div className="mb-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-xl overflow-hidden bg-[#3d4260] p-3 max-w-[200px] mx-auto"
                >
                  <img
                    src={selectedImageSrc}
                    alt={selectedImageAlt}
                    className="w-full h-auto rounded-lg"
                  />
                </motion.div>
                {onChangeSticker && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={onChangeSticker}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 text-[#a8b5d4] hover:text-[#d4a5d4] transition-colors py-1.5 text-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Change Sticker</span>
                  </motion.button>
                )}
              </div>
            )}

            <p className="text-[#a8b5d4] mb-4 text-center text-sm">How would you like to share?</p>

            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => onShare('text')}
                className="w-full bg-[#3d4260] hover:bg-[#4a4f6f] rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#2d3250] rounded-full p-2">
                    <MessageSquare className="w-4 h-4 text-[#a8b5d4]" />
                  </div>
                  <span className="text-sm text-[#e8d4e8] group-hover:text-[#c4a8d4] transition-colors">
                    Text
                  </span>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => onShare('download')}
                className="w-full bg-[#3d4260] hover:bg-[#4a4f6f] rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#2d3250] rounded-full p-2">
                    <Download className="w-4 h-4 text-[#a8b5d4]" />
                  </div>
                  <span className="text-sm text-[#e8d4e8] group-hover:text-[#c4a8d4] transition-colors">
                    Download as JPG
                  </span>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => onShare('copy')}
                className="w-full bg-[#3d4260] hover:bg-[#4a4f6f] rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#2d3250] rounded-full p-2">
                    <Copy className="w-4 h-4 text-[#a8b5d4]" />
                  </div>
                  <span className="text-sm text-[#e8d4e8] group-hover:text-[#c4a8d4] transition-colors">
                    Copy
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
