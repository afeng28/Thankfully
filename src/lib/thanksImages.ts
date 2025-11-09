import image4 from '../assets/4.JPEG';
import image5 from '../assets/5.JPEG';
import image6 from '../assets/6.JPEG';
import image7 from '../assets/7.JPEG';
import image8 from '../assets/8.JPEG';

export interface ThankYouImage {
  id: string;
  src: string;
  alt: string;
  description: string;
}

export const thankYouImages: ThankYouImage[] = [
  {
    id: 'image4',
    src: image4,
    alt: 'Thankfully - Cute otter holding a heart with thankfully text',
    description: 'Otter holding heart with "thankfully" text'
  },
  {
    id: 'image5',
    src: image5,
    alt: 'Thankfully - Relaxed otter holding a heart with thankfully text',
    description: 'Relaxed otter with heart and "thankfully" text'
  },
  {
    id: 'image6',
    src: image6,
    alt: "I'm otterly thankful for you - Happy otter jumping with music notes",
    description: 'Happy otter jumping with "i\'m otterly thankful for you!"'
  },
  {
    id: 'image7',
    src: image7,
    alt: 'Hugs and thanks - Two otters hugging each other',
    description: 'Two otters hugging with "hugs and thanks!"'
  },
  {
    id: 'image8',
    src: image8,
    alt: 'I appreciate you - Otter holding a heart',
    description: 'Otter holding heart with "i appreciate you"'
  }
];
