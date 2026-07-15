import type { ReactNode } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Sidebar } from './Sidebar';
import { RagChatbot } from '@/components/ai/RagChatbot';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  brandName?: string;
}

export const DashboardLayout = ({
  children,
  title = 'Dashboard',
  subtitle = 'Welcome to your dashboard',
  brandName = 'NeuroStage',
}: DashboardLayoutProps) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar brandName={brandName} />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
          <div>
            <h1 className="text-base font-semibold text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:text-right">
              <p className="text-xs font-medium text-slate-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
      <RagChatbot />
    </div>
  );
};
