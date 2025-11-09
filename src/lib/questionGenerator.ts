import { supabase } from './supabase';
import { getUserPreferences } from './userPreferences';

export interface CustomQuestions {
  questions: string[];
  generatedAt: Date;
}

async function getPreviousWeekEntries() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('gratitude_entries')
    .select('answers, entry_date')
    .gte('entry_date', oneWeekAgo.toISOString().split('T')[0])
    .order('entry_date', { ascending: false });

  if (error) {
    console.error('Error fetching previous entries:', error);
    return [];
  }

  return data || [];
}

async function callGeminiAPI(prompt: string): Promise<string | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/call-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        prompt_text: prompt
      })
    });

    if (!response.ok) {
      console.error('Gemini API call failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

function parseQuestionsFromResponse(text: string): string[] {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const questions: string[] = [];

  for (const line of lines) {
    const cleanedLine = line
      .replace(/^\d+[\.\)]\s*/, '')
      .replace(/^[-*]\s*/, '')
      .replace(/^Question \d+:?\s*/i, '')
      .trim();

    if (cleanedLine.endsWith('?') && cleanedLine.length > 10) {
      questions.push(cleanedLine);
    }
  }

  return questions.slice(0, 3);
}

export async function generateCustomQuestions(): Promise<string[]> {
  try {
    const preferences = await getUserPreferences();
    const previousEntries = await getPreviousWeekEntries();

    const mainGoal = preferences?.main_goal || 'personal reflection';
    const timeCommitment = preferences?.time_commitment || 'a few minutes each day';

    let previousQuestionsText = '';
    if (previousEntries.length > 0) {
      const entriesText = previousEntries.map(entry => {
        const answers = entry.answers as Array<{ question: string; answer: string }>;
        return answers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n');
      }).join('\n\n');

      previousQuestionsText = `The user has journaled these following answers to these prompts in the past week:\n${entriesText}`;
    } else {
      previousQuestionsText = 'The user is just starting their gratitude journaling journey.';
    }

    const prompt = `The user of this gratitude journaling app is focused on ${mainGoal} and wants to spend ${timeCommitment}. Based on this information, generate three unique questions that allow the user to reflect on key parts of their day and express gratitude. ${previousQuestionsText} Tailor the 3 generated questions to align with the goals or highlights they mentioned previously.

Return ONLY the 3 questions, numbered 1-3, with no additional explanation or text.`;

    const geminiResponse = await callGeminiAPI(prompt);

    if (!geminiResponse) {
      return getDefaultQuestions();
    }

    const questions = parseQuestionsFromResponse(geminiResponse);

    if (questions.length < 3) {
      return getDefaultQuestions();
    }

    return questions;
  } catch (error) {
    console.error('Error generating custom questions:', error);
    return getDefaultQuestions();
  }
}

function getDefaultQuestions(): string[] {
  return [
    "What small moment brought you unexpected joy today?",
    "Who made you smile today, and why?",
    "What's something you're looking forward to?"
  ];
}
