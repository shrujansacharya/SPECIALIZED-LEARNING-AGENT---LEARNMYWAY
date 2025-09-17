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

const themeBackgrounds: Record<string, string> = {
  cricket: "An ultra-detailed 3D render of an intense cricket moment — a batsman hitting the ball mid-swing, stumps flying, and the red leather ball glowing in motion. High contrast, vivid colors, cinematic lighting, hyper-realistic.",
  space: "A breathtaking 3D render of outer space with glowing planets, radiant nebulae, asteroid belts, and a futuristic spaceship. Neon cosmic colors, cinematic depth, Unreal Engine style.",
  nature: "A vibrant 3D render of an enchanted glowing forest with colorful flowers, luminous plants, flowing waterfalls, and friendly animals. Magical atmosphere, ultra-detailed textures.",
  science: "A futuristic 3D render of a glowing science lab filled with robots, holographic screens, neon circuits, and colorful experiments. Hyper-detailed sci-fi design.",
  art: "A surreal and colorful 3D render of a creative art studio with floating glowing paint strokes, vibrant sculptures, and radiant masterpieces suspended in the air. Dreamlike surrealism.",
  history: "A dramatic 3D render combining vivid historical moments — knights, pyramids, dinosaurs, and temples — blended in a cinematic fantasy scene. Rich textures, vibrant colors.",
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState('');
  const [themeBg, setThemeBg] = useState<string | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    setNotifications([{ id: 1, message: 'Welcome to LearnMyWay!' }]);
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
          
          if (entry.target.id === 'modes') {
            const swipeCards = entry.target.querySelectorAll('.swipe-card');
            swipeCards.forEach(card => card.classList.add('animate-in'));
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
      (section as HTMLElement).style.opacity = '0';
      (section as HTMLElement).style.transform = 'translateY(30px)';
      (section as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(section);
    });

    const homeSection = document.querySelector('#home') as HTMLElement;
    if (homeSection) {
      homeSection.style.opacity = '1';
      homeSection.style.transform = 'translateY(0)';
    }

    const handleMouseMove = (e: MouseEvent) => {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.innerHTML = '✨';
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      sparkle.style.fontSize = `${Math.random() * 10 + 15}px`;
      
      document.body.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 1000);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`relative min-h-screen ${darkMode ? 'dark' : ''}`}>
      <style>{`
        * {
            font-family: 'Baloo 2', cursive;
        }
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
        .slide-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .slide-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .swipe-card { opacity: 0; transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .swipe-card:nth-child(1) { transform: translateX(-100px); transition-delay: 0.2s; }
        .swipe-card:nth-child(2) { transform: translateX(100px); transition-delay: 0.6s; }
        .swipe-card:nth-child(3) { transform: translateX(-100px); transition-delay: 1s; }
        .swipe-card.animate-in { opacity: 1; transform: translateX(0); }
        .theme-card { transition: all 0.3s ease; }
        .theme-card:hover { transform: scale(1.05) rotate(2deg); }
        .theme-section { 
          transition: background 0.6s ease; 
          background-size: cover !important;
          background-position: center !important;
        }
        .theme-space { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #000000 100%); }
        .theme-cricket { background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%); }
        .theme-art { background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); }
        .theme-nature { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); }
        .theme-science { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); }
        .theme-history { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%); }
        .career-icon { animation: pulse 2s infinite; }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .progress-path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawPath 3s ease-in-out forwards; }
        @keyframes drawPath { to { stroke-dashoffset: 0; } }
        .theme-bg-element { position: absolute; pointer-events: none; opacity: 0; transition: opacity 0.4s ease; }
        .theme-bg-element.active { opacity: 0.3; }
        .nature-leaf { animation: leafFloat 4s ease-in-out infinite; }
        .nature-flower { animation: flowerSway 3s ease-in-out infinite; }
        .art-brush { animation: brushStroke 2s ease-in-out infinite; }
        .art-color { animation: colorSplash 3s ease-in-out infinite; }
        .cricket-bat { animation: batSwing 2.5s ease-in-out infinite; }
        .cricket-ball { animation: ballBounce 2s ease-in-out infinite; }
        @keyframes leafFloat { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(10deg); } }
        @keyframes flowerSway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes brushStroke { 0%, 100% { transform: rotate(-10deg) translateY(0px); } 50% { transform: rotate(10deg) translateY(-10px); } }
        @keyframes colorSplash { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        @keyframes batSwing { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
        @keyframes ballBounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .nav-link { transition: all 0.3s ease; }
        .nav-link:hover { transform: translateY(-2px); color: #FACC15; }
        .sparkle { position: fixed; pointer-events: none; z-index: 9999; animation: sparkleAnim 1s ease-out forwards; }
        @keyframes sparkleAnim {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            100% { transform: scale(1) rotate(180deg); opacity: 0; }
        }
        .science-dna { animation: dnaRotate 4s ease-in-out infinite; }
        .science-scope { animation: scopeMove 3s ease-in-out infinite; }
        .history-book { animation: bookFlip 3s ease-in-out infinite; }
        .history-glass { animation: glassMove 2.5s ease-in-out infinite; }
        @keyframes dnaRotate { 0%, 100% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(10deg) scale(1.1); } }
        @keyframes scopeMove { 0%, 100% { transform: translateY(0px) rotate(-5deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
        @keyframes bookFlip { 0%, 100% { transform: rotateY(0deg); } 50% { transform: rotateY(15deg); } }
        @keyframes glassMove { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.1) rotate(10deg); } }
      `}</style>

      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 shadow-lg dark:bg-gray-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🚀</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-white">LearnMyWay</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a onClick={() => scrollToSection('home')} className="nav-link text-gray-700 font-medium dark:text-gray-300">Home</a>
              <a onClick={() => scrollToSection('modes')} className="nav-link text-gray-700 font-medium dark:text-gray-300">Modes</a>
              <a onClick={() => scrollToSection('themes')} className="nav-link text-gray-700 font-medium dark:text-gray-300">Themes</a>
              <a onClick={() => scrollToSection('careers')} className="nav-link text-gray-700 font-medium dark:text-gray-300">Careers</a>
              <a onClick={() => scrollToSection('about')} className="nav-link text-gray-700 font-medium dark:text-gray-300">About</a>
              <NotificationBell notifications={notifications} />
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors">
                {darkMode ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="gradient-bg min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-icon absolute top-20 left-10 text-6xl">📚</div>
          <div className="floating-icon absolute top-32 right-20 text-5xl">🚀</div>
          <div className="floating-icon absolute bottom-40 left-20 text-4xl">✏</div>
          <div className="floating-icon absolute bottom-20 right-10 text-6xl">✨</div>
          <div className="floating-icon absolute top-1/2 left-1/3 text-5xl">🌟</div>
        </div>
        <div className="text-center z-10 px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bounce-in">
            Welcome to LearnMyWay 🚀
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 bounce-in" style={{ animationDelay: '0.2s' }}>
            Where Learning Feels Like Play!
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-12 bounce-in" style={{ animationDelay: '0.4s' }}>
            A magical space where Students, Teachers, and Parents connect, share, and grow together.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center bounce-in" style={{ animationDelay: '0.6s' }}>
            <button onClick={() => scrollToSection('modes')} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
              🎓 Explore as Student
            </button>
            <button onClick={() => scrollToSection('modes')} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
              👩‍🏫 Enter Teacher Mode
            </button>
            <button onClick={() => scrollToSection('modes')} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
              ❤ Parent Dashboard
            </button>
          </div>
        </div>
      </section>

      <section id="modes" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              🦸 Choose Your Superpower
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Discover your learning adventure!</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="swipe-card slide-card bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl p-8 text-white text-center">
              <div className="text-6xl mb-6">🎓</div>
              <h3 className="text-2xl font-bold mb-4">Student Power</h3>
              <p className="text-lg leading-relaxed">
                Step into your own learning world! Play with themes, solve challenges, chat with your study buddy, and explore your dream career — all while having fun!
              </p>
              <button onClick={() => navigate('/home')} className="mt-6 bg-white text-teal-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Start Learning 🚀
              </button>
            </div>
            <div className="swipe-card slide-card bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-8 text-white text-center">
              <div className="text-6xl mb-6">👩‍🏫</div>
              <h3 className="text-2xl font-bold mb-4">Teacher Power</h3>
              <p className="text-lg leading-relaxed">
                Track lessons, update completed topics, and collaborate with students. Teaching is now interactive, visual, and engaging!
              </p>
              <button onClick={() => navigate('/teacher')} className="mt-6 bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Teach Now 📚
              </button>
            </div>
            <div className="swipe-card slide-card bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-8 text-white text-center">
              <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
              <h3 className="text-2xl font-bold mb-4">Parent Power</h3>
              <p className="text-lg leading-relaxed">
                Stay in the loop with your child's learning journey. See completed portions, check progress, and cheer them on every step!
              </p>
              <button onClick={() => navigate('/parent')} className="mt-6 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Track Progress 📈
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="themes"
        className="theme-section py-20"
        style={{
          background: themeBg ? `url("https://image.pollinations.ai/prompt/${encodeURIComponent(themeBg)}")` : '#fff',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            🎨 Learn the Way YOU Love ✨
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            Hover on a theme and watch the magic happen!
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.keys(themeBackgrounds).map((theme) => (
              <div
                key={theme}
                className="rounded-2xl p-8 text-white text-center cursor-pointer transition-all transform hover:scale-105"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                onMouseEnter={() => {
                  setActiveTheme(theme);
                  setThemeBg(themeBackgrounds[theme]);
                }}
                onMouseLeave={() => {
                  setActiveTheme('');
                  setThemeBg(null);
                }}
              >
                <div className="text-5xl mb-4">
                  {theme === 'cricket' && '🏏'}
                  {theme === 'space' && '🌌'}
                  {theme === 'nature' && '🌿'}
                  {theme === 'science' && '🔬'}
                  {theme === 'art' && '🎨'}
                  {theme === 'history' && '🏛'}
                </div>
                <h3 className="text-2xl font-bold capitalize">{theme} Theme</h3>
                <p className="mt-2">Make learning fun with {theme} adventures!</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="careers" className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              🚀 Dream Big. Start Early.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Explore careers with mini roadmaps, fun facts, and stories!</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <div className="career-icon text-4xl mb-3">🤖</div>
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">AI Scientist</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Build the future with artificial intelligence!</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <div className="career-icon text-4xl mb-3">🩺</div>
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Doctor</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Help people and save lives every day!</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <div className="career-icon text-4xl mb-3">🛰</div>
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Space Explorer</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Discover new worlds beyond Earth!</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <div className="career-icon text-4xl mb-3">🎮</div>
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Game Designer</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Create amazing games that millions love!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              🗣 Your AI Learning Buddy
            </h2>
            <p className="text-xl">AI that explains concepts in the theme YOU love!</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">🏏 Cricket Bot Says:</h3>
                <p className="text-lg leading-relaxed">
                  "Didn't get fractions? Think of it like cricket! If a team scores 150 runs in 30 overs, that's 150/30 = 5 runs per over. Fractions are just parts of a whole, like overs in a match!"
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mt-6">
                <h3 className="text-2xl font-bold mb-4">🤔 What If? Bot:</h3>
                <p className="text-lg leading-relaxed">
                  "What if we could fly? We'd need wings 6 times our arm span and super strong chest muscles! That's why airplanes have big wings and powerful engines!"
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl mb-6">🤖</div>
              <h3 className="text-3xl font-bold mb-4">Always Here to Help!</h3>
              <p className="text-xl">Ask anything, anytime, in any theme you love!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              👥 Learn Together, Feel Together
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Join study groups with friends & teachers!</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 md:p-12 dark:from-gray-800 dark:to-gray-800">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Emotion Detection Magic ✨</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  AI tracks emotions — 😊 means understood, 😕 means confused — so teachers know exactly when to step in and help!
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">😊</span>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">I understand this concept!</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">🤔</span>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">I need to think about this...</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">😕</span>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">I'm confused, need help!</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-gray-700">
                  <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Live Collaboration Board</h4>
                  <div className="bg-gray-100 rounded-lg p-4 mb-4 dark:bg-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sarah is drawing...</div>
                    <div className="h-20 bg-blue-200 rounded flex items-center justify-center dark:bg-blue-800">
                      <span className="text-2xl">📐 ➕ 📏 = 📊</span>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <span className="text-2xl">😊</span>
                    <span className="text-2xl">😊</span>
                    <span className="text-2xl">🤔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              📈 Track Your Learning Journey Like a Game!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Level up with every lesson completed!</p>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl dark:bg-gray-800">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Level 15</h3>
                <p className="text-gray-600 dark:text-gray-400">Math Master</p>
                <div className="bg-yellow-200 rounded-full h-3 mt-4 dark:bg-yellow-800">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">847 Stars</h3>
                <p className="text-gray-600 dark:text-gray-400">Collected This Month</p>
                <div className="flex justify-center space-x-1 mt-4">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-300">⭐</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">12 Badges</h3>
                <p className="text-gray-600 dark:text-gray-400">Achievements Unlocked</p>
                <div className="flex justify-center space-x-2 mt-4">
                  <span className="text-2xl">🏅</span>
                  <span className="text-2xl">🎖</span>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>
            <div className="mt-12">
              <h4 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Your Learning Adventure Map</h4>
              <div className="relative">
                <svg className="w-full h-32" viewBox="0 0 800 120">
                  <path className="progress-path" d="M50,60 Q200,20 350,60 T650,60 L750,60" stroke="#4ade80" strokeWidth="4" fill="none" />
                  <circle cx="50" cy="60" r="8" fill="#22c55e" />
                  <circle cx="200" cy="40" r="8" fill="#22c55e" />
                  <circle cx="350" cy="60" r="8" fill="#22c55e" />
                  <circle cx="500" cy="40" r="8" fill="#fbbf24" />
                  <circle cx="650" cy="60" r="6" fill="#d1d5db" />
                  <circle cx="750" cy="60" r="6" fill="#d1d5db" />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-8">
                  <span className="text-xs font-medium text-gray-800 dark:text-white">Start</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">Basics</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">Intermediate</span>
                  <span className="text-xs font-medium text-yellow-600">Current</span>
                  <span className="text-xs font-medium text-gray-400">Advanced</span>
                  <span className="text-xs font-medium text-gray-400">Expert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              💡 Why LearnMyWay?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Because learning should never feel boring! We connect parents, teachers, and students through theme-based, gamified, and personalized learning experiences that make education magical.
            </p>
          </div>
          <div className="text-center">
            <div className="text-8xl mb-8">🌈</div>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Parents</p>
              </div>
              <div className="text-3xl text-pink-500">❤</div>
              <div className="text-center">
                <div className="text-4xl mb-2">👩‍🏫</div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Teachers</p>
              </div>
              <div className="text-3xl text-pink-500">❤</div>
              <div className="text-center">
                <div className="text-4xl mb-2">🎓</div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Students</p>
              </div>
            </div>
            <button onClick={() => navigate('/join')} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Join Our Learning Family! 🚀
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🚀</span>
            <span className="text-2xl font-bold">LearnMyWay</span>
          </div>
          <p className="text-gray-400 mb-6">Where Learning Feels Like Play!</p>
          <div className="flex justify-center space-x-6 text-2xl">
            <span>📚</span>
            <span>🎨</span>
            <span>🚀</span>
            <span>✨</span>
            <span>🌟</span>
          </div>
          <p className="text-gray-500 text-sm mt-8">© 2024 LearnMyWay. Making education magical for everyone!</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;