

---

## 7. More Sample Rules

```json
POST /rules/_bulk
{ "index": { "_id": 3 } }
{
  "id": 3,
  "topic": "Client Satisfaction",
  "rule_query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "client" } },
        { "span_term": { "comment_text": "support" } }
      ],
      "slop": 5,
      "in_order": false
    }
  }
}
{ "index": { "_id": 4 } }
{
  "id": 4,
  "topic": "Learning and Growth",
  "rule_query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "learning" } },
        { "span_term": { "comment_text": "growth" } }
      ],
      "slop": 3,
      "in_order": false
    }
  }
}
{ "index": { "_id": 5 } }
{
  "id": 5,
  "topic": "Team Collaboration",
  "rule_query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "team" } },
        { "span_term": { "comment_text": "collaboration" } }
      ],
      "slop": 4,
      "in_order": false
    }
  }
}
```

---

## 8. More Select Queries (per rule)

### Career Growth

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
  }
}
```

### Internal Mobility

```json
POST /comments/_search
{
  "query": {
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

### Client Satisfaction

```json
POST /comments/_search
{
  "query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "client" } },
        { "span_term": { "comment_text": "support" } }
      ],
      "slop": 5,
      "in_order": false
    }
  }
}
```

### Learning and Growth

```json
POST /comments/_search
{
  "query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "learning" } },
        { "span_term": { "comment_text": "growth" } }
      ],
      "slop": 3,
      "in_order": false
    }
  }
}
```

### Team Collaboration

```json
POST /comments/_search
{
  "query": {
    "span_near": {
      "clauses": [
        { "span_term": { "comment_text": "team" } },
        { "span_term": { "comment_text": "collaboration" } }
      ],
      "slop": 4,
      "in_order": false
    }
  }
}
```
