import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Sparkles, FolderOpen, Rocket, ArrowRight } from "lucide-react";

const RoadmapSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const roadmapItems = [
    {
      icon: Users,
      title: "Collaborative Hunting",
      description: "Create squads with friends. Share leads, track status together, and get hired faster as a team.",
      status: "Coming Q2 2026"
    },
    {
      icon: Sparkles,
      title: "AI Powerhouse",
      description: "Internal Resume Editor and AI Cover Letter Generator built right into your workflow. Write better, faster.",
      status: "Coming Q3 2026"
    },
    {
      icon: FolderOpen,
      title: "Asset Manager",
      description: "Store tailored resumes and cover letters alongside the specific job they were sent to. Perfect recall.",
      status: "Coming Q4 2026"
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zap/20 text-zap text-sm font-medium mb-4">
            <Rocket className="w-4 h-4" />
            Coming Soon
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            The Future of Job Hunting
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            We're just getting started. Here's what's on our roadmap to make your job search even more powerful.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roadmapItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="group"
            >
              <div className="h-full bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10 hover:border-primary-foreground/20 hover:bg-primary-foreground/10 transition-all duration-300">
                {/* Status badge */}
                <span className="inline-block px-3 py-1 rounded-full bg-zap/20 text-zap text-xs font-medium mb-6">
                  {item.status}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-primary-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-primary-foreground/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-primary-foreground/60 mb-4">Be the first to know when new features drop</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-colors group">
            Join the waitlist
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default RoadmapSection;