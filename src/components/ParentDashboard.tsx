import React from 'react';
import { Clock, Award, BookOpen, AlertTriangle } from 'lucide-react';

const ProgressCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-${color}-50 p-6 rounded-xl`}>
    <div className="flex items-center space-x-4">
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
    </div>
  </div>
);

export const ParentDashboard = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen" role="main">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Parent Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ProgressCard
          title="Time Spent Learning"
          value="2.5 hours"
          icon={Clock}
          color="blue"
        />
        <ProgressCard
          title="Achievements"
          value="5 badges"
          icon={Award}
          color="green"
        />
        <ProgressCard
          title="Lessons Completed"
          value="12"
          icon={BookOpen}
          color="purple"
        />
        <ProgressCard
          title="Areas for Help"
          value="2"
          icon={AlertTriangle}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { activity: 'Completed Math Quiz', time: '2 hours ago', score: '90%' },
              { activity: 'Started Science Lesson', time: '4 hours ago', score: 'In Progress' },
              { activity: 'Earned "Math Whiz" Badge', time: 'Yesterday', score: '🏆' },
            ].map((item) => (
              <div
                key={item.activity}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.activity}</p>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </div>
                <span className="font-semibold text-indigo-600">{item.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Focus Areas</h2>
          <div className="space-y-4">
            {[
              { subject: 'Mathematics', progress: 75, status: 'Excelling' },
              { subject: 'Reading', progress: 60, status: 'On Track' },
              { subject: 'Science', progress: 45, status: 'Needs Attention' },
            ].map((item) => (
              <div key={item.subject} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">{item.subject}</span>
                  <span className="text-sm text-gray-500">{item.status}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${item.progress}%` }}
                    role="progressbar"
                    aria-valuenow={item.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings & Controls</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Daily Time Limit</p>
              <p className="text-sm text-gray-500">Set maximum learning time per day</p>
            </div>
            <select
              className="px-4 py-2 border rounded-lg"
              aria-label="Select daily time limit"
            >
              <option>1 hour</option>
              <option>2 hours</option>
              <option>3 hours</option>
              <option>4 hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Content Restrictions</p>
              <p className="text-sm text-gray-500">Manage accessible content</p>
            </div>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              aria-label="Manage content restrictions"
            >
              Manage
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Weekly Progress Reports</p>
              <p className="text-sm text-gray-500">Receive detailed learning reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};