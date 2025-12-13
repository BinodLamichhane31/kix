import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Sparkles, Zap } from 'lucide-react';
import { appRoutes } from '../../../utils/navigation';

const features = [
  {
    icon: Palette,
    title: '9 Parts',
    description: 'Fully customizable',
  },
  {
    icon: Sparkles,
    title: 'Real-time',
    description: '3D preview',
  },
  {
    icon: Zap,
    title: 'Unlimited',
    description: 'Color combinations',
  },
];

export default function CustomizationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-black pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-20 mb-20">
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-brand-black dark:text-white mb-6 leading-tight">
            Customize Your <span className="text-brand-accent">Sneakers</span>
          </h1>
          
          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Design your perfect pair with real-time 3D preview. Change colors, customize every detail.
          </p>

          {/* Sneaker Preview */}
          <div className="relative max-w-lg mx-auto mb-16">
            <div className="aspect-square rounded-2xl bg-white dark:bg-brand-gray border border-gray-200 dark:border-white/10 p-12 shadow-lg flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2012&auto=format&fit=crop"
                alt="Customizable Sneaker"
                className="w-full h-full object-contain"
              />
              {/* Neon accent glow only on sneaker */}
              <div className="absolute inset-0 bg-brand-accent/10 dark:bg-brand-accent/5 rounded-2xl pointer-events-none" />
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center justify-center gap-8 mb-12 flex-wrap">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                  <feature.icon size={20} className="text-brand-black dark:text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-brand-black dark:text-white">
                    {feature.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            to={appRoutes.customizeSneaker}
            className="group inline-flex items-center gap-2 bg-brand-black dark:bg-white text-white dark:text-brand-black px-8 py-4 rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-brand-accent transition-all transform hover:scale-105 active:scale-95 shadow-xl dark:shadow-none"
          >
            Start Customizing
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
