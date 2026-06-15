'use client';

// Word-group library: searchable master list + editor. Owns its own editor state.

import { useMemo, useState } from 'react';

import { Plus, Search, Trash2, X } from 'lucide-react';

import { norm } from './engine';
import { ROW_CAP } from './seed';
import type { WordGroup } from './types';
import { btn, btnSm, field } from './ui';
import type { RB } from './useStore';

export function WordGroupsPanel({ rb }: { rb: RB }) {
    const [selGroup, setSelGroup] = useState<string | null>(rb.groups[0]?.id ?? null);
    const [gName, setGName] = useState(rb.groups[0]?.name ?? '');
    const [gTerms, setGTerms] = useState<string[]>([...(rb.groups[0]?.terms ?? [])]);
    const [gInput, setGInput] = useState('');
    const [gTermFilter, setGTermFilter] = useState('');
    const [gIsNew, setGIsNew] = useState(false);
    const [groupSearch, setGroupSearch] = useState('');

    const visibleGroups = useMemo(() => {
        const q = groupSearch.toLowerCase();

        return rb.groups.map((g) => ({ g, hitTerm: q && !g.name.includes(q) ? g.terms.find((t) => t.includes(q)) : undefined })).filter(({ g }) => !q || g.name.includes(q) || g.terms.some((t) => t.includes(q)));
    }, [rb.groups, groupSearch]);

    const loadGroup = (g: WordGroup) => {
        setSelGroup(g.id);
        setGName(g.name);
        setGTerms([...g.terms]);
        setGInput('');
        setGTermFilter('');
        setGIsNew(false);
    };
    const newGroup = () => {
        setSelGroup('__new');
        setGName('');
        setGTerms([]);
        setGInput('');
        setGTermFilter('');
        setGIsNew(true);
    };
    const saveGroup = () => {
        const name = gName.trim().replace(/^#/, '');
        if (!name) return;
        if (gIsNew) {
            const g: WordGroup = { id: rb.nextId('g'), name, terms: gTerms };
            rb.setGroups((prev) => [...prev, g]);
            setSelGroup(g.id);
            setGIsNew(false);
        } else {
            rb.setGroups((prev) => prev.map((x) => (x.id === selGroup ? { ...x, name, terms: gTerms } : x)));
        }
    };
    const deleteGroup = (g: WordGroup) => {
        const n = rb.usage(g.name);
        rb.ask(n ? `#${g.name} is used by ${n} rule(s). Delete anyway?` : `Delete #${g.name}?`, () => {
            const remaining = rb.groups.filter((x) => x.id !== g.id);
            rb.setGroups(remaining);
            if (selGroup === g.id) {
                if (remaining[0]) loadGroup(remaining[0]);
                else { setSelGroup(null); setGTerms([]); setGName(''); }
            }
        });
    };
    const addGroupTerms = (raw: string) => {
        const parts = raw.split(/[,\n;]+/).map(norm).filter(Boolean);
        if (parts.length) setGTerms((prev) => [...new Set([...prev, ...parts])]);
        setGInput('');
    };

    return (
        <div className='flex items-start gap-4'>
            <div className='w-72 shrink-0'>
                <div className='mb-2 flex items-center justify-between'>
                    <span className='text-sm font-medium'>{rb.groups.length} word groups</span>
                    <button onClick={newGroup} className={btnSm}><Plus className='size-3.5' /> New</button>
                </div>
                <div className='relative mb-2'>
                    <Search className='absolute left-2.5 top-2 size-4 text-muted-foreground' />
                    <input className={`${field} h-9 pl-8`} placeholder='Search name or term' value={groupSearch} onChange={(e) => setGroupSearch(e.target.value.toLowerCase().trim())} />
                </div>
                <div className='overflow-hidden rounded-md border'>
                    {visibleGroups.slice(0, ROW_CAP).map(({ g, hitTerm }) => (
                        <button key={g.id} onClick={() => loadGroup(g)} className={`block w-full border-b px-3 py-2 text-left last:border-b-0 transition-colors ${selGroup === g.id ? 'bg-primary/10' : 'hover:bg-accent/50'}`}>
                            <div className='truncate font-mono text-[12.5px] text-blue-600 dark:text-blue-400'>#{g.name}</div>
                            <div className='text-[11px] text-muted-foreground'>
                                {g.terms.length} terms · used {rb.usage(g.name)}
                                {hitTerm && <span className='ml-1 text-emerald-600 dark:text-emerald-400'>· contains “{hitTerm}”</span>}
                            </div>
                        </button>
                    ))}
                    {visibleGroups.length === 0 && <div className='px-3 py-6 text-center text-sm text-muted-foreground'>No groups match.</div>}
                </div>
                {visibleGroups.length > ROW_CAP && <div className='py-1.5 text-center text-[11px] text-muted-foreground'>{visibleGroups.length - ROW_CAP} more · refine search</div>}
            </div>

            <div className='min-w-0 flex-1'>
                {selGroup ? (
                    <div className='rounded-xl border-2 border-primary/60 p-4'>
                        <h3 className='mb-3 text-sm font-medium'>{gIsNew ? 'New word group' : 'Edit word group'}</h3>
                        <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Name</label>
                        <div className='mt-1.5 flex items-center gap-1.5'>
                            <span className='font-mono text-sm text-blue-600 dark:text-blue-400'>#</span>
                            <input className={`${field} font-mono`} placeholder='topic_en' value={gName} onChange={(e) => setGName(e.target.value)} />
                        </div>
                        <div className='mt-4 flex items-center justify-between'>
                            <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Terms ({gTerms.length})</label>
                            {gTerms.length > 20 && <input className='h-7 w-40 rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring' placeholder='filter terms' value={gTermFilter} onChange={(e) => setGTermFilter(e.target.value.toLowerCase())} />}
                        </div>
                        <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                            {gTerms.filter((t) => !gTermFilter || t.includes(gTermFilter)).map((t) => (
                                <span key={t} className='inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-sm'>
                                    {t}
                                    <X className='size-3 cursor-pointer' onClick={() => setGTerms(gTerms.filter((x) => x !== t))} />
                                </span>
                            ))}
                            <input className='h-7 w-48 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring' placeholder='+ add term(s), comma to bulk-add' value={gInput} onChange={(e) => setGInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addGroupTerms(gInput); }} />
                        </div>
                        {!gIsNew && <p className='mt-3 text-xs text-muted-foreground'>Used by {rb.usage(gName)} rules — saving updates all of them.</p>}
                        <div className='mt-4 flex justify-end gap-2'>
                            {!gIsNew && selGroup && <button onClick={() => deleteGroup(rb.groups.find((x) => x.id === selGroup)!)} className={`${btn} text-red-600 hover:text-red-600`}><Trash2 className='size-4' /> Delete</button>}
                            <button onClick={saveGroup} disabled={!gName.trim()} className={`${btn} border-primary text-primary disabled:pointer-events-none disabled:opacity-50`}>Save</button>
                        </div>
                    </div>
                ) : (
                    <div className='rounded-xl bg-muted/50 p-8 text-center text-sm text-muted-foreground'>Select a word group, or create a new one.</div>
                )}
            </div>
        </div>
    );
}
