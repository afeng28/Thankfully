import { supabase } from './supabase';

interface NameCache {
  [key: string]: boolean;
}

const nameCache: NameCache = {};
const userConfirmedCache: Set<string> = new Set();

export async function isCommonName(word: string): Promise<boolean> {
  const normalized = word.toLowerCase().trim();

  if (!normalized || normalized.length < 2) {
    return false;
  }

  if (userConfirmedCache.has(normalized)) {
    return true;
  }

  if (nameCache[normalized] !== undefined) {
    return nameCache[normalized];
  }

  try {
    const { data, error } = await supabase
      .from('common_names')
      .select('id')
      .eq('name', normalized)
      .maybeSingle();

    if (error) {
      console.error('Error checking common name:', error);
      return false;
    }

    const isName = !!data;
    nameCache[normalized] = isName;
    return isName;
  } catch (error) {
    console.error('Error in isCommonName:', error);
    return false;
  }
}

export async function isUserConfirmedName(word: string): Promise<boolean> {
  const normalized = word.toLowerCase().trim();

  if (!normalized) {
    return false;
  }

  if (userConfirmedCache.has(normalized)) {
    return true;
  }

  try {
    const { data, error } = await supabase
      .from('user_confirmed_names')
      .select('id')
      .eq('normalized_name', normalized)
      .maybeSingle();

    if (error) {
      console.error('Error checking user confirmed name:', error);
      return false;
    }

    if (data) {
      userConfirmedCache.add(normalized);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in isUserConfirmedName:', error);
    return false;
  }
}

export async function addUserConfirmedName(name: string): Promise<void> {
  const normalized = name.toLowerCase().trim();

  if (!normalized) {
    return;
  }

  try {
    const { data: existing, error: checkError } = await supabase
      .from('user_confirmed_names')
      .select('id, confirmed_count')
      .eq('normalized_name', normalized)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing name:', checkError);
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('user_confirmed_names')
        .update({
          confirmed_count: existing.confirmed_count + 1,
          last_confirmed_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating confirmed name:', updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from('user_confirmed_names')
        .insert({
          name,
          normalized_name: normalized,
          confirmed_count: 1,
          last_confirmed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting confirmed name:', insertError);
      }
    }

    userConfirmedCache.add(normalized);
  } catch (error) {
    console.error('Error in addUserConfirmedName:', error);
  }
}

export function isCapitalized(word: string): boolean {
  if (!word || word.length === 0) {
    return false;
  }

  const firstChar = word[0];
  return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
}

export function hasUppercaseFirstLetter(word: string): boolean {
  const cleaned = word.replace(/[^a-zA-Z'-]/g, '');

  if (!cleaned || cleaned.length < 2) {
    return false;
  }

  return isCapitalized(cleaned);
}

export async function isPersonName(word: string): Promise<boolean> {
  const normalized = word.toLowerCase().trim();

  if (!normalized || normalized.length < 2) {
    return false;
  }

  const commonWords = new Set([
    'the', 'this', 'that', 'what', 'when', 'where', 'why', 'how',
    'today', 'tomorrow', 'yesterday', 'my', 'i', 'me', 'he', 'she',
    'they', 'we', 'you', 'it', 'his', 'her', 'their', 'our', 'its',
    'a', 'an', 'and', 'or', 'but', 'not', 'no', 'yes', 'can', 'could',
    'would', 'should', 'will', 'may', 'might', 'must', 'shall'
  ]);

  if (commonWords.has(normalized)) {
    return false;
  }

  const isUserConfirmed = await isUserConfirmedName(word);
  if (isUserConfirmed) {
    return true;
  }

  const isCommon = await isCommonName(word);
  return isCommon;
}

export interface DetectedWord {
  word: string;
  isComplete: boolean;
  isCapitalized: boolean;
  startIndex: number;
  endIndex: number;
}

export function extractWords(text: string): DetectedWord[] {
  const delimiterRegex = /[\s,;.!?]+/;
  let currentIndex = 0;
  const words: DetectedWord[] = [];

  while (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    const match = remainingText.match(/^([a-zA-Z'\-]+)/);

    if (match) {
      const word = match[1];
      const wordEnd = currentIndex + word.length;

      const isComplete = wordEnd < text.length && delimiterRegex.test(text[wordEnd]);
      const capitalized = hasUppercaseFirstLetter(word);

      words.push({
        word,
        isComplete,
        isCapitalized: capitalized,
        startIndex: currentIndex,
        endIndex: wordEnd
      });

      currentIndex = wordEnd;

      if (isComplete) {
        const delimiterMatch = text.substring(wordEnd).match(delimiterRegex);
        if (delimiterMatch) {
          currentIndex += delimiterMatch[0].length;
        }
      }
    } else {
      const nextDelimiterMatch = remainingText.match(delimiterRegex);
      if (nextDelimiterMatch) {
        currentIndex += nextDelimiterMatch[0].length;
      } else {
        break;
      }
    }
  }

  return words;
}

export async function preloadCommonNames(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('common_names')
      .select('name')
      .lte('popularity_score', 100);

    if (error) {
      console.error('Error preloading common names:', error);
      return;
    }

    if (data) {
      data.forEach((item) => {
        nameCache[item.name] = true;
      });
    }
  } catch (error) {
    console.error('Error in preloadCommonNames:', error);
  }
}

export async function preloadUserConfirmedNames(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('user_confirmed_names')
      .select('normalized_name');

    if (error) {
      console.error('Error preloading user confirmed names:', error);
      return;
    }

    if (data) {
      data.forEach((item) => {
        userConfirmedCache.add(item.normalized_name);
      });
    }
  } catch (error) {
    console.error('Error in preloadUserConfirmedNames:', error);
  }
}

export function clearNameCache(): void {
  Object.keys(nameCache).forEach(key => delete nameCache[key]);
  userConfirmedCache.clear();
}
