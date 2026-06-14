'use client';

/**
 * RulesBuilder — text-analytics rules builder that scales to a few segments ×
 * hundreds of topics × hundreds of rules, plus thousands of word groups.
 *
 * Navigation: no tree. Breadcrumb drill-down (Segments → Topics → Rules), each
 * level a flat searchable list. The rules workspace and the word-group library
 * are master-detail (searchable list left, editor right). Lists cap rendered
 * rows (swap in a virtualizer for production).
 *
 * Match expression DSL (free text is the source of truth):
 *   terms        word | "phrase" | #word_group
 *   near         a near b          within N words (per-near distance, default 5)
 *                a near/5 b        explicit distance
 *   within       a within 5 b      proximity with explicit distance (alias of near/N)
 *   and / or     boolean
 *   ( )          grouping / precedence  (or < and < near/within)
 * Exclude is a separate field. A real tokenizer → parser → evaluator powers the
 * live test; production matching runs server-side (see astToQuery for shape).
 *
 * CRUD is in-memory (resets on refresh). All dialogs are in-app (no window.*).
 * Deps: react + lucide-react. Styling: shadcn tokens, Bootstrap-portable.
 */

import { useMemo, useRef, useState } from 'react';

import { ArrowUpRight, Ban, BookText, Check, ChevronDown, ChevronRight, CircleCheck, Code2, Folder, Lightbulb, Minus, Pencil, Plus, Search, Tag, Trash2, TriangleAlert, X } from 'lucide-react';

import SlateMatchEditor, { type SlateMatchEditorHandle } from './SlateMatchEditor';

// ─── Data model ──────────────────────────────────────────────────────────────

type Rule = { id: string; match: string; exclude: string[] };
type Topic = { id: string; name: string; rules: Rule[] };
type Segment = { id: string; name: string; topics: Topic[] };
type WordGroup = { id: string; name: string; terms: string[] };
type Status = 'match' | 'excluded' | 'miss';
type Part = { text: string; norm: string; kind: Status | 'none' };
type Section = 'rules' | 'groups';
type RulesView = 'segments' | 'topics' | 'rules' | 'segForm' | 'topicForm';
type Confirm = { message: string; onYes: () => void; label?: string; tone?: 'danger' | 'primary' };

const ROW_CAP = 100;
const DEFAULT_DIST = 5;

// Seed examples for the test box. Editable/clearable — paste real comments to test against.
const SEED_TEST = [
    "There's lots of opportunity to grow toward my goals here.",
    'Plenty of opportunity to advance toward my career goals.',
    'Good opportunity to grow and hit goals, but the sales pressure is intense.',
    'The onboarding process was smooth and welcoming.'
].join('\n');

const INITIAL_SEGMENTS: Segment[] = [
    { id: 's1', name: 'SIM', topics: ['Communication', 'Compensation', 'Onboarding', 'Recognition'].map((name, i) => ({ id: `s1t${i}`, name, rules: [] })) },
    {
        id: 's2',
        name: 'Responsible Growth',
        topics: [
            { id: 's2t0', name: 'Customer Experience', rules: [] },
            {
                id: 's2t1',
                name: 'Career and Development',
                rules: [
                    { id: 'r1', match: 'opportunity near goal near #bp_advancement_terms_en', exclude: ['#bacghr_sales_salespressure', 'career'] },
                    { id: 'r2', match: '(promote or advance) near #bp_employee_en', exclude: [] },
                    { id: 'r3', match: 'development near/3 program', exclude: ['software', 'technology'] },
                    { id: 'r4', match: 'learn and grow', exclude: ['cooperate', 'group'] }
                ]
            },
            { id: 's2t2', name: 'Wellness', rules: [] }
        ]
    },
    { id: 's3', name: 'Admin', topics: ['Space Modernization', 'Labor Relations'].map((name, i) => ({ id: `s3t${i}`, name, rules: [] })) },
    { id: 's4', name: 'Sales Practices', topics: ['Product Opening 1', 'Product Opening 2'].map((name, i) => ({ id: `s4t${i}`, name, rules: [] })) },
    // Topics with no segment ([None] in the source). The "Ungrouped" bucket is a UI grouping, not a real segment.
    { id: 'none', name: 'Ungrouped', topics: ['Management', 'Sensitive – Ageism (ER)', 'Sensitive – Compensation', 'Admin – Performance Management'].map((name, i) => ({ id: `nt${i}`, name, rules: [] })) }
];

const INITIAL_WORD_GROUPS: WordGroup[] = [
    { id: 'g1', name: 'bp_advancement_terms_en', terms: ['advance', 'advancement', 'grow', 'growth', 'mobility', 'progress', 'progression', 'promote', 'promotion'] },
    { id: 'g2', name: 'bp_customer_en', terms: ['client', 'customer', 'holder', 'member', 'patron', 'subscriber', 'user'] },
    { id: 'g3', name: 'bp_employee_en', terms: ['agent', 'assistant', 'associate', 'boss', 'manager', 'rep', 'staff', 'supervisor', 'team', 'worker'] },
    { id: 'g4', name: 'bacghr_sales_salespressure', terms: ['pressure', 'push', 'quota', 'target', 'aggressive', 'forced'] }
];

// Ungrouped topics often carry a category in their name ("Sensitive – Ageism", "Admin – Performance").
// Split on " - " / " – " / " — " to derive a display-only prefix that can be promoted to a real segment.
const splitPrefix = (name: string): { prefix: string | null; rest: string } => {
    const m = name.match(/^(.+?)\s+[-–—]\s+(.+)$/);

    return m ? { prefix: m[1].trim(), rest: m[2].trim() } : { prefix: null, rest: name };
};

// ─── DSL engine: tokenize → parse → evaluate ─────────────────────────────────

type Ast =
    | { k: 'term'; kind: 'word' | 'phrase' | 'group'; v: string }
    | { k: 'and'; l: Ast; r: Ast }
    | { k: 'or'; l: Ast; r: Ast }
    | { k: 'near'; l: Ast; r: Ast; dist: number; ordered: boolean };
