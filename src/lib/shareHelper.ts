import { supabase } from './supabase';

function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function createShareableLink(
  recipientName: string,
  imageUrl: string,
  message: string
): Promise<string | null> {
  try {
    const shareId = generateShareId();

    const { error } = await supabase
      .from('shared_thanks')
      .insert({
        share_id: shareId,
        recipient_name: recipientName,
        image_url: imageUrl,
        message,
      });

    if (error) {
      console.error('Error creating shareable link:', error);
      return null;
    }

    const baseUrl = window.location.origin;
    return `${baseUrl}?thanks=${shareId}`;
  } catch (error) {
    console.error('Error creating shareable link:', error);
    return null;
  }
}
