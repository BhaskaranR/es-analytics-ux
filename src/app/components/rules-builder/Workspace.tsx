'use client';

// Right-hand workspace: routes between the word-group library and the
// rules area (breadcrumb + segment/topic lists + forms + rule editor).

import { ChevronRight } from 'lucide-react';

import { Forms } from './Forms';
import { RuleEditor } from './RuleEditor';
import { RuleList } from './RuleList';
import { WordGroupsPanel } from './WordGroupsPanel';
import { Crumb } from './ui';
import type { RB } from './useStore';

export function Workspace({ rb }: { rb: RB }) {
    if (rb.section === 'groups') return <section className='min-w-0 flex-1'><WordGroupsPanel rb={rb} /></section>;

    return (
        <section className='min-w-0 flex-1'>
            {/* breadcrumb */}
            <div className='mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                <button onClick={() => rb.setRv('segments')} className='font-medium text-foreground hover:underline'>Rules</button>
                {(rb.rv === 'topics' || rb.rv === 'rules') && rb.seg && (
                    <>
                        <ChevronRight className='size-3.5' />
                        <Crumb label={rb.seg.name} items={rb.segments.map((s) => ({ id: s.id, label: s.name }))} onSelect={rb.switchSegment} accent={rb.rv === 'topics'} />
                    </>
                )}
                {rb.rv === 'rules' && rb.topic && rb.seg && (
                    <>
                        <ChevronRight className='size-3.5' />
                        <Crumb label={rb.topic.name} items={rb.seg.topics.map((t) => ({ id: t.id, label: t.name }))} onSelect={(id) => rb.pickTopic(rb.seg!.id, id)} accent />
                    </>
                )}
                {rb.rv === 'segForm' && <><ChevronRight className='size-3.5' /><span className='text-foreground'>{rb.segForm.id ? 'Edit segment' : 'New segment'}</span></>}
                {rb.rv === 'topicForm' && <><ChevronRight className='size-3.5' /><span className='text-foreground'>{rb.topicForm.id ? 'Edit topic' : 'New topic'}</span></>}
            </div>

            {(rb.rv === 'segments' || rb.rv === 'topics' || rb.rv === 'segForm' || rb.rv === 'topicForm') && <Forms rb={rb} />}

            {rb.rv === 'rules' &&
                (!rb.topic ? (
                    <div className='rounded-xl bg-muted/50 p-8 text-center text-sm text-muted-foreground'>Pick a topic to author rules.</div>
                ) : (
                    <div className='flex items-start gap-4'>
                        <RuleList rb={rb} />
                        <RuleEditor rb={rb} />
                    </div>
                ))}
        </section>
    );
}