type Tok = { t: 'word' | 'phrase' | 'group' | 'op' | 'num' | 'lp' | 'rp'; v: string; ordered?: boolean };

const norm = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');
const expand = (tok: string, gm: Record<string, string[]>) => (tok.startsWith('#') ? (gm[tok.slice(1)] ?? [tok.slice(1)]) : [tok]);

function lev(a: string, b: string) {
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;
    const d = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        let prev = d[0];
        d[0] = i;
        for (let j = 1; j <= n; j++) {
            const tmp = d[j];
            d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }

    return d[n];
}

/** Match a comment word against a rule term: wildcard (manage*), fuzzy (?word / word~[n]), stemming, exact. */
function matchTerm(word: string, term: string, stem: boolean) {
    const w = norm(word);
    if (!w) return false;
    const tl = term.toLowerCase();
    if (tl.includes('*')) {
        const pat = tl.replace(/[^a-z*]/g, '').split('*').join('.*');

        return new RegExp(`^${pat}$`).test(w);
    }
    const fz = tl.match(/^\?(.+)$/) ?? tl.match(/^(.+?)~(\d)?$/);
    if (fz) {
        const base = norm(fz[1]);
        if (!base) return false;
        const max = fz[2] ? parseInt(fz[2], 10) : base.length <= 4 ? 1 : 2;

        return w === base || lev(w, base) <= max;
    }
    const t = norm(tl);
    if (!t) return false;
    if (w === t) return true;
    if (stem) {
        if (w.replace(/s$/, '') === t) return true;
        if (t.length >= 4 && w.startsWith(t)) return true;
    }

    return false;
}

function tokenize(src: string): Tok[] {
    const out: Tok[] = [];
    let i = 0;
    while (i < src.length) {
        const c = src[i];
        if (/\s/.test(c)) {
            i++;
            continue;
        }
        if (c === '(') {
            out.push({ t: 'lp', v: '(' });
            i++;
            continue;
        }
        if (c === ')') {
            out.push({ t: 'rp', v: ')' });
            i++;
            continue;
        }
        if (c === '"') {
            let j = i + 1;
            while (j < src.length && src[j] !== '"') j++;
            out.push({ t: 'phrase', v: src.slice(i + 1, j) });
            i = j + 1;
            continue;
        }
        let j = i;
        while (j < src.length && !/\s/.test(src[j]) && src[j] !== '(' && src[j] !== ')' && src[j] !== '"') j++;
        const w = src.slice(i, j);
        i = j;
        const prox = w.match(/^(near|within)(>)?(?:\/(\d+))?$/i);
        if (prox) {
            out.push({ t: 'op', v: 'near', ordered: !!prox[2] });
            if (prox[3]) out.push({ t: 'num', v: prox[3] });
            continue;
        }
        const lw = w.toLowerCase();
        if (lw === 'and' || lw === 'or') out.push({ t: 'op', v: lw });
        else if (/^\d+$/.test(w)) out.push({ t: 'num', v: w });
        else if (w.startsWith('#')) out.push({ t: 'group', v: w.slice(1) });
        else out.push({ t: 'word', v: w });
    }

    return out;
}

function parse(toks: Tok[]): Ast {
    let p = 0;
    const peek = () => toks[p];
    const err = (m: string) => new Error(m);

    const parseAtom = (): Ast => {
        const tk = peek();
        if (!tk) throw err('Expression is incomplete');
        if (tk.t === 'lp') {
            p++;
            const n = parseOr();
            if (peek()?.t !== 'rp') throw err('Missing closing )');
            p++;

            return n;
        }
        if (tk.t === 'rp') throw err('Unexpected )');
        if (tk.t === 'op') throw err(`"${tk.v}" needs a term before it`);
        if (tk.t === 'num') throw err('Unexpected number');
        p++;

        return { k: 'term', kind: tk.t, v: tk.v };
    };
    const parseProx = (): Ast => {
        let node = parseAtom();
        while (peek()?.t === 'op' && peek().v === 'near') {
            const op = toks[p++];
            let dist = DEFAULT_DIST;
            if (peek()?.t === 'num') dist = parseInt(toks[p++].v, 10);
            node = { k: 'near', l: node, r: parseAtom(), dist, ordered: !!op.ordered };
        }

        return node;
    };
    const parseAnd = (): Ast => {
        let node = parseProx();
        while (peek()?.t === 'op' && peek().v === 'and') {
            p++;
            node = { k: 'and', l: node, r: parseProx() };
        }

        return node;
    };
    const parseOr = (): Ast => {
        let node = parseAnd();
        while (peek()?.t === 'op' && peek().v === 'or') {
            p++;
            node = { k: 'or', l: node, r: parseAnd() };
        }

        return node;
    };

    const ast = parseOr();
    if (p < toks.length) throw err(`Unexpected "${toks[p].v}"`);

    return ast;
}

function collectGroups(node: Ast): string[] {
    if (node.k === 'term') return node.kind === 'group' ? [node.v] : [];

    return node.k === 'near' || node.k === 'and' || node.k === 'or' ? [...collectGroups(node.l), ...collectGroups(node.r)] : [];
}

type Ev = { ok: boolean; pos: number[] };
function termPositions(node: Extract<Ast, { k: 'term' }>, words: string[], gm: Record<string, string[]>, stem: boolean): number[] {
    const ps: number[] = [];
    if (node.kind === 'group') {
        const terms = gm[node.v] ?? [node.v];
        words.forEach((w, i) => terms.some((t) => matchTerm(w, t, stem)) && ps.push(i));
    } else if (node.kind === 'phrase') {
        const seq = node.v.split(/\s+/).filter(Boolean);
        for (let i = 0; i + seq.length <= words.length; i++) if (seq.every((s, k) => matchTerm(words[i + k], s, stem))) for (let k = 0; k < seq.length; k++) ps.push(i + k);
    } else {
        words.forEach((w, i) => matchTerm(w, node.v, stem) && ps.push(i));
    }

    return ps;
}

function evaluate(node: Ast, words: string[], gm: Record<string, string[]>, stem: boolean): Ev {
    if (node.k === 'term') {
        const pos = termPositions(node, words, gm, stem);

        return { ok: pos.length > 0, pos };
    }
    if (node.k === 'or') {
        const l = evaluate(node.l, words, gm, stem);
        const r = evaluate(node.r, words, gm, stem);
        if (l.ok && r.ok) return { ok: true, pos: [...l.pos, ...r.pos] };

        return l.ok ? l : r.ok ? r : { ok: false, pos: [] };
    }
    if (node.k === 'and') {
        const l = evaluate(node.l, words, gm, stem);
        const r = evaluate(node.r, words, gm, stem);

        return l.ok && r.ok ? { ok: true, pos: [...l.pos, ...r.pos] } : { ok: false, pos: [] };
    }
    // near (ordered → right must follow left)
    const l = evaluate(node.l, words, gm, stem);
    const r = evaluate(node.r, words, gm, stem);
    if (!l.ok || !r.ok) return { ok: false, pos: [] };
    const hit = new Set<number>();
    let ok = false;
    for (const a of l.pos)
        for (const b of r.pos) {
            const within = node.ordered ? b > a && b - a <= node.dist : Math.abs(a - b) <= node.dist;
            if (within) {
                ok = true;
                hit.add(a);
                hit.add(b);
            }
        }

    return ok ? { ok: true, pos: [...hit] } : { ok: false, pos: [] };
}

function evalComment(text: string, ast: Ast | null, exclude: string[], gm: Record<string, string[]>, stem: boolean): { status: Status; parts: Part[] } {
    const words = text.split(/\s+/);
    const m = ast ? evaluate(ast, words, gm, stem) : { ok: false, pos: [] };
    const exTerms = exclude.flatMap((t) => expand(t, gm));
    const exPos = new Set<number>();
    words.forEach((w, i) => exTerms.some((t) => matchTerm(w, t, stem)) && exPos.add(i));
    const matchPos = new Set(m.ok ? m.pos : []);
    const status: Status = m.ok && exPos.size ? 'excluded' : m.ok ? 'match' : 'miss';
    const parts: Part[] = words.map((w, i) => ({ text: w, norm: norm(w), kind: exPos.has(i) ? 'excluded' : matchPos.has(i) ? 'match' : 'none' }));

    return { status, parts };
}

// readable English + compiled-query preview from the AST
function flat(node: Ast, k: Ast['k']): Ast[] {
    return node.k === k && 'l' in node ? [...flat((node as any).l, k), (node as any).r] : [node];
}
function english(node: Ast): string {
    if (node.k === 'term') return node.kind === 'group' ? `any ${node.v} term` : `“${node.v}”`;
    if (node.k === 'or') return flat(node, 'or').map((n) => (n.k === 'and' ? `(${english(n)})` : english(n))).join(' or ');
    if (node.k === 'and') return flat(node, 'and').map((n) => (n.k === 'or' ? `(${english(n)})` : english(n))).join(' and ');

    const parts = flat(node, 'near').map(english).join(` within ${(node as any).dist} words of `);

    return (node as any).ordered ? `${parts} (in order)` : parts;
}
function ivl(node: Ast): any {
    if (node.k === 'term') {
        if (node.kind === 'word') {
            const clean = node.v.toLowerCase();
            if (clean.includes('*')) {
                const pat = clean.replace(/[^a-z*]/g, '');

                return /^[a-z]+\*$/.test(pat) ? { prefix: { prefix: pat.slice(0, -1), analyzer: 'word_groups' } } : { wildcard: { pattern: pat, analyzer: 'word_groups' } };
            }
            const fz = clean.match(/^\?(.+)$/) ?? clean.match(/^(.+?)~\d?$/);
            if (fz) return { fuzzy: { term: norm(fz[1]), analyzer: 'word_groups' } };
        }

        return { match: { query: node.kind === 'group' ? `#${node.v}` : node.v, analyzer: 'word_groups' } };
    }
    if (node.k === 'near') return { all_of: { ordered: !!node.ordered, max_gaps: Math.max(0, node.dist - 1), intervals: flat(node, 'near').map(ivl) } };
    if (node.k === 'and') return { all_of: { ordered: false, intervals: flat(node, 'and').map(ivl) } };

    return { any_of: { intervals: flat(node, 'or').map(ivl) } };
}
function astToQuery(ast: Ast | null, exclude: string[]) {
    if (!ast) return '—';
    const q: any = { bool: { must: [{ intervals: { comment_text: ivl(ast) } }] } };
    if (exclude.length) q.bool.must_not = [{ match: { comment_text: { query: exclude.join(' '), analyzer: 'word_groups' } } }];

    return JSON.stringify(q, null, 2);
}

// ─── Presentational helpers ───────────────────────────────────────────────────

const btn = 'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground';
const btnSm = 'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors hover:bg-accent';
const field = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-ring';

