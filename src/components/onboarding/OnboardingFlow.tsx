import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WelcomeScreen } from './WelcomeScreen';
import { NameQuestion } from './NameQuestion';
import { Question1Screen } from './Question1Screen';
import { Question2Screen } from './Question2Screen';
import { CompletionScreen } from './CompletionScreen';

export type MainGoal = 'begin_journey' | 'improve_mood' | 'capture_memories';
export type TimeCommitment = 'quick' | 'balanced' | 'deep';
export type TextBoxSize = 'small' | 'medium' | 'large';

export interface OnboardingData {
  username?: string;
  mainGoal?: MainGoal;
  timeCommitment?: TimeCommitment;
  textBoxSize?: TextBoxSize;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleWelcome = () => {
    setCurrentStep(1);
  };

  const handleNameSubmit = (name: string) => {
    setOnboardingData(prev => ({ ...prev, username: name }));
    setCurrentStep(2);
  };

  const handleQuestion1 = (goal: MainGoal) => {
    setOnboardingData(prev => ({ ...prev, mainGoal: goal }));
    setCurrentStep(3);
  };

  const handleQuestion2 = (timeCommitment: TimeCommitment) => {
    let textBoxSize: TextBoxSize = 'medium';
    if (timeCommitment === 'quick') textBoxSize = 'small';
    else if (timeCommitment === 'deep') textBoxSize = 'large';

    const finalData = {
      ...onboardingData,
      timeCommitment,
      textBoxSize
    };

    setOnboardingData(finalData);
    setCurrentStep(4);
  };

  const handleCompletion = () => {
    onComplete(onboardingData);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1d2e] via-[#25283d] to-[#2d3250] z-50">
      {currentStep > 0 && currentStep < 4 && (
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-[#a8b5d4] hover:text-[#e8d4e8] transition-colors"
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 h-2 bg-[#2d3250] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="h-full flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <WelcomeScreen key="welcome" onContinue={handleWelcome} />
          )}
          {currentStep === 1 && (
            <NameQuestion key="name" onSubmit={handleNameSubmit} />
          )}
          {currentStep === 2 && (
            <Question1Screen key="question1" onSelect={handleQuestion1} />
          )}
          {currentStep === 3 && (
            <Question2Screen key="question2" onSelect={handleQuestion2} />
          )}
          {currentStep === 4 && (
            <CompletionScreen key="completion" onContinue={handleCompletion} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
