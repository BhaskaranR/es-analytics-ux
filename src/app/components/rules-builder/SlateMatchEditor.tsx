'use client';

/**
 * SlateMatchEditor — Slate-based match-expression editor with TRUE in-field
 * syntax highlighting and a `#` word-group autocomplete.
 *
 * Controlled: `value` is the plain DSL string. External changes (toolbar inserts,
 * distance steppers, switching rules) are synced into the editor; user edits emit
 * via `onChange`. Slate is used only for decorations + the mention popup — the
 * existing tokenizer / parser / compiler stay the source of truth.
 *
 * Deps: slate, slate-react, slate-history.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { BaseEditor, Descendant, Editor, Node as SlateNode, Path, Range, Text, Transforms, createEditor } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';

type CustomText = { text: string; op?: boolean; group?: boolean; phrase?: boolean; special?: boolean };
type DecRange = Range & { op?: boolean; group?: boolean; phrase?: boolean; special?: boolean };

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: { type: 'line'; children: CustomText[] };
        Text: CustomText;
    }
}

type Group = { name: string; terms: string[] };

// Imperative handle so the parent's operator pills / steppers can insert at the caret.
export type SlateMatchEditorHandle = { insert: (text: string, caretBack?: number) => void };

function computeRanges(path: Path, text: string): DecRange[] {
    const out: DecRange[] = [];
    const re = /"[^"]*"|#[A-Za-z0-9_]+|\b(?:near|within)(?:>)?(?:\/\d+)?\b|\b(?:and|or)\b|[^\s()"]+/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
        const tok = m[0];
        const start = m.index;
        const end = start + tok.length;
        const range = (mark: keyof CustomText): DecRange => ({ anchor: { path, offset: start }, focus: { path, offset: end }, [mark]: true });
        if (tok[0] === '"') out.push(range('phrase'));
        else if (tok[0] === '#') out.push(range('group'));
        else if (/^(?:near|within)(?:>)?(?:\/\d+)?$/i.test(tok) || /^(?:and|or)$/i.test(tok)) out.push(range('op'));
        else if (tok.includes('*') || tok.includes('~') || tok.startsWith('?')) out.push(range('special'));
    }

    return out;
}

const serialize = (nodes: Descendant[]) => nodes.map((n) => SlateNode.string(n)).join('');

const SlateMatchEditor = forwardRef<SlateMatchEditorHandle, { value?: string; groups?: Group[]; onChange?: (s: string) => void }>(function SlateMatchEditor(
    { value = '', groups = [], onChange },
    ref
) {
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const initial = useMemo<Descendant[]>(() => [{ type: 'line', children: [{ text: value }] }], []); // eslint-disable-line react-hooks/exhaustive-deps

    const lastEmitted = useRef(value);
    const programmatic = useRef(false);
    const [target, setTarget] = useState<Range | null>(null);
    const [search, setSearch] = useState('');
    const [index, setIndex] = useState(0);

    const items = useMemo(() => (target ? groups.filter((g) => g.name.toLowerCase().includes(search)).slice(0, 8) : []), [target, search, groups]);

    const resetEditor = useCallback(
        (text: string) => {
            programmatic.current = true;
            editor.children = [{ type: 'line', children: [{ text }] }];
            const end = { path: [0, 0], offset: text.length };
            editor.selection = { anchor: end, focus: end };
            editor.onChange();
        },
        [editor]
    );

    // sync external value → editor (toolbar, steppers, rule switch)
    useEffect(() => {
        if (value !== lastEmitted.current) {
            resetEditor(value);
            lastEmitted.current = value;
        }
    }, [value, resetEditor]);

    const insertGroup = (name: string) => {
        if (!target) return;
        Transforms.select(editor, target);
        Transforms.insertText(editor, `#${name} `);
        setTarget(null);
    };

    // toolbar pills / steppers insert at the current caret (or end if never focused)
    useImperativeHandle(
        ref,
        () => ({
            insert(text: string, caretBack = 0) {
                ReactEditor.focus(editor);
                if (!editor.selection) Transforms.select(editor, Editor.end(editor, []));
                Transforms.insertText(editor, text);
                if (caretBack > 0) Transforms.move(editor, { distance: caretBack, unit: 'character', reverse: true });
            }
        }),
        [editor]
    );

    const handleChange = (val: Descendant[]) => {
        const str = serialize(val);
        lastEmitted.current = str;
        onChange?.(str);
        if (programmatic.current) {
            programmatic.current = false;
            setTarget(null);

            return;
        }
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const before = Editor.string(editor, { anchor: Editor.start(editor, []), focus: start });
            const mention = before.match(/#([A-Za-z0-9_]*)$/);
            if (mention) {
                setTarget({ anchor: { path: start.path, offset: start.offset - mention[0].length }, focus: start });
                setSearch(mention[1].toLowerCase());
                setIndex(0);

                return;
            }
        }
        setTarget(null);
    };

    const renderLeaf = useCallback((props: { leaf: CustomText; attributes: Record<string, unknown>; children: React.ReactNode }) => {
        const { leaf, attributes, children } = props;
        const cls = leaf.op
            ? 'text-muted-foreground italic'
            : leaf.group
              ? 'font-medium text-blue-600 dark:text-blue-400'
              : leaf.phrase
                ? 'text-emerald-700 dark:text-emerald-400'
                : leaf.special
                  ? 'text-amber-600 dark:text-amber-400'
                  : '';

        return (
            <span {...attributes} className={cls}>
                {children}
            </span>
        );
    }, []);

    const decorate = useCallback(([node, path]: [SlateNode, Path]) => (Text.isText(node) ? computeRanges(path, node.text) : []), []);

    return (
        <div className='relative'>
            <Slate editor={editor} initialValue={initial} onChange={handleChange}>
                <div className='rounded-md border bg-background px-3 py-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring'>
                    <Editable
                        decorate={decorate}
                        renderLeaf={renderLeaf}
                        spellCheck={false}
                        placeholder='opportunity near goal near #group'
                        className='font-mono text-sm outline-none'
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (target && items[index]) insertGroup(items[index].name);

                                return;
                            }
                            if (target && items.length) {
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setIndex((i) => Math.min(items.length - 1, i + 1));
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setIndex((i) => Math.max(0, i - 1));
                                } else if (e.key === 'Tab') {
                                    e.preventDefault();
                                    insertGroup(items[index].name);
                                } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setTarget(null);
                                }
                            }
                        }}
                    />
                </div>
            </Slate>

            {target && items.length > 0 && (
                <div className='absolute left-0 top-full z-30 mt-1 max-h-56 w-72 overflow-auto rounded-md border bg-background p-1 shadow-md'>
                    {items.map((g, i) => (
                        <div
                            key={g.name}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                insertGroup(g.name);
                            }}
                            className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm ${i === index ? 'bg-accent' : 'hover:bg-accent'}`}>
                            <span className='font-mono text-blue-600 dark:text-blue-400'>#{g.name}</span>
                            <span className='ml-auto text-[11px] text-muted-foreground'>{g.terms.length} terms</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default SlateMatchEditor;
