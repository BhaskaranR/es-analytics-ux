// Shared types for the Rules Builder.

export type Rule = { id: string; match: string; exclude: string[] };
export type Topic = { id: string; name: string; rules: Rule[] };
export type Segment = { id: string; name: string; topics: Topic[] };
export type WordGroup = { id: string; name: string; terms: string[] };

export type Status = 'match' | 'excluded' | 'miss';
export type Part = { text: string; norm: string; kind: Status | 'none' };

export type Section = 'rules' | 'groups';
export type RulesView = 'segments' | 'topics' | 'rules' | 'segForm' | 'topicForm';
export type Confirm = { message: string; onYes: () => void; label?: string; tone?: 'danger' | 'primary' };

// Match-expression AST.
export type Ast =
    | { k: 'term'; kind: 'word' | 'phrase' | 'group'; v: string }
    | { k: 'and'; l: Ast; r: Ast }
    | { k: 'or'; l: Ast; r: Ast }
    | { k: 'near'; l: Ast; r: Ast; dist: number; ordered: boolean };

export type Tok = { t: 'word' | 'phrase' | 'group' | 'op' | 'num' | 'lp' | 'rp'; v: string; ordered?: boolean };
