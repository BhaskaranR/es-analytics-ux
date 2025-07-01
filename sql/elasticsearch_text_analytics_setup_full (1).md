

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

---

## 9. More Bulk Insert Comments

```json
POST /comments/_bulk
{ "index": { "_id": 4 } }
{ "id": 4, "respondent_id": 1004, "comment_text": "Learning new tools helped my professional growth." }
{ "index": { "_id": 5 } }
{ "id": 5, "respondent_id": 1005, "comment_text": "The support from our client has been outstanding." }
{ "index": { "_id": 6 } }
{ "id": 6, "respondent_id": 1006, "comment_text": "Team collaboration was key to delivering this project." }
{ "index": { "_id": 7 } }
{ "id": 7, "respondent_id": 1007, "comment_text": "Internal transfer opened up career growth opportunities." }
{ "index": { "_id": 8 } }
{ "id": 8, "respondent_id": 1008, "comment_text": "Career advancement is tied closely to learning and mentorship." }
{ "index": { "_id": 9 } }
{ "id": 9, "respondent_id": 1009, "comment_text": "I found the onboarding process very smooth and helpful." }
{ "index": { "_id": 10 } }
{ "id": 10, "respondent_id": 1010, "comment_text": "Client support was unresponsive during onboarding." }
```
