import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { QuestionFlow } from './components/QuestionFlow';
import { StickerSharing } from './components/StickerSharing';
import { Insights } from './components/Insights';
import { History } from './components/History';
import { WeeklySummary } from './components/WeeklySummary';
import { MonthlySummary } from './components/MonthlySummary';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { SharedThanksViewer } from './components/SharedThanksViewer';
import type { OnboardingData, TextBoxSize } from './components/onboarding/OnboardingFlow';
import { getUserPreferences, saveOnboardingPreferences } from './lib/userPreferences';
import { loadGratitudeEntries, saveGratitudeEntry } from './lib/gratitudeEntries';
import { clearUserData } from './lib/clearUserData';
import { motion } from 'motion/react';
import { Toaster } from './components/ui/sonner';

export type View = 'onboarding' | 'dashboard' | 'questions' | 'completion' | 'sticker' | 'insights' | 'history' | 'weekly' | 'monthly' | 'shared-thanks';

export interface GratitudeEntry {
  id: string;
  date: Date;
  answers: Array<{ question: string; answer: string }>;
  mentionedPeople: string[];
  mediaUrl?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [userName, setUserName] = useState('Friend');
  const [textBoxSize, setTextBoxSize] = useState<TextBoxSize>('medium');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [currentEntry, setCurrentEntry] = useState<GratitudeEntry | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [hasCompletedEntry, setHasCompletedEntry] = useState(false);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);

  const checkIfCompletedToday = (entriesList: GratitudeEntry[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return entriesList.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const thankId = urlParams.get('thanks');

    if (thankId) {
      setShareId(thankId);
      setCurrentView('shared-thanks');
      setIsLoadingPreferences(false);
      return;
    }

    const loadUserPreferences = async () => {
      const prefs = await getUserPreferences();

      if (prefs && prefs.has_completed_onboarding) {
        setUserName(prefs.username);
        setTextBoxSize(prefs.text_box_size as TextBoxSize);

        const loadedEntries = await loadGratitudeEntries();
        setEntries(loadedEntries);

        if (loadedEntries.length > 0) {
          setHasCompletedEntry(true);
          setHasCompletedToday(checkIfCompletedToday(loadedEntries));
        }

        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }

      setIsLoadingPreferences(false);
    };

    loadUserPreferences();
  }, []);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    const username = data.username || 'Friend';
    
    // Clear all user data (entries, theme cache, etc.) for fresh start
    await clearUserData('default_user', true);
    
    const success = await saveOnboardingPreferences(data, username);

    if (success) {
      setUserName(username);
      setTextBoxSize(data.textBoxSize || 'medium');
      // Ensure entries are empty for new user
      setEntries([]);
      setHasCompletedEntry(false);
      setHasCompletedToday(false);
      setCurrentView('dashboard');
    }
  };

  const handleRestartOnboarding = () => {
    setCurrentView('onboarding');
  };

  const handleStartGratitude = () => {
    setCurrentView('questions');
  };

  const handleCompleteQuestions = async (entry: GratitudeEntry) => {
    setCurrentEntry(entry);
    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    setHasCompletedEntry(true);
    setHasCompletedToday(checkIfCompletedToday(updatedEntries));

    await saveGratitudeEntry(entry);

    setCurrentView('completion');
  };

  const handleCompletionFinish = () => {
    if (currentEntry && currentEntry.mentionedPeople.length > 0) {
      setCurrentView('sticker');
    } else {
      setCurrentView('insights');
    }
  };

  const handleStickerComplete = () => {
    setCurrentView('insights');
  };

  if (isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1d2e] via-[#25283d] to-[#2d3250] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-8xl"
        >
          🦦
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d2e] via-[#25283d] to-[#2d3250]">
      <Toaster position="top-center" richColors />
      {currentView === 'onboarding' && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
      {currentView === 'dashboard' && (
        <Dashboard
          userName={userName}
          onStart={handleStartGratitude}
          onNavigate={setCurrentView}
          onRestartOnboarding={handleRestartOnboarding}
          hasCompletedToday={hasCompletedToday}
          hasAnyEntries={hasCompletedEntry}
        />
      )}
      {currentView === 'questions' && (
        <QuestionFlow onComplete={handleCompleteQuestions} textBoxSize={textBoxSize} />
      )}
      {currentView === 'completion' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex items-center justify-center px-4"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              onAnimationComplete={() => {
                setTimeout(handleCompletionFinish, 2000);
              }}
              className="text-8xl mb-6"
            >
              🦦
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[#d4a5d4] text-xl"
            >
              Beautiful! Your gratitude has been captured ✨
            </motion.p>
          </div>
        </motion.div>
      )}
      {currentView === 'sticker' && currentEntry && (
        <StickerSharing
          mentionedPeople={currentEntry.mentionedPeople}
          onComplete={handleStickerComplete}
        />
      )}
      {currentView === 'insights' && (
        <Insights entries={entries} onNavigate={setCurrentView} onRestartOnboarding={handleRestartOnboarding} />
      )}
      {currentView === 'history' && (
        <History entries={entries} onNavigate={setCurrentView} onRestartOnboarding={handleRestartOnboarding} />
      )}
      {currentView === 'weekly' && (
        <WeeklySummary entries={entries} onClose={() => setCurrentView('insights')} />
      )}
      {currentView === 'monthly' && (
        <MonthlySummary entries={entries} onClose={() => setCurrentView('insights')} />
      )}
      {currentView === 'shared-thanks' && shareId && (
        <SharedThanksViewer shareId={shareId} />
      )}
    </div>
  );
}

export default App;
