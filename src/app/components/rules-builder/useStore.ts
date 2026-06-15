'use client';

// All shared state + mutation handlers for the Rules Builder. View components
// receive the returned object as a single `rb` prop. Editor-local UI state
// (autocomplete, test box, word-group editor fields) lives in the view files.

import { useMemo, useRef, useState } from 'react';

import { INITIAL_SEGMENTS, INITIAL_WORD_GROUPS, splitPrefix } from './seed';
import type { Confirm, Rule, RulesView, Section, Segment, Topic, WordGroup } from './types';

export function useRulesBuilderStore() {
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

    const [match, setMatch] = useState('app near slow near #speed_en');
    const [exclude, setExclude] = useState<string[]>(['#positive_en', 'fast']);

    const [ruleSearch, setRuleSearch] = useState('');
    const [fHasExclude, setFHasExclude] = useState(false);
    const [fUsesGroup, setFUsesGroup] = useState(false);

    const idRef = useRef(1000);
    const nextId = (p: string) => `${p}${idRef.current++}`;
    const ask = (message: string, onYes: () => void, opts?: { label?: string; tone?: 'danger' | 'primary' }) => setConfirm({ message, onYes, ...opts });

    const groupMap = useMemo(() => Object.fromEntries(groups.map((g) => [g.name, g.terms])), [groups]);
    const usage = (name: string) => segments.reduce((n, s) => n + s.topics.reduce((m, t) => m + t.rules.filter((r) => r.match.includes(`#${name}`) || r.exclude.includes(`#${name}`)).length, 0), 0);
    const ruleCount = (s: Segment) => s.topics.reduce((n, t) => n + t.rules.length, 0);

    const seg = segments.find((s) => s.id === selSeg);
    const topic = seg?.topics.find((t) => t.id === selTopic);
    const rules = topic?.rules ?? [];

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

    // ── Ungrouped → real segment ──
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

    return {
        segments, setSegments, groups, setGroups,
        section, setSection, rv, setRv, returnRv,
        openSegs, setOpenSegs, navFilter, setNavFilter,
        selSeg, selTopic, selRule, setSelRule,
        segForm, setSegForm, topicForm, setTopicForm, confirm, setConfirm,
        match, setMatch, exclude, setExclude,
        ruleSearch, setRuleSearch, fHasExclude, setFHasExclude, fUsesGroup, setFUsesGroup,
        nextId, ask, groupMap, usage, ruleCount, seg, topic, rules,
        loadRule, pickTopic, switchSegment, pickRule,
        newRule, saveRule, deleteRule,
        openNewSegment, openEditSegment, saveSegForm, deleteSegment,
        openNewTopic, openEditTopic, saveTopicForm, deleteTopic,
        promotePrefix, askPromote
    };
}

export type RB = ReturnType<typeof useRulesBuilderStore>;
