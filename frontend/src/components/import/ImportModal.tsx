// frontend/src/components/import/ImportModal.tsx
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { importApi } from '../../api/client';

interface ImportResult {
  imported: number;
  skipped: number;
  parseErrors: string[];
}

export const ImportModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const qc = useQueryClient();

  const { mutate, data, isPending, isSuccess, isError, error, reset } = useMutation<
    ImportResult, Error, File
  >({
    mutationFn: (f: File) => importApi.upload(f).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith('.csv')) setFile(f);
  }, []);

  const handleClose = () => {
    setFile(null);
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import M-Pesa Statement">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => document.getElementById('csv-input')?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${dragging ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/2'}`}
            >
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <Upload size={32} className="mx-auto mb-3 text-slate-500" />
              <p className="text-white font-medium">Drop your CSV file here</p>
              <p className="text-sm text-slate-500 mt-1">or click to browse</p>
              <p className="text-xs text-slate-600 mt-3">Supports M-Pesa statement CSV format · Max 5MB</p>
            </div>

            {/* Selected file */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3 p-3 bg-surface-600 rounded-xl"
              >
                <FileText size={18} className="text-brand-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setFile(null)} className="btn-ghost p-1">
                  <X size={14} />
                </button>
              </motion.div>
            )}

            {isError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {(error as any)?.response?.data?.error || 'Upload failed. Please try again.'}
              </div>
            )}

            {/* Instructions */}
            <div className="mt-4 p-3 bg-surface-600 rounded-xl">
              <p className="text-xs text-slate-400 font-medium mb-2">How to export your M-Pesa statement:</p>
              <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                <li>Open M-Pesa app → Statements → Download</li>
                <li>Or SMS STATEMENT to 234 and follow the link</li>
                <li>Save the CSV file and upload it here</li>
              </ol>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={handleClose} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => file && mutate(file)}
                disabled={!file || isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isPending ? <><Spinner size="sm" /> Processing…</> : 'Import Transactions'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Import Complete</h3>
            <p className="text-slate-400 text-sm mb-4">Your transactions have been processed</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-green-500/10 rounded-xl">
                <p className="text-2xl font-bold text-green-400">{data?.imported}</p>
                <p className="text-xs text-slate-500 mt-0.5">Imported</p>
              </div>
              <div className="p-4 bg-surface-600 rounded-xl">
                <p className="text-2xl font-bold text-slate-300">{data?.skipped}</p>
                <p className="text-xs text-slate-500 mt-0.5">Skipped</p>
              </div>
            </div>

            {data?.parseErrors && data.parseErrors.length > 0 && (
              <div className="text-left p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                <p className="text-xs font-medium text-amber-400 mb-1">
                  {data.parseErrors.length} row(s) had issues:
                </p>
                <ul className="text-xs text-slate-500 space-y-0.5">
                  {data.parseErrors.slice(0, 3).map((e, i) => <li key={i}>• {e}</li>)}
                  {data.parseErrors.length > 3 && <li>• …and {data.parseErrors.length - 3} more</li>}
                </ul>
              </div>
            )}

            <button onClick={handleClose} className="btn-primary w-full">Done</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};