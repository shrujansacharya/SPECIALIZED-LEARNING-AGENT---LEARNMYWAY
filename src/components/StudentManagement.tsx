import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, Search, X, Trash2, ArrowLeft, Star, TrendingDown, TrendingUp } from 'lucide-react';
import PerformanceModal from './PerformanceModal';

interface StudentManagementProps {
    onBack: () => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ onBack }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [performanceState, setPerformanceState] = useState<{ studentId: string | null; level: 'weak' | 'average' | 'good' | null }>({ studentId: null, level: null });

  const fetchStudents = useCallback(async (studentClass: string) => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/teachers/students`;
      if (studentClass && studentClass !== 'All') {
        url += `?class=${encodeURIComponent(studentClass)}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Failed to fetch students:', response.statusText);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(selectedClass);
  }, [selectedClass, fetchStudents]);

  const handleEdit = (student: any) => {
    setEditingId(student._id);
    setFormData({
      ...student,
      name: student.name || '',
      dob: student.dob || '',
      class: student.class || '',
      email: student.email || '',
      learningStyle: student.learningStyle || '',
      interests: student.interests || '',
    });
  };

  const handleSave = async (id: string) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teachers/students/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setEditingId(null);
          fetchStudents(selectedClass);
        } else {
          alert('Failed to save changes.');
        }
      } catch (error) {
        console.error('Error saving changes:', error);
        alert('Error saving changes.');
      }
    };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teachers/students/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Student record deleted successfully.');
          fetchStudents(selectedClass);
        } else {
          alert('Failed to delete student record. Check the console for details.');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };
  
  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePerformanceClick = (studentId: string, level: 'weak' | 'average' | 'good') => {
    setPerformanceState({ studentId, level });
    setIsPerformanceModalOpen(true);
  };
  
  const onModalClose = () => {
    setIsPerformanceModalOpen(false);
    setPerformanceState({ studentId: null, level: null });
  };

  const getPerformanceSubjects = (student: any, level: 'weak' | 'average' | 'good') => {
    const performanceEntry = student.performance?.find((p: any) => p.level === level);
    return performanceEntry ? performanceEntry.subjects.join(', ') : 'N/A';
  };


  if (loading) {
    return <div className="p-8 text-center text-xl">Loading student data...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft size={24} className="text-gray-800 dark:text-white" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Registered Students</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="All">All Classes</option>
            {[4, 5, 6, 7, 8, 9, 10].map(std => (
              <option key={std} value={`${std}th std`}>{`${std}th std`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b dark:border-gray-700 text-left text-gray-500 dark:text-gray-400 uppercase text-sm">
              <th className="p-3">Name</th>
              <th className="p-3">Date of Birth</th>
              <th className="p-3">Class</th>
              <th className="p-3">Email</th>
              <th className="p-3">Learning Style</th>
              <th className="p-3">Interests</th>
              <th className="p-3">Performance</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <tr key={s._id} className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-3 text-gray-800 dark:text-white">{editingId === s._id ? <input type="text" value={formData.name} onChange={e => handleChange(e, 'name')} className="w-full bg-transparent" /> : s.name}</td>
                  <td className="p-3 text-gray-800 dark:text-white">{editingId === s._id ? <input type="date" value={formData.dob} onChange={e => handleChange(e, 'dob')} className="w-20 bg-transparent" /> : s.dob}</td>
                  <td className="p-3 text-gray-800 dark:text-white">{editingId === s._id ? <input type="text" value={formData.class} onChange={e => handleChange(e, 'class')} className="w-24 bg-transparent" /> : s.class}</td>
                  <td className="p-3 text-gray-800 dark:text-white">{editingId === s._id ? <input type="email" value={formData.email} onChange={e => handleChange(e, 'email')} className="w-full bg-transparent" /> : s.email}</td>
                  <td className="p-3 text-gray-800 dark:text-white">{editingId === s._id ? <input type="text" value={formData.learningStyle} onChange={e => handleChange(e, 'learningStyle')} className="w-full bg-transparent" /> : s.learningStyle || 'N/A'}</td>
                  <td className="p-3 text-gray-800 dark:text-white">{editingId === s._id ? <input type="text" value={formData.interests} onChange={e => handleChange(e, 'interests')} className="w-full bg-transparent" /> : s.interests || 'N/A'}</td>
                  <td className="p-3 text-gray-800 dark:text-white">
                    <div className="flex gap-2">
                        <button onClick={() => handlePerformanceClick(s._id, 'weak')} className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Weak</button>
                        <button onClick={() => handlePerformanceClick(s._id, 'average')} className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors">Average</button>
                        <button onClick={() => handlePerformanceClick(s._id, 'good')} className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors">Good</button>
                    </div>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {editingId === s._id ? (
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleSave(s._id)} className="text-green-500 hover:text-green-700" title="Save">
                          <Save size={20} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-700" title="Cancel">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-700" title="Edit">
                          <Edit size={20} />
                        </button>
                        <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700" title="Delete">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500 dark:text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PerformanceModal 
        isOpen={isPerformanceModalOpen}
        onClose={onModalClose}
        studentId={performanceState.studentId}
        performanceLevel={performanceState.level}
        onSave={() => fetchStudents(selectedClass)}
      />
    </motion.div>
  );
};

export default StudentManagement;