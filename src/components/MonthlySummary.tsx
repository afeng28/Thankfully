import { useState } from 'react';
import type { GratitudeEntry } from '../App';
import { calculateMonthlyStoryData } from '../lib/monthlyStoryData';
import { StoryWrapper } from './monthly-story/StoryWrapper';
import { OpeningSlide } from './monthly-story/OpeningSlide';
import { BubblesSlide } from './monthly-story/BubblesSlide';
import { ThemesSlide } from './monthly-story/ThemesSlide';
import { StickersSlide } from './monthly-story/StickersSlide';
import { StreakSlide } from './monthly-story/StreakSlide';
import { EncouragingSlide } from './monthly-story/EncouragingSlide';
import { CollageSlide } from './monthly-story/CollageSlide';

interface MonthlySummaryProps {
  entries: GratitudeEntry[];
  onClose: () => void;
}

export function MonthlySummary({ entries, onClose }: MonthlySummaryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const storyData = calculateMonthlyStoryData(entries);
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalSlides = 7;

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <OpeningSlide monthName={monthName} />;
      case 1:
        return <BubblesSlide themeBubbles={storyData.themeBubbles} />;
      case 2:
        return (
          <ThemesSlide
            newThemes={storyData.newThemes}
            recurringThemes={storyData.recurringThemes}
          />
        );
      case 3:
        return (
          <StickersSlide
            stickerCount={storyData.stickerCount}
            people={storyData.people}
          />
        );
      case 4:
        return (
          <StreakSlide
            displayStreak={storyData.displayStreak}
            isCurrentStreak={storyData.isCurrentStreak}
            currentStreak={storyData.currentStreak}
            longestStreak={storyData.longestStreak}
          />
        );
      case 5:
        return (
          <EncouragingSlide
            daysLogged={storyData.daysLogged}
            displayStreak={storyData.displayStreak}
            themesCount={storyData.themeBubbles.length}
            peopleCount={storyData.people.length}
          />
        );
      case 6:
        return (
          <CollageSlide
            monthName={monthName}
            daysLogged={storyData.daysLogged}
            displayStreak={storyData.displayStreak}
            stickerCount={storyData.stickerCount}
            themesCount={storyData.themeBubbles.length}
            peopleCount={storyData.people.length}
            topThemes={storyData.themeBubbles.slice(0, 5).map(t => t.word)}
            onClose={onClose}
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
