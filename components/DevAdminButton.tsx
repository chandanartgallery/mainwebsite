'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

// Dev-only shortcut. Renders after mount to avoid SSR/client mismatches.
export default function DevAdminButton() {
  const cartOpen = useUIStore((s) => s.cartOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(process.env.NODE_ENV === 'development');
  }, []);

  if (!visible || cartOpen) return null;

  return (
    <Link
      href="/admin"
      title="Dev shortcut → Admin Panel"
      className="fixed bottom-5 right-5 z-[40] flex items-center gap-2 rounded-xl border border-white/15 bg-[#111318] px-3.5 py-2.5 text-[0.68rem] font-bold uppercase tracking-widest text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#1a1d24]"
    >
      <Terminal className="h-3.5 w-3.5 text-[#b99a64]" />
      Admin
    </Link>
  );
}
