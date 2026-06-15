'use client';

// Left sidebar: word-groups button + segment/topic tree, with the Ungrouped
// bucket grouped by derived name-prefix (promotable to a real segment).

import { BookText, ChevronDown, ChevronRight, Folder, Pencil, Plus, Search, Tag, Trash2, ArrowUpRight } from 'lucide-react';

import { splitPrefix } from './seed';
import type { Segment, Topic } from './types';
import { field } from './ui';
import type { RB } from './useStore';

export function TreeNav({ rb }: { rb: RB }) {
    const topicRow = (s: Segment, tp: Topic, displayName: string, pad: string) => {
        const on = rb.section === 'rules' && rb.rv === 'rules' && s.id === rb.selSeg && tp.id === rb.selTopic;

        return (
            <div key={tp.id} className={`group flex items-center gap-2 rounded-md py-1.5 ${pad} pr-2 text-sm transition-colors ${on ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-accent'}`}>
                <button onClick={() => rb.pickTopic(s.id, tp.id)} className='flex min-w-0 flex-1 items-center gap-2'>
                    <Tag className='size-3.5 opacity-70' />
                    <span className='flex-1 truncate text-left'>{displayName}</span>
                </button>
                <span className='flex items-center gap-1 opacity-0 group-hover:opacity-100'>
                    <button onClick={() => rb.openEditTopic(s.id, tp)} title='Rename'><Pencil className='size-3.5 text-muted-foreground hover:text-foreground' /></button>
                    <button onClick={() => rb.deleteTopic(s.id, tp.id)} title='Delete topic'><Trash2 className='size-3.5 text-muted-foreground hover:text-red-600' /></button>
                </span>
                {tp.rules.length > 0 && <span className='text-xs text-muted-foreground'>{tp.rules.length}</span>}
            </div>
        );
    };

    const renderUngrouped = (s: Segment, tps: Topic[]) => {
        const byPrefix = new Map<string, Topic[]>();
        const plain: Topic[] = [];
        tps.forEach((t) => {
            const { prefix } = splitPrefix(t.name);
            if (!prefix) return void plain.push(t);
            const arr = byPrefix.get(prefix);
            if (arr) arr.push(t);
            else byPrefix.set(prefix, [t]);
        });

        return (
            <>
                {[...byPrefix.entries()].map(([prefix, topics]) => {
                    const existing = rb.segments.find((x) => x.id !== 'none' && x.name.toLowerCase() === prefix.toLowerCase());

                    return (
                        <div key={prefix}>
                            <div className='group flex items-center gap-1.5 rounded-md py-1 pl-7 pr-2'>
                                <span className='flex-1 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>{prefix}</span>
                                <span className='text-[10px] text-muted-foreground'>{topics.length}</span>
                                <button
                                    onClick={() => rb.askPromote(prefix, topics, existing)}
                                    title={existing ? `Move into the existing “${existing.name}” segment` : `Promote “${prefix}” to a segment`}
                                    className='flex items-center gap-0.5 rounded px-1 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100'>
                                    <ArrowUpRight className='size-3' /> {existing ? 'merge' : 'promote'}
                                </button>
                            </div>
                            {topics.map((tp) => topicRow(s, tp, splitPrefix(tp.name).rest, 'pl-10'))}
                        </div>
                    );
                })}
                {plain.map((tp) => topicRow(s, tp, tp.name, 'pl-7'))}
            </>
        );
    };

    return (
        <nav className='w-60 shrink-0 rounded-xl bg-muted/50 p-2.5'>
            <div className='relative mb-2.5'>
                <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                <input className={`${field} h-9 pl-8`} placeholder='Search topics' value={rb.navFilter} onChange={(e) => rb.setNavFilter(e.target.value.toLowerCase().trim())} />
            </div>
            <button onClick={() => rb.setSection('groups')} className={`mb-2 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors ${rb.section === 'groups' ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-accent'}`}>
                <BookText className='size-4' /> Word groups
                <span className='ml-auto text-xs text-muted-foreground'>{rb.groups.length}</span>
            </button>
            <div className='my-2 border-t' />
            <div className='flex items-center justify-between px-1.5 pb-1.5'>
                <span className='text-[11px] uppercase tracking-wide text-muted-foreground'>Segments</span>
                <button onClick={rb.openNewSegment} title='New segment'><Plus className='size-3.5 text-muted-foreground hover:text-foreground' /></button>
            </div>
            <div className='max-h-[600px] space-y-0.5 overflow-y-auto'>
                {rb.segments.map((s) => {
                    const tps = s.topics.filter((t) => !rb.navFilter || t.name.toLowerCase().includes(rb.navFilter) || s.name.toLowerCase().includes(rb.navFilter));
                    if (rb.navFilter && tps.length === 0) return null;
                    const open = rb.openSegs[s.id] || (!!rb.navFilter && tps.length > 0);

                    return (
                        <div key={s.id}>
                            <div className='group flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm font-medium hover:bg-accent'>
                                <button onClick={() => rb.setOpenSegs((o) => ({ ...o, [s.id]: !open }))} className='flex min-w-0 flex-1 items-center gap-1.5'>
                                    {open ? <ChevronDown className='size-3.5 text-muted-foreground' /> : <ChevronRight className='size-3.5 text-muted-foreground' />}
                                    <Folder className='size-4 text-muted-foreground' />
                                    <span className='flex-1 truncate text-left'>{s.name}</span>
                                </button>
                                <span className='flex items-center gap-1 opacity-0 group-hover:opacity-100'>
                                    {s.id !== 'none' && <button onClick={() => rb.openEditSegment(s)} title='Rename'><Pencil className='size-3.5 text-muted-foreground hover:text-foreground' /></button>}
                                    <button onClick={() => rb.openNewTopic(s.id)} title='Add topic'><Plus className='size-3.5 text-muted-foreground hover:text-foreground' /></button>
                                    {s.id !== 'none' && <button onClick={() => rb.deleteSegment(s.id)} title='Delete segment'><Trash2 className='size-3.5 text-muted-foreground hover:text-red-600' /></button>}
                                </span>
                                <span className='text-xs text-muted-foreground'>{s.topics.length}</span>
                            </div>
                            {open && (s.id === 'none' ? renderUngrouped(s, tps) : tps.map((tp) => topicRow(s, tp, tp.name, 'pl-7')))}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
