# Rules Builder — Build Spec (hand this to Claude Sonnet)

A self-contained specification to rebuild the text-analytics **Rules Builder** from scratch.
Give this whole file to Sonnet as context, then drive it phase by phase using the prompts at
the end. The result should be a single client component, `RulesBuilder.tsx`, that needs only
**React + lucide-react** (Slate is optional — see Phase 7).

> Use generic seed data only. Do NOT paste any internal/employer-specific segment names,
> topic names, or word-group codes into the build. Re-add real data locally after it's built.

---

## 1. Goal (one paragraph)

A UI for authoring text-matching rules over free-text comments (surveys, POS feedback).
Hierarchy: **Word Groups** (reusable synonym lists) and **Segments → Topics → Rules**.
Each rule has a plain-text **match expression** (a small query DSL) plus a separate **exclude**
list. The builder lets you CRUD segments/topics/rules/word-groups, write expressions with
operator assists, see plain-English read-back, and **test against pasted comments live in the
browser**. It also previews the **compiled query** (Elasticsearch intervals JSON). All state is
in-memory (resets on refresh); persistence is wired later.

---

## 2. Stack & conventions

- Next.js App Router, `'use client'` component. Single file: `src/app/components/RulesBuilder.tsx`.
- Deps: `react` (useMemo/useRef/useState), `lucide-react` for icons. No other runtime deps.
- Styling: Tailwind + **shadcn CSS-variable tokens** — `bg-background`, `text-foreground`,
  `text-muted-foreground`, `border`, `bg-muted`, `bg-accent`, `bg-primary/10`, `text-primary`,
  `focus:ring-ring`, etc. Plus literal colors for semantics:
  - blue = word groups (`text-blue-600 dark:text-blue-400`)
  - emerald = match / phrases
  - rose (or red) = excludes / literal exclude words
  - amber = wildcard/fuzzy operators and warnings
- Color convention is consistent everywhere: **blue `#group`, rose literal word, emerald match.**

---

## 3. Data model (TypeScript)

```ts
type Rule = { id: string; match: string; exclude: string[] };
type Topic = { id: string; name: string; rules: Rule[] };
type Segment = { id: string; name: string; topics: Topic[] };
type WordGroup = { id: string; name: string; terms: string[] };

type Status = 'match' | 'excluded' | 'miss';
type Section = 'rules' | 'groups';            // which top-level area is shown
type RulesView = 'segments' | 'topics' | 'rules' | 'segForm' | 'topicForm';
```

