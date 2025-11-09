import { useState } from 'react';
import type { GratitudeEntry } from '../App';
import { calculateMonthlyStoryData } from '../lib/monthlyStoryData';
import { StoryWrapper } from './monthly-story/StoryWrapper';
import { OpeningSlide } from './monthly-story/OpeningSlide';
import { StickersSlide } from './monthly-story/StickersSlide';
import { StreakSlide } from './monthly-story/StreakSlide';

interface MonthlySummaryProps {
  entries: GratitudeEntry[];
  onClose: () => void;
}

export function MonthlySummary({ entries, onClose }: MonthlySummaryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const storyData = calculateMonthlyStoryData(entries);
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalSlides = 3;

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <OpeningSlide monthName={monthName} />;
      case 1:
        return (
          <StickersSlide
            stickerCount={storyData.stickerCount}
            people={storyData.people}
          />
        );
      case 2:
        return (
          <StreakSlide
            displayStreak={storyData.displayStreak}
            isCurrentStreak={storyData.isCurrentStreak}
            currentStreak={storyData.currentStreak}
            longestStreak={storyData.longestStreak}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StoryWrapper
      totalSlides={totalSlides}
      currentSlide={currentSlide}
      onSlideChange={setCurrentSlide}
      onClose={onClose}
    >
      {renderSlide()}
    </StoryWrapper>
  );
}
