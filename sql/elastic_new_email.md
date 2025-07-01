Elasticsearch does not expand synonyms in span_* queries because span_term only works on exact terms from the analyzed token stream. This creates a challenge when combining span_near with synonyms defined using a custom analyzer.

🔬 Why It Fails with Synonyms
Let's say you define a synonym rule like this:

"synonyms": [
  "#bacghr_career => career, promotion, growth, development"
]
When indexing a comment like:

"I want career advancement"
The custom analyzer expands #bacghr_career → multiple terms (during indexing).

But when you write a span_term:

{ "span_term": { "text": "#bacghr_career" } }
This fails because #bacghr_career does not exist as a term in the index — it was replaced by the synonyms.

Also, span queries cannot reference multiple expanded terms — it expects one literal token per clause.