You said:
In elastic search I have this index comment_rules_1 which is a percolator

The description is learning near pathway within 20 words

Both learning and pathway should be there in the text but it returns if just learning is there
ChatGPT said:

I see why this is happening — your current percolator query uses an intervals query with "all_of" but "ordered": false and "max_gaps": 20 for each match.

The issue is:

all_of in intervals works like a logical AND for intervals but because "max_gaps": 20 is applied individually inside each match, ES might still consider a single match as valid if the all_of condition is not being enforced as you expect.

More importantly, intervals doesn't default to “must contain both terms somewhere” unless you structure the query so that both matches are part of the same all_of block.

Right now your JSON basically says:

Find an interval with "learning" (within 20 word gaps allowed) and find an interval with "pathway" (also within 20 words allowed) — but because ES treats each as a possible interval independently, a single match can pass.

How to make it strict so both terms must appear:

You want them both present and within 20 words of each other.
The query should look more like this:

{
  "intervals": {
    "comment_text": {
      "all_of": {
        "ordered": false,
        "intervals": [
          {
            "match": {
              "query": "learning",
              "analyzer": "search_analyzer"
            }
          },
          {
            "match": {
              "query": "pathway",
              "analyzer": "search_analyzer"
            }
          }
        ],
        "max_gaps": 20
      }
    }
  }
}

Key changes:

max_gaps moved outside to the all_of level — applies to the pair as a whole.

Both learning and pathway are in the same all_of block, forcing both to appear.

ordered: false means they can be in any order.

If you still get results with only one term, it means the percolator is wrapping this query in a way that doesn’t enforce all_of.
In that case, you could fallback to a span_near query inside your percolator mapping:

{
  "span_near": {
    "clauses": [
      { "span_term": { "comment_text": "learning" } },
      { "span_term": { "comment_text": "pathway" } }
    ],
    "slop": 20,
    "in_order": false
  }
}

If you want, I can rewrite your exact percolator mapping and query so that Elasticsearch won’t match unless both learning and pathway exist in the same text.

Do you want me to rewrite it in intervals or switch to span_near for stricter control?

1) Update the percolator rule (doc id 156)
POST comment_rules_1/_update/156
{
  "doc": {
    "query": {
      "intervals": {
        "comment_text": {
          "all_of": {
            "ordered": false,
            "max_gaps": 20,
            "intervals": [
              { "match": { "query": "learning", "analyzer": "search_analyzer" } },
              { "match": { "query": "pathway", "analyzer": "search_analyzer" } }
            ]
          }
        }
      }
    },
    "description": "learning near pathway WITHIN 20 WORDS"
  }
}

2) Percolate some example texts

These calls search your percolator docs and tell you if rule 156 matches the input text.

Only “learning” → should NOT match

POST comment_rules_1/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": { "comment_text": "I enjoy continuous learning at work." }
    }
  }
}

Only “pathway” → should NOT match

POST comment_rules_1/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": { "comment_text": "We discussed a pathway for advancement." }
    }
  }
}

Both, but >20 words apart → should NOT match
(25 filler tokens between them to be safe)

POST comment_rules_1/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "learning a1 a2 a3 a4 a5 a6 a7 a8 a9 a10 a11 a12 a13 a14 a15 a16 a17 a18 a19 a20 a21 a22 a23 a24 pathway"
      }
    }
  }
}

Both within ≤20 words (any order) → should MATCH

POST comment_rules_1/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "A clear pathway for continuous learning and growth."
      }
    }
  }
}

3) (Optional) Explain why something matched
GET comment_rules_1/_explain/156
{
  "query": {
    "percolate": {
      "field": "query",
      "document": { "comment_text": "A clear pathway for continuous learning and growth." }
    }
  }
}
