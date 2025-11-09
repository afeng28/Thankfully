import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { thankYouImages } from '../lib/thanksImages';
import { saveThanksRecord } from '../lib/thanksHelper';
import { SharingOptionsModal } from './SharingOptionsModal';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { createShareableLink } from '../lib/shareHelper';

interface ThanksModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  onSuccess?: () => void;
}

export function ThanksModal({ isOpen, onClose, personName, onSuccess }: ThanksModalProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [showSharingOptions, setShowSharingOptions] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = async (imageId: string) => {
    setSelectedImageId(imageId);
    setIsUploading(true);

    try {
      const selectedImage = thankYouImages.find(img => img.id === imageId);
      if (!selectedImage) return;

      const response = await fetch(selectedImage.src);
      const blob = await response.blob();

      const fileName = `${Date.now()}-${imageId}.jpg`;
      const { data, error } = await supabase.storage
        .from('thanks-stickers')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('thanks-stickers')
        .getPublicUrl(fileName);

      setUploadedImageUrl(publicUrl);
      setShowSharingOptions(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to prepare image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadImage = async () => {
    if (!uploadedImageUrl) return false;

    try {
      const response = await fetch(uploadedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thank-you-${personName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Failed to download:', err);
      return false;
    }
  };

  const copyImageToClipboard = async () => {
    if (!uploadedImageUrl) return false;

    try {
      const response = await fetch(uploadedImageUrl);
      const blob = await response.blob();

      const img = new Image();
      img.src = URL.createObjectURL(blob);
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      ctx.drawImage(img, 0, 0);

      const pngBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);

      URL.revokeObjectURL(img.src);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  };

  const handleShare = async (method: 'text' | 'download' | 'copy') => {
    if (!selectedImageId || !uploadedImageUrl) return;

    const selectedImage = thankYouImages.find(img => img.id === selectedImageId);
    if (!selectedImage) return;

    try {
      await saveThanksRecord(personName, selectedImageId, 'sent');

      if (method === 'text') {
        try {
          const response = await fetch(uploadedImageUrl);
          const blob = await response.blob();

          const img = new Image();
          img.src = URL.createObjectURL(blob);
          await new Promise((resolve) => { img.onload = resolve; });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');

          ctx.drawImage(img, 0, 0);

          const pngBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png');
          });

          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob })
          ]);

          URL.revokeObjectURL(img.src);

          const message = `Thank you, ${personName}!`;
          const encodedMessage = encodeURIComponent(message);
          window.location.href = `sms:?&body=${encodedMessage}`;

          toast.success('Sticker copied!', {
            description: 'Paste it in your message',
            duration: 4000
          });

          onSuccess?.();
          setShowSharingOptions(false);
          setSelectedImageId(null);
          setUploadedImageUrl(null);
          onClose();
          return;
        } catch (error) {
          console.error('Clipboard failed, falling back to share:', error);

          if (navigator.share) {
            try {
              const response = await fetch(uploadedImageUrl);
              const blob = await response.blob();
              const file = new File([blob], `thank-you-${personName}.jpg`, { type: 'image/jpeg' });

              const shareData = {
                text: `Thank you, ${personName}!`,
                files: [file]
              };

              if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                toast.success('Shared successfully!');
                onSuccess?.();
                setShowSharingOptions(false);
                setSelectedImageId(null);
                setUploadedImageUrl(null);
                onClose();
                return;
              }
            } catch (shareError: any) {
              if (shareError.name === 'AbortError') {
                onSuccess?.();
                setShowSharingOptions(false);
                setSelectedImageId(null);
                setUploadedImageUrl(null);
                onClose();
                return;
              }
            }
          }

          toast.error('Could not copy. Please try download instead.');
          return;
        }
      } else if (method === 'download') {
        const downloaded = await downloadImage();
        if (downloaded) {
          toast.success('Image downloaded successfully!');
        } else {
          toast.error('Failed to download image. Please try again.');
          return;
        }
      } else if (method === 'copy') {
        const copied = await copyImageToClipboard();
        if (copied) {
          toast.success('Image copied to clipboard!', {
            description: 'You can now paste it in any app'
          });
        } else {
          toast.error('Failed to copy. Please try download instead.');
          return;
        }
      }

      onSuccess?.();
      setShowSharingOptions(false);
      setSelectedImageId(null);
      setUploadedImageUrl(null);
      onClose();
    } catch (error) {
      console.error('Error sharing thanks:', error);
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleCloseSharingOptions = () => {
    setShowSharingOptions(false);
    setSelectedImageId(null);
    setUploadedImageUrl(null);
  };

  const handleChangeSticker = () => {
    setShowSharingOptions(false);
    setSelectedImageId(null);
    setUploadedImageUrl(null);
  };

  const handleCloseMain = () => {
    setSelectedImageId(null);
    setShowSharingOptions(false);
    setUploadedImageUrl(null);
    onClose();
  };

  const selectedImage = selectedImageId ? thankYouImages.find(img => img.id === selectedImageId) : null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !showSharingOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseMain}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="thanks-modal-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#2d3250] rounded-3xl p-6 sm:p-8 max-w-4xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 id="thanks-modal-title" className="text-[#e8d4e8] text-xl sm:text-2xl font-medium">
                  Say Thanks to {personName}
                </h2>
                <Button
                  onClick={handleCloseMain}
                  variant="ghost"
                  size="icon"
                  className="text-[#a8b5d4] hover:bg-[#3d4260] min-w-[44px] min-h-[44px]"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-[#a8b5d4] mb-6 text-center">
                Select a thank you sticker to share:
              </p>

              <div className="flex justify-center items-center gap-3">
                {thankYouImages.slice(2).map((image, index) => (
                  <motion.button
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleImageSelect(image.id)}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-[#d4a5d4] focus:ring-offset-2 focus:ring-offset-[#2d3250] hover:scale-110 hover:ring-2 hover:ring-[#a8b5d4] cursor-pointer"
                    aria-label={`Select ${image.alt}`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    {selectedImageId === image.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-[#d4a5d4]/40 border-4 border-[#d4a5d4] rounded-xl"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SharingOptionsModal
        isOpen={showSharingOptions}
        onClose={handleCloseSharingOptions}
        onShare={handleShare}
        selectedImageSrc={selectedImage?.src}
        selectedImageAlt={selectedImage?.alt}
        onChangeSticker={handleChangeSticker}
      />
    </>
  );
}
