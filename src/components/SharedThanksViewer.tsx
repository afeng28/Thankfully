import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface SharedThanksData {
  recipient_name: string;
  image_url: string;
  message: string;
}

interface SharedThanksViewerProps {
  shareId: string;
}

export function SharedThanksViewer({ shareId }: SharedThanksViewerProps) {
  const [data, setData] = useState<SharedThanksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSharedThanks = async () => {
      try {
        const { data: thanksData, error: fetchError } = await supabase
          .from('shared_thanks')
          .select('*')
          .eq('share_id', shareId)
          .maybeSingle();

        if (fetchError || !thanksData) {
          setError(true);
        } else {
          setData(thanksData);
        }
      } catch (err) {
        console.error('Error fetching shared thanks:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedThanks();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1d2e] via-[#25283d] to-[#2d3250] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-8xl"
        >
          🦦
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1d2e] via-[#25283d] to-[#2d3250] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-[#e8d4e8] text-2xl font-medium mb-2">
            Thank You Message Not Found
          </h1>
          <p className="text-[#a8b5d4]">
            This link may have expired or is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d2e] via-[#25283d] to-[#2d3250] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[#e8d4e8] text-4xl font-semibold text-center mb-8"
        >
          Thank you, {data.recipient_name}!
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#3d4260] rounded-3xl p-8"
        >
          <img
            src={data.image_url}
            alt="Thank you sticker"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </motion.div>

        {data.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-[#3d4260] rounded-2xl p-6 text-center"
          >
            <p className="text-[#d4a5d4] text-lg leading-relaxed">
              {data.message}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-[#a8b5d4] text-sm"
        >
          Sent with gratitude
        </motion.div>
      </motion.div>
    </div>
  );
}
