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
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-brand-black">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-20 mb-20 text-center">
          {/* Title */}
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl text-brand-black dark:text-white">
            Customize Your <span className="text-brand-accent">Sneakers</span>
          </h1>
          
          {/* Description */}
          <p className="max-w-2xl mx-auto mb-12 text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-400">
            Design your perfect pair with real-time 3D preview. Change colors, customize every detail.
          </p>

          {/* Sneaker Preview */}
          <div className="relative max-w-lg mx-auto mb-16">
            <div className="flex items-center justify-center p-12 overflow-hidden bg-white border border-gray-200 shadow-lg aspect-square rounded-2xl dark:bg-brand-gray dark:border-white/10">
              <img
                src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2012&auto=format&fit=crop"
                alt="Customizable Sneaker"
                className="object-contain w-full h-full"
              />
              {/* Neon accent glow only on sneaker */}
              <div className="absolute inset-0 pointer-events-none bg-brand-accent/10 dark:bg-brand-accent/5 rounded-2xl" />
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg dark:bg-white/5 dark:border-white/10">
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
            className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all transform shadow-xl group bg-brand-black dark:bg-white dark:text-brand-black rounded-xl hover:bg-brand-accent dark:hover:bg-brand-accent hover:scale-105 active:scale-95 dark:shadow-none"
          >
            Start Customizing
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
