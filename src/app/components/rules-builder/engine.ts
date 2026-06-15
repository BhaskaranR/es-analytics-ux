// DSL engine: tokenize → parse → evaluate → compile. Pure functions, no React.

import type { Ast, Part, Status, Tok } from './types';

export const DEFAULT_DIST = 5;

export const norm = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');
export const expand = (tok: string, gm: Record<string, string[]>) => (tok.startsWith('#') ? (gm[tok.slice(1)] ?? [tok.slice(1)]) : [tok]);

export function lev(a: string, b: string) {
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
export function matchTerm(word: string, term: string, stem: boolean) {
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

export function tokenize(src: string): Tok[] {
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

export function parse(toks: Tok[]): Ast {
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

export function collectGroups(node: Ast): string[] {
    if (node.k === 'term') return node.kind === 'group' ? [node.v] : [];

    return node.k === 'near' || node.k === 'and' || node.k === 'or' ? [...collectGroups(node.l), ...collectGroups(node.r)] : [];
}

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

type Ev = { ok: boolean; pos: number[] };
export function evaluate(node: Ast, words: string[], gm: Record<string, string[]>, stem: boolean): Ev {
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

export function evalComment(text: string, ast: Ast | null, exclude: string[], gm: Record<string, string[]>, stem: boolean): { status: Status; parts: Part[] } {
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
export function english(node: Ast): string {
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
export function astToQuery(ast: Ast | null, exclude: string[]) {
    if (!ast) return '—';
    const q: any = { bool: { must: [{ intervals: { comment_text: ivl(ast) } }] } };
    if (exclude.length) q.bool.must_not = [{ match: { comment_text: { query: exclude.join(' '), analyzer: 'word_groups' } } }];

    return JSON.stringify(q, null, 2);
}
