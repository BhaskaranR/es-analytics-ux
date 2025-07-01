# Elasticsearch Setup for Text Analytics Rules and Comments

## 1. Create Index: `comments`

```json
PUT /comments
{
  "mappings": {
    "properties": {
      "id": { "type": "integer" },
      "respondent_id": { "type": "integer" },
      "comment_text": { "type": "text" }
    }
  }
}
```

---

## 2. Create Index: `rules`

```json
PUT /rules
{
  "mappings": {
    "properties": {
      "id": { "type": "integer" },
      "topic": { "type": "keyword" },
      "rule_query": { "type": "object", "enabled": false }
    }
  }
}
```

---

## 3. Insert Sample Comments

```json
POST /comments/_bulk
{ "index": { "_id": 1 } }
{ "id": 1, "respondent_id": 1001, "comment_text": "I think career development is important for growth." }
{ "index": { "_id": 2 } }
{ "id": 2, "respondent_id": 1002, "comment_text": "Internal transfer was a great opportunity." }
{ "index": { "_id": 3 } }
{ "id": 3, "respondent_id": 1003, "comment_text": "Support from the client was lacking." }
{ "index": { "_id": 4 } }
{ "id": 4, "respondent_id": 1004, "comment_text": "There’s a lot of focus on career growth here." }
{ "index": { "_id": 5 } }
{ "id": 5, "respondent_id": 1005, "comment_text": "Learning has been continuous and growth is encouraged." }
{ "index": { "_id": 6 } }
{ "id": 6, "respondent_id": 1006, "comment_text": "My internal transfer helped me develop new skills." }
{ "index": { "_id": 7 } }
{ "id": 7, "respondent_id": 1007, "comment_text": "I feel supported by my team and collaboration is strong." }
{ "index": { "_id": 8 } }
{ "id": 8, "respondent_id": 1008, "comment_text": "Internal processes made the transfer smooth." }
{ "index": { "_id": 9 } }
{ "id": 9, "respondent_id": 1009, "comment_text": "Client expectations were met with excellent support." }
{ "index": { "_id": 10 } }
{ "id": 10, "respondent_id": 1010, "comment_text": "Career advancement opportunities are abundant." }
{ "index": { "_id": 11 } }
{ "id": 11, "respondent_id": 1011, "comment_text": "The team values collaboration and open feedback." }
{ "index": { "_id": 12 } }
{ "id": 12, "respondent_id": 1012, "comment_text": "Learning initiatives are in place to support growth." }
{ "index": { "_id": 13 } }
{ "id": 13, "respondent_id": 1013, "comment_text": "I had a good experience working with the client support team." }

```

---

## 4. Insert Sample Rules (flattened span_near queries)

```json
POST /rules/_bulk
{ "index": { "_id": 1 } }
{
  "id": 1,
  "topic": "Career Growth",
  "rule_query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "career" } },
        { "span_term": { "comment_text": "growth" } }
      ],
      "slop": 5,
      "in_order": false
    }
  }
}
{ "index": { "_id": 2 } }
{
  "id": 2,
  "topic": "Internal Mobility",
  "rule_query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "internal" } },
        { "span_term": { "comment_text": "transfer" } }
      ],
      "slop": 4,
      "in_order": false
    }
  }
}
```

---

## 5. Select Matching Comments for a Rule

```json
POST /comments/_search
{
  "query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "career" } },
        { "span_term": { "comment_text": "growth" } }
      ],
      "slop": 5,
      "in_order": false
    }
  },
  "highlight": {
    "fields": {
      "comment_text": {}
    }
  }
}
```

---

## 6. Optional Aggregation: Match Count by Rule

(You’ll need to run queries per rule or use scripted logic externally)

---

Let me know if you want this in Python (Elasticsearch client) or a curl-based shell script.
