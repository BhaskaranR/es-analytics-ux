# Elasticsearch Percolator Rule Setup

This document outlines the complete setup for using percolator queries in Elasticsearch to match user comments to predefined rules, with or without using word groups.

---

## 1. Index Setup

### Create `word_groups` Index

```json
PUT /word_groups
{
  "mappings": {
    "properties": {
      "group_name": { "type": "keyword" },
      "words": { "type": "keyword" }
    }
  }
}

### Create comment_rules Index with Percolator

PUT /comment_rules
{
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "text": {
        "type": "text",
        "term_vector": "with_positions_offsets",
        "analyzer": "standard"
      },
      "topic": {
        "type": "keyword"
      },
      "group_refs": {
        "type": "keyword"
      }
    }
  }
}


PUT /comments
{
  "mappings": {
    "properties": {
      "text": {
        "type": "text"
      },
      "created_at": {
        "type": "date"
      },
      "user_id": {
        "type": "keyword"
      }
    }
  }
}



POST /word_groups/_bulk
{ "index": { "_id": "#bacghr_client" } }
{ "group_name": "#bacghr_client", "words": ["client", "customer", "user", "end user"] }

{ "index": { "_id": "#bacghr_internalmove" } }
{ "group_name": "#bacghr_internalmove", "words": ["internal", "transfer", "from_within", "lateral", "IJP"] }

{ "index": { "_id": "#bacghr_career" } }
{ "group_name": "#bacghr_career", "words": ["career", "promotion", "growth", "development"] }

{ "index": { "_id": "#bacghr_onboarding" } }
{ "group_name": "#bacghr_onboarding", "words": ["onboarding", "orientation", "induction"] }

{ "index": { "_id": "#bacghr_team" } }
{ "group_name": "#bacghr_team", "words": ["team", "collaboration", "cooperation", "group"] }

{ "index": { "_id": "#bacghr_support" } }
{ "group_name": "#bacghr_support", "words": ["support", "assistance", "help", "aid"] }

##Insert Rules Without Group Macros



POST /comment_rules/_doc
{
  "topic": "Career Growth",
  "query": {
    "bool": {
      "should": [
        { "match_phrase": { "content": { "query": "career growth", "slop": 3 } } },
        { "match_phrase": { "content": { "query": "promotion growth", "slop": 3 } } },
        { "match_phrase": { "content": { "query": "learning growth", "slop": 3 } } }
      ]
    }
  }
}


POST /comment_rules/_doc
// POST _bulk
{ "index": { "_index": "comment_rules", "_id": "1" } }
{ "topic": "Client Satisfaction", "group_refs": ["#bacghr_client", "#bacghr_support"], "query": { "bool": { "should": [ { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "client" } } } }, { "span_multi": { "match": { "wildcard": { "text": "support" } } } } ], "slop": 5, "in_order": false } } ] } } }
{ "index": { "_index": "comment_rules", "_id": "2" } }
{ "topic": "Internal Mobility", "query": { "span_near": { "clauses": [ { "span_or": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "internal" } } } }, { "span_multi": { "match": { "wildcard": { "text": "transfer" } } } }, { "span_multi": { "match": { "wildcard": { "text": "from_within" } } } }, { "span_multi": { "match": { "wildcard": { "text": "lateral" } } } }, { "span_multi": { "match": { "wildcard": { "text": "IJP" } } } } ] } }, { "span_multi": { "match": { "wildcard": { "text": "opportunity" } } } } ], "slop": 4, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "3" } }
{ "topic": "Career Growth", "query": { "span_near": { "clauses": [ { "span_or": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "career" } } } }, { "span_multi": { "match": { "wildcard": { "text": "promotion" } } } }, { "span_multi": { "match": { "wildcard": { "text": "growth" } } } }, { "span_multi": { "match": { "wildcard": { "text": "development" } } } } ] } }, { "span_multi": { "match": { "wildcard": { "text": "lacking" } } } } ], "slop": 6, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "4" } }
{ "topic": "Onboarding", "query": { "span_near": { "clauses": [ { "span_or": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "onboarding" } } } }, { "span_multi": { "match": { "wildcard": { "text": "orientation" } } } }, { "span_multi": { "match": { "wildcard": { "text": "induction" } } } } ] } }, { "span_multi": { "match": { "wildcard": { "text": "helpful" } } } } ], "slop": 3, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "5" } }
{ "topic": "Team Culture", "query": { "span_near": { "clauses": [ { "span_or": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "team" } } } }, { "span_multi": { "match": { "wildcard": { "text": "collaboration" } } } }, { "span_multi": { "match": { "wildcard": { "text": "cooperation" } } } }, { "span_multi": { "match": { "wildcard": { "text": "group" } } } } ] } }, { "span_multi": { "match": { "wildcard": { "text": "issues" } } } } ], "slop": 2, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "6" } }
{ "topic": "Leadership Feedback", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "leadership" } } } }, { "span_multi": { "match": { "wildcard": { "text": "feedback" } } } } ], "slop": 5, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "7" } }
{ "topic": "Work Environment", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "environment" } } } }, { "span_multi": { "match": { "wildcard": { "text": "stressful" } } } } ], "slop": 4, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "8" } }
{ "topic": "Support Experience", "query": { "bool": { "should": [ { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "support" } } } }, { "span_multi": { "match": { "wildcard": { "text": "experience" } } } } ], "slop": 5, "in_order": false } }, { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "assistance" } } } }, { "span_multi": { "match": { "wildcard": { "text": "feedback" } } } } ], "slop": 5, "in_order": false } } ] } } }
{ "index": { "_index": "comment_rules", "_id": "9" } }
{ "topic": "Promotion Issues", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "promotion" } } } }, { "span_multi": { "match": { "wildcard": { "text": "denied" } } } } ], "slop": 6, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "10" } }
{ "topic": "Client Concerns", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "customer" } } } }, { "span_multi": { "match": { "wildcard": { "text": "issue" } } } } ], "slop": 5, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "11" } }
{ "topic": "Internal Transfers", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "transfer" } } } }, { "span_multi": { "match": { "wildcard": { "text": "within" } } } } ], "slop": 4, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "12" } }
{ "topic": "Career Frustration", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "growth" } } } }, { "span_multi": { "match": { "wildcard": { "text": "blocked" } } } } ], "slop": 6, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "13" } }
{ "topic": "Teamwork Challenge", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "team" } } } }, { "span_multi": { "match": { "wildcard": { "text": "dysfunction" } } } } ], "slop": 4, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "14" } }
{ "topic": "Onboarding Problems", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "induction" } } } }, { "span_multi": { "match": { "wildcard": { "text": "confusing" } } } } ], "slop": 3, "in_order": false } } }
{ "index": { "_index": "comment_rules", "_id": "15" } }
{ "topic": "Customer Help", "query": { "span_near": { "clauses": [ { "span_multi": { "match": { "wildcard": { "text": "end user" } } } }, { "span_multi": { "match": { "wildcard": { "text": "aid" } } } } ], "slop": 4, "in_order": false } } }

🔽 Comments that will match your rules:
"I believe client support should be more responsive."
→ Matches: #bacghr_client + #bacghr_support → "Client Satisfaction"

"My internal transfer gave me great growth opportunities."
→ Matches: #bacghr_internalmove, #bacghr_career → "Internal Mobility", "Career Growth"

"The career path and promotion process are unclear."
→ Matches: #bacghr_career → "Career Growth", "Promotion Issues"

"I felt the onboarding and orientation were very helpful."
→ Matches: #bacghr_onboarding → "Onboarding", "Helpfulness of Induction"

"Team collaboration has improved but issues remain."
→ Matches: #bacghr_team → "Team Culture", "Teamwork Challenge"

"Leadership feedback and development planning was excellent."
→ Matches: "Leadership Feedback", "Leadership Growth"

"Support from the end user desk was delayed again."
→ Matches: "Support Complaints", "Customer Help"

"The induction experience was confusing but necessary."
→ Matches: "Onboarding Problems", "Helpfulness of Induction"

"Promotion was denied despite consistent performance."
_→ Matches: "Promotion Issues"

"The environment has become stressful over the past quarter."
_→ Matches: "Work Environment"