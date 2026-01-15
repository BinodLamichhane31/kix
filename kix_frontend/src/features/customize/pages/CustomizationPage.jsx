import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Eye, Infinity, Sparkles } from 'lucide-react';
import { appRoutes } from '../../../utils/navigation';

const features = [
  {
    icon: Palette,
    title: '8 Customizable Parts',
    description: 'Full control over design',
  },
  {
    icon: Eye,
    title: 'Live 3D Preview',
    description: 'See changes instantly',
  },
  {
    icon: Infinity,
    title: 'Endless Possibilities',
    description: 'Unlimited color combos',
  },
];

export default function CustomizationPage() {
  return (
    <div className="min-h-screen pt-20 bg-white dark:bg-brand-black">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid items-center min-h-[calc(100vh-5rem)] grid-cols-1 gap-12 py-12 lg:grid-cols-2">
          
          {/* Left Side - Content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 border-brand-accent/20 dark:border-brand-accent/30 text-brand-black dark:text-white">
              <Sparkles size={12} className="text-brand-accent" />
              Design Your Dream Sneakers
            </div>
            
            {/* Title */}
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl text-brand-black dark:text-white">
              Customize Your <span className="text-brand-accent">Perfect Pair</span>
            </h1>
            
            {/* Description */}
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
              Design your unique sneakers with our interactive 3D customizer. Change colors, preview in real-time, and bring your vision to life.
            </p>

            {/* Price Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-lg bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-brand-black dark:text-white">
              Starting from <span className="text-lg font-black text-brand-accent">Rs. 3,000</span>
            </div>

            {/* CTA Button */}
            <div>
              <Link
                to={appRoutes.customizeSneaker}
                className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all transform shadow-lg group bg-brand-black dark:bg-brand-accent dark:text-brand-black rounded-xl hover:bg-brand-accent dark:hover:bg-white hover:scale-105 active:scale-95"
              >
                Start Customizing
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Side - Image and Features */}
          <div className="space-y-6 lg:pl-8">
            {/* Sneaker Preview */}
            <div className="relative">
              <div className="flex items-center justify-center p-8 overflow-hidden bg-gray-50 border border-gray-200 shadow-sm aspect-square rounded-2xl dark:bg-brand-gray dark:border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2012&auto=format&fit=crop"
                  alt="Customizable Sneaker"
                  className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Features in horizontal row */}
            <div className="grid grid-cols-3 gap-3">
              {features.map((feature) => (
                <div key={feature.title} className="p-3 text-center transition-colors border rounded-xl bg-gray-50 dark:bg-brand-gray border-gray-200 dark:border-white/10 hover:border-brand-accent/30 dark:hover:border-brand-accent/30">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 border rounded-lg bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <feature.icon size={18} className="text-brand-accent" />
                  </div>
                  <div className="text-xs font-bold text-brand-black dark:text-white">
                    {feature.title}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
