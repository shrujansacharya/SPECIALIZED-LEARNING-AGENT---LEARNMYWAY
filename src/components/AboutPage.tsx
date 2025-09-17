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
    <div className="relative min-h-screen bg-white text-gray-800 overflow-hidden font-sans">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-100 backdrop-blur shadow py-4 px-6 flex justify-center border-b border-gray-300">
        <div className="flex space-x-6 text-lg">
          <a href="#mission" className="text-gray-700 font-semibold hover:text-gray-900 transition-colors">Mission</a>
          <a href="#kids" className="text-gray-700 font-semibold hover:text-gray-900 transition-colors">For Kids</a>
          <a href="#parents" className="text-gray-700 font-semibold hover:text-gray-900 transition-colors">Grown-Ups</a>
          <a href="#cta" className="text-gray-700 font-semibold hover:text-gray-900 transition-colors">Start Now</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-white py-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-gray-200">
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-wide font-serif">
            Welcome to LearnMyWay!
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Ready for a super fun learning adventure? Discover YOUR way to shine with games, quizzes, and friends!
          </p>

        </div>
        <svg className="absolute bottom-0 left-0 w-full h-32 text-pink-200" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,60 C360,100 1080,20 1440,60 V100 H0 Z" />
        </svg>
      </section>



      {/* Learning Styles Section */}
      <section id="kids" className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative border-b border-gray-200">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-12 text-center font-serif border-b-4 border-gray-300 inline-block">
            Discover Your Learning Style!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                emoji: "👀",
                title: "Visual",
                desc: "You learn best by seeing pictures, diagrams, and videos. Great for drawing and watching!",
                color: "bg-gray-100",
                textColor: "text-gray-900",
                borderColor: "border-gray-300",
              },
              {
                emoji: "👂",
                title: "Auditory",
                desc: "You learn best by listening to stories, music, and discussions. Perfect for talking and hearing!",
                color: "bg-gray-100",
                textColor: "text-gray-900",
                borderColor: "border-gray-300",
              },
              {
                emoji: "🤚",
                title: "Kinesthetic",
                desc: "You learn best by doing hands-on activities and moving around. Awesome for building and playing!",
                color: "bg-gray-100",
                textColor: "text-gray-900",
                borderColor: "border-gray-300",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`${item.color} p-6 rounded-3xl shadow hover:shadow-md transition-all duration-300 border ${item.borderColor} relative overflow-hidden`}
                style={{ animationDelay: `${index * 200}ms`, minHeight: '260px', width: '100%', maxWidth: '300px' }}
              >
                <div className="flex items-center space-x-3 mb-4 relative z-10">
                  <span className="text-4xl">{item.emoji}</span>
                  <h3 className={`text-xl font-semibold ${item.textColor} font-serif`}>{item.title}</h3>
                </div>
                <p className={`${item.textColor} text-base font-normal leading-relaxed relative z-10`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Details Section */}
      <section id="quiz-details" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 relative border-b border-gray-200">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-10 font-serif border-b-4 border-gray-300 inline-block">
            About Our Learning Style Quiz
          </h2>
          <div className="bg-white p-8 rounded-3xl shadow-md">
            <p className="text-gray-700 text-lg sm:text-xl leading-relaxed mb-6">
              🌟 Discover your learning superpower with our magical quiz! 🌟
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Answer fun questions about what you love (👀 pictures, 👂 sounds, or 🤚 hands-on fun) and unlock personalized adventures! Perfect for kids, parents, and teachers to make learning a BLAST! 🎉
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Ready to shine? Let's quiz! 💫
            </p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section id="cta" className="py-20 px-4 sm:px-6 lg:px-8 text-center relative bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => navigate('/quiz')}
          className="px-12 py-6 bg-blue-600 text-white rounded-full font-semibold text-xl shadow hover:shadow-md transition-all duration-300 focus:ring-4 focus:ring-blue-400 flex items-center space-x-4 mx-auto"
          aria-label="Start your learning adventure"
        >
          <Brain size={36} className="text-white" />
          <span>Jump In Now!</span>
        </button>
      </section>



      {/* Scroll-to-Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow hover:shadow-md transition-all duration-300 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp size={28} />
      </button>
    </div>
  );
};

export default AboutPage;