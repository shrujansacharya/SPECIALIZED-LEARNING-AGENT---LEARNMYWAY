import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, File, Image as ImageIcon, Users, Filter } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { subjectDetails } from '../utils/subjects';

interface UploadedMaterialsListProps {
    onBack: () => void;
}

const isImage = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension && imageExtensions.includes(extension);
};

const isVideo = (fileName: string) => {
    const videoExtensions = ['mp4', 'avi', 'mov', 'webm'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension && videoExtensions.includes(extension);
};

const AssignedStudentsSummary: React.FC<{ students: any[] }> = ({ students }) => {
    if (!students || students.length === 0) {
        return <span className="text-gray-500">No students assigned</span>;
    }
    const totalStudents = students.length;
    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users size={16} />
            <span title={students.map(s => s.name).join(', ')}>
                Assigned to <strong className="font-semibold text-gray-700 dark:text-gray-300">{totalStudents} student(s)</strong>
            </span>
        </div>
    );
};

const UploadedMaterialsList: React.FC<UploadedMaterialsListProps> = ({ onBack }) => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string>('All');
    const [selectedClass, setSelectedClass] = useState<string>('All');

    const availableSubjects = ['All', ...subjectDetails.map(s => s.name)];
    const availableClasses = ['All', '4th std', '5th std', '6th std', '7th std', '8th std', '9th std', '10th std'];

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) return;
                const idToken = await user.getIdToken();

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials`, {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setMaterials(data);
                } else {
                    console.error('Failed to fetch materials:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching materials:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);
    
    const filteredMaterials = useMemo(() => {
        return materials.filter(material => {
            const subjectMatch = selectedSubject === 'All' || material.subject === selectedSubject;
            
            if (!subjectMatch) return false;

            if (selectedClass === 'All') return true;

            return material.targetStudents && material.targetStudents.some((student: any) => 
                student?.class?.trim().toLowerCase() === selectedClass.trim().toLowerCase()
            );
        });
    }, [materials, selectedSubject, selectedClass]);

    const handleDelete = async (materialId: string) => {
        if (window.confirm('Are you sure you want to delete this material?')) {
             try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) return;
                const idToken = await user.getIdToken();

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials/${materialId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${idToken}` },
                });

                if (response.ok) {
                    alert('Material deleted successfully.');
                    setMaterials(prev => prev.filter(m => m._id !== materialId));
                } else {
                    alert('Failed to delete material.');
                }
            } catch (error) {
                console.error('Error deleting material:', error);
                alert('An error occurred while deleting the material.');
            }
        }
    };
    
    if (loading) {
        return <div className="p-8 text-center text-lg dark:text-white">Loading materials...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl min-h-screen">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeft size={24} className="text-gray-800 dark:text-white" />
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Uploaded Materials</h2>
            </div>

            <div className="p-4 mb-8 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col md:flex-row gap-4 items-center border dark:border-gray-600">
                <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
                    <Filter size={20} />
                    <span>Filter by:</span>
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <select id="subject-filter" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500">
                        {availableSubjects.map(subject => (<option key={subject} value={subject}>{subject === 'All' ? 'All Subjects' : subject}</option>))}
                    </select>
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <select id="class-filter" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500">
                        {availableClasses.map(cls => (<option key={cls} value={cls}>{cls === 'All' ? 'All Classes' : cls}</option>))}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.length > 0 ? filteredMaterials.map((material: any) => (
                    <div key={material._id} className="relative p-4 border rounded-xl shadow-sm bg-gray-50 dark:bg-gray-700 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-8" title={material.fileName}>{material.fileName}</h4>
                            <button onClick={() => handleDelete(material._id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={20} />
                            </button>
                        </div>
                        {material.comment && (<p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Task:</strong> {material.comment}</p>)}
                        <div className="mb-3"><AssignedStudentsSummary students={material.targetStudents} /></div>
                        <div className="flex-grow flex items-center justify-center p-4 mt-auto border rounded-lg bg-white dark:bg-gray-800">
                           {isImage(material.fileName) ? ( <img src={`${import.meta.env.VITE_BACKEND_URL}${material.filePath}`} alt={material.fileName} className="max-h-28 object-contain" /> ) : isVideo(material.fileName) ? ( <video src={`${import.meta.env.VITE_BACKEND_URL}${material.filePath}`} className="max-h-28 object-contain" controls={false} /> ) : ( <div className="flex items-center text-gray-500 dark:text-gray-300"><File size={32} className="mr-2" /><span>{material.fileName.split('.').pop()?.toUpperCase()} File</span></div> )}
                        </div>
                    </div>
                )) : (
                     <p className="col-span-full text-center text-gray-500 dark:text-gray-400 mt-12">No materials found for the selected filters.</p>
                )}
            </div>
        </motion.div>
    );
};

export default UploadedMaterialsList;