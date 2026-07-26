import { useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'sidebar:collapsed';

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? false : stored === 'true';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  return (
    <div className="min-h-screen w-full bg-background flex">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? '4rem' : '15rem' }}
      >
        {children}
      </main>
    </div>
  );
};
