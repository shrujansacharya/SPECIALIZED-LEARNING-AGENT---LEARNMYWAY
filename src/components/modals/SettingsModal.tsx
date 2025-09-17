// src/components/modals/SettingsModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SettingsModalProps {
  notifications: boolean;
  sound: boolean;
  onToggleNotifications: () => void;
  onToggleSound: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
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
        className="bg-white bg-opacity-90 rounded-2xl p-6 w-full max-w-md shadow-lg"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-blue-600">Settings</h2>
          <motion.button onClick={onClose} whileHover={{ scale: 1.2 }} className="p-2 bg-red-600 text-white rounded-full">
            <X size={24} />
          </motion.button>
        </div>
        <p className="mt-4">Settings placeholder</p>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;