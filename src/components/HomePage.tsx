import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon } from 'lucide-react';

interface NotificationBellProps {
  notifications: any[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications }) => (
  <div className="relative">
    <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-500 transition-colors" />
    {notifications.length > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </div>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    setNotifications([{ id: 1, message: 'Welcome back to LearnMyWay! 🚀' }]);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <style>{`
        * { font-family: 'Baloo 2', cursive; }
        .gradient-bg {
          background: linear-gradient(-45deg, #38BDF8, #9AE6B4, #F6AD55, #D6BCFA);
          background-size: 400% 400%;
          animation: gradientShift 8s ease-in-out infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }
        .floating-icon:nth-child(2) { animation-delay: -2s; }
        .floating-icon:nth-child(3) { animation-delay: -4s; }
        .floating-icon:nth-child(4) { animation-delay: -1s; }
        .floating-icon:nth-child(5) { animation-delay: -3s; }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(-10px) rotate(-3deg); }
        }
        .bounce-in { animation: bounceIn 1s ease-out; }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* Background */}
      <div className="gradient-bg absolute inset-0"></div>

      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-icon absolute top-20 left-10 text-6xl">🚀</div>
        <div className="floating-icon absolute top-32 right-20 text-5xl">✨</div>
        <div className="floating-icon absolute bottom-40 left-20 text-4xl">📚</div>
        <div className="floating-icon absolute bottom-20 right-10 text-6xl">🎮</div>
        <div className="floating-icon absolute top-1/2 left-1/3 text-5xl">🌟</div>
      </div>

      {/* Nav bar */}
      <nav className="flex justify-end items-center p-6 md:p-12 relative z-20">
        <div className="flex items-center space-x-4">
          <NotificationBell notifications={notifications} />
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors">
            {darkMode ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-200" />}
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bounce-in drop-shadow-2xl">
          Ready to Play and Learn? 🎮
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl leading-relaxed bounce-in" style={{ animationDelay: '0.2s' }}>
          Choose your side of the adventure and let’s get started!
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Student */}
          <div
            onClick={() => navigate('/login')}
            className="card-hover cursor-pointer bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl p-10 text-white text-center shadow-xl"
          >
            <div className="text-6xl mb-6">🎓</div>
            <h3 className="text-2xl font-bold mb-4">Start Learning</h3>
            <p className="text-lg">Your epic quest begins here! 🗺️</p>
          </div>

          {/* Teacher */}
          <div
            onClick={() => navigate('/teacher')}
            className="card-hover cursor-pointer bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-10 text-white text-center shadow-xl"
          >
            <div className="text-6xl mb-6">👩‍🏫</div>
            <h3 className="text-2xl font-bold mb-4">Teacher Portal</h3>
            <p className="text-lg">Guide your future heroes! 👩‍🏫</p>
          </div>

          {/* Parent */}
          <div
            onClick={() => navigate('/parent')}
            className="card-hover cursor-pointer bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-10 text-white text-center shadow-xl"
          >
            <div className="text-6xl mb-6">❤️</div>
            <h3 className="text-2xl font-bold mb-4">Parent Portal</h3>
            <p className="text-lg">Cheer on their epic journey! ✨</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