function ExprText({ text }: { text: string }) {
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

function StatusIcon({ status }: { status: Status }) {
    if (status === 'match') return <Check className='size-4 text-emerald-600 dark:text-emerald-400' />;
    if (status === 'excluded') return <Ban className='size-4 text-red-600 dark:text-red-400' />;

    return <Minus className='size-4 text-muted-foreground' />;
}

function Crumb({ label, items, onSelect, accent }: { label: string; items: { id: string; label: string }[]; onSelect: (id: string) => void; accent?: boolean }) {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function RulesBuilder() {
    const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS);
    const [groups, setGroups] = useState<WordGroup[]>(INITIAL_WORD_GROUPS);

    const [section, setSection] = useState<Section>('rules');
    const [rv, setRv] = useState<RulesView>('rules');
    const [returnRv, setReturnRv] = useState<RulesView>('rules');
    const [openSegs, setOpenSegs] = useState<Record<string, boolean>>({ s2: true });
    const [navFilter, setNavFilter] = useState('');

    const [selSeg, setSelSeg] = useState('s2');
    const [selTopic, setSelTopic] = useState('s2t1');
    const [selRule, setSelRule] = useState('r1');

    const [segForm, setSegForm] = useState<{ id: string | null; name: string }>({ id: null, name: '' });
    const [topicForm, setTopicForm] = useState<{ id: string | null; segId: string; name: string }>({ id: null, segId: '', name: '' });
    const [confirm, setConfirm] = useState<Confirm | null>(null);

    const [match, setMatch] = useState('opportunity near goal near #bp_advancement_terms_en');
    const [exclude, setExclude] = useState<string[]>(['#bacghr_sales_salespressure', 'career']);
    const [exInput, setExInput] = useState('');
    const [exIndex, setExIndex] = useState(0);
    const [exFocus, setExFocus] = useState(false);
    const [showQuery, setShowQuery] = useState(false);
    const [stem, setStem] = useState(true);
    const [testInput, setTestInput] = useState(SEED_TEST);
    const [ruleSearch, setRuleSearch] = useState('');
    const [fHasExclude, setFHasExclude] = useState(false);
    const [fUsesGroup, setFUsesGroup] = useState(false);
    const editorRef = useRef<SlateMatchEditorHandle>(null);

    const [selGroup, setSelGroup] = useState<string | null>('g1');
    const [gName, setGName] = useState(INITIAL_WORD_GROUPS[0].name);
    const [gTerms, setGTerms] = useState<string[]>([...INITIAL_WORD_GROUPS[0].terms]);
    const [gInput, setGInput] = useState('');
    const [gTermFilter, setGTermFilter] = useState('');
    const [gIsNew, setGIsNew] = useState(false);
    const [groupSearch, setGroupSearch] = useState('');

    const idRef = useRef(1000);
    const nextId = (p: string) => `${p}${idRef.current++}`;
    const ask = (message: string, onYes: () => void, opts?: { label?: string; tone?: 'danger' | 'primary' }) => setConfirm({ message, onYes, ...opts });

    const groupMap = useMemo(() => Object.fromEntries(groups.map((g) => [g.name, g.terms])), [groups]);
    const usage = (name: string) => segments.reduce((n, s) => n + s.topics.reduce((m, t) => m + t.rules.filter((r) => r.match.includes(`#${name}`) || r.exclude.includes(`#${name}`)).length, 0), 0);
    const ruleCount = (s: Segment) => s.topics.reduce((n, t) => n + t.rules.length, 0);

    const seg = segments.find((s) => s.id === selSeg);
    const topic = seg?.topics.find((t) => t.id === selTopic);
    const rules = topic?.rules ?? [];

    // parse the current expression once
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

    // distance steppers — one per near/within occurrence in the text
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
    // toolbar pills / steppers insert into the Slate editor at the caret; # autocomplete lives in the editor
    const insert = (token: string, caretBack = 0) => editorRef.current?.insert(token, caretBack);

    const visibleRules = useMemo(() => {
        const q = ruleSearch.toLowerCase();

        return rules.filter((r) => {
            if (q && !r.match.toLowerCase().includes(q) && !r.exclude.some((e) => e.toLowerCase().includes(q))) return false;
            if (fHasExclude && r.exclude.length === 0) return false;
            if (fUsesGroup && !r.match.includes('#') && !r.exclude.some((e) => e.startsWith('#'))) return false;

            return true;
        });
    }, [rules, ruleSearch, fHasExclude, fUsesGroup]);

    const visibleGroups = useMemo(() => {
        const q = groupSearch.toLowerCase();

        return groups.map((g) => ({ g, hitTerm: q && !g.name.includes(q) ? g.terms.find((t) => t.includes(q)) : undefined })).filter(({ g }) => !q || g.name.includes(q) || g.terms.some((t) => t.includes(q)));
    }, [groups, groupSearch]);

    // ── selection ──
    const loadRule = (r?: Rule) => {
        setMatch(r?.match ?? '');
        setExclude(r ? [...r.exclude] : []);
    };
    const pickTopic = (segId: string, topicId: string) => {
        setSection('rules');
        setRv('rules');
        setSelSeg(segId);
        setSelTopic(topicId);
        setRuleSearch('');
        const first = segments.find((s) => s.id === segId)?.topics.find((t) => t.id === topicId)?.rules[0];
        setSelRule(first?.id ?? '');
        loadRule(first);
    };
    const switchSegment = (segId: string) => {
        setSelSeg(segId);
        setRv('topics');
    };
    const pickRule = (r: Rule) => {
        setSelRule(r.id);
        loadRule(r);
    };

    // ── rule CRUD ──
    const mutateTopic = (fn: (t: Topic) => Topic) => setSegments((prev) => prev.map((s) => (s.id !== selSeg ? s : { ...s, topics: s.topics.map((t) => (t.id !== selTopic ? t : fn(t))) })));
    const newRule = () => {
        if (!topic) return;
        const r: Rule = { id: nextId('r'), match: '', exclude: [] };
        mutateTopic((t) => ({ ...t, rules: [...t.rules, r] }));
        setSelRule(r.id);
        loadRule(r);
    };
    const saveRule = () => {
        if (!selRule) return;
        mutateTopic((t) => ({ ...t, rules: t.rules.map((r) => (r.id === selRule ? { ...r, match, exclude: [...exclude] } : r)) }));
    };
    const deleteRule = (id: string) =>
        ask('Delete this rule?', () => {
            const remaining = rules.filter((r) => r.id !== id);
            mutateTopic((t) => ({ ...t, rules: t.rules.filter((r) => r.id !== id) }));
            if (selRule === id) {
                setSelRule(remaining[0]?.id ?? '');
                loadRule(remaining[0]);
            }
        });
    const addExclude = (t: string) => {
        const v = t.trim().replace(/,$/, '');
        if (v && !exclude.includes(v)) setExclude([...exclude, v]);
        setExInput('');
        setExIndex(0);
    };
    // exclude-field helpers: # autocomplete (parity with the match field) + unknown-group warning
    const exItems = exInput.startsWith('#') ? groups.filter((g) => g.name.toLowerCase().includes(exInput.slice(1).toLowerCase())).slice(0, 8) : [];
    const unknownExcludes = exclude.filter((e) => e.startsWith('#') && !groupMap[e.slice(1)]).map((e) => e.slice(1));

    // ── segment / topic CRUD ──
    const openNewSegment = () => {
        setSection('rules');
        setReturnRv(rv);
        setSegForm({ id: null, name: '' });
        setRv('segForm');
    };
    const openEditSegment = (s: Segment) => {
        setSection('rules');
        setReturnRv(rv);
        setSegForm({ id: s.id, name: s.name });
        setRv('segForm');
    };
    const saveSegForm = () => {
        const name = segForm.name.trim();
        if (!name) return;
        if (segForm.id) {
            setSegments((prev) => prev.map((s) => (s.id === segForm.id ? { ...s, name } : s)));
            setRv(returnRv);
        } else {
            const s: Segment = { id: nextId('s'), name, topics: [] };
            setSegments((prev) => [...prev, s]);
            setSelSeg(s.id);
            setRv('topics');
        }
    };
    const deleteSegment = (id: string) =>
        ask('Delete this segment and all its topics and rules?', () => {
            setSegments((prev) => prev.filter((s) => s.id !== id));
            if (selSeg === id) setRv('segments');
        });

    const openNewTopic = (segId: string) => {
        setSection('rules');
        setReturnRv(rv);
        setTopicForm({ id: null, segId, name: '' });
        setRv('topicForm');
    };
    const openEditTopic = (segId: string, t: Topic) => {
        setSection('rules');
        setReturnRv(rv);
        setTopicForm({ id: t.id, segId, name: t.name });
        setRv('topicForm');
    };
    const saveTopicForm = () => {
        const name = topicForm.name.trim();
        if (!name || !topicForm.segId) return;
        if (topicForm.id) {
            const cur = segments.find((s) => s.topics.some((t) => t.id === topicForm.id));
            const theTopic = cur?.topics.find((t) => t.id === topicForm.id);
            if (cur && theTopic && cur.id !== topicForm.segId) {
                setSegments((prev) =>
                    prev.map((s) => {
                        if (s.id === cur.id) return { ...s, topics: s.topics.filter((t) => t.id !== topicForm.id) };
                        if (s.id === topicForm.segId) return { ...s, topics: [...s.topics, { ...theTopic, name }] };

                        return s;
                    })
                );
            } else {
                setSegments((prev) => prev.map((s) => (s.id === topicForm.segId ? { ...s, topics: s.topics.map((t) => (t.id === topicForm.id ? { ...t, name } : t)) } : s)));
            }
            pickTopic(topicForm.segId, topicForm.id);
        } else {
            const t: Topic = { id: nextId('t'), name, rules: [] };
            setSegments((prev) => prev.map((s) => (s.id === topicForm.segId ? { ...s, topics: [...s.topics, t] } : s)));
            pickTopic(topicForm.segId, t.id);
        }
    };
    const deleteTopic = (segId: string, topicId: string) =>
        ask('Delete this topic and its rules?', () => {
            setSegments((prev) => prev.map((s) => (s.id === segId ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) } : s)));
            if (selTopic === topicId) setRv('topics');
        });

    // Promote a derived prefix in the Ungrouped bucket into a real segment (or merge into an existing
    // same-named one). Topics move out of Ungrouped and lose the now-redundant prefix from their names.
    const promotePrefix = (prefix: string, topics: Topic[], existingId?: string) => {
        const ids = new Set(topics.map((t) => t.id));
        const moved = topics.map((t) => ({ ...t, name: splitPrefix(t.name).rest }));
        const targetId = existingId ?? nextId('s');
        setSegments((prev) => {
            const stripped = prev.map((s) => (s.id === 'none' ? { ...s, topics: s.topics.filter((t) => !ids.has(t.id)) } : s));
            if (existingId) return stripped.map((s) => (s.id === existingId ? { ...s, topics: [...s.topics, ...moved] } : s));
            const noneIdx = stripped.findIndex((s) => s.id === 'none');
            const newSeg: Segment = { id: targetId, name: prefix, topics: moved };

            return noneIdx < 0 ? [...stripped, newSeg] : [...stripped.slice(0, noneIdx), newSeg, ...stripped.slice(noneIdx)];
        });
        setOpenSegs((o) => ({ ...o, [targetId]: true }));
        if (ids.has(selTopic)) setSelSeg(targetId);
    };
    const askPromote = (prefix: string, topics: Topic[], existing?: Segment) =>
        ask(
            existing
                ? `Move ${topics.length} topic${topics.length > 1 ? 's' : ''} into the existing “${existing.name}” segment? The “${prefix} – ” prefix is removed from their names.`
                : `Create a new “${prefix}” segment from ${topics.length} topic${topics.length > 1 ? 's' : ''}? The “${prefix} – ” prefix is removed from their names.`,
            () => promotePrefix(prefix, topics, existing?.id),
            { label: existing ? 'Move' : 'Promote', tone: 'primary' }
        );

    // ── word-group CRUD ──
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
            const g: WordGroup = { id: nextId('g'), name, terms: gTerms };
            setGroups((prev) => [...prev, g]);
            setSelGroup(g.id);
            setGIsNew(false);
        } else {
            setGroups((prev) => prev.map((x) => (x.id === selGroup ? { ...x, name, terms: gTerms } : x)));
        }
    };
    const deleteGroup = (g: WordGroup) => {
        const n = usage(g.name);
        ask(n ? `#${g.name} is used by ${n} rule(s). Delete anyway?` : `Delete #${g.name}?`, () => {
            const remaining = groups.filter((x) => x.id !== g.id);
            setGroups(remaining);
            if (selGroup === g.id) {
                if (remaining[0]) loadGroup(remaining[0]);
                else {
                    setSelGroup(null);
                    setGTerms([]);
                    setGName('');
                }
            }
        });
    };
    const addGroupTerms = (raw: string) => {
        const parts = raw.split(/[,\n;]+/).map(norm).filter(Boolean);
        if (parts.length) setGTerms((prev) => [...new Set([...prev, ...parts])]);
        setGInput('');
    };

    const opBtn = 'rounded-md border px-2.5 py-1 font-mono text-xs transition-colors hover:bg-accent';

    // one topic row in the tree (shared by normal segments and the Ungrouped prefix sub-lists)
    const topicRow = (s: Segment, tp: Topic, displayName: string, pad: string) => {
        const on = section === 'rules' && rv === 'rules' && s.id === selSeg && tp.id === selTopic;

        return (
            <div key={tp.id} className={`group flex items-center gap-2 rounded-md py-1.5 ${pad} pr-2 text-sm transition-colors ${on ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-accent'}`}>
                <button onClick={() => pickTopic(s.id, tp.id)} className='flex min-w-0 flex-1 items-center gap-2'>
                    <Tag className='size-3.5 opacity-70' />
                    <span className='flex-1 truncate text-left'>{displayName}</span>
                </button>
                <span className='flex items-center gap-1 opacity-0 group-hover:opacity-100'>
                    <button onClick={() => openEditTopic(s.id, tp)} title='Rename'><Pencil className='size-3.5 text-muted-foreground hover:text-foreground' /></button>
                    <button onClick={() => deleteTopic(s.id, tp.id)} title='Delete topic'><Trash2 className='size-3.5 text-muted-foreground hover:text-red-600' /></button>
                </span>
                {tp.rules.length > 0 && <span className='text-xs text-muted-foreground'>{tp.rules.length}</span>}
            </div>
        );
    };

    // Ungrouped bucket: group topics by derived name-prefix, each promotable to a real segment.
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
                    const existing = segments.find((x) => x.id !== 'none' && x.name.toLowerCase() === prefix.toLowerCase());

                    return (
                        <div key={prefix}>
                            <div className='group flex items-center gap-1.5 rounded-md py-1 pl-7 pr-2'>
                                <span className='flex-1 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>{prefix}</span>
                                <span className='text-[10px] text-muted-foreground'>{topics.length}</span>
                                <button
                                    onClick={() => askPromote(prefix, topics, existing)}
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
        <div className='mx-auto max-w-7xl p-4 text-foreground'>
            <div className='flex items-start gap-4'>
                <nav className='w-60 shrink-0 rounded-xl bg-muted/50 p-2.5'>
                    <div className='relative mb-2.5'>
                        <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                        <input className={`${field} h-9 pl-8`} placeholder='Search topics' value={navFilter} onChange={(e) => setNavFilter(e.target.value.toLowerCase().trim())} />
                    </div>
                    <button onClick={() => setSection('groups')} className={`mb-2 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors ${section === 'groups' ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-accent'}`}>
                        <BookText className='size-4' /> Word groups
                        <span className='ml-auto text-xs text-muted-foreground'>{groups.length}</span>
                    </button>
                    <div className='my-2 border-t' />
                    <div className='flex items-center justify-between px-1.5 pb-1.5'>
                        <span className='text-[11px] uppercase tracking-wide text-muted-foreground'>Segments</span>
                        <button onClick={openNewSegment} title='New segment'><Plus className='size-3.5 text-muted-foreground hover:text-foreground' /></button>
                    </div>
                    <div className='max-h-[600px] space-y-0.5 overflow-y-auto'>
                        {segments.map((s) => {
                            const tps = s.topics.filter((t) => !navFilter || t.name.toLowerCase().includes(navFilter) || s.name.toLowerCase().includes(navFilter));
                            if (navFilter && tps.length === 0) return null;
                            const open = openSegs[s.id] || (!!navFilter && tps.length > 0);

                            return (
                                <div key={s.id}>
                                    <div className='group flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm font-medium hover:bg-accent'>
                                        <button onClick={() => setOpenSegs((o) => ({ ...o, [s.id]: !open }))} className='flex min-w-0 flex-1 items-center gap-1.5'>
                                            {open ? <ChevronDown className='size-3.5 text-muted-foreground' /> : <ChevronRight className='size-3.5 text-muted-foreground' />}
                                            <Folder className='size-4 text-muted-foreground' />
                                            <span className='flex-1 truncate text-left'>{s.name}</span>
                                        </button>
                                        <span className='flex items-center gap-1 opacity-0 group-hover:opacity-100'>
                                            {s.id !== 'none' && <button onClick={() => openEditSegment(s)} title='Rename'><Pencil className='size-3.5 text-muted-foreground hover:text-foreground' /></button>}
                                            <button onClick={() => openNewTopic(s.id)} title='Add topic'><Plus className='size-3.5 text-muted-foreground hover:text-foreground' /></button>
                                            {s.id !== 'none' && <button onClick={() => deleteSegment(s.id)} title='Delete segment'><Trash2 className='size-3.5 text-muted-foreground hover:text-red-600' /></button>}
                                        </span>
                                        <span className='text-xs text-muted-foreground'>{s.topics.length}</span>
                                    </div>
                                    {open && (s.id === 'none' ? renderUngrouped(s, tps) : tps.map((tp) => topicRow(s, tp, tp.name, 'pl-7')))}
                                </div>
                            );
                        })}
                    </div>
                </nav>
                <section className='min-w-0 flex-1'>

            {section === 'groups' ? (
                <div className='flex items-start gap-4'>
                    <div className='w-72 shrink-0'>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-medium'>{groups.length} word groups</span>
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
                                        {g.terms.length} terms · used {usage(g.name)}
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
                                    <input className={`${field} font-mono`} placeholder='bp_topic_en' value={gName} onChange={(e) => setGName(e.target.value)} />
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
                                {!gIsNew && <p className='mt-3 text-xs text-muted-foreground'>Used by {usage(gName)} rules — saving updates all of them.</p>}
                                <div className='mt-4 flex justify-end gap-2'>
                                    {!gIsNew && selGroup && <button onClick={() => deleteGroup(groups.find((x) => x.id === selGroup)!)} className={`${btn} text-red-600 hover:text-red-600`}><Trash2 className='size-4' /> Delete</button>}
                                    <button onClick={saveGroup} disabled={!gName.trim()} className={`${btn} border-primary text-primary disabled:pointer-events-none disabled:opacity-50`}>Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className='rounded-xl bg-muted/50 p-8 text-center text-sm text-muted-foreground'>Select a word group, or create a new one.</div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className='mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                        <button onClick={() => setRv('segments')} className='font-medium text-foreground hover:underline'>Rules</button>
                        {(rv === 'topics' || rv === 'rules') && seg && (
                            <>
                                <ChevronRight className='size-3.5' />
                                <Crumb label={seg.name} items={segments.map((s) => ({ id: s.id, label: s.name }))} onSelect={switchSegment} accent={rv === 'topics'} />
                            </>
                        )}
                        {rv === 'rules' && topic && seg && (
                            <>
                                <ChevronRight className='size-3.5' />
                                <Crumb label={topic.name} items={seg.topics.map((t) => ({ id: t.id, label: t.name }))} onSelect={(id) => pickTopic(seg.id, id)} accent />
                            </>
                        )}
                        {rv === 'segForm' && <><ChevronRight className='size-3.5' /><span className='text-foreground'>{segForm.id ? 'Edit segment' : 'New segment'}</span></>}
                        {rv === 'topicForm' && <><ChevronRight className='size-3.5' /><span className='text-foreground'>{topicForm.id ? 'Edit topic' : 'New topic'}</span></>}
                    </div>

                    {rv === 'segments' && (
                        <div className='max-w-2xl'>
                            <div className='mb-3 flex items-center justify-between'>
                                <h2 className='text-lg font-medium'>Segments</h2>
                                <button onClick={openNewSegment} className={btn}><Plus className='size-4' /> New segment</button>
                            </div>
                            <div className='overflow-hidden rounded-xl border'>
                                {segments.map((s) => (
                                    <div key={s.id} className='group flex items-center gap-2 border-b px-4 py-3 last:border-b-0 hover:bg-accent/50'>
                                        <button onClick={() => switchSegment(s.id)} className='flex min-w-0 flex-1 items-center gap-3 text-left'>
                                            <Folder className='size-4 text-muted-foreground' />
                                            <span className='font-medium'>{s.name}</span>
                                            <span className='text-xs text-muted-foreground'>{s.topics.length} topics · {ruleCount(s)} rules</span>
                                        </button>
                                        <span className='flex items-center gap-2 opacity-0 group-hover:opacity-100'>
                                            <button onClick={() => openEditSegment(s)} title='Rename'><Pencil className='size-4 text-muted-foreground hover:text-foreground' /></button>
                                            <button onClick={() => deleteSegment(s.id)} title='Delete'><Trash2 className='size-4 text-muted-foreground hover:text-red-600' /></button>
                                        </span>
                                        <ChevronRight className='size-4 text-muted-foreground' />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {rv === 'topics' && seg && (
                        <div className='max-w-2xl'>
                            <div className='mb-3 flex items-center justify-between'>
                                <h2 className='text-lg font-medium'>{seg.name}</h2>
                                <button onClick={() => openNewTopic(seg.id)} className={btn}><Plus className='size-4' /> New topic</button>
                            </div>
                            {seg.topics.length === 0 ? (
                                <div className='rounded-xl bg-muted/50 p-8 text-center text-sm text-muted-foreground'>No topics yet in this segment.</div>
                            ) : (
                                <div className='overflow-hidden rounded-xl border'>
                                    {seg.topics.map((t) => (
                                        <div key={t.id} className='group flex items-center gap-2 border-b px-4 py-3 last:border-b-0 hover:bg-accent/50'>
                                            <button onClick={() => pickTopic(seg.id, t.id)} className='flex min-w-0 flex-1 items-center gap-3 text-left'>
                                                <Tag className='size-4 text-muted-foreground' />
                                                <span className='min-w-0 flex-1 truncate'>{t.name}</span>
                                                <span className='text-xs text-muted-foreground'>{t.rules.length} rules</span>
                                            </button>
                                            <span className='flex items-center gap-2 opacity-0 group-hover:opacity-100'>
                                                <button onClick={() => openEditTopic(seg.id, t)} title='Rename'><Pencil className='size-4 text-muted-foreground hover:text-foreground' /></button>
                                                <button onClick={() => deleteTopic(seg.id, t.id)} title='Delete'><Trash2 className='size-4 text-muted-foreground hover:text-red-600' /></button>
                                            </span>
                                            <ChevronRight className='size-4 text-muted-foreground' />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {rv === 'segForm' && (
                        <div className='max-w-lg'>
                            <h2 className='mb-1 text-lg font-medium'>{segForm.id ? 'Edit segment' : 'New segment'}</h2>
                            <p className='mb-4 text-sm text-muted-foreground'>A segment is a top-level grouping that holds topics.</p>
                            <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Name</label>
                            <input autoFocus className={`${field} mt-1.5`} placeholder='e.g. Responsible Growth' value={segForm.name} onChange={(e) => setSegForm({ ...segForm, name: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') saveSegForm(); if (e.key === 'Escape') setRv(returnRv); }} />
                            <div className='mt-4 flex justify-end gap-2'>
                                <button onClick={() => setRv(returnRv)} className={btn}>Cancel</button>
                                <button onClick={saveSegForm} disabled={!segForm.name.trim()} className={`${btn} border-primary text-primary disabled:pointer-events-none disabled:opacity-50`}>Save</button>
                            </div>
                        </div>
                    )}

                    {rv === 'topicForm' && (
                        <div className='max-w-lg'>
                            <h2 className='mb-1 text-lg font-medium'>{topicForm.id ? 'Edit topic' : 'New topic'}</h2>
                            <p className='mb-4 text-sm text-muted-foreground'>A topic lives under a segment and holds rules.</p>
                            <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Segment</label>
                            <select className={`${field} mt-1.5`} value={topicForm.segId} onChange={(e) => setTopicForm({ ...topicForm, segId: e.target.value })}>
                                {segments.map((s) => <option key={s.id} value={s.id}>{s.id === 'none' ? '— No segment —' : s.name}</option>)}
                            </select>
                            <label className='mt-4 block text-[11px] uppercase tracking-wide text-muted-foreground'>Name</label>
                            <input autoFocus className={`${field} mt-1.5`} placeholder='e.g. Career and Development' value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') saveTopicForm(); if (e.key === 'Escape') setRv(returnRv); }} />
                            <div className='mt-4 flex justify-end gap-2'>
                                <button onClick={() => setRv(returnRv)} className={btn}>Cancel</button>
                                <button onClick={saveTopicForm} disabled={!topicForm.name.trim() || !topicForm.segId} className={`${btn} border-primary text-primary disabled:pointer-events-none disabled:opacity-50`}>Save</button>
                            </div>
                        </div>
                    )}

                    {rv === 'rules' &&
                        (!topic ? (
                            <div className='rounded-xl bg-muted/50 p-8 text-center text-sm text-muted-foreground'>Pick a topic to author rules.</div>
                        ) : (
                            <div className='flex items-start gap-4'>
                                <div className='w-80 shrink-0'>
                                    <div className='mb-2 flex items-center justify-between'>
                                        <span className='text-sm font-medium'>{rules.length} rules</span>
                                        <button onClick={newRule} className={btnSm}><Plus className='size-3.5' /> New</button>
                                    </div>
                                    <div className='relative mb-2'>
                                        <Search className='absolute left-2.5 top-2 size-4 text-muted-foreground' />
                                        <input className={`${field} h-9 pl-8`} placeholder='Search rules' value={ruleSearch} onChange={(e) => setRuleSearch(e.target.value)} />
                                    </div>
                                    <div className='mb-2 flex gap-1.5'>
                                        <button onClick={() => setFUsesGroup((v) => !v)} className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${fUsesGroup ? 'bg-primary/10 text-primary' : 'bg-muted hover:bg-accent'}`}>uses #group</button>
                                        <button onClick={() => setFHasExclude((v) => !v)} className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${fHasExclude ? 'bg-primary/10 text-primary' : 'bg-muted hover:bg-accent'}`}>has exclude</button>
                                    </div>
                                    <div className='overflow-hidden rounded-md border'>
                                        {visibleRules.slice(0, ROW_CAP).map((r) => (
                                            <div key={r.id} className={`group flex items-start gap-1 border-b px-2.5 py-2 last:border-b-0 transition-colors ${r.id === selRule ? 'bg-primary/10' : 'hover:bg-accent/50'}`}>
                                                <button onClick={() => pickRule(r)} className='min-w-0 flex-1 text-left' title={r.match}>
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
                                                <button onClick={() => deleteRule(r.id)} title='Delete rule' className='mt-0.5 opacity-0 group-hover:opacity-100'><Trash2 className='size-3.5 text-muted-foreground hover:text-red-600' /></button>
                                            </div>
                                        ))}
                                        {visibleRules.length === 0 && <div className='px-3 py-6 text-center text-sm text-muted-foreground'>No rules match.</div>}
                                    </div>
                                    {visibleRules.length > ROW_CAP && <div className='py-1.5 text-center text-[11px] text-muted-foreground'>{visibleRules.length - ROW_CAP} more · refine search</div>}
                                </div>

                                <div className='min-w-0 flex-1'>
                                    {selRule ? (
                                        <div className='rounded-xl border-2 border-primary/60 p-4'>
                                            <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Match expression</label>
                                            {/* operator toolbar */}
                                            <div className='mt-1.5 flex flex-wrap gap-1.5'>
                                                <button className={opBtn} onClick={() => insert(' near ')} title='within N words — set distance below'>near</button>
                                                <button className={opBtn} onClick={() => insert(' and ')}>and</button>
                                                <button className={opBtn} onClick={() => insert(' or ')}>or</button>
                                                <button className={opBtn} onClick={() => insert('()', 1)}>( )</button>
                                                <button className={opBtn} onClick={() => insert('""', 1)}>&quot; &quot;</button>
                                                <button className={`${opBtn} text-amber-600 dark:text-amber-400`} onClick={() => insert('*')} title='wildcard: manage* matches manager, managing'>*</button>
                                                <button className={`${opBtn} text-amber-600 dark:text-amber-400`} onClick={() => insert('~')} title='fuzzy: word~ or ?word — tolerates typos'>~</button>
                                                <button className={`${opBtn} border-primary/40 text-blue-600 dark:text-blue-400`} onClick={() => insert('#')}># group</button>
                                            </div>
                                            <div className='mt-1.5'>
                                                <SlateMatchEditor ref={editorRef} value={match} groups={groups} onChange={setMatch} />
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
                                            {parsed.ast && (
                                                <div className='mt-2 text-xs text-muted-foreground'>
                                                    <span className='text-muted-foreground/70'>Reads as:</span> {english(parsed.ast)}
                                                </div>
                                            )}

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
                                                <textarea
                                                    value={testInput}
                                                    onChange={(e) => setTestInput(e.target.value)}
                                                    rows={3}
                                                    placeholder='Paste comments to test — one per line'
                                                    className='mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'
                                                />
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

                                            <div className='mt-3'>
                                                <button onClick={() => setShowQuery((s) => !s)} className='flex items-center gap-1 text-xs text-primary'>
                                                    {showQuery ? <ChevronDown className='size-3.5' /> : <ChevronRight className='size-3.5' />}
                                                    <Code2 className='size-3.5' /> {showQuery ? 'Hide' : 'View'} compiled query
                                                </button>
                                                {showQuery && <pre className='mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-[11.5px] leading-relaxed text-muted-foreground'>{astToQuery(parsed.ast, exclude)}</pre>}
                                            </div>

                                            <div className='mt-4 flex justify-end gap-2'>
                                                <button onClick={() => loadRule(rules.find((r) => r.id === selRule))} className={btn}>Cancel</button>
                                                <button onClick={saveRule} disabled={!!parsed.error} className={`${btn} border-primary text-primary disabled:pointer-events-none disabled:opacity-50`}>Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='rounded-xl bg-muted/50 p-8 text-center text-sm text-muted-foreground'>No rule selected. <button onClick={newRule} className='text-primary'>+ New rule</button></div>
                                    )}
                                </div>
                            </div>
                        ))}
                </>
            )}
                </section>
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
