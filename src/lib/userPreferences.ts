import { supabase } from './supabase';
import type { OnboardingData, TextBoxSize } from '../components/onboarding/OnboardingFlow';

export interface UserPreferences {
  id: string;
  user_id: string;
  username: string;
  main_goal?: string;
  time_commitment?: string;
  text_box_size: TextBoxSize;
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', 'default_user')
    .maybeSingle();

  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }

  return data;
}

export async function saveOnboardingPreferences(
  onboardingData: OnboardingData,
  username: string = 'Friend'
): Promise<boolean> {
  const existing = await getUserPreferences();

  const preferenceData = {
    user_id: 'default_user',
    username,
    main_goal: onboardingData.mainGoal,
    time_commitment: onboardingData.timeCommitment,
    text_box_size: onboardingData.textBoxSize || 'medium',
    has_completed_onboarding: true
  };

  if (existing) {
    const { error } = await supabase
      .from('user_preferences')
      .update(preferenceData)
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('user_preferences')
      .insert([preferenceData]);

    if (error) {
      console.error('Error creating user preferences:', error);
      return false;
    }
  }

  return true;
}

export async function updateUsername(username: string): Promise<boolean> {
  const existing = await getUserPreferences();

  if (!existing) {
    return false;
  }

  const { error } = await supabase
    .from('user_preferences')
    .update({ username })
    .eq('id', existing.id);

  if (error) {
    console.error('Error updating username:', error);
    return false;
  }

  return true;
}

export function getTextAreaHeight(textBoxSize: TextBoxSize): string {
  switch (textBoxSize) {
    case 'small':
      return 'h-20';
    case 'medium':
      return 'h-32';
    case 'large':
      return 'h-48';
    default:
      return 'h-32';
  }
}

export function getTextAreaRows(textBoxSize: TextBoxSize): number {
  switch (textBoxSize) {
    case 'small':
      return 3;
    case 'medium':
      return 5;
    case 'large':
      return 8;
    default:
      return 5;
  }
}
