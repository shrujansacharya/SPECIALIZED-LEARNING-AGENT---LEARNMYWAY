import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Rocket, Star, Heart, Sparkles, ArrowUp, Instagram, Phone, Mail } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log('No user, redirecting to login');
        navigate('/student', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-cyan-300 text-gray-900 overflow-hidden font-['Comic_Neue']">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-400 to-pink-400 backdrop-blur-lg shadow-lg py-4 px-6 flex justify-center rounded-b-3xl">
        <div className="flex space-x-6 text-lg">
          <a href="#mission" className="text-white font-bold hover:text-yellow-300 transition-colors neon-glow">Mission</a>
          <a href="#kids" className="text-white font-bold hover:text-yellow-300 transition-colors neon-glow">For Kids</a>
          <a href="#parents" className="text-white font-bold hover:text-yellow-300 transition-colors neon-glow">Grown-Ups</a>
          <a href="#cta" className="text-white font-bold hover:text-yellow-300 transition-colors neon-glow">Start Now</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 py-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none animate-pulse" style={{ background: 'url(/sparkles-pattern.png)' }}></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-yellow-300 to-lime-300 bg-clip-text text-transparent mb-6 tracking-wide font-['Bubblegum_Sans'] drop-shadow-2xl animate-bounce-slow">
            Welcome to LearnMyWay!
          </h1>
          <p className="text-xl sm:text-2xl text-white font-bold mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Ready for a super fun learning adventure? Discover YOUR way to shine with games, quizzes, and friends!
          </p>
          <div className="relative inline-block">
            <Rocket size={64} className="text-lime-300 animate-spin-slow absolute -top-16 -left-16" />
            <Star size={56} className="text-yellow-300 animate-pulse absolute -top-12 -right-16" />
            <img
              src="/mascot-star.png"
              alt="LearnMyWay Mascot"
              className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 mx-auto rounded-full border-8 border-cyan-300 shadow-2xl animate-float"
            />
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-32 text-pink-200" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,60 C360,100 1080,20 1440,60 V100 H0 Z" />
        </svg>
      </section>

      {/* Our Mission Section */}
      <section id="mission" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent mb-10 font-['Bubblegum_Sans'] border-b-6 border-yellow-300 inline-block neon-glow">
            Our Big Dream
          </h2>
          <div className="bg-gradient-to-br from-white/90 to-cyan-100/90 p-8 rounded-3xl shadow-2xl animate-fade-in backdrop-blur-lg border-4 border-pink-300 transform hover:scale-105 transition-transform duration-300">
            <p className="text-gray-800 text-lg sm:text-xl leading-relaxed">
              At LearnMyWay, we want learning to be a BLAST for kids like YOU! Whether you love drawing, listening to stories, or building stuff, we make learning fit YOUR style. With fun games and cool challenges, we help you explore, grow, and LOVE learning every day!
            </p>
          </div>
          <Heart size={48} className="absolute top-4 left-4 text-pink-500 animate-pulse opacity-50" />
          <Sparkles size={48} className="absolute bottom-4 right-4 text-yellow-300 animate-spin-slow opacity-50" />
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-32 text-cyan-200" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,60 C360,20 1080,100 1440,60 V100 H0 Z" />
        </svg>
      </section>

      {/* For Kids Section */}
      <section id="kids" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-lime-200 to-pink-200 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent mb-12 text-center font-['Bubblegum_Sans'] border-b-6 border-cyan-300 inline-block neon-glow">
            Super Fun for Kids!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "Find Your Style",
                desc: "Take a fun quiz to see if you love pictures, sounds, or moving!",
                color: "bg-cyan-400",
                textColor: "text-cyan-900",
                borderColor: "border-cyan-600",
              },
              {
                icon: Rocket,
                title: "Explore Cool Stuff",
                desc: "Play games about stars, animals, or robots—pick what YOU love!",
                color: "bg-pink-400",
                textColor: "text-pink-900",
                borderColor: "border-pink-600",
              },
              {
                icon: Star,
                title: "Win Awesome Prizes",
                desc: "Earn badges and unlock new worlds as you learn!",
                color: "bg-yellow-400",
                textColor: "text-yellow-900",
                borderColor: "border-yellow-600",
              },
              {
                icon: Heart,
                title: "Make New Friends",
                desc: "Join kids who love dinosaurs, games, or art like you!",
                color: "bg-purple-400",
                textColor: "text-purple-900",
                borderColor: "border-purple-600",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`${item.color} p-6 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-4 hover:rotate-3 transition-all duration-300 animate-fade-in border-4 ${item.borderColor} relative overflow-hidden neon-glow`}
                style={{ animationDelay: `${index * 200}ms`, minHeight: '260px', width: '100%', maxWidth: '300px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                <div className="flex items-center space-x-3 mb-4 relative z-10">
                  <item.icon size={48} className={`${item.textColor} animate-bounce drop-shadow-lg`} />
                  <h3 className={`text-xl font-bold ${item.textColor} font-['Bubblegum_Sans'] drop-shadow-lg`}>{item.title}</h3>
                </div>
                <p className={`${item.textColor} text-base font-bold leading-relaxed drop-shadow-md relative z-10`}>{item.desc}</p>
                <Sparkles size={28} className={`absolute top-2 right-2 ${item.textColor} opacity-50 animate-pulse`} />
              </div>
            ))}
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-32 text-yellow-200" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,60 C360,100 1080,20 1440,60 V100 H0 Z" />
        </svg>
      </section>

      {/* For Parents and Teachers Section */}
      <section id="parents" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-200 to-cyan-200 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-lime-400 to-pink-500 bg-clip-text text-transparent mb-10 text-center font-['Bubblegum_Sans'] border-b-6 border-yellow-300 inline-block neon-glow">
            For Parents & Teachers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                icon: Heart,
                title: "Parent Power",
                desc: "Check out your kid’s progress and cheer them on!",
                color: "text-pink-600",
              },
              {
                icon: Star,
                title: "Teacher Tools",
                desc: "Make fun classrooms and help students shine!",
                color: "text-cyan-600",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/90 to-yellow-100/90 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:-rotate-2 transition-all duration-300 animate-fade-in backdrop-blur-md border-4 border-cyan-300 neon-glow"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <item.icon size={48} className={`${item.color} animate-bounce`} />
                  <h3 className="text-xl font-bold text-gray-900 font-['Bubblegum_Sans']">{item.title}</h3>
                </div>
                <p className="text-gray-800 text-base font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-32 text-pink-200" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,60 C360,20 1080,100 1440,60 V100 H0 Z" />
        </svg>
      </section>

      {/* Call-to-Action Section */}
      <section id="cta" className="py-20 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-200 to-pink-200 opacity-70 animate-pulse"></div>
        <button
          onClick={() => navigate('/quiz')}
          className="px-12 py-6 bg-gradient-to-r from-pink-500 via-cyan-500 to-lime-500 text-white rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-125 transition-all duration-300 focus:ring-4 focus:ring-yellow-400 flex items-center space-x-4 mx-auto animate-bounce relative z-10 neon-glow"
          aria-label="Start your learning adventure"
        >
          <Brain size={36} className="text-yellow-300 animate-spin-slow" />
          <span>Jump In Now!</span>
        </button>
        <Rocket size={64} className="absolute bottom-8 left-8 text-lime-400 animate-float opacity-50" />
        <Star size={64} className="absolute top-8 right-8 text-yellow-400 animate-pulse opacity-50" />
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-purple-900 via-cyan-900 to-pink-900 text-white relative">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold font-['Bubblegum_Sans'] mb-6 bg-gradient-to-r from-lime-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-md">
            Let’s Be Friends!
          </h3>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-10 mb-6">
            <a
              href="https://instagram.com/learnmyway_official"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 hover:text-yellow-300 transition-colors neon-glow"
              aria-label="Follow us on Instagram"
            >
              <Instagram size={32} />
              <span className="text-lg">@learnmyway_official</span>
            </a>
            <a
              href="tel:+1234567890"
              className="flex items-center justify-center space-x-2 hover:text-yellow-300 transition-colors neon-glow"
              aria-label="Call us at +1 (234) 567-890"
            >
              <Phone size={32} />
              <span className="text-lg">+1 (234) 567-890</span>
            </a>
            <a
              href="mailto:support@learnmyway.com"
              className="flex items-center justify-center space-x-2 hover:text-yellow-300 transition-colors neon-glow"
              aria-label="Email us at support@learnmyway.com"
            >
              <Mail size={32} />
              <span className="text-lg">support@learnmyway.com</span>
            </a>
          </div>
          <p className="text-sm font-bold opacity-80">
            LearnMyWay © 2025 | Made with Love for Kids!
          </p>
        </div>
      </footer>

      {/* Scroll-to-Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:scale-125 transition-all duration-300 z-50 neon-glow"
        aria-label="Scroll to top"
      >
        <ArrowUp size={28} className="animate-bounce" />
      </button>
    </div>
  );
};

export default AboutPage;