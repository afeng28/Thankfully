import type { GratitudeEntry } from '../App';

export interface ThemeBubble {
  word: string;
  count: number;
  isNew?: boolean;
  isRecurring?: boolean;
}

export interface MonthlyStoryData {
  daysLogged: number;
  currentStreak: number;
  longestStreak: number;
  displayStreak: number;
  isCurrentStreak: boolean;
  stickerCount: number;
  people: string[];
  themeBubbles: ThemeBubble[];
  newThemes: string[];
  recurringThemes: string[];
  joyfulMoments: string[];
}

const skipWords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'through', 'during', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my',
  'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'them', 'this', 'that',
  'these', 'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
  'both', 'each', 'few', 'more', 'most', 'some', 'such', 'than', 'too', 'very', 'just'
]);

export function getMonthEntries(entries: GratitudeEntry[]): GratitudeEntry[] {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return entries.filter(entry => new Date(entry.date) >= monthAgo);
}

export function getPreviousMonthEntries(entries: GratitudeEntry[]): GratitudeEntry[] {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  return entries.filter(entry => {
    const date = new Date(entry.date);
    return date >= twoMonthsAgo && date < monthAgo;
  });
}

export function calculateCurrentStreak(entries: GratitudeEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentEntry = new Date(sortedEntries[0].date);
  mostRecentEntry.setHours(0, 0, 0, 0);

  const daysSinceLastEntry = Math.floor((today.getTime() - mostRecentEntry.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastEntry > 1) return 0;

  let streak = 1;
  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const current = new Date(sortedEntries[i].date);
    const next = new Date(sortedEntries[i + 1].date);

    current.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);

    const diffTime = current.getTime() - next.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(entries: GratitudeEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const current = new Date(sortedEntries[i].date);
    const next = new Date(sortedEntries[i + 1].date);

    current.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);

    const diffTime = current.getTime() - next.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

export function extractThemes(entries: GratitudeEntry[]): Record<string, number> {
  const wordCount: Record<string, number> = {};

  entries.forEach(entry => {
    entry.answers.forEach(({ answer }) => {
      const words = answer.toLowerCase().split(/\s+/);
      words.forEach(word => {
        const cleaned = word.replace(/[^a-z]/g, '');
        if (cleaned.length > 3 && !skipWords.has(cleaned)) {
          wordCount[cleaned] = (wordCount[cleaned] || 0) + 1;
        }
      });
    });
  });

  return wordCount;
}

export function getThemeBubbles(entries: GratitudeEntry[], limit: number = 8): ThemeBubble[] {
  const wordCount = extractThemes(entries);

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function categorizeThemes(
  currentMonthEntries: GratitudeEntry[],
  previousMonthEntries: GratitudeEntry[]
): { newThemes: string[], recurringThemes: string[] } {
  const currentThemes = extractThemes(currentMonthEntries);
  const previousThemes = extractThemes(previousMonthEntries);

  const newThemes: string[] = [];
  const recurringThemes: string[] = [];

  Object.keys(currentThemes).forEach(theme => {
    if (previousThemes[theme]) {
      recurringThemes.push(theme);
    } else {
      newThemes.push(theme);
    }
  });

  return {
    newThemes: newThemes.slice(0, 5),
    recurringThemes: recurringThemes.slice(0, 5)
  };
}

export function getPeople(entries: GratitudeEntry[]): string[] {
  const people = new Set<string>();
  entries.forEach(entry => {
    entry.mentionedPeople.forEach(person => people.add(person));
  });
  return Array.from(people);
}

export function getJoyfulMoments(entries: GratitudeEntry[]): string[] {
  const moments: string[] = [];
  entries.forEach(entry => {
    entry.answers.forEach(({ answer }) => {
      if (answer.length > 20) {
        moments.push(answer);
      }
    });
  });
  return moments.slice(0, 4);
}

export function calculateMonthlyStoryData(
  allEntries: GratitudeEntry[]
): MonthlyStoryData {
  const monthEntries = getMonthEntries(allEntries);
  const previousMonthEntries = getPreviousMonthEntries(allEntries);

  const currentStreak = calculateCurrentStreak(allEntries);
  const longestStreak = calculateLongestStreak(allEntries);

  const displayStreak = Math.max(currentStreak, longestStreak);
  const isCurrentStreak = currentStreak >= longestStreak;

  const { newThemes, recurringThemes } = categorizeThemes(monthEntries, previousMonthEntries);

  return {
    daysLogged: monthEntries.length,
    currentStreak,
    longestStreak,
    displayStreak,
    isCurrentStreak,
    stickerCount: monthEntries.reduce((acc, entry) => acc + entry.mentionedPeople.length, 0),
    people: getPeople(monthEntries),
    themeBubbles: getThemeBubbles(monthEntries),
    newThemes,
    recurringThemes,
    joyfulMoments: getJoyfulMoments(monthEntries)
  };
}
