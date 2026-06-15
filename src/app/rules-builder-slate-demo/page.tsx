'use client';

import { useState } from 'react';

import SlateMatchEditor from '../components/SlateMatchEditor';

const GROUPS = [
    { name: 'bp_advancement_terms_en', terms: ['advance', 'advancement', 'grow', 'growth', 'mobility', 'progress', 'progression', 'promote', 'promotion'] },
    { name: 'bp_customer_en', terms: ['client', 'customer', 'holder', 'member', 'patron', 'subscriber', 'user'] },
    { name: 'bp_employee_en', terms: ['agent', 'assistant', 'associate', 'boss', 'manager', 'rep', 'staff', 'supervisor', 'team', 'worker'] },
    { name: 'bacghr_sales_salespressure', terms: ['pressure', 'push', 'quota', 'target', 'aggressive', 'forced'] }
];

export default function SlateDemoPage() {
    const [value, setValue] = useState('opportunity near goal near #bp_advancement_terms_en');

    return (
        <div className='mx-auto max-w-3xl p-8 text-foreground'>
            <h1 className='text-xl font-medium'>Slate match editor — spike</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
                Experimental. In-field syntax highlighting + caret-anchored <span className='font-mono text-blue-600 dark:text-blue-400'>#</span> autocomplete. Does not affect the
                main builder at <span className='font-mono'>/rules-builder-demo</span>.
            </p>

            <label className='mt-6 block text-[11px] uppercase tracking-wide text-muted-foreground'>Match expression</label>
            <div className='mt-1.5'>
                <SlateMatchEditor value={value} groups={GROUPS} onChange={setValue} />
            </div>
            <p className='mt-1.5 text-[11px] text-muted-foreground'>
                Type <span className='font-mono text-blue-600 dark:text-blue-400'>#</span> to autocomplete a word group · operators, phrases, and wildcards highlight as you type ·
                Enter / Tab / arrows in the dropdown.
            </p>

            <label className='mt-6 block text-[11px] uppercase tracking-wide text-muted-foreground'>Plain-string value (source of truth)</label>
            <pre className='mt-1.5 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs'>{value || '(empty)'}</pre>

            <p className='mt-4 text-xs text-muted-foreground'>
                Try: <span className='font-mono'>(promote or advance) near #bp_employee_en</span> · <span className='font-mono'>manage* and "team lead"</span> ·{' '}
                <span className='font-mono'>recieve~</span>
            </p>
        </div>
    );
}
