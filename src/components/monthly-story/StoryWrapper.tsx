import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface StoryWrapperProps {
  totalSlides: number;
  currentSlide: number;
  onSlideChange: (slide: number) => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function StoryWrapper({
  totalSlides,
  currentSlide,
  onSlideChange,
  onClose,
  children
}: StoryWrapperProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const goToNextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      onSlideChange(currentSlide + 1);
    }
  }, [currentSlide, totalSlides, onSlideChange]);

  const goToPreviousSlide = useCallback(() => {
    if (currentSlide > 0) {
      onSlideChange(currentSlide - 1);
    }
  }, [currentSlide, onSlideChange]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextSlide();
    } else if (isRightSwipe) {
      goToPreviousSlide();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPreviousSlide, onClose]);

  return (
    <div
      className="fixed inset-0 bg-gradient-to-b from-[#1a1d2e] via-[#25283d] to-[#2d3250] z-50 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('story-slide-container')) {
          const clickX = e.clientX;
          const windowWidth = window.innerWidth;

          if (clickX < windowWidth / 3) {
            goToPreviousSlide();
          } else if (clickX > (windowWidth * 2) / 3) {
            goToNextSlide();
          }
        }
      }}
    >
      <div className="absolute top-0 left-0 right-0 z-50 pt-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 flex gap-1">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div
                key={index}
                className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: index < currentSlide ? '100%' : '0%' }}
                  animate={{ width: index <= currentSlide ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="ml-4 text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {currentSlide > 0 && (
        <button
          onClick={goToPreviousSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all hidden md:block"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentSlide < totalSlides - 1 && (
        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all hidden md:block"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="story-slide-container h-full w-full flex items-center justify-center p-4 pt-20">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
}
