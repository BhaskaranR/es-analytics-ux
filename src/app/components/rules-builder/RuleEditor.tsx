'use client';

// Editor for the selected rule: operator pills, match input with # autocomplete,
// validation, proximity steppers, English read-back, exclude token-field, live
// test, and compiled-query preview. Owns its editor-local UI state.

import { useMemo, useRef, useState } from 'react';

import { Ban, ChevronDown, ChevronRight, CircleCheck, Code2, Lightbulb, TriangleAlert, X } from 'lucide-react';

import { DEFAULT_DIST, astToQuery, collectGroups, english, evalComment, parse, tokenize } from './engine';
import { SEED_TEST } from './seed';
import type { Ast, Status, WordGroup } from './types';
import { StatusIcon, field, opBtn } from './ui';
import type { RB } from './useStore';

export function RuleEditor({ rb }: { rb: RB }) {
    const matchRef = useRef<HTMLInputElement>(null);
    const [ac, setAc] = useState<{ open: boolean; items: WordGroup[]; index: number; from: number }>({ open: false, items: [], index: 0, from: 0 });
    const [exInput, setExInput] = useState('');
    const [exIndex, setExIndex] = useState(0);
    const [exFocus, setExFocus] = useState(false);
    const [showQuery, setShowQuery] = useState(false);
    const [stem, setStem] = useState(true);
    const [testInput, setTestInput] = useState(SEED_TEST);

    const { match, setMatch, exclude, setExclude, groups, groupMap } = rb;

    const parsed = useMemo<{ ast: Ast | null; error: string | null; warn: string | null }>(() => {
        const m = match.trim();
        if (!m) return { ast: null, error: null, warn: null };
        try {
            const ast = parse(tokenize(m));
            const missing = collectGroups(ast).find((g) => !groupMap[g]);

            return { ast, error: null, warn: missing ? `Unknown word group: #${missing}` : null };
        } catch (e) {
            return { ast: null, error: (e as Error).message, warn: null };
        }
    }, [match, groupMap]);

    const samples = useMemo(() => testInput.split('\n').map((s) => s.trim()).filter(Boolean), [testInput]);
    const results = useMemo(() => {
        if (!parsed.ast) return [];
        const order: Record<Status, number> = { match: 0, excluded: 1, miss: 2 };

        return samples.map((s) => ({ s, ...evalComment(s, parsed.ast, exclude, groupMap, stem) })).sort((a, b) => order[a.status] - order[b.status]);
    }, [parsed.ast, exclude, groupMap, stem, samples]);
    const matchedCount = results.filter((r) => r.status === 'match').length;
    const excludedCount = results.filter((r) => r.status === 'excluded').length;

    const nearOccurrences = useMemo(() => [...match.matchAll(/\b(near|within)\b(>)?(?:\/(\d+))?/gi)].map((m) => ({ ordered: !!m[2], dist: m[3] ? parseInt(m[3], 10) : DEFAULT_DIST })), [match]);
    const rewriteProx = (occIdx: number, patch: { dist?: number; ordered?: boolean }) => {
        let k = -1;
        setMatch(
            match.replace(/\b(near|within)\b(>)?(?:\/(\d+))?/gi, (full, op, gt, num) => {
                if (++k !== occIdx) return full;
                const ordered = patch.ordered ?? !!gt;
                const dist = patch.dist ?? (num ? parseInt(num, 10) : DEFAULT_DIST);

                return `${op.toLowerCase()}${ordered ? '>' : ''}/${dist}`;
            })
        );
    };
    const insert = (token: string, caretBack = 0) => {
        const el = matchRef.current;
        const s = el?.selectionStart ?? match.length;
        const e = el?.selectionEnd ?? match.length;
        setMatch(match.slice(0, s) + token + match.slice(e));
        requestAnimationFrame(() => {
            el?.focus();
            const pos = s + token.length - caretBack;
            el?.setSelectionRange(pos, pos);
        });
    };

    // # autocomplete in the match input
    const updateAcFrom = (value: string, caret: number) => {
        const m = value.slice(0, caret).match(/#([A-Za-z0-9_]*)$/);
        if (!m) {
            setAc((a) => (a.open ? { ...a, open: false } : a));

            return;
        }
        const frag = m[1].toLowerCase();
        const items = groups.filter((g) => g.name.toLowerCase().includes(frag)).slice(0, 8);
        setAc({ open: items.length > 0, items, index: 0, from: caret - m[0].length });
    };
    const updateAcCaret = () => {
        const el = matchRef.current;
        if (el) updateAcFrom(el.value, el.selectionStart ?? el.value.length);
    };
    const acceptAc = (g: WordGroup) => {
        const el = matchRef.current;
        const caret = el?.selectionStart ?? match.length;
        const text = `#${g.name} `;
        setMatch(match.slice(0, ac.from) + text + match.slice(caret));
        setAc((a) => ({ ...a, open: false }));
        const pos = ac.from + text.length;
        requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(pos, pos); });
    };

    const addExclude = (t: string) => {
        const v = t.trim().replace(/,$/, '');
        if (v && !exclude.includes(v)) setExclude([...exclude, v]);
        setExInput('');
        setExIndex(0);
    };
    const exItems = exInput.startsWith('#') ? groups.filter((g) => g.name.toLowerCase().includes(exInput.slice(1).toLowerCase())).slice(0, 8) : [];
    const unknownExcludes = exclude.filter((e) => e.startsWith('#') && !groupMap[e.slice(1)]).map((e) => e.slice(1));

    if (!rb.selRule)
        return (
            <div className='min-w-0 flex-1'>
                <div className='rounded-xl bg-muted/50 p-8 text-center text-sm text-muted-foreground'>No rule selected. <button onClick={rb.newRule} className='text-primary'>+ New rule</button></div>
            </div>
        );

    return (
        <div className='min-w-0 flex-1'>
            <div className='rounded-xl border-2 border-primary/60 p-4'>
                <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Match expression</label>
                {/* operator pills */}
                <div className='mt-1.5 flex flex-wrap gap-1.5'>
                    <button className={opBtn} onClick={() => insert(' near ')} title='within N words — set distance below'>near</button>
                    <button className={opBtn} onClick={() => insert(' and ')}>and</button>
                    <button className={opBtn} onClick={() => insert(' or ')}>or</button>
                    <button className={opBtn} onClick={() => insert('()', 1)}>( )</button>
                    <button className={opBtn} onClick={() => insert('""', 1)}>&quot; &quot;</button>
                    <button className={`${opBtn} text-amber-600 dark:text-amber-400`} onClick={() => insert('*')} title='wildcard: manage* matches manager, managing'>*</button>
                    <button className={`${opBtn} text-amber-600 dark:text-amber-400`} onClick={() => insert('~')} title='fuzzy: word~ or ?word — tolerates typos'>~</button>
                    <button className={`${opBtn} border-primary/40 text-blue-600 dark:text-blue-400`} onClick={() => { insert('#'); requestAnimationFrame(updateAcCaret); }}># group</button>
                </div>
                <div className='relative mt-1.5'>
                    <input
                        ref={matchRef}
                        className={`${field} font-mono`}
                        value={match}
                        onChange={(e) => { setMatch(e.target.value); updateAcFrom(e.target.value, e.target.selectionStart ?? e.target.value.length); }}
                        onClick={updateAcCaret}
                        onBlur={() => setTimeout(() => setAc((a) => ({ ...a, open: false })), 120)}
                        onKeyDown={(e) => {
                            if (!ac.open) return;
                            if (e.key === 'ArrowDown') { e.preventDefault(); setAc((a) => ({ ...a, index: Math.min(a.items.length - 1, a.index + 1) })); }
                            else if (e.key === 'ArrowUp') { e.preventDefault(); setAc((a) => ({ ...a, index: Math.max(0, a.index - 1) })); }
                            else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); acceptAc(ac.items[ac.index]); }
                            else if (e.key === 'Escape') { e.preventDefault(); setAc((a) => ({ ...a, open: false })); }
                        }}
                    />
                    {ac.open && (
                        <div className='absolute left-0 top-full z-30 mt-1 max-h-56 w-72 overflow-auto rounded-md border bg-background p-1 shadow-md'>
                            {ac.items.map((g, idx) => (
                                <button key={g.id} onMouseDown={(e) => { e.preventDefault(); acceptAc(g); }} className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${idx === ac.index ? 'bg-accent' : 'hover:bg-accent'}`}>
                                    <span className='font-mono text-blue-600 dark:text-blue-400'>#{g.name}</span>
                                    <span className='ml-auto text-[11px] text-muted-foreground'>{g.terms.length} terms</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* validation */}
                <div className='mt-1.5 text-xs'>
                    {parsed.error ? (
                        <span className='flex items-center gap-1 text-red-600 dark:text-red-400'><TriangleAlert className='size-3.5' /> {parsed.error}</span>
                    ) : parsed.warn ? (
                        <span className='flex items-center gap-1 text-amber-600 dark:text-amber-400'><TriangleAlert className='size-3.5' /> {parsed.warn}</span>
                    ) : parsed.ast ? (
                        <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400'><CircleCheck className='size-3.5' /> Valid</span>
                    ) : (
                        <span className='flex items-center gap-1 text-muted-foreground'><Lightbulb className='size-3.5' /> type <span className='font-mono text-blue-600 dark:text-blue-400'>#</span> for a word group · <span className='italic'>near</span> = proximity</span>
                    )}
                </div>

                {/* distance steppers */}
                {nearOccurrences.length > 0 && (
                    <div className='mt-2 flex flex-wrap items-center gap-2'>
                        <span className='text-[11px] uppercase tracking-wide text-muted-foreground'>Proximity</span>
                        {nearOccurrences.map((occ, i) => (
                            <span key={i} className='inline-flex items-center gap-1 rounded-md border bg-muted/50 px-1.5 py-0.5 text-xs'>
                                <span className='italic text-muted-foreground'>near {i + 1}</span> ≤
                                <button className='px-1 text-muted-foreground hover:text-foreground' onClick={() => rewriteProx(i, { dist: Math.max(1, occ.dist - 1) })}>−</button>
                                <span className='w-4 text-center font-medium'>{occ.dist}</span>
                                <button className='px-1 text-muted-foreground hover:text-foreground' onClick={() => rewriteProx(i, { dist: Math.min(100, occ.dist + 1) })}>+</button>
                                <span className='text-muted-foreground'>words</span>
                                <button onClick={() => rewriteProx(i, { ordered: !occ.ordered })} title='in order: left term must come before right' className={`ml-1 rounded px-1 ${occ.ordered ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{occ.ordered ? 'in order' : 'any order'}</button>
                            </span>
                        ))}
                    </div>
                )}

                {/* plain-English read-back */}
                {parsed.ast && <div className='mt-2 text-xs text-muted-foreground'><span className='text-muted-foreground/70'>Reads as:</span> {english(parsed.ast)}</div>}

                {/* exclude token-field */}
                <div className='mt-4'>
                    <label className='flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground'>
                        <Ban className='size-3.5 text-rose-500/80' /> Exclude
                        <span className='normal-case tracking-normal text-muted-foreground/70'>— skip the comment if any of these appear</span>
                    </label>
                    <div className='relative mt-1.5'>
                        <div className='flex flex-wrap items-center gap-1.5 rounded-md border bg-background p-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring'>
                            {exclude.length === 0 && <span className='px-1 text-xs text-muted-foreground'>None — comment matches on the expression alone.</span>}
                            {exclude.map((t, i) => {
                                const isGroup = t.startsWith('#');
                                const unknown = isGroup && !groupMap[t.slice(1)];

                                return (
                                    <span key={i} title={unknown ? 'Unknown word group' : isGroup ? `${groupMap[t.slice(1)]?.length ?? 0} terms` : 'literal word'} className={`group/chip inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${isGroup ? `font-mono ${unknown ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}` : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}`}>
                                        {unknown && <TriangleAlert className='size-3' />}
                                        {t}
                                        <X className='size-3 cursor-pointer opacity-60 group-hover/chip:opacity-100' onClick={() => setExclude(exclude.filter((_, idx) => idx !== i))} />
                                    </span>
                                );
                            })}
                            <input
                                className='h-6 min-w-32 flex-1 bg-transparent px-1 text-xs outline-none'
                                placeholder='+ add word or #group'
                                value={exInput}
                                onChange={(e) => { setExInput(e.target.value); setExIndex(0); }}
                                onFocus={() => setExFocus(true)}
                                onBlur={() => setTimeout(() => setExFocus(false), 120)}
                                onKeyDown={(e) => {
                                    if (exItems.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                                        e.preventDefault();
                                        setExIndex((x) => Math.max(0, Math.min(exItems.length - 1, x + (e.key === 'ArrowDown' ? 1 : -1))));
                                    } else if (e.key === 'Enter' || e.key === 'Tab') {
                                        if (exItems.length) { e.preventDefault(); addExclude(`#${exItems[exIndex].name}`); }
                                        else if (e.key === 'Enter') addExclude(exInput);
                                    } else if (e.key === 'Backspace' && !exInput && exclude.length) {
                                        setExclude(exclude.slice(0, -1));
                                    } else if (e.key === 'Escape') {
                                        setExInput('');
                                    }
                                }}
                            />
                        </div>
                        {exFocus && exItems.length > 0 && (
                            <div className='absolute left-0 top-full z-30 mt-1 max-h-56 w-72 overflow-auto rounded-md border bg-background p-1 shadow-md'>
                                {exItems.map((g, idx) => (
                                    <button key={g.id} onMouseDown={(e) => { e.preventDefault(); addExclude(`#${g.name}`); }} className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${idx === exIndex ? 'bg-accent' : 'hover:bg-accent'}`}>
                                        <span className='font-mono text-blue-600 dark:text-blue-400'>#{g.name}</span>
                                        <span className='ml-auto text-[11px] text-muted-foreground'>{g.terms.length} terms</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {unknownExcludes.length > 0 && (
                        <p className='mt-1.5 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400'>
                            <TriangleAlert className='size-3' /> Unknown word group{unknownExcludes.length > 1 ? 's' : ''}: {unknownExcludes.map((g) => `#${g}`).join(', ')}
                        </p>
                    )}
                </div>

                {/* test panel */}
                <div className='mt-4 border-t pt-3.5'>
                    <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                            Test · click a word to exclude
                            <button onClick={() => setStem((v) => !v)} title='Stemming: grow matches growing / grew. Analyzer-level setting, applies to every rule.' className={`rounded-md border px-1.5 py-0.5 text-[11px] ${stem ? 'border-primary/40 text-primary' : 'text-muted-foreground'}`}>stemming {stem ? 'on' : 'off'}</button>
                        </span>
                        <span className='flex gap-1.5'>
                            <span className='rounded-md bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'>{matchedCount} matched</span>
                            <span className='rounded-md bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-950 dark:text-red-300'>{excludedCount} excluded</span>
                        </span>
                    </div>
                    <textarea value={testInput} onChange={(e) => setTestInput(e.target.value)} rows={3} placeholder='Paste comments to test — one per line' className='mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring' />
                    <div className='mt-2.5'>
                        {parsed.error ? (
                            <div className='py-3 text-center text-sm text-muted-foreground'>Fix the expression to test it.</div>
                        ) : samples.length === 0 ? (
                            <div className='py-3 text-center text-sm text-muted-foreground'>Paste a comment above to test it.</div>
                        ) : (
                            results.map((r, i) => (
                                <div key={i} className={`flex items-start gap-2.5 border-b py-1.5 ${r.status === 'miss' ? 'opacity-50' : ''}`}>
                                    <span className='mt-0.5 shrink-0'><StatusIcon status={r.status} /></span>
                                    <span className='text-sm leading-relaxed'>
                                        {r.parts.map((p, j) => (
                                            <span key={j}>
                                                <span onClick={() => addExclude(p.norm)} title={`click to exclude "${p.norm}"`} className={`cursor-pointer rounded px-0.5 ${p.kind === 'excluded' ? 'bg-red-100 text-red-800 line-through dark:bg-red-900/40 dark:text-red-300' : p.kind === 'match' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : ''}`}>{p.text}</span>{' '}
                                            </span>
                                        ))}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* compiled query */}
                <div className='mt-3'>
                    <button onClick={() => setShowQuery((s) => !s)} className='flex items-center gap-1 text-xs text-primary'>
                        {showQuery ? <ChevronDown className='size-3.5' /> : <ChevronRight className='size-3.5' />}
                        <Code2 className='size-3.5' /> {showQuery ? 'Hide' : 'View'} compiled query
                    </button>
                    {showQuery && <pre className='mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-[11.5px] leading-relaxed text-muted-foreground'>{astToQuery(parsed.ast, exclude)}</pre>}
                </div>

                <div className='mt-4 flex justify-end gap-2'>
                    <button onClick={() => rb.loadRule(rb.rules.find((r) => r.id === rb.selRule))} className='inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent'>Cancel</button>
                    <button onClick={rb.saveRule} disabled={!!parsed.error} className='inline-flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-sm text-primary transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50'>Save</button>
                </div>
            </div>
        </div>
    );
}
