import { useState, useEffect } from 'react';

const Preloader = () => {
  const [showText1, setShowText1] = useState(false);
  const [showText2, setShowText2] = useState(false);
  const [showText3, setShowText3] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show first text after 400ms
    const timer1 = setTimeout(() => {
      setShowText1(true);
    }, 400);

    // Show second text after 1400ms
    const timer2 = setTimeout(() => {
      setShowText2(true);
    }, 1400);

    // Show third text after 2400ms
    const timer3 = setTimeout(() => {
      setShowText3(true);
    }, 2400);

    // Start fade out after all texts are shown (3500ms total)
    const timer4 = setTimeout(() => {
      setFadeOut(true);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  if (fadeOut) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 transition-opacity duration-1000 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="text-center relative z-10">
        {/* First Text - "Best Gifts" */}
        <div className={`mb-8 transition-all duration-1000 ease-out ${showText1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wide">
            <span className="inline-block animate-textReveal bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-2xl">
              Best Gifts
            </span>
          </h1>
        </div>

        {/* Second Text - "For You or Your Loved Ones" */}
        <div className={`mb-8 transition-all duration-1000 ease-out delay-200 ${showText2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-white/95 tracking-wide">
            <span className="inline-block animate-textReveal drop-shadow-lg">
              For You or Your Loved Ones
            </span>
          </h2>
        </div>

        {/* Third Text - "Explore from Us!" */}
        <div className={`transition-all duration-1000 ease-out delay-300 ${showText3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
          <h3 className="text-xl md:text-3xl lg:text-4xl font-medium text-white/85 tracking-wide">
            <span className="inline-block animate-textReveal drop-shadow-md">
              Explore from Us!
            </span>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Preloader;

