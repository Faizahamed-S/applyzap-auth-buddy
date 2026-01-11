import { motion } from "framer-motion";
import { TrendingUp, FileCheck, Clock, Target, BarChart3 } from "lucide-react";

const DashboardMockup = () => {
  return (
    <div className="relative">
      {/* Glow effect behind mockup */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />
      
      {/* Main mockup container */}
      <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
        {/* Window header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-zap/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-background/50 text-xs text-muted-foreground">
              applyzap.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Applied", value: "47", icon: FileCheck, color: "text-primary" },
              { label: "In Review", value: "12", icon: Clock, color: "text-zap" },
              { label: "Interviews", value: "8", icon: Target, color: "text-accent" },
              { label: "Success Rate", value: "17%", icon: TrendingUp, color: "text-green-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                className="bg-muted/30 rounded-xl p-3 text-center"
              >
                <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Chart area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="bg-muted/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-card-foreground">Application Velocity</span>
              </div>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            
            {/* Animated chart bars */}
            <div className="flex items-end gap-2 h-20">
              {[40, 65, 35, 80, 55, 90, 70].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-accent"
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <span key={i} className="text-[10px] text-muted-foreground flex-1 text-center">{day}</span>
              ))}
            </div>
          </motion.div>

          {/* Recent applications list */}
          <div className="space-y-2">
            {[
              { company: "Google", role: "SWE Intern", status: "Interview", statusColor: "bg-accent" },
              { company: "Meta", role: "Product Design", status: "Applied", statusColor: "bg-primary" },
              { company: "Stripe", role: "Backend Intern", status: "In Review", statusColor: "bg-zap" },
            ].map((app, i) => (
              <motion.div
                key={app.company}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.5 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold text-card-foreground">
                    {app.company[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{app.company}</p>
                    <p className="text-xs text-muted-foreground">{app.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-medium text-primary-foreground ${app.statusColor}`}>
                  {app.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating elements for depth */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-1/4 w-16 h-16 rounded-2xl bg-gradient-to-br from-zap to-zap/50 shadow-lg flex items-center justify-center"
      >
        <TrendingUp className="w-8 h-8 text-zap-foreground" />
      </motion.div>
    </div>
  );
};

export default DashboardMockup;