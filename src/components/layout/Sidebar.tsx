import { useLocation, useNavigate } from 'react-router-dom';
import { useLogout } from '@/lib/hooks/useLogout';
import { useAppSelector } from '@/redux/hooks';
import { NAV_ITEMS } from '@/lib/navConfig';
import type { RoleName } from '@/types/user';

interface SidebarProps {
  brandName?: string;
}

export const Sidebar = ({ brandName = 'NeuroStage' }: SidebarProps) => {
  const { handleLogout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAppSelector((state) => state.auth.role) as RoleName | null;

  // Filter nav items based on current role
  const visibleItems = NAV_ITEMS.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-slate-200 bg-white">
      {/* Logo / Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8h4v4H8z" fill="white" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          {brandName}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {visibleItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={[
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-slate-100 font-medium text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
              title={item.label}
            >
              <span className={active ? 'text-slate-900' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
};
