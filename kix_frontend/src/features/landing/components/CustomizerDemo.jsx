import { Palette, Play, Check } from 'lucide-react';

export function CustomizerDemo() {
  return (
    <section id="customize" className="py-24 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-brand-black dark:to-brand-gray relative overflow-hidden transition-colors duration-300">
      {/* Background typography */}
      <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-black/5 dark:text-white/5 whitespace-nowrap pointer-events-none select-none transition-colors duration-300">
        CREATE
      </h2>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <div>
            <div className="inline-flex items-center space-x-2 text-brand-black dark:text-brand-accent mb-6">
              <Palette size={24} />
              <span className="font-bold uppercase tracking-widest text-sm">The Lab</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Total Control.<br/>
              Infinite Possibilities.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
              Don't settle for off-the-shelf. Use our real-time 3D customizer to tweak every panel, stitch, and lace. Visualize your masterpiece before you buy.
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                "Premium Italian Leathers & Sustainable Meshes",
                "360° Real-time 3D Preview",
                "Custom Engraving Options"
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <div className="bg-white dark:bg-white/10 p-1 rounded-full shadow-sm dark:shadow-none">
                    <Check size={14} className="text-brand-black dark:text-brand-accent" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button className="bg-brand-black dark:bg-white text-white dark:text-brand-black px-8 py-4 rounded-full font-bold hover:bg-brand-accent dark:hover:bg-brand-accent transition-colors shadow-lg dark:shadow-none flex items-center gap-2">
              <Play size={20} />
              <span>Open Customizer</span>
            </button>
          </div>

          {/* Video/GIF Showcase */}
          <div className="relative">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-3xl p-8 relative shadow-xl dark:shadow-2xl overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-white/80 dark:bg-brand-black/50 px-3 py-1 rounded-full text-xs text-gray-900 dark:text-white font-mono border border-gray-200 dark:border-white/10 shadow-sm">
                  Customization Demo
                </span>
              </div>

              {/* Video Container */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 dark:bg-black relative group">
                {/* Video Element - You can replace this with your actual video URL or GIF */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
                >
                  {/* Fallback: You can add multiple source formats here */}
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                  {/* Fallback image if video doesn't load */}
                  <img 
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
                    alt="Customization Showcase"
                    className="w-full h-full object-cover"
                  />
                </video>

                {/* Alternative: If you prefer a GIF, uncomment this and comment out the video */}
                {/* 
                <img 
                  src="https://media.giphy.com/media/your-gif-url.gif"
                  alt="Customization Showcase"
                  className="w-full h-full object-cover"
                />
                */}

                {/* Play Overlay (shows on hover if video is paused) */}
                <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 dark:bg-brand-black/90 backdrop-blur-sm rounded-full p-4 shadow-xl">
                    <Play size={32} className="text-brand-black dark:text-brand-accent" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="mt-6 bg-white/60 dark:bg-brand-black/40 p-4 rounded-xl border border-white/20 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 dark:text-white font-bold text-sm mb-1">Watch the Magic</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      See how easy it is to customize your perfect pair
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span>Live Demo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
