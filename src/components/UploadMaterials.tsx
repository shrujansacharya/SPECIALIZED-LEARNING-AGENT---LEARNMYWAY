import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, Users, BookOpen, FileText, CheckCircle, ChevronRight, XCircle, FileUp } from 'lucide-react';
import { subjectDetails } from '../utils/subjects';
import { getAuth } from 'firebase/auth';

interface UploadMaterialsProps {
    onBack: () => void;
    onViewUploads: () => void;
}

const UploadMaterials: React.FC<UploadMaterialsProps> = ({ onBack, onViewUploads }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [studentsInClass, setStudentsInClass] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [comment, setComment] = useState<string>('');
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // THE FIX: Use the full, consistent class names
    const classes = ['4th std', '5th std', '6th std', '7th std', '8th std', '9th std', '10th std'];
    const subjects = subjectDetails;

    // Fetch students when a class is selected
    useEffect(() => {
        const fetchStudentsByClass = async () => {
            if (!selectedClass) {
                setStudentsInClass([]);
                return;
            }
            try {
                // THE FIX: API call now uses the selectedClass directly
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/teachers/students?class=${selectedClass}`);
                setStudentsInClass(response.data);
                setSelectedStudents(response.data.map((s: any) => s._id));
            } catch (err) {
                setError("Could not load students for this class.");
            }
        };
        fetchStudentsByClass();
    }, [selectedClass]);

    const handleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        setSelectedStudents(prev => 
            prev.length === studentsInClass.length ? [] : studentsInClass.map(s => s._id)
        );
    };

    const handleUpload = async () => {
        if (!selectedSubject || !file || selectedStudents.length === 0) {
            setError('Please complete all steps before uploading.');
            return;
        }
        setUploading(true);
        setError(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');
            
            const idToken = await user.getIdToken();

            const formData = new FormData();
            formData.append('material', file);
            formData.append('subject', selectedSubject);
            formData.append('comment', comment);
            formData.append('targetStudents', JSON.stringify(selectedStudents));

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/teachers/upload-material`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${idToken}`,
                },
            });
            setUploadSuccess(true);
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setSelectedSubject(null);
        setSelectedClass('');
        setStudentsInClass([]);
        setSelectedStudents([]);
        setFile(null);
        setComment('');
        setUploadSuccess(false);
        setError(null);
    };

    const steps = [
        { id: 1, name: 'Subject', icon: BookOpen },
        { id: 2, name: 'Audience', icon: Users },
        { id: 3, name: 'File', icon: FileText },
        { id: 4, name: 'Review', icon: CheckCircle },
    ];

    const stepVariants = {
        hidden: { opacity: 0, x: 300 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -300 },
    };

    // Main component render
    if (uploadSuccess) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upload Successful!</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">The material has been assigned to the selected students.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={resetForm} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Upload Another File</button>
                    <button onClick={onViewUploads} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">View All Uploads</button>
                </div>
            </motion.div>
        );
    }
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ArrowLeft className="text-gray-800 dark:text-white" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upload New Material</h2>
                </div>
                <button onClick={onViewUploads} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    View Uploads
                </button>
            </div>
            
            {/* Stepper */}
            <div className="flex justify-between items-center mb-8">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.id ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                <step.icon size={24} />
                            </div>
                            <p className={`mt-2 text-sm font-semibold ${currentStep >= step.id ? 'text-gray-800 dark:text-white' : 'text-gray-500'}`}>{step.name}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px] overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div key={currentStep} variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                        {currentStep === 1 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Step 1: Choose a Subject</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {subjects.map(subject => (
                                        <button key={subject.id} onClick={() => { setSelectedSubject(subject.name); setCurrentStep(2); }} className="p-4 text-left bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:ring-2 hover:ring-purple-500 transition-all">
                                            {subject.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Step 2: Select Audience for <span className="text-purple-500">{selectedSubject}</span></h3>
                                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-4">
                                    <option value="" disabled>-- Select a Class --</option>
                                    {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                </select>
                                {studentsInClass.length > 0 && (
                                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-gray-700 dark:text-gray-300">Students in Class {selectedClass}</h4>
                                            <button onClick={handleSelectAll} className="text-sm font-semibold text-purple-600 hover:underline">{selectedStudents.length === studentsInClass.length ? 'Deselect All' : 'Select All'}</button>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {studentsInClass.map(student => (
                                                <div key={student._id} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                                                    <input type="checkbox" id={student._id} checked={selectedStudents.includes(student._id)} onChange={() => handleStudentSelection(student._id)} className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"/>
                                                    <label htmlFor={student._id} className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200">{student.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <button onClick={() => setCurrentStep(3)} disabled={selectedStudents.length === 0} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400">Next</button>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Step 3: Upload File & Add Details</h3>
                                <div className="mb-4">
                                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{file ? `Selected: ${file.name}` : <><span className="font-semibold">Click to upload</span> or drag and drop</>}</p>
                                        </div>
                                        <input id="file-upload" type="file" className="hidden" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                                    </label>
                                </div>
                                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a task or comment (optional)..." className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600" rows={4}/>
                                <button onClick={() => setCurrentStep(4)} disabled={!file} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400">Next</button>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Step 4: Review and Upload</h3>
                                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <p><strong>Subject:</strong> <span className="text-purple-600 font-medium">{selectedSubject}</span></p>
                                    <p><strong>Assigned to:</strong> <span className="text-purple-600 font-medium">{selectedStudents.length} student(s) from Class {selectedClass}</span></p>
                                    <p><strong>File:</strong> <span className="text-purple-600 font-medium">{file?.name}</span></p>
                                    {comment && <p><strong>Comment:</strong> <span className="text-purple-600 font-medium">{comment}</span></p>}
                                </div>
                                <button onClick={handleUpload} disabled={uploading} className="mt-4 w-full py-3 bg-green-500 text-white font-bold rounded-lg disabled:bg-gray-400">
                                    {uploading ? 'Uploading...' : 'Confirm & Upload'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {/* Back Button */}
            {currentStep > 1 && (
                <button onClick={() => setCurrentStep(currentStep - 1)} className="mt-4 text-sm text-gray-500 hover:underline">
                    Back
                </button>
            )}

            {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        </motion.div>
    );
};

export default UploadMaterials;