import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

export const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'Applications', href: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard' },
    { icon: FileText, label: 'Documents', href: '/dashboard' },
    { icon: Settings, label: 'Settings', href: '/dashboard' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col",
        "bg-[hsl(230,75%,10%)]",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className={cn("transition-opacity", collapsed && "opacity-0 w-0 overflow-hidden")}>
          <Logo variant="light" size="sm" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white hover:bg-white/10 shrink-0"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors",
                isActive && "bg-[hsl(199,89%,48%)] text-white hover:bg-[hsl(199,89%,48%)] hover:text-white",
                collapsed && "justify-center px-2"
              )}
              onClick={() => navigate(item.href)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={cn("transition-opacity", collapsed && "opacity-0 w-0 overflow-hidden")}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-white/10">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={cn("transition-opacity", collapsed && "opacity-0 w-0 overflow-hidden")}>
            Logout
          </span>
        </Button>
      </div>
    </aside>
  );
};
