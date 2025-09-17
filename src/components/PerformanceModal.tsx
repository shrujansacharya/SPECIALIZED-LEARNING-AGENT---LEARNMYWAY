// src/components/PerformanceModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { subjectDetails } from '../utils/subjects'; // Import subjectDetails instead of a hardcoded list

interface PerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string | null;
    performanceLevel: 'weak' | 'average' | 'good' | null;
    onSave: () => void;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({ isOpen, onClose, studentId, performanceLevel, onSave }) => {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Use the name from the centralized subjectDetails list
    const subjects = subjectDetails.map(subject => subject.name);

    const handleSubjectToggle = (subjectName: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectName)
                ? prev.filter(s => s !== subjectName)
                : [...prev, subjectName]
        );
    };

    const handleSave = async () => {
        if (!studentId || !performanceLevel || selectedSubjects.length === 0) {
            alert('Please select at least one subject.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teachers/students/${studentId}/performance`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: performanceLevel,
                    subjects: selectedSubjects,
                }),
            });

            if (response.ok) {
                alert(`Student marked as ${performanceLevel} in ${selectedSubjects.join(', ')}.`);
                onSave();
                onClose();
            } else {
                alert('Failed to save performance data.');
            }
        } catch (error) {
            console.error("Error saving performance:", error);
            alert('An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedSubjects([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50 }}
                        className="relative w-full max-w-md p-6 bg-white rounded-3xl shadow-2xl text-gray-800"
                    >
                        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Mark Student as <span className={`capitalize ${performanceLevel === 'weak' ? 'text-red-500' : performanceLevel === 'average' ? 'text-yellow-500' : 'text-green-500'}`}>{performanceLevel}</span></h2>
                        <p className="text-gray-600 mb-6">Select the subjects this student needs help with:</p>

                        <div className="grid grid-cols-2 gap-4 mb-6 max-h-60 overflow-y-auto">
                            {subjects.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => handleSubjectToggle(subject)}
                                    className={`py-2 px-4 rounded-full text-sm font-semibold transition-colors ${
                                        selectedSubjects.includes(subject)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading || selectedSubjects.length === 0}
                            className="mt-4 w-full py-3 px-6 bg-green-500 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Saving...' : 'Save Performance'}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PerformanceModal;