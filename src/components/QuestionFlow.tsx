import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import type { GratitudeEntry } from '../App';
import {
  extractWords,
  addUserConfirmedName,
  preloadCommonNames,
  preloadUserConfirmedNames,
  type DetectedWord
} from '../lib/nameRecognition';
import { getTextAreaHeight, getTextAreaRows } from '../lib/userPreferences';
import type { TextBoxSize } from './onboarding/OnboardingFlow';
import { generateCustomQuestions } from '../lib/questionGenerator';

interface QuestionFlowProps {
  onComplete: (entry: GratitudeEntry) => void;
  textBoxSize?: TextBoxSize;
}

const defaultQuestions = [
  "What small moment brought you unexpected joy today?",
  "Who made you smile today, and why?",
  "What's something you're looking forward to?"
];

export function QuestionFlow({ onComplete, textBoxSize = 'medium' }: QuestionFlowProps) {
  const [questions, setQuestions] = useState<string[]>(defaultQuestions);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [detectedNames, setDetectedNames] = useState<Set<string>>(new Set());
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [mentionedPeople, setMentionedPeople] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const textAreaHeight = getTextAreaHeight(textBoxSize);
  const textAreaRows = getTextAreaRows(textBoxSize);

  useEffect(() => {
    preloadCommonNames();
    preloadUserConfirmedNames();
    loadCustomQuestions();
  }, []);

  const loadCustomQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const customQuestions = await generateCustomQuestions();
      setQuestions(customQuestions);
    } catch (error) {
      console.error('Failed to load custom questions:', error);
      setQuestions(defaultQuestions);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentQuestionIndex]);

  const detectCapitalizedNames = (text: string) => {
    if (showNamePopup) {
      return;
    }

    const words: DetectedWord[] = extractWords(text);

    for (const wordData of words) {
      if (!wordData.isComplete || !wordData.isCapitalized) {
        continue;
      }

      const cleaned = wordData.word.replace(/[^a-zA-Z'-]/g, '');

      if (!cleaned || cleaned.length < 2) {
        continue;
      }

      const normalizedWord = cleaned.toLowerCase();

      if (detectedNames.has(normalizedWord)) {
        continue;
      }

      const commonWords = new Set([
        'the', 'this', 'that', 'what', 'when', 'where', 'why', 'how',
        'today', 'tomorrow', 'yesterday', 'my', 'i', 'me', 'he', 'she',
        'they', 'we', 'you', 'it', 'his', 'her', 'their', 'our', 'its',
        'a', 'an', 'and', 'or', 'but', 'not', 'no', 'yes', 'can', 'could',
        'would', 'should', 'will', 'may', 'might', 'must', 'shall'
      ]);

      if (commonWords.has(normalizedWord)) {
        continue;
      }

      setPendingName(cleaned);
      setShowNamePopup(true);
      setDetectedNames(new Set([...detectedNames, normalizedWord]));
      return;
    }
  };

  const handleTextSelection = (event: React.MouseEvent<HTMLTextAreaElement> | React.TouchEvent<HTMLTextAreaElement>) => {
    if (showNamePopup) {
      return;
    }

    const textarea = event.currentTarget;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    if (selectionStart === selectionEnd) {
      return;
    }

    const text = textarea.value;

    let wordStart = selectionStart;
    while (wordStart > 0 && /[a-zA-Z'\-]/.test(text[wordStart - 1])) {
      wordStart--;
    }

    let wordEnd = selectionEnd;
    while (wordEnd < text.length && /[a-zA-Z'\-]/.test(text[wordEnd])) {
      wordEnd++;
    }

    const fullWord = text.substring(wordStart, wordEnd).trim();

    if (fullWord && fullWord.length >= 2) {
      const cleaned = fullWord.replace(/[^a-zA-Z'\-]/g, '');

      if (cleaned && cleaned.length >= 2) {
        const normalizedSelection = cleaned.toLowerCase();

        if (!detectedNames.has(normalizedSelection)) {
          setPendingName(cleaned);
          setShowNamePopup(true);
          setDetectedNames(new Set([...detectedNames, normalizedSelection]));
        }
      }
    }
  };

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);

    if (showNamePopup && pendingName) {
      const words = value.split(/[\s,;.!?]+/).filter(w => w.length > 0);
      const cleanedWords = words.map(w => w.replace(/[^a-zA-Z'-]/g, ''));
      const nameStillPresent = cleanedWords.some(w =>
        w.toLowerCase() === pendingName.toLowerCase()
      );

      if (!nameStillPresent) {
        setShowNamePopup(false);
        setPendingName('');
      }
    }

    detectCapitalizedNames(value);
  };

  const handleNameConfirm = async (isGratefulFor: boolean) => {
    if (isGratefulFor && pendingName) {
      if (!mentionedPeople.some(p => p.toLowerCase() === pendingName.toLowerCase())) {
        setMentionedPeople([...mentionedPeople, pendingName]);
      }
      await addUserConfirmedName(pendingName);
    }
    setShowNamePopup(false);
    setPendingName('');
  };

  const handleNext = useCallback(() => {
    if (!currentAnswer.trim()) {
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer(newAnswers[currentQuestionIndex + 1]);
    } else {
      const entry: GratitudeEntry = {
        id: Date.now().toString(),
        date: new Date(),
        answers: questions.map((q, i) => ({ question: q, answer: newAnswers[i] })),
        mentionedPeople
      };
      onComplete(entry);
    }
  }, [currentAnswer, answers, currentQuestionIndex, mentionedPeople, onComplete]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTextarea = target.tagName === 'TEXTAREA';

      if (event.key === 'Enter' && !event.shiftKey) {
        if (showNamePopup) {
          return;
        }

        if (currentAnswer.trim()) {
          event.preventDefault();
          handleNext();

          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
          }, 100);
        }
      }

      if (event.key === 'ArrowRight') {
        if (showNamePopup) {
          return;
        }

        if (isTextarea) {
          const textarea = target as HTMLTextAreaElement;
          const cursorAtEnd = textarea.selectionStart === textarea.value.length;

          if (!cursorAtEnd) {
            return;
          }
        }

        if (currentAnswer.trim()) {
          event.preventDefault();
          handleNext();

          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
          }, 100);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentAnswer, showNamePopup, handleNext]);

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl mb-4"
        >
          🦦
        </motion.div>
        <p className="text-[#a8b5d4] text-lg">Preparing your personalized questions...</p>
      </div>
    );
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = currentAnswer;
      setAnswers(newAnswers);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(newAnswers[currentQuestionIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4">
          {currentQuestionIndex > 0 && (
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-[#a8b5d4] hover:text-[#e8d4e8] hover:bg-[#2d3250] rounded-full px-3"
            >
              ←
            </Button>
          )}
          <Progress value={progress} className="flex-1 h-2 bg-[#2d3250] [&>div]:bg-gradient-to-r [&>div]:from-[#a8b5d4] [&>div]:to-[#c4a8d4]" />
          <span className="text-[#a8b5d4] text-sm font-medium whitespace-nowrap">
            {currentQuestionIndex + 1}/3
          </span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl mb-8"
          >
            🦦
          </motion.div>

          <div className="bg-[#2d3250] rounded-3xl px-8 py-6 mb-8 relative">
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-[#2d3250]" />
            <p className="text-[#e8d4e8] text-center text-lg">
              {questions[currentQuestionIndex]}
            </p>
          </div>

          <div className="w-full max-w-md relative">
            <Textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              placeholder="Share your thoughts..."
              rows={textAreaRows}
              className={`bg-[#1a1d2e] border-2 border-[#3d4260] text-[#e8d4e8] placeholder:text-[#6b7099] rounded-3xl ${textAreaHeight} resize-none focus:border-[#a8b5d4] transition-colors text-base`}
            />

            <AnimatePresence>
              {showNamePopup && pendingName && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mt-4 bg-[#2d3250] rounded-2xl p-4 border-2 border-[#a8b5d4]"
                >
                  <p className="text-[#e8d4e8] text-base mb-4">
                    Is <span className="font-semibold text-[#c4a8d4]">{pendingName}</span> a person you are grateful for?
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleNameConfirm(false)}
                      variant="outline"
                      className="border-[#3d4260] text-[#a8b5d4] hover:bg-[#3d4260] rounded-full px-6"
                    >
                      No
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleNameConfirm(true)}
                      className="bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] hover:from-[#b5c2e1] hover:to-[#d1b5e1] text-[#1a1d2e] rounded-full px-6"
                    >
                      Yes
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-center"
            >
              <p className="text-[#6b7099] text-sm">
                Press Enter or → to continue
              </p>
            </motion.div>
          </div>

          <Button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="mt-8 bg-gradient-to-r from-[#a8b5d4] to-[#c4a8d4] hover:from-[#b5c2e1] hover:to-[#d1b5e1] text-[#1a1d2e] px-8 py-6 rounded-full text-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Complete'}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
