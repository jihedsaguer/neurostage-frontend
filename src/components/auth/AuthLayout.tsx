import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white mb-4">
          <span className="text-xl font-bold">NS</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">NeuroStage</h1>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;
