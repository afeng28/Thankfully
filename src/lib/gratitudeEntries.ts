import { supabase } from './supabase';
import type { GratitudeEntry } from '../App';

export async function saveGratitudeEntry(entry: GratitudeEntry): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gratitude_entries')
      .insert({
        user_id: 'default_user',
        entry_date: entry.date.toISOString().split('T')[0],
        answers: entry.answers,
        mentioned_people: entry.mentionedPeople,
        media_url: entry.mediaUrl
      });

    if (error) {
      console.error('Error saving gratitude entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving gratitude entry:', error);
    return false;
  }
}

export async function loadGratitudeEntries(): Promise<GratitudeEntry[]> {
  try {
    const { data, error } = await supabase
      .from('gratitude_entries')
      .select('*')
      .eq('user_id', 'default_user')
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error loading gratitude entries:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(entry => ({
      id: entry.id,
      date: new Date(entry.entry_date),
      answers: entry.answers as Array<{ question: string; answer: string }>,
      mentionedPeople: entry.mentioned_people || [],
      mediaUrl: entry.media_url || undefined
    }));
  } catch (error) {
    console.error('Error loading gratitude entries:', error);
    return [];
  }
}

export async function deleteGratitudeEntry(entryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gratitude_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', 'default_user');

    if (error) {
      console.error('Error deleting gratitude entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting gratitude entry:', error);
    return false;
  }
}
