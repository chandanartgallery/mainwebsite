'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface LuxSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Optional label shown before the trigger (e.g. "Sort By:") */
  label?: string;
  /** Tailwind / inline className for the trigger button */
  className?: string;
  /** Width class for the dropdown panel — defaults to "min-w-[180px]" */
  panelClassName?: string;
  /** Placement of the panel relative to the trigger */
  placement?: 'bottom-left' | 'bottom-right';
  /** Whether this is inside the dark admin panel (uses adm-* CSS vars) */
  admin?: boolean;
}

export default function LuxSelect({
  value,
  onChange,
  options,
  label,
  className = '',
  panelClassName = 'min-w-[180px]',
  placement = 'bottom-right',
  admin = false,
}: LuxSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.97, y: -6 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as any },
    },
    exit: {
      opacity: 0,
      scale: 0.97,
      y: -4,
      transition: { duration: 0.13 },
    },
  };

  if (admin) {
    // ── Admin variant (uses adm-* CSS custom properties) ──────────────────
    return (
      <div ref={ref} className={`relative inline-flex items-center gap-2 ${className}`}>
        {label && (
          <span className="text-[0.7rem] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--adm-text3)' }}>
            {label}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-semibold transition-colors"
          style={{
            background: open ? 'rgba(185,154,100,0.1)' : 'var(--adm-card2)',
            border: '1px solid var(--adm-border)',
            color: 'var(--adm-text)',
            minWidth: '7rem',
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex-1 text-left truncate">{selected?.label ?? '—'}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--adm-gold)' }} />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`absolute z-50 py-1 rounded-xl shadow-xl overflow-hidden ${panelClassName} ${
                placement === 'bottom-right' ? 'right-0' : 'left-0'
              } top-full mt-1.5`}
              style={{ background: 'var(--adm-modal-bg)', border: '1px solid var(--adm-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}
            >
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => { onChange(opt.value); setOpen(false); }}
                      className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-[0.75rem] font-medium text-left transition-colors"
                      style={{
                        background: active ? 'rgba(185,154,100,0.12)' : 'transparent',
                        color: active ? 'var(--adm-gold)' : 'var(--adm-text)',
                      }}
                      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(185,154,100,0.06)'; }}
                      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <span>{opt.label}</span>
                      {active && <Check className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--adm-gold)' }} />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Site variant (uses Tailwind + CSS vars from globals.css) ─────────────
  return (
    <div ref={ref} className={`relative inline-flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 transition-colors hover:text-neutral-600 dark:hover:text-neutral-600 focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label ?? '—'}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute z-50 py-1.5 rounded-[14px] overflow-hidden ${panelClassName} ${
              placement === 'bottom-right' ? 'right-0' : 'left-0'
            } top-full mt-2`}
            style={{
              background: 'var(--surface-solid)',
              border: '1px solid var(--line)',
              boxShadow: '0 8px 36px rgba(45,35,25,0.14)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`w-full flex items-center justify-between gap-4 px-4 py-2.5 text-[0.8rem] text-left transition-colors duration-150 ${
                      active
                        ? 'text-neutral-700 font-bold bg-neutral-900/10'
                        : 'text-neutral-800 dark:text-neutral-100 font-medium hover:bg-neutral-900/8 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {active && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0 text-neutral-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
