import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaVideo, FaUsers, FaComments, FaDesktop, FaLink, FaLock, FaMobileAlt, FaRocket, FaShareAlt, FaUser, FaMicrophone, FaPhone, FaArrowRight, FaChevronDown, FaPlay, FaCalendar, FaCog, FaShieldAlt, FaChartLine, FaGlobe, FaClock, FaStar, FaCode, FaCloud, FaBolt, FaRobot, FaBrain, FaNetworkWired } from 'react-icons/fa';
import AnimatedSnow from './common/AnimatedSnow';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Home = () => {
  const logoRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const floatingElements = useRef([]);
  const [showVideoPreview, setShowVideoPreview] = useState(true);
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    // Simple animations without complex GSAP
    if (logoRef.current) {
      gsap.from(logoRef.current, {
        opacity: 0,
        y: -30,
        duration: 1,
        ease: 'power2.out'
      });
    }

    // Animate floating elements
    floatingElements.current.forEach((el, index) => {
      if (el) {
        gsap.to(el, {
          y: Math.random() * 20 - 10,
          x: Math.random() * 20 - 10,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    });

    // Cleanup
    return () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleVideoPreview = () => {
    setShowVideoPreview(!showVideoPreview);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
    <AnimatedSnow snowflakeCount={80} />
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
      
      <div className="relative z-10">
        {/* Debug: Simple visible content */}
        <div className="pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">NexusMeet</h1>
            <p className="text-2xl text-white/90 mb-8">Next-Generation Video Conferencing for the Modern Workplace</p>
             
            <div className="flex justify-center space-x-4 mb-16">
              <Link
                to="/create-meeting"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105"
              >
                Start Meeting
              </Link>
              <Link
                to="/join-meeting"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105"
              >
                Join Meeting
              </Link>
            </div>
          </div>
        </div>
        

        {/* Professional Floating Elements */}
        <div ref={el => floatingElements.current[0] = el} className="absolute top-20 left-10 w-6 h-6 bg-white/20 rounded-full opacity-40"></div>
        <div ref={el => floatingElements.current[1] = el} className="absolute top-40 right-20 w-4 h-4 bg-white/20 rounded-full opacity-40"></div>
        <div ref={el => floatingElements.current[2] = el} className="absolute bottom-40 left-20 w-5 h-5 bg-white/30 rounded-full opacity-40"></div>
        <div ref={el => floatingElements.current[3] = el} className="absolute bottom-20 right-40 w-3 h-3 bg-white/30 rounded-full opacity-40"></div>

        {/* Hero Section - Professional Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            {/* Animated Logo - Professional Branding */}
            <div ref={logoRef} className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-2xl border border-white/30">
                <FaVideo className="text-white text-2xl" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                NexusMeet
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">
              Next-generation video conferencing for the modern workplace. <span className="font-semibold text-white">Secure, reliable, and AI-powered.</span>
            </p>
            
            
            
            {/* Professional CTA Buttons */}
            <div ref={heroRef} className="hero-buttons flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16 relative z-10">
              <Link
                to="/create-meeting"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-10 py-5 text-white font-medium shadow-2xl transition duration-300 hover:bg-white/30 hover:scale-105 transform z-10 text-lg"
              >
                <span className="absolute inset-0 flex h-full w-full -translate-x-full items-center justify-center bg-white text-blue-600 group-hover:translate-x-0 transition duration-300">
                  <FaArrowRight className="mr-2" /> Start Now
                </span>
                <span className="flex items-center transition duration-300 group-hover:translate-x-full">
                  <FaRocket className="mr-2" /> Instant Meeting
                </span>
              </Link>
              
              <Link
                to="/join-meeting"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 px-10 py-5 text-white font-medium shadow-2xl transition duration-300 hover:border-white/50 hover:scale-105 transform z-10 text-lg"
              >
                <span className="absolute inset-0 flex h-full w-full -translate-x-full items-center justify-center bg-white/20 text-white group-hover:translate-x-0 transition duration-300">
                  <FaArrowRight className="mr-2" /> Join Now
                </span>
                <span className="flex items-center transition duration-300 group-hover:translate-x-full">
                  <FaShareAlt className="mr-2" /> Join Meeting
                </span>
              </Link>
            </div>
          
          {/* ATTRACTIVE HERO SECTION WITH VIDEO ANIMATIONS */}
          <div className="relative max-w-5xl mx-auto mb-16">
            {/* Video Preview Button */}
            <button
              onClick={toggleVideoPreview}
              className="w-full mb-4"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/30 transition-all duration-300 shadow-2xl hover:shadow-3xl border border-white/30">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                    <FaPlay className="text-lg ml-1" />
                  </div>
                  <div className="text-center flex-1">
                    <h3 className="text-lg font-bold text-white">See NexusMeet in Action</h3>
                    <p className="text-white/80 text-sm">Watch our interactive demo</p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FaChevronDown className={`transform ${showVideoPreview ? 'rotate-180' : ''} transition-transform text-white`} />
                  </div>
                </div>
              </div>
            </button>
            <div className="text-center text-white/80 text-sm mb-4">
              <p>Experience seamless video conferencing with NexusMeet. Join or create meetings in seconds.</p>
            </div>
            
            {/* Animated Video Preview */}
            {showVideoPreview && (
              <div className="video-preview-container bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-blue-200 overflow-hidden">
                {/* Live Meeting Simulation */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl aspect-video relative overflow-hidden shadow-lg">
                  {/* Animated "Live" Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE MEETING</span>
                    </div>
                  </div>
                  
                  {/* Animated Participant Grid */}
                  <div className="grid grid-cols-2 gap-3 w-full h-full p-4">
                    {/* Main Speaker - Animated */}
                    <div className="bg-gray-800 rounded-xl relative overflow-hidden shadow-lg">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" alt="Main Speaker" className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-xs px-3 py-1 rounded-full shadow-sm text-white font-medium">
                        You (Speaker)
                      </div>
                      <div className="absolute top-3 right-3 flex space-x-1">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                    
                    {/* Other Participants - Animated */}
                    <div className="grid grid-rows-2 gap-3">
                      <div className="bg-gray-800 rounded-xl relative overflow-hidden shadow-lg">
                        <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face" alt="Sarah" className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-xs px-2 py-1 rounded-full shadow-sm text-white font-medium">
                          Sarah
                        </div>
                        <div className="absolute top-2 left-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                      </div>
                      <div className="bg-gray-800 rounded-xl relative overflow-hidden shadow-lg">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" alt="Mike" className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-xs px-2 py-1 rounded-full shadow-sm text-white font-medium">
                          Mike
                        </div>
                        <div className="absolute top-2 left-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Video Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-gray-800 backdrop-blur-sm rounded-full px-6 py-3 z-20">
                    <button className="p-2 bg-cyan-500/80 rounded-full text-white hover:bg-cyan-500 transition shadow-lg" onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })} onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}>
                      <FaMicrophone className="text-sm" />
                    </button>
                    <button className="p-2 bg-cyan-500/80 rounded-full text-white hover:bg-cyan-500 transition shadow-lg" onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })} onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}>
                      <FaVideo className="text-sm" />
                    </button>
                    <button className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition shadow-lg" onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })} onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}>
                      <FaPhone className="text-sm" />
                    </button>
                    <button className="p-2 bg-cyan-500/80 rounded-full text-white hover:bg-cyan-500 transition shadow-lg" onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })} onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}>
                      <FaDesktop className="text-sm" />
                    </button>
                  </div>
                </div>
                
                {/* Animated Meeting Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 animate-pulse">4</div>
                    <div className="text-sm text-gray-600 font-medium">Participants</div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600 animate-pulse">00:15:32</div>
                    <div className="text-sm text-gray-600 font-medium">Duration</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
                    <div className="text-2xl font-bold text-green-600">🔒</div>
                    <div className="text-sm text-gray-600 font-medium">Secure</div>
                  </div>
                </div>
                
                {/* Animated Chat Preview */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-xs text-white shadow-lg">
                      <FaUser />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-blue-700 mb-1">You</div>
                      <div className="text-sm text-gray-700 bg-white/80 rounded-lg p-3 shadow-sm border border-blue-100">
                        Hey team! Let's discuss the project timeline... 🚀
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Typing Indicator */}
                  <div className="mt-3 flex items-center space-x-2 ml-11">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Sarah is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Professional Features Section */}
        <div ref={featuresRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                Futuristic Features
              </h2>
              <p className="text-xl text-white/90 font-medium">Built for the future, by innovators</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Professional Feature Cards */}
            {[
              {
                icon: <FaRocket className="text-2xl text-blue-600" />,
                title: "Instant Meetings",
                description: "Create professional meetings with one click. Enterprise-grade reliability.",
                gradient: "from-blue-50 to-blue-100",
                color: "border-blue-200",
                shadow: "hover:shadow-blue-200/50"
              },
              {
                icon: <FaVideo className="text-2xl text-emerald-600" />,
                title: "4K Video",
                description: "Ultra-HD video quality with adaptive bitrate for smooth meetings.",
                gradient: "from-emerald-50 to-emerald-100",
                color: "border-emerald-200",
                shadow: "hover:shadow-emerald-200/50"
              },
              {
                icon: <FaComments className="text-2xl text-cyan-600" />,
                title: "Smart Chat",
                description: "Secure chat with end-to-end encryption and message history.",
                gradient: "from-cyan-50 to-cyan-100",
                color: "border-cyan-200",
                shadow: "hover:shadow-cyan-200/50"
              },
              {
                icon: <FaDesktop className="text-2xl text-indigo-600" />,
                title: "Screen Share",
                description: "Share screens with 4K resolution and low latency.",
                gradient: "from-indigo-50 to-indigo-100",
                color: "border-indigo-200",
                shadow: "hover:shadow-indigo-200/50"
              },
              {
                icon: <FaLink className="text-2xl text-purple-600" />,
                title: "Secure Links",
                description: "Password-protected meetings with expiration options.",
                gradient: "from-purple-50 to-purple-100",
                color: "border-purple-200",
                shadow: "hover:shadow-purple-200/50"
              },
              {
                icon: <FaUsers className="text-2xl text-rose-600" />,
                title: "Scalable",
                description: "Host meetings with 100+ participants seamlessly.",
                gradient: "from-rose-50 to-rose-100",
                color: "border-rose-200",
                shadow: "hover:shadow-rose-200/50"
              },
              {
                icon: <FaLock className="text-2xl text-amber-600" />,
                title: "Bank-Grade Security",
                description: "AES-256 encryption and SOC 2 compliance.",
                gradient: "from-amber-50 to-amber-100",
                color: "border-amber-200",
                shadow: "hover:shadow-amber-200/50"
              },
              {
                icon: <FaMobileAlt className="text-2xl text-lime-600" />,
                title: "Cross-Platform",
                description: "Native apps for all platforms with sync.",
                gradient: "from-lime-50 to-lime-100",
                color: "border-lime-200",
                shadow: "hover:shadow-lime-200/50"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="feature-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { y: -8, scale: 1.03, duration: 0.3, ease: "power2.out" });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
                }}
              >
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 shadow-lg border border-white/30">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
                <button
                  onClick={() => alert(`Feature: ${feature.title}`)}
                  className="mt-3 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Professional CTA Section */}
      <div ref={ctaRef} className=" backdrop-blur-sm py-20 relative overflow-hidden mt-16 border-t border-white/20">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Ready for Next-Gen Meetings?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Experience the future of video conferencing. Secure, reliable, and AI-powered.
          </p>

          <div className="cta-buttons flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/create-meeting"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3 font-medium shadow-2xl transition duration-300 hover:bg-white/30 hover:scale-105 transform"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
              }}
            >
              <span className="absolute inset-0 flex h-full w-full items-center justify-center bg-white text-gray-900 group-hover:translate-x-full transition duration-300">
                <FaArrowRight className="mr-2" /> Start Now
              </span>
              <span className="flex items-center transition duration-300 group-hover:-translate-x-full">
                <FaVideo className="mr-2" /> Start Free Meeting
              </span>
            </Link>

            <Link 
              to="/join-meeting"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-white/30 text-white px-8 py-3 font-medium shadow-2xl transition duration-300 hover:border-white/50 hover:scale-105"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
              }}
            >
              <span className="absolute inset-0 flex h-full w-full items-center justify-center bg-white/20 text-white group-hover:translate-x-full transition duration-300">
                <FaArrowRight className="mr-2" /> Join Now
              </span>
              <span className="flex items-center transition duration-300 group-hover:-translate-x-full">
                <FaShareAlt className="mr-2" /> Join Existing
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-white/10 backdrop-blur-sm py-12 border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 shadow-lg border border-white/30">
                <FaVideo className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">
                NexusMeet
              </span>
            </div>

            <div className="flex space-x-8 text-base text-white/80 font-medium">
              <Link to="/" className="hover:text-white transition-colors duration-200 hover:underline">Home</Link>
              <Link to="/create-meeting" className="hover:text-white transition-colors duration-200 hover:underline">Create</Link>
              <Link to="/join-meeting" className="hover:text-white transition-colors duration-200 hover:underline">Join</Link>
              <Link to="/login" className="hover:text-white transition-colors duration-200 hover:underline">Login</Link>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
            <p className="font-medium">© {new Date().getFullYear()} NexusMeet. All rights reserved. Next-generation video conferencing.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button - GSAP Animated */}
      <button
        className="fixed bottom-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full shadow-2xl flex items-center justify-center transition-opacity duration-300 hover:bg-white/30"
        onClick={scrollToTop}
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, { scale: 1.1, rotate: 90, duration: 0.2 });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.2 });
        }}
      >
        <FaChevronDown className="transform rotate-180" />
      </button>
      </div>
    </div>
  );
};

export default Home;