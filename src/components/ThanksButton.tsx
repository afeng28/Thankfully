import { Heart } from 'lucide-react';
import { Button } from './ui/button';

interface ThanksButtonProps {
  onClick: () => void;
  disabled?: boolean;
  lastSentTime?: string;
}

export function ThanksButton({ onClick, disabled, lastSentTime }: ThanksButtonProps) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      size="sm"
      variant="ghost"
      className="text-[#c4a8d4] hover:text-[#d1b5e1] hover:bg-[#3d4260] transition-all ml-2 min-h-[44px] px-3"
      aria-label={lastSentTime ? `Say thanks again (last sent ${lastSentTime})` : 'Say thanks'}
    >
      <Heart className="w-4 h-4 mr-1" />
      <span className="text-sm">Say Thanks</span>
    </Button>
  );
}
