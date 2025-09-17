import React from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { Message, Subject } from '../Chatbot';

interface HistoryModalProps {
  history: Message[];
  subjects: Subject[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, subjects, onClose }) => {
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
        className="bg-white bg-opacity-90 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg font-['Poppins']"
      >
        <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
          <History size={32} /> Your Learning Quests
        </h2>
        <div className="mt-4 space-y-3">
          {history.map((msg, idx) => (
            <div key={idx} className="bg-green-100 p-3 rounded-xl">
              <p className="text-lg text-gray-600">
                {new Date(msg.timestamp).toLocaleString()} - {subjects.find(s => s.id === msg.subjectId)?.name || 'General'}
              </p>
              <p className={`text-lg ${msg.isBot ? 'text-black' : 'text-green-600'}`}>
                {msg.isBot ? 'Owl Buddy: ' : 'You: '}{msg.text.slice(0, 100)}{msg.text.length > 100 ? '...' : ''} {msg.sticker || ''}
              </p>
            </div>
          ))}
        </div>
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

export default HistoryModal;