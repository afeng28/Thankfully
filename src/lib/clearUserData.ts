import { supabase } from './supabase';
import { clearAllGratitudeEntries } from './gratitudeEntries';

/**
 * Clears all user data including:
 * - Theme analysis cache
 * - Gratitude entries (for fresh start)
 * - Any other cached user data
 */
export async function clearUserData(userId: string = 'default_user', clearEntries: boolean = true): Promise<boolean> {
  try {
    // Clear theme analysis cache
    try {
      const { error: cacheError } = await supabase
        .from('theme_analysis_cache')
        .delete()
        .eq('cache_key', `theme_analysis_${userId}`);

      if (cacheError) {
        console.error('Error clearing theme cache:', cacheError);
        // Continue even if cache clear fails (table might not exist)
      }
    } catch (cacheError) {
      console.log('Theme cache table might not exist, continuing...');
    }

    // Clear all gratitude entries if requested (for fresh start)
    if (clearEntries) {
      await clearAllGratitudeEntries(userId);
    }

    // Clear any localStorage data related to themes or user memory
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('theme') || key.includes('analysis') || key.includes('cache'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (localStorageError) {
      console.error('Error clearing localStorage:', localStorageError);
      // Continue even if localStorage clear fails
    }

    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
}

