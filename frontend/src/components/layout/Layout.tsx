// ─── frontend/src/components/layout/Layout.tsx ───────────────────────────────
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store/useAppStore';

export const Layout = ({ children }: { children: ReactNode }) => {
  const token = useAppStore(s => s.token);
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};