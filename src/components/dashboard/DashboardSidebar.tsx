import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  PenTool,
  Users,
  BarChart3,
  Handshake,
  Globe,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Logo from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Job Tracker', href: '/tracker' },
  { icon: FileText, label: 'Resume Generator', comingSoon: true },
  { icon: PenTool, label: 'Cover Letter', comingSoon: true },
  { icon: Users, label: 'Referral Base', comingSoon: true },
  { icon: BarChart3, label: 'Analytics', comingSoon: true },
  { icon: Handshake, label: 'Collaborative Apply', comingSoon: true },
  { icon: Globe, label: 'Global Apply', comingSoon: true },
  { icon: UserCircle, label: 'Profile', href: '/profile' },
];

export const DashboardSidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleNavClick = (item: NavItem) => {
    if (item.comingSoon) {
      toast.info(`${item.label} — Coming soon!`);
      return;
    }
    if (item.href) navigate(item.href);
  };

  const isActive = (href?: string) => href && location.pathname === href;

  const renderNavButton = (item: NavItem) => {
    const btn = (
      <Button
        variant="ghost"
        className={cn(
          'w-full gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors',
          collapsed ? 'justify-center px-2' : 'justify-start',
          isActive(item.href) && 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent',
          item.comingSoon && 'opacity-50',
        )}
        onClick={() => handleNavClick(item)}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <span className="truncate flex-1 text-left">{item.label}</span>
        )}
        {!collapsed && item.comingSoon && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zap/20 text-zap font-medium leading-none">
            Soon
          </span>
        )}
      </Button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.comingSoon && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-zap/20 text-zap font-medium">Soon</span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.label}>{btn}</div>;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300',
        'bg-sidebar border-r border-sidebar-border',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border h-16">
        <div className={cn('transition-all overflow-hidden', collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
          <Logo size="sm" linkTo="/dashboard" />
        </div>
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mx-auto">
                <Logo size="sm" showText={false} linkTo="/dashboard" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">ApplyZap</TooltipContent>
          </Tooltip>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            'text-sidebar-foreground/50 hover:text-sidebar-foreground shrink-0 h-8 w-8',
            collapsed && 'hidden',
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(renderNavButton)}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {/* Expand toggle when collapsed */}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        )}

        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-1')}>
          <ThemeToggle />
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>

        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};
