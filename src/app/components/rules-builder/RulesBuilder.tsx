'use client';

// Root: owns the store, lays out the tree nav + workspace, and renders the
// in-app confirm dialog. CRUD is in-memory (resets on refresh).

import { TreeNav } from './TreeNav';
import { Workspace } from './Workspace';
import { btn } from './ui';
import { useRulesBuilderStore } from './useStore';

export default function RulesBuilder() {
    const rb = useRulesBuilderStore();
    const { confirm, setConfirm } = rb;

    return (
        <div className='mx-auto max-w-7xl p-4 text-foreground'>
            <div className='flex items-start gap-4'>
                <TreeNav rb={rb} />
                <Workspace rb={rb} />
            </div>

            {confirm && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4' onClick={() => setConfirm(null)}>
                    <div className='w-full max-w-sm rounded-xl border bg-background p-5 shadow-lg' onClick={(e) => e.stopPropagation()}>
                        <p className='text-sm'>{confirm.message}</p>
                        <div className='mt-5 flex justify-end gap-2'>
                            <button onClick={() => setConfirm(null)} className={btn}>Cancel</button>
                            <button
                                onClick={() => { confirm.onYes(); setConfirm(null); }}
                                className={`${btn} ${confirm.tone === 'primary' ? 'border-primary text-primary hover:bg-primary/10' : 'border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950'}`}>
                                {confirm.label ?? 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
