// Demo seed data + small helpers. Replace the seed data with your own.

import type { Segment, WordGroup } from './types';

export const ROW_CAP = 100;

// Ungrouped topics often carry a category in their name ("Sensitive - Privacy", "Admin - Account Management").
// Split on " - " / " – " / " — " to derive a display-only prefix that can be promoted to a real segment.
export const splitPrefix = (name: string): { prefix: string | null; rest: string } => {
    const m = name.match(/^(.+?)\s+[-–—]\s+(.+)$/);

    return m ? { prefix: m[1].trim(), rest: m[2].trim() } : { prefix: null, rest: name };
};

// Seed examples for the test box. Editable/clearable — paste real comments to test against.
export const SEED_TEST = [
    'The app is really slow when loading large files.',
    'The app feels slow and laggy, but the team is great.',
    'Constant crashes and freezes make the platform unusable.',
    'Support was fast and resolved my issue quickly.'
].join('\n');

export const INITIAL_SEGMENTS: Segment[] = [
    { id: 's1', name: 'Customer Feedback', topics: ['Delivery', 'Pricing', 'Onboarding', 'Support'].map((name, i) => ({ id: `s1t${i}`, name, rules: [] })) },
    {
        id: 's2',
        name: 'Product Experience',
        topics: [
            { id: 's2t0', name: 'Usability', rules: [] },
            {
                id: 's2t1',
                name: 'Performance',
                rules: [
                    { id: 'r1', match: 'app near slow near #speed_en', exclude: ['#positive_en', 'fast'] },
                    { id: 'r2', match: '(crash or freeze) near #app_en', exclude: [] },
                    { id: 'r3', match: 'load near/3 time', exclude: ['quick'] },
                    { id: 'r4', match: 'lag and stutter', exclude: ['smooth'] }
                ]
            },
            { id: 's2t2', name: 'Reliability', rules: [] }
        ]
    },
    { id: 's3', name: 'Support', topics: ['Response Time', 'Resolution'].map((name, i) => ({ id: `s3t${i}`, name, rules: [] })) },
    { id: 's4', name: 'Billing', topics: ['Invoices', 'Refunds'].map((name, i) => ({ id: `s4t${i}`, name, rules: [] })) },
    // Topics with no segment. The "Ungrouped" bucket is a UI grouping, not a real segment.
    { id: 'none', name: 'Ungrouped', topics: ['General', 'Sensitive - Privacy', 'Sensitive - Accessibility', 'Admin - Account Management'].map((name, i) => ({ id: `nt${i}`, name, rules: [] })) }
];

export const INITIAL_WORD_GROUPS: WordGroup[] = [
    { id: 'g1', name: 'speed_en', terms: ['slow', 'sluggish', 'lag', 'laggy', 'delay', 'delayed'] },
    { id: 'g2', name: 'app_en', terms: ['app', 'application', 'software', 'platform', 'system'] },
    { id: 'g3', name: 'positive_en', terms: ['great', 'good', 'love', 'excellent', 'awesome', 'fast'] },
    { id: 'g4', name: 'staff_en', terms: ['agent', 'rep', 'support', 'staff', 'team'] }
];
