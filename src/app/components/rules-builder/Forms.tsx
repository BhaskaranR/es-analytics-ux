'use client';

// Segment list, topic list, and the new/edit form pages (rv: segments | topics | segForm | topicForm).

import { ChevronRight, Folder, Pencil, Plus, Tag, Trash2 } from 'lucide-react';

import { btn, field } from './ui';
import type { RB } from './useStore';

export function Forms({ rb }: { rb: RB }) {
    if (rb.rv === 'segments')
        return (
            <div className='max-w-2xl'>
                <div className='mb-3 flex items-center justify-between'>
                    <h2 className='text-lg font-medium'>Segments</h2>
                    <button onClick={rb.openNewSegment} className={btn}><Plus className='size-4' /> New segment</button>
                </div>
                <div className='overflow-hidden rounded-xl border'>
                    {rb.segments.map((s) => (
                        <div key={s.id} className='group flex items-center gap-2 border-b px-4 py-3 last:border-b-0 hover:bg-accent/50'>
                            <button onClick={() => rb.switchSegment(s.id)} className='flex min-w-0 flex-1 items-center gap-3 text-left'>
                                <Folder className='size-4 text-muted-foreground' />
                                <span className='font-medium'>{s.name}</span>
                                <span className='text-xs text-muted-foreground'>{s.topics.length} topics · {rb.ruleCount(s)} rules</span>
                            </button>
                            <span className='flex items-center gap-2 opacity-0 group-hover:opacity-100'>
                                <button onClick={() => rb.openEditSegment(s)} title='Rename'><Pencil className='size-4 text-muted-foreground hover:text-foreground' /></button>
                                <button onClick={() => rb.deleteSegment(s.id)} title='Delete'><Trash2 className='size-4 text-muted-foreground hover:text-red-600' /></button>
                            </span>
                            <ChevronRight className='size-4 text-muted-foreground' />
                        </div>
                    ))}
                </div>
            </div>
        );

    if (rb.rv === 'topics' && rb.seg)
        return (
            <div className='max-w-2xl'>
                <div className='mb-3 flex items-center justify-between'>
                    <h2 className='text-lg font-medium'>{rb.seg.name}</h2>
                    <button onClick={() => rb.openNewTopic(rb.seg!.id)} className={btn}><Plus className='size-4' /> New topic</button>
                </div>
                {rb.seg.topics.length === 0 ? (
                    <div className='rounded-xl bg-muted/50 p-8 text-center text-sm text-muted-foreground'>No topics yet in this segment.</div>
                ) : (
                    <div className='overflow-hidden rounded-xl border'>
                        {rb.seg.topics.map((t) => (
                            <div key={t.id} className='group flex items-center gap-2 border-b px-4 py-3 last:border-b-0 hover:bg-accent/50'>
                                <button onClick={() => rb.pickTopic(rb.seg!.id, t.id)} className='flex min-w-0 flex-1 items-center gap-3 text-left'>
                                    <Tag className='size-4 text-muted-foreground' />
                                    <span className='min-w-0 flex-1 truncate'>{t.name}</span>
                                    <span className='text-xs text-muted-foreground'>{t.rules.length} rules</span>
                                </button>
                                <span className='flex items-center gap-2 opacity-0 group-hover:opacity-100'>
                                    <button onClick={() => rb.openEditTopic(rb.seg!.id, t)} title='Rename'><Pencil className='size-4 text-muted-foreground hover:text-foreground' /></button>
                                    <button onClick={() => rb.deleteTopic(rb.seg!.id, t.id)} title='Delete'><Trash2 className='size-4 text-muted-foreground hover:text-red-600' /></button>
                                </span>
                                <ChevronRight className='size-4 text-muted-foreground' />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );

    if (rb.rv === 'segForm')
        return (
            <div className='max-w-lg'>
                <h2 className='mb-1 text-lg font-medium'>{rb.segForm.id ? 'Edit segment' : 'New segment'}</h2>
                <p className='mb-4 text-sm text-muted-foreground'>A segment is a top-level grouping that holds topics.</p>
                <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Name</label>
                <input autoFocus className={`${field} mt-1.5`} placeholder='e.g. Product Experience' value={rb.segForm.name} onChange={(e) => rb.setSegForm({ ...rb.segForm, name: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') rb.saveSegForm(); if (e.key === 'Escape') rb.setRv(rb.returnRv); }} />
                <div className='mt-4 flex justify-end gap-2'>
                    <button onClick={() => rb.setRv(rb.returnRv)} className={btn}>Cancel</button>
                    <button onClick={rb.saveSegForm} disabled={!rb.segForm.name.trim()} className={`${btn} border-primary text-primary disabled:pointer-events-none disabled:opacity-50`}>Save</button>
                </div>
            </div>
        );

    if (rb.rv === 'topicForm')
        return (
            <div className='max-w-lg'>
                <h2 className='mb-1 text-lg font-medium'>{rb.topicForm.id ? 'Edit topic' : 'New topic'}</h2>
                <p className='mb-4 text-sm text-muted-foreground'>A topic lives under a segment and holds rules.</p>
                <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Segment</label>
                <select className={`${field} mt-1.5`} value={rb.topicForm.segId} onChange={(e) => rb.setTopicForm({ ...rb.topicForm, segId: e.target.value })}>
                    {rb.segments.map((s) => <option key={s.id} value={s.id}>{s.id === 'none' ? '— No segment —' : s.name}</option>)}
                </select>
                <label className='mt-4 block text-[11px] uppercase tracking-wide text-muted-foreground'>Name</label>
                <input autoFocus className={`${field} mt-1.5`} placeholder='e.g. Performance' value={rb.topicForm.name} onChange={(e) => rb.setTopicForm({ ...rb.topicForm, name: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') rb.saveTopicForm(); if (e.key === 'Escape') rb.setRv(rb.returnRv); }} />
                <div className='mt-4 flex justify-end gap-2'>
                    <button onClick={() => rb.setRv(rb.returnRv)} className={btn}>Cancel</button>
                    <button onClick={rb.saveTopicForm} disabled={!rb.topicForm.name.trim() || !rb.topicForm.segId} className={`${btn} border-primary text-primary disabled:pointer-events-none disabled:opacity-50`}>Save</button>
                </div>
            </div>
        );

    return null;
}