- A special segment with `id: 'none'`, `name: 'Ungrouped'` holds topics that have no segment.
  It is a UI bucket, not a real segment (can't be renamed/deleted).
- Seed with generic demo data, e.g. one segment "Customer Feedback" → topics "Delivery",
  "Pricing"; word groups like `positive_en` / `staff_en`; a couple of example rules.

---

## 4. The match DSL (free text is the source of truth)

Terms:
- `word` — a bare word (matched against comment words; stemming + wildcard/fuzzy apply)
- `"a phrase"` — consecutive words
- `#group_name` — expands to a word group's terms

Operators (precedence low → high: `or` < `and` < `near`/`within`):
- `a or b`, `a and b` — boolean
- `a near b` — proximity, default within 5 words, any order
- `a near/3 b` — explicit distance 3
- `a near> b` — **ordered** (b must come after a); combine: `near>/3`
- `a within 5 b` — alias of `near/5`
- `( ... )` — grouping
- wildcard: `manage*` → matches manager, managing (prefix/contains via `*`)
- fuzzy: `?word` (Oracle style) **and** `word~` / `word~2` (Lucene style) — typo tolerance
- stemming: an analyzer-level **setting** (toggle), default ON — NOT a per-term operator
  (because the percolator engine can't stem individual terms reliably).

Example: `opportunity near goal near #advancement` with exclude `[#pressure, churn]`.

---

## 5. Engine (tokenize → parse → evaluate → compile)

Implement these pure functions. They power the live test and the compiled-query preview.

**AST:**
```ts
type Ast =
  | { k: 'term'; kind: 'word'|'phrase'|'group'; v: string }
  | { k: 'and'; l: Ast; r: Ast }
  | { k: 'or'; l: Ast; r: Ast }
  | { k: 'near'; l: Ast; r: Ast; dist: number; ordered: boolean };
```

**Helpers:**
- `norm(w)` → lowercase, strip non-`a-z`.
- `lev(a,b)` → Levenshtein distance (rolling 1-D array).
- `matchTerm(word, term, stem)` → boolean. Order: if term has `*` → build regex
  `^pat$` with `*`→`.*`; else if `?word` or `word~[n]` → fuzzy: max = n, or
  (len ≤ 4 ? 1 : 2), test `lev(word,base) <= max`; else exact `norm` equality; if `stem`,
  also accept `word` minus trailing `s`, or `word.startsWith(term)` when term length ≥ 4.

**tokenize(src):** scan chars; handle `(`, `)`, `"..."`; words split on whitespace/parens/quote.
Recognize `near|within` with optional `>` (ordered) and `/N` (distance) → emit an op token +
optional num token. `and`/`or` → op. `#x` → group token. digits → num. else word token.

**parse(toks):** recursive descent — `parseAtom` (term / parenthesized `parseOr`),
`parseProx` (chains `near`, reads optional following number as distance, default 5),
`parseAnd`, `parseOr`. Throw readable errors ("Missing closing )", "\"near\" needs a term
before it", "Unexpected \"x\"").

**evaluate(node, words, groupMap, stem) → { ok, pos[] }:**
- term → positions where it matches (group = any term in the group; phrase = run of words).
- or → union if both, else whichever matches.
- and → both must match (union positions).
- near → for each left pos a and right pos b: `ordered ? (b>a && b-a<=dist) : abs(a-b)<=dist`.
  Collect hit positions.

**evalComment(text, ast, exclude, groupMap, stem):** split text to words, evaluate; compute
exclude positions (expand `#groups`); status = excluded if matched AND any exclude word present,
else match if matched, else miss. Return per-word parts tagged `match`/`excluded`/`none` for
highlighting.

**english(ast):** plain-English read-back, e.g. `"opportunity" within 5 words of "goal" ...`,
`any advancement term`, `(in order)` suffix for ordered near.

**astToQuery(ast, exclude):** compile to Elasticsearch JSON for preview:
- term word → `{ match: { query, analyzer } }`; wildcard → `{ prefix }` or `{ wildcard }`;
  fuzzy → `{ fuzzy: { term } }`; group → `{ match: { query: '#name' } }`.
- near → `{ all_of: { ordered, max_gaps: dist-1, intervals: [...] } }`
- and → `{ all_of: { ordered:false, intervals } }`; or → `{ any_of: { intervals } }`.
- wrap: `{ bool: { must: [{ intervals: { comment_text: <ivl> } }], must_not: [match exclude] } }`.

---

## 6. UI (layout & interactions)

**Page:** `max-w-7xl`, a flex row: left **tree nav** (`w-60`) + right `flex-1` workspace.

**Tree nav (left):**
- Search box (filters topics by name).
- "Word groups" button → switches `section` to `'groups'`.
- "Segments" list: each segment is an expandable row (chevron, folder icon, name, topic count).
  Hover reveals: rename (pencil), add-topic (plus), delete (trash). Hidden for `id:'none'`.
- Topics nested under each segment; clicking a topic opens its rules workspace. Hover: rename,
  delete. Shows rule count.
- **Ungrouped bucket** (`id:'none'`): group its topics by a derived **name prefix** (split on
  ` - ` / ` – ` / ` — `). Render each prefix as a small sub-header with the topics indented and
  the prefix stripped from the display name. On hover a prefix shows **Promote** (→ creates a
  real segment named after the prefix, moves those topics into it, strips the prefix) or
  **Merge** (if a segment with that name already exists). Confirm via in-app dialog.

**Rules workspace (master-detail):**
- Left column (`w-80`): rule list. Each row shows the match expression with **syntax-highlight
  spans** (blue `#group`, italic muted operators, emerald phrases, amber wildcard/fuzzy) and,
  below it, the **exclude line**: a small rose "⊘ EXCL" marker + one **pill per exclude term**
  (blue for `#group`, rose for word). Use `break-words` so long rules wrap fully. Search box +
  toggle filters ("uses #group", "has exclude"). Cap rendered rows (e.g. 100) with a "N more"
  note (swap a virtualizer in for production).
- Right column (editor for the selected rule):
  1. **Operator pills toolbar** (keep these at the very top): `near`, `and`, `or`, `( )`,
     `" "`, `*`, `~`, `# group`. Clicking inserts the token at the caret. `*`/`~` are amber.
  2. **Match input** — a text field bound to `match`. Provide `#` autocomplete: when the caret
     is right after a `#fragment`, show a dropdown of matching word groups (name + term count);
     Arrow keys, Enter/Tab to accept, Escape to close. (Phase 7 upgrades this field to Slate.)
  3. **Validation line** — green "Valid" / red error / amber "Unknown word group: #x".
  4. **Proximity steppers** — one chip per `near` occurrence: distance −/＋ and an
     "any order"/"in order" toggle. Editing rewrites the expression text in place.
  5. **Reads-as** plain-English line.
  6. **Exclude token-field** — a single bordered box (focus-ring as a whole) containing the
     exclude chips + an inline input. `#` autocomplete here too. Backspace on empty input
     removes the last chip. Empty state text when no excludes. Amber chip + warning line for an
     unknown `#group`. Label: rose "⊘ Exclude — skip the comment if any of these appear".
  7. **Test panel** — a `<textarea>` where the user pastes their own comments (one per line);
     a stemming on/off toggle; results list with match/excluded/miss icons, per-word
     highlighting, counts ("N matched / N excluded"). Clicking a word adds it to excludes.
  8. **View compiled query** — collapsible `<pre>` showing `astToQuery(...)`.
  9. **Cancel** (reload saved rule) + **Save** (disabled when the expression has a parse error).

**Word groups area** (`section==='groups'`): master-detail. Searchable list (search name OR
term; show which term matched). Editor: name (with leading `#`), term chips (add via comma/enter,
filter when many), usage count ("used by N rules"), Save / Delete (warn if in use).

**Segment / Topic forms** (`rv==='segForm'|'topicForm'`): in-app form pages in the workspace —
NOT browser prompts. Name field, Enter to save / Esc to cancel. Topic form has a Segment
`<select>` (with "— No segment —" → the Ungrouped bucket).

**Dialogs:** one in-app confirm modal (no `window.confirm`). Support a primary-tone variant
(for Promote/Merge) vs the destructive red Delete.

---

## 7. (Optional) Slate match editor

If `slate` + `slate-react` + `slate-history` (+ `slate-dom` peer) are available, replace the
plain match `<input>` with a Slate-based editor that gives **true in-field syntax highlighting**
and the `#` autocomplete. Keep the operator pills above it. Expose an imperative
`insert(text, caretBack)` handle (via `forwardRef`/`useImperativeHandle`) so the pills and
proximity steppers can insert at the caret. The plain DSL string stays the source of truth
(`value`/`onChange`); Slate only does decorations + the mention popup. If Slate isn't available,
the plain input from Phase 6 is perfectly fine — skip this.

---

## 8. Suggested build order

1. Types + generic seed data + the engine (Section 5) with a tiny console test.
2. Tree nav + section/view state + selecting a topic.
3. Rules master-detail list + the editor's match input + validation + Reads-as.
4. Live test panel + compiled-query preview.
5. Exclude token-field with `#` autocomplete + unknown-group warning.
6. Word-groups master-detail CRUD; segment/topic form pages; confirm dialog.
7. Ungrouped prefix grouping + Promote/Merge.
8. (Optional) Slate editor swap.

---

## 9. Kickoff prompt (paste this to Sonnet after the spec)

> Build `src/app/components/RulesBuilder.tsx` per the spec above. It's a Next.js App Router
> client component using only React + lucide-react, styled with Tailwind/shadcn tokens. Start
> with Phase 1 (types, generic seed data, and the full tokenize/parse/evaluate/compile engine)
> and show me that file section; I'll say "next" to continue through the phases. Use only
> generic demo seed data. Keep everything in one file. After each phase, list what could break.
