  // ─── frontend/src/components/ui/Modal.tsx ─────────────────────────────────────
  import { motion, AnimatePresence } from 'framer-motion';
  import { X } from 'lucide-react';
  import { ReactNode } from 'react';
  
  interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: string;
  }
  
  export const Modal = ({ open, onClose, title, children, width = 'max-w-lg' }: ModalProps) => (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative z-10 w-full ${width} glass p-6`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button onClick={onClose} className="btn-ghost p-1.5">
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );