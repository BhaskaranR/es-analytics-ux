'use client';

// Presentational helpers + shared class strings.

import { useState } from 'react';

import { Ban, Check, ChevronDown, Minus } from 'lucide-react';

import type { Status } from './types';

export const btn = 'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground';
export const btnSm = 'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors hover:bg-accent';
export const field = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-ring';
export const opBtn = 'rounded-md border px-2.5 py-1 font-mono text-xs transition-colors hover:bg-accent';

// Syntax-highlight a match expression for read-only display.
export function ExprText({ text }: { text: string }) {
    if (!text) return <span className='text-muted-foreground italic'>(empty rule)</span>;

    return (
        <>
            {text.split(/(\s+)/).map((tk, i) => {
                const lw = tk.toLowerCase();
                if (tk.startsWith('#')) return <span key={i} className='font-medium text-blue-600 dark:text-blue-400'>{tk}</span>;
                if (/^(near|within)(>)?(\/\d+)?$/.test(lw) || lw === 'and' || lw === 'or') return <span key={i} className='text-muted-foreground italic'>{tk}</span>;
                if (tk.startsWith('"')) return <span key={i} className='text-emerald-700 dark:text-emerald-400'>{tk}</span>;
                if (tk.includes('*') || tk.startsWith('?') || /~\d?$/.test(tk)) return <span key={i} className='text-amber-600 dark:text-amber-400'>{tk}</span>;

                return <span key={i}>{tk}</span>;
            })}
        </>
    );
}

export function StatusIcon({ status }: { status: Status }) {
    if (status === 'match') return <Check className='size-4 text-emerald-600 dark:text-emerald-400' />;
    if (status === 'excluded') return <Ban className='size-4 text-red-600 dark:text-red-400' />;

    return <Minus className='size-4 text-muted-foreground' />;
}

// Breadcrumb dropdown (searchable when long).
export function Crumb({ label, items, onSelect, accent }: { label: string; items: { id: string; label: string }[]; onSelect: (id: string) => void; accent?: boolean }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const shown = q ? items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())) : items;

    return (
        <span className='relative inline-flex'>
            <button onClick={() => setOpen((o) => !o)} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${accent ? 'bg-primary/10 text-primary' : 'bg-muted hover:bg-accent'}`}>
                <span className='max-w-[200px] truncate'>{label}</span>
                <ChevronDown className='size-3.5 opacity-60' />
            </button>
            {open && (
                <>
                    <div className='fixed inset-0 z-10' onClick={() => setOpen(false)} />
                    <div className='absolute left-0 top-full z-20 mt-1 max-h-72 w-64 overflow-auto rounded-md border bg-background p-1 shadow-md'>
                        {items.length > 8 && <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder='Filter…' className='mb-1 w-full rounded-md border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring' />}
                        {shown.map((it) => (
                            <button key={it.id} onClick={() => { onSelect(it.id); setOpen(false); setQ(''); }} className='block w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-accent'>
                                {it.label}
                            </button>
                        ))}
                        {shown.length === 0 && <div className='px-2 py-1.5 text-sm text-muted-foreground'>No matches</div>}
                    </div>
                </>
            )}
        </span>
    );
}
