'use client';

import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-neutral-600 flex-shrink-0" />;
    }
  };

  const getBgStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-zinc-950/95 border-emerald-500/40 shadow-emerald-500/10';
      case 'error':
        return 'bg-zinc-950/95 border-rose-500/40 shadow-rose-500/10';
      case 'warning':
        return 'bg-zinc-950/95 border-amber-500/40 shadow-amber-500/10';
      default:
        return 'bg-zinc-950/95 border-neutral-300/40 shadow-luxury-gold/10';
    }
  };

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto w-full p-4 rounded-[12px] border backdrop-blur-md shadow-lg flex items-start gap-3.5 transition-all duration-200 ${getBgStyle(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 text-sm font-medium text-neutral-100 leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-neutral-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
