import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "auto";
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

const sizeConfig = {
  sm: { icon: "w-8 h-8", iconInner: "w-4 h-4", text: "text-lg" },
  md: { icon: "w-10 h-10", iconInner: "w-6 h-6", text: "text-2xl" },
  lg: { icon: "w-14 h-14", iconInner: "w-8 h-8", text: "text-3xl" },
};

const Logo = ({ 
  size = "md", 
  variant = "auto", 
  showText = true,
  className,
  linkTo = "/"
}: LogoProps) => {
  const config = sizeConfig[size];
  
  const textColorClass = variant === "light" 
    ? "text-white" 
    : variant === "dark" 
      ? "text-foreground" 
      : "text-foreground";

  const logoContent = (
    <div className={cn("flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80", className)}>
      <div className={cn(
        "rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow",
        config.icon
      )}>
        <Zap className={cn("text-primary-foreground", config.iconInner)} />
      </div>
      {showText && (
        <span className={cn("font-bold", config.text, textColorClass)}>
          ApplyZap
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{logoContent}</Link>;
  }

  return logoContent;
};

export { Logo };
export default Logo;
