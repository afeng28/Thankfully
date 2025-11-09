import { supabase } from './supabase';

export interface ThanksSent {
  id: string;
  user_id: string;
  person_name: string;
  image_selected: string;
  sent_timestamp: string;
  message_status: string;
  created_at: string;
  updated_at: string;
}

export async function saveThanksRecord(
  personName: string,
  imageId: string,
  status: 'sent' | 'failed' = 'sent'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('thanks_sent')
      .insert([{
        user_id: 'default_user',
        person_name: personName,
        image_selected: imageId,
        message_status: status,
        sent_timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error saving thanks record:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception saving thanks record:', err);
    return false;
  }
}

export async function getLastThanksSent(personName: string): Promise<ThanksSent | null> {
  try {
    const { data, error } = await supabase
      .from('thanks_sent')
      .select('*')
      .eq('user_id', 'default_user')
      .eq('person_name', personName)
      .order('sent_timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching last thanks sent:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching last thanks sent:', err);
    return null;
  }
}

export async function getThanksHistory(personName?: string): Promise<ThanksSent[]> {
  try {
    let query = supabase
      .from('thanks_sent')
      .select('*')
      .eq('user_id', 'default_user')
      .order('sent_timestamp', { ascending: false });

    if (personName) {
      query = query.eq('person_name', personName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching thanks history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching thanks history:', err);
    return [];
  }
}

export function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

export async function shareViaIMessage(imageUrl: string, personName: string): Promise<boolean> {
  try {
    if (canUseNativeShare()) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'thank-you.jpg', { type: 'image/jpeg' });

      await navigator.share({
        files: [file],
        title: 'Thank You',
        text: `Thank you, ${personName}! 💜`
      });

      return true;
    } else {
      const smsUrl = `sms:&body=Thank you, ${personName}! 💜`;
      window.open(smsUrl, '_blank');
      return true;
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return false;
    }
    console.error('Error sharing via iMessage:', err);
    return false;
  }
}

export function formatTimeSince(date: string): string {
  const now = new Date();
  const sentDate = new Date(date);
  const diffMs = now.getTime() - sentDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return sentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
