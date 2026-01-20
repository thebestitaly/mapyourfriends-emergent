import React from 'react';
import { useClerk } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Map, Users, Plane, Calendar, Globe2, ArrowRight } from 'lucide-react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

export default function LandingPage() {
  const clerk = useClerk();

  const handleLogin = () => {
    clerk.openSignIn();
  };

  const features = [
    {
      icon: <Map className="w-6 h-6" />,
      title: 'Map Your Network',
      description: 'See where your friends live and which cities they know best'
    },
    {
      icon: <Plane className="w-6 h-6" />,
      title: 'Travel Mode',
      description: 'Discover connections in your next destination before you arrive'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Plan Meetups',
      description: 'Organize gatherings with friends in any city'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Curated Connections',
      description: 'Quality over quantity. Your real network, visualized'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/40 overflow-auto">
      {/* Ambient background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 md:px-12">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl btn-gradient-primary flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-800">Map Your Friends</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleLogin}
            data-testid="header-login-btn"
            className="px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 
                       text-slate-700 font-medium text-sm hover:bg-white hover:shadow-md 
                       transition-all duration-300 hover:scale-[1.02]"
          >
            Sign In
          </motion.button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 md:px-12 pt-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight">
                  See your world
                  <br />
                  <span className="gradient-text">through friendships</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                  Map Your Friends transforms your social network into a beautiful,
                  spatial experience. Discover who you know in every corner of the world.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  data-testid="hero-get-started-btn"
                  className="px-8 py-4 rounded-full btn-gradient-primary text-white font-semibold 
                             shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 
                             transition-shadow duration-300 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                                 border-2 border-white shadow-sm flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-medium">
                        {String.fromCharCode(64 + i)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">1,200+</span> friends mapped worldwide
                </p>
              </div>
            </motion.div>

            {/* Right - Map Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="glass-panel rounded-3xl p-2 shadow-floating">
                <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                  {/* Simplified map illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-full h-full opacity-20" viewBox="0 0 400 300">
                      <path d="M50,150 Q100,50 200,100 T350,150" stroke="#0EA5E9" strokeWidth="2" fill="none" />
                      <path d="M80,200 Q150,120 250,180 T380,200" stroke="#EC4899" strokeWidth="2" fill="none" />
                      <circle cx="100" cy="120" r="30" fill="#E0F2FE" />
                      <circle cx="200" cy="100" r="40" fill="#FCE7F3" />
                      <circle cx="300" cy="150" r="35" fill="#E0F2FE" />
                    </svg>
                  </div>

                  {/* Floating markers */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full btn-gradient-primary 
                               flex items-center justify-center shadow-lg shadow-cyan-500/40 border-3 border-white"
                  >
                    <span className="text-white text-sm font-bold">A</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-1/3 right-1/3 w-10 h-10 rounded-full btn-gradient-secondary 
                               flex items-center justify-center shadow-lg shadow-pink-500/40 border-3 border-white"
                  >
                    <span className="text-white text-sm font-bold">M</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/3 right-1/4 w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 
                               flex items-center justify-center shadow-lg shadow-purple-500/40 border-3 border-white"
                  >
                    <span className="text-white text-sm font-bold">S</span>
                  </motion.div>

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                    <line x1="28%" y1="28%" x2="45%" y2="36%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                    <line x1="45%" y1="36%" x2="72%" y2="62%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Floating friend card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 glass-panel rounded-2xl p-4 shadow-floating max-w-[240px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                                  flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-slate-800">Alex Chen</p>
                    <p className="text-sm text-slate-500">Berlin, Germany</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium">Advice</span>
                  <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">Meetup</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-32 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="glass-panel rounded-2xl p-6 hover:bg-white/90 transition-all duration-300 
                           hover:shadow-lg group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl btn-gradient-primary flex items-center justify-center 
                                mb-4 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/30 
                                transition-shadow duration-300">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© 2025 Map Your Friends. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
