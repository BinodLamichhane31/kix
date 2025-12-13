import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { appRoutes } from '../../../utils/navigation';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-brand-black dark:via-brand-gray dark:to-brand-black transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 w-full px-4 pt-24 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-5 py-2 space-x-2 border border-gray-200 rounded-full shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-sm dark:border-white/10 dark:shadow-none">
              <Sparkles size={16} className="text-brand-accent" />
              <span className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Customize Your Style
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                Design.<br />
                <span className="text-brand-accent">
                  Customize.
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">Wear.</span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
              Create and shop personalized sneakers with real-time previews. Your style, your way.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                to={appRoutes.shop}
                className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all transform shadow-xl group bg-brand-black dark:bg-white dark:text-brand-black rounded-xl hover:bg-brand-accent dark:hover:bg-brand-accent hover:scale-105 active:scale-95 dark:shadow-none"
              >
                <span>Get Started</span>
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={appRoutes.shop}
                className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-gray-900 transition-all border-2 border-gray-300 rounded-xl dark:text-white dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <Zap size={18} />
                <span>Browse Sneakers</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-gray-600 lg:justify-start dark:text-gray-400">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-3xl font-black text-brand-black dark:text-brand-accent">24k+</span>
                <span className="text-sm font-medium">Unique Designs</span>
              </div>
              <div className="hidden w-px h-12 bg-gray-300 lg:block dark:bg-white/10" />
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-3xl font-black text-brand-black dark:text-brand-accent">4.9★</span>
                <span className="text-sm font-medium">Customer Rating</span>
              </div>
              <div className="hidden w-px h-12 bg-gray-300 lg:block dark:bg-white/10" />
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-3xl font-black text-brand-black dark:text-brand-accent">100%</span>
                <span className="text-sm font-medium">Customizable</span>
              </div>
            </div>
          </div>

          {/* Hero Image Section */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-[600px]">
              {/* Background Glow Effects */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/15 rounded-full blur-2xl" />
                <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-xl" />
              </div>

              {/* Main Sneaker Container */}
              <div className="relative">
              {/* Sneaker Image with Rotation */}
              <div className="relative transform rotate-[-6deg] hover:rotate-[-3deg] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2012&auto=format&fit=crop" 
                  alt="KIX Custom Sneaker" 
                  className="w-full h-auto object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_50px_50px_rgba(0,0,0,0.7)]"
                />
              </div>

                {/* Floating Feature Cards */}
                <div className="absolute p-5 transition-transform transform border-2 border-gray-200 shadow-2xl -top-6 -right-6 lg:-right-12 bg-white/95 dark:bg-brand-gray/95 backdrop-blur-lg rounded-2xl dark:border-white/20 dark:shadow-none hover:scale-105">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-accent/20 dark:bg-brand-accent/30">
                      <Sparkles size={20} className="text-brand-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Featured</p>
                      <p className="text-base font-black text-gray-900 dark:text-white">Neon Runner X</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-sm text-yellow-400">★</span>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">4.9</span>
                  </div>
                </div>

                {/* Bottom Price Card */}
                <div className="absolute px-8 py-4 text-base font-black transition-transform transform -translate-x-1/2 border-2 shadow-2xl -bottom-8 left-1/2 bg-gradient-to-r from-brand-accent to-green-500 text-brand-black rounded-2xl hover:scale-105 border-white/20">
                  <p className="mb-1 text-xs opacity-90">Starting from</p>
                  <p className="text-xl">₨19,285</p>
                </div>

                {/* Side Decorative Elements */}
                <div className="absolute hidden top-1/4 -left-8 lg:block">
                  <div className="flex items-center justify-center w-16 h-16 border-2 rounded-full shadow-xl bg-white/80 dark:bg-brand-gray/80 backdrop-blur-sm border-brand-accent/30 animate-bounce" style={{ animationDuration: '2s' }}>
                    <Zap size={24} className="text-brand-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <div className="absolute hidden -translate-x-1/2 bottom-8 left-1/2 lg:block">
        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500 animate-bounce">
          <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent dark:from-gray-500"></div>
        </div>
      </div> */}
    </section>
  );
}
