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