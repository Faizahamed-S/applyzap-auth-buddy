import { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen w-full bg-background flex">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? '4rem' : '15rem' }}
      >
        {children}
      </main>
    </div>
  );
};
