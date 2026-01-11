import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { LayoutDashboard, Chrome, BarChart3, Zap, CheckCircle2 } from "lucide-react";

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: LayoutDashboard,
      title: "Unified Tracking",
      description: "Keep all your applications in one secure dashboard. No more messy spreadsheets or scattered notes.",
      benefits: ["Centralized view", "Easy organization", "Never lose track"],
      gradient: "from-primary to-primary/60"
    },
    {
      icon: Chrome,
      title: "One-Touch Save",
      description: "Add jobs instantly from LinkedIn, Indeed, and more with our browser extension. Zero friction.",
      benefits: ["Chrome extension", "One-click save", "Auto-fill details"],
      gradient: "from-accent to-accent/60"
    },
    {
      icon: BarChart3,
      title: "Data-Driven Insights",
      description: "Visualize your progress. See your application velocity and success rates at a glance.",
      benefits: ["Visual analytics", "Success metrics", "Progress tracking"],
      gradient: "from-zap to-zap/60"
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            The Solution
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything you need to <span className="text-gradient">land the job</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ApplyZap gives you the tools to track, analyze, and optimize your job search like never before.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="group"
            >
              <div className="h-full bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold text-card-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Benefits list */}
                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;