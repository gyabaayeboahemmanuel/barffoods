import { Truck, Shield, Clock, RotateCcw } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick delivery within 2 hours'
    },
    {
      icon: Shield,
      title: 'Fresh Guarantee',
      description: '100% fresh products guaranteed'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: 'Hassle-free returns within 30 days'
    }
  ];

  return (
    <section className="py-10 bg-gray-50/80 dark:bg-gray-800/30 border-y border-gray-200/80 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title text-center mb-2">Why choose us</h2>
        <p className="section-subtitle text-center mb-8">Fast, fresh, and reliable</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="card-bs p-5 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
