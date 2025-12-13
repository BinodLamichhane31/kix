import { ShieldCheck, Truck, Sliders, Zap } from 'lucide-react';

export function ValueProps() {
  const features = [
    {
      icon: <Sliders size={32} />,
      title: "Real-Time Customization",
      desc: "See your changes instantly. Mix and match colors, materials, and laces with zero lag."
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Quality Guarantee",
      desc: "Hand-crafted by expert cobblers. If it's not perfect, we remake it. 100% satisfaction."
    },
    {
      icon: <Truck size={32} />,
      title: "Global Fast Shipping",
      desc: "Free express shipping on orders over ₨26,600. Track your custom creation from lab to doorstep."
    },
    {
      icon: <Zap size={32} />,
      title: "Exclusive Drops",
      desc: "Get early access to limited edition materials and celebrity collaboration blueprints."
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-brand-black border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">
            Why Choose <span className="text-brand-black dark:text-brand-accent">KIX?</span>
          </h2>
          <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 dark:bg-brand-gray p-8 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-brand-black/20 dark:hover:border-brand-accent/50 transition-colors group shadow-sm dark:shadow-none hover:shadow-md">
              <div className="w-14 h-14 bg-white dark:bg-brand-black rounded-xl flex items-center justify-center text-gray-900 dark:text-white mb-6 group-hover:text-brand-black dark:group-hover:text-brand-accent group-hover:scale-110 transition-all duration-300 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

