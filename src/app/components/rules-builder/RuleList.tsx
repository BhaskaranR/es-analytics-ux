'use client';

// Master list of rules for the selected topic, with search + filters.

import { useMemo } from 'react';

import { Ban, Plus, Search, Trash2 } from 'lucide-react';

import { ROW_CAP } from './seed';
import { ExprText, btnSm, field } from './ui';
import type { RB } from './useStore';

export function RuleList({ rb }: { rb: RB }) {
    const visibleRules = useMemo(() => {
        const q = rb.ruleSearch.toLowerCase();

        return rb.rules.filter((r) => {
            if (q && !r.match.toLowerCase().includes(q) && !r.exclude.some((e) => e.toLowerCase().includes(q))) return false;
            if (rb.fHasExclude && r.exclude.length === 0) return false;
            if (rb.fUsesGroup && !r.match.includes('#') && !r.exclude.some((e) => e.startsWith('#'))) return false;

            return true;
        });
    }, [rb.rules, rb.ruleSearch, rb.fHasExclude, rb.fUsesGroup]);

    return (
        <div className='w-80 shrink-0'>
            <div className='mb-2 flex items-center justify-between'>
                <span className='text-sm font-medium'>{rb.rules.length} rules</span>
                <button onClick={rb.newRule} className={btnSm}><Plus className='size-3.5' /> New</button>
            </div>
            <div className='relative mb-2'>
                <Search className='absolute left-2.5 top-2 size-4 text-muted-foreground' />
                <input className={`${field} h-9 pl-8`} placeholder='Search rules' value={rb.ruleSearch} onChange={(e) => rb.setRuleSearch(e.target.value)} />
            </div>
            <div className='mb-2 flex gap-1.5'>
                <button onClick={() => rb.setFUsesGroup((v) => !v)} className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${rb.fUsesGroup ? 'bg-primary/10 text-primary' : 'bg-muted hover:bg-accent'}`}>uses #group</button>
                <button onClick={() => rb.setFHasExclude((v) => !v)} className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${rb.fHasExclude ? 'bg-primary/10 text-primary' : 'bg-muted hover:bg-accent'}`}>has exclude</button>
            </div>
            <div className='overflow-hidden rounded-md border'>
                {visibleRules.slice(0, ROW_CAP).map((r) => (
                    <div key={r.id} className={`group flex items-start gap-1 border-b px-2.5 py-2 last:border-b-0 transition-colors ${r.id === rb.selRule ? 'bg-primary/10' : 'hover:bg-accent/50'}`}>
                        <button onClick={() => rb.pickRule(r)} className='min-w-0 flex-1 text-left' title={r.match}>
                            <div className='font-mono text-[12px] leading-relaxed break-words'><ExprText text={r.match} /></div>
                            {r.exclude.length > 0 && (
                                <div className='mt-1 flex flex-wrap items-center gap-1'>
                                    <span className='inline-flex items-center gap-0.5 text-[9px] font-medium uppercase tracking-wide text-rose-500/80'><Ban className='size-3' /> excl</span>
                                    {r.exclude.map((e, i) => (
                                        <span key={i} className={`break-all rounded px-1 py-px text-[10px] ${e.startsWith('#') ? 'bg-blue-50 font-mono text-blue-600 dark:bg-blue-950/50 dark:text-blue-300' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'}`}>{e}</span>
                                    ))}
                                </div>
                            )}
                        </button>
                        <button onClick={() => rb.deleteRule(r.id)} title='Delete rule' className='mt-0.5 opacity-0 group-hover:opacity-100'><Trash2 className='size-3.5 text-muted-foreground hover:text-red-600' /></button>
                    </div>
                ))}
                {visibleRules.length === 0 && <div className='px-3 py-6 text-center text-sm text-muted-foreground'>No rules match.</div>}
            </div>
            {visibleRules.length > ROW_CAP && <div className='py-1.5 text-center text-[11px] text-muted-foreground'>{visibleRules.length - ROW_CAP} more · refine search</div>}
        </div>
    );
}
