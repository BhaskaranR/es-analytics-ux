# rules-builder

Single-file text-analytics **Rules Builder** React component: tree navigation over
Segments → Topics → Rules, an engine-neutral match DSL (`near` / `and` / `or` /
wildcard / fuzzy / stemming), live in-browser testing, compiled-query preview, and a
Slate-based match editor with in-field syntax highlighting + `#` word-group autocomplete.

The whole thing is one file: **`RulesBuilderCombined.tsx`**. It exports two components:

```tsx
import RulesBuilder, { SlateMatchEditor } from 'rules-builder';
// RulesBuilder      → default export, the full builder
// SlateMatchEditor  → named export, the match-expression editor (used internally)
```

Ships with **generic demo seed data** (Customer Feedback / Product Experience, etc.) — replace
it with your own segments, topics, and word groups in your app.

---

## Peer dependencies

The package ships source only and declares these as peers — install them in the host app:

```
react react-dom lucide-react slate slate-dom slate-history slate-react
```

`slate-dom` is a peer of `slate-react` ≥ 0.119 and must be present, or you'll hit
`Module not found: Can't resolve 'slate-dom'`.

---

## Usage

This package ships **raw `.tsx`**. Two ways to use it:

### A. Import directly (host app transpiles it)
Next.js won't transpile `node_modules` by default — allow this package:

```js
// next.config.js
module.exports = { transpilePackages: ['rules-builder'] };
```

```tsx
import RulesBuilder from 'rules-builder';

export default function Page() {
    return <RulesBuilder />;
}
```

### B. Copy the file into your source (no transpile config)

```
npm install rules-builder
cp node_modules/rules-builder/RulesBuilderCombined.tsx src/app/components/
```

Then import it locally and remove the dependency if you only wanted the file.

---

## Notes

- `'use client'` is at the top of the file — it's a client component (Next App Router).
- Styling uses shadcn CSS-variable tokens (`bg-background`, `text-muted-foreground`,
  `border`, `bg-primary/10`, …) plus literal emerald/rose/amber for match/exclude
  highlights. It expects Tailwind with those tokens defined (shadcn setup).
- All CRUD is in-memory (resets on refresh) — wire to your API where noted.

## License

MIT
