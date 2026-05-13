// ─── frontend/src/components/layout/Header.tsx ───────────────────────────────
import { useState } from 'react';
import { Upload, Bell } from 'lucide-react';
import { ImportModal } from '../import/ImportModal';

interface HeaderProps { title: string; subtitle?: string; }

export const Header = ({ title, subtitle }: HeaderProps) => {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-surface-900/80 backdrop-blur-sm sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost p-2 relative">
            <Bell size={18} />
          </button>
          <button onClick={() => setImportOpen(true)} className="btn-primary flex items-center gap-2">
            <Upload size={16} />
            <span>Import CSV</span>
          </button>
        </div>
      </header>
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
};


