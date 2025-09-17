import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StudentManagement from './StudentManagement';
import MaterialsManager from './MaterialsManager';
import VideoClasses from './VideoClasses'; // ✅ New import

const TeacherDashboard: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'students' | 'classes' | 'materials'>('dashboard');
    const [isPasswordProtected, setIsPasswordProtected] = useState(true);
    const [password, setPassword] = useState('');

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === import.meta.env.VITE_TEACHER_PASSWORD) {
            setIsPasswordProtected(false);
        } else {
            alert('Incorrect password.');
            setPassword('');
        }
    };

    if (isPasswordProtected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        Teacher Access
                    </h2>
                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        >
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (view) {
            case 'students':
                return <StudentManagement onBack={() => setView('dashboard')} />;
            case 'classes':
                return <VideoClasses onBack={() => setView('dashboard')} />; // ✅ Updated
            case 'materials':
                return <MaterialsManager onBack={() => setView('dashboard')} />;
            case 'dashboard':
            default:
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                    >
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setView('students')}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Registered Students
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                View and manage student data.
                            </p>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setView('classes')}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Classes
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Create and manage live video sessions.
                            </p>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setView('materials')}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Manage Materials
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Upload and view shared resources.
                            </p>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">
                Teacher Dashboard
            </h1>
            {renderContent()}
        </div>
    );
};

export default TeacherDashboard;
