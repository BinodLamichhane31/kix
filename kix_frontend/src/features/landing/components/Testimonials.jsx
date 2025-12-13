import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "Sneakerhead",
    rating: 5,
    text: "The customization tool is insane. I recreated a colorway I've wanted for years and the quality is actually better than the big brands.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    role: "Fashion Blogger",
    rating: 5,
    text: "Shipping was surprisingly fast for a custom shoe. The packaging alone felt premium. Definitely ordering my next pair for fashion week.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Marcus Chen",
    role: "Pro Skater",
    rating: 5,
    text: "Durable materials. I skate these hard and they hold up. Being able to choose the rubber density for the sole is a game changer.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gray-100 dark:bg-brand-gray relative overflow-hidden transition-colors duration-300">
      {/* Decorative Circle */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
             <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Community <span className="text-brand-black dark:text-brand-accent">Voice</span>
            </h2>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
             <div className="flex text-brand-black dark:text-brand-accent">
               {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
             </div>
             <span className="text-gray-900 dark:text-white font-bold ml-2">4.9/5</span>
             <span className="text-gray-500 dark:text-gray-400 text-sm">based on 12,000+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <div key={review.id} className="bg-white dark:bg-brand-black p-8 rounded-2xl border border-gray-100 dark:border-white/5 relative hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm dark:shadow-none">
              <Quote className="absolute top-6 right-6 text-gray-200 dark:text-white/10" size={48} />
              
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src={review.avatar} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-black dark:border-brand-accent"
                />
                <div>
                  <h4 className="text-gray-900 dark:text-white font-bold">{review.name}</h4>
                  <p className="text-brand-black dark:text-brand-accent text-xs uppercase tracking-wide">{review.role}</p>
                </div>
              </div>
              
              <div className="flex text-brand-black dark:text-brand-accent mb-4">
                 {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
