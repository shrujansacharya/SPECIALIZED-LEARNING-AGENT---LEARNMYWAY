import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Star } from 'lucide-react';

interface VideoModalProps {
  videoQuery: string;
  setVideoQuery: (query: string) => void;
  videos: { id: string; title: string; thumbnail: string; description: string }[];
  loading: boolean;
  error: string | null;
  onSearch: () => void;
  onClose: () => void;
  awardBrainBucks: (amount: number) => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoQuery, setVideoQuery, videos, loading, error, onSearch, onClose, awardBrainBucks }) => {
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  const handleQuiz = () => {
    setShowQuiz(true);
    setTimeout(() => {
      setShowQuiz(false);
      awardBrainBucks(20);
      alert('Great job! You earned 20 Brain Bucks! 🎉');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white bg-opacity-90 rounded-2xl p-6 w-full max-w-5xl shadow-lg font-['Poppins']"
      >
        <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
          <Video size={32} /> Explore Fun Videos
        </h2>
        <div className="flex gap-3 mt-4">
          <input
            type="text"
            value={videoQuery}
            onChange={(e) => setVideoQuery(e.target.value)}
            placeholder="Search fun videos (e.g., space for kids)"
            className="flex-1 px-4 py-3 bg-green-100 text-black text-lg border border-green-400 rounded-xl focus:outline-none"
            aria-label="Video search input"
          />
          <motion.button
            onClick={onSearch}
            whileHover={{ scale: 1.2 }}
            className="p-3 bg-green-600 text-white rounded-xl"
            disabled={loading}
            aria-label="Search videos"
          >
            <Video size={24} />
          </motion.button>
          <motion.button
            onClick={handleQuiz}
            whileHover={{ scale: 1.2 }}
            className="p-3 bg-yellow-600 text-white rounded-xl"
            disabled={loading || showQuiz}
            aria-label="Take quiz"
          >
            <Star size={24} />
          </motion.button>
        </div>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-lg text-blue-600"
          >
            Quick Quiz: Loading fun question... 🎉
          </motion.div>
        )}
        {videos.length > 0 && (
          <div className="mt-4 flex overflow-x-auto gap-4 pb-4">
            {videos.map((video) => (
              <motion.a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-100 rounded-xl p-3 w-64 flex-shrink-0 hover:bg-green-200"
                whileHover={{ scale: 1.05 }}
              >
                <img src={video.thumbnail} alt={video.title} className="w-full h-36 object-cover rounded-lg mb-2" />
                <h3 className="text-lg text-blue-600">{video.title}</h3>
                <p className="text-lg text-gray-600">{video.description}</p>
              </motion.a>
            ))}
          </div>
        )}
        {loading && <p className="text-lg text-center mt-4 text-blue-600">Searching videos... 🚀</p>}
        {error && <p className="text-red-500 text-lg text-center mt-4">{error}</p>}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl text-lg"
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default VideoModal;