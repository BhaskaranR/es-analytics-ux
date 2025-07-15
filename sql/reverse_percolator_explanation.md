# Reverse Percolator: Testing Rules Against Existing Comments

## Overview

The reverse percolator is a powerful Elasticsearch pattern that allows you to test new rules against existing comments to see what they would match. This is the opposite of the traditional percolator pattern where you test incoming documents against stored rules.

## Architecture

### Traditional Percolator (Current Setup)

```
comment_rules (percolator index) ← incoming comments
     ↓
matched_comments (regular index) ← stores matched results
```

### Reverse Percolator (New Setup)

```
comment_percolator (percolator index) ← incoming rules
     ↓
rule_templates (regular index) ← stores rule templates
```

## How It Works

### 1. Comment Percolator Index

- **Purpose**: Stores comments as percolator documents
- **Structure**: Each comment has a `query` field that defines what rules would match it
- **Use Case**: Test new rules against existing comments

### 2. Rule Templates Index

- **Purpose**: Stores rule templates/queries for testing
- **Structure**: Contains rule definitions that can be tested
- **Use Case**: Manage and organize rule templates

## Use Cases

### 1. Rule Testing

Test new rules before adding them to production:

```bash
# Test a new rule against existing comments
curl -X POST "localhost:9200/comment_percolator/_search" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": {
      "percolate": {
        "field": "query",
        "document": {
          "comment_text": "I need career development help"
        }
      }
    }
  }'
```

### 2. Rule Impact Analysis

See how many comments a new rule would affect:

```bash
# Count matches for a rule
curl -X POST "localhost:9200/comment_percolator/_search" \
  -H 'Content-Type: application/json' \
  -d '{
    "size": 0,
    "query": {
      "percolate": {
        "field": "query",
        "document": {
          "comment_text": "test comment"
        }
      }
    }
  }'
```

### 3. Rule Validation

Validate rules before adding them to production:

```bash
# Test rule against a sample of comments
curl -X POST "localhost:9200/comment_percolator/_search" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": {
      "bool": {
        "must": [
          {
            "percolate": {
              "field": "query",
              "document": {
                "comment_text": "career development opportunities"
              }
            }
          },
          {
            "range": {
              "timestamp": {
                "gte": "2024-01-01"
              }
            }
          }
        ]
      }
    }
  }'
```

## Setup Instructions

### 1. Create Comment Percolator Index

```bash
curl -X PUT "localhost:9200/comment_percolator" \
  -H 'Content-Type: application/json' \
  -d '{
    "settings": {
      "analysis": {
        "filter": {
          "synonym_rules": {
            "type": "synonym_graph",
            "synonyms_set": "word_groups",
            "updateable": true
          }
        },
        "analyzer": {
          "index_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase"]
          },
          "search_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase", "synonym_rules"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "query": {
          "type": "percolator"
        },
        "comment_text": {
          "type": "text",
          "analyzer": "index_analyzer",
          "search_analyzer": "search_analyzer"
        },
        "comment_id": {
          "type": "keyword"
        },
        "timestamp": {
          "type": "date"
        },
        "source": {
          "type": "keyword"
        }
      }
    }
  }'
```

### 2. Index Comments as Percolator Documents

```bash
curl -X POST "localhost:9200/comment_percolator/_bulk" \
  -H 'Content-Type: application/x-ndjson' \
  -d '{"index":{"_id":"comment_1"}}
{"comment_id":"1","comment_text":"I need help with my career development","timestamp":"2024-01-15T10:00:00Z","source":"survey","query":{"match":{"comment_text":"career development"}}}
{"index":{"_id":"comment_2"}}
{"comment_id":"2","comment_text":"The client support team was very helpful","timestamp":"2024-01-15T11:00:00Z","source":"survey","query":{"match":{"comment_text":"client support"}}}'
```

### 3. Create Rule Templates Index

```bash
curl -X PUT "localhost:9200/rule_templates" \
  -H 'Content-Type: application/json' \
  -d '{
    "mappings": {
      "properties": {
        "rule_name": {
          "type": "keyword"
        },
        "rule_description": {
          "type": "text"
        },
        "rule_query": {
          "type": "object"
        },
        "topic": {
          "type": "keyword"
        },
        "created_at": {
          "type": "date"
        }
      }
    }
  }'
```

## API Endpoints

### Test Rule Against Comments

```javascript
POST /api/elasticsearch/reverse-percolator
{
  "action": "test_rule",
  "document": {
    "comment_text": "I need career development help"
  }
}
```

### Test Rule Template

```javascript
POST /api/elasticsearch/reverse-percolator
{
  "action": "test_template",
  "templateId": "rule_1",
  "document": {
    "comment_text": "test comment"
  }
}
```

### Get Rule Templates

```javascript
GET /api/elasticsearch/reverse-percolator?action=templates
```

### Create Rule Template

```javascript
POST /api/elasticsearch/reverse-percolator
{
  "action": "create_template",
  "rule_name": "career_development_rule",
  "rule_description": "Matches comments about career development",
  "rule_query": {
    "intervals": {
      "comment_text": {
        "all_of": {
          "ordered": false,
          "intervals": [
            {
              "match": {
                "query": "career",
                "analyzer": "search_analyzer",
                "max_gaps": 3
              }
            },
            {
              "match": {
                "query": "development",
                "analyzer": "search_analyzer",
                "max_gaps": 3
              }
            }
          ]
        }
      }
    }
  },
  "topic": "Career Development"
}
```

## Benefits

### 1. Rule Validation

- Test rules before production deployment
- Validate rule logic and syntax
- Ensure rules match expected comments

### 2. Impact Analysis

- Understand how many comments a rule would affect
- Identify potential false positives
- Optimize rule specificity

### 3. Rule Development

- Iterate on rules quickly
- Test rule variations
- Build rule libraries

### 4. Quality Assurance

- Ensure rule consistency
- Validate rule performance
- Monitor rule effectiveness

## Comparison: Traditional vs Reverse Percolator

| Aspect          | Traditional Percolator            | Reverse Percolator                    |
| --------------- | --------------------------------- | ------------------------------------- |
| **Purpose**     | Match incoming documents to rules | Test rules against existing documents |
| **Index Type**  | Rules as percolator documents     | Comments as percolator documents      |
| **Use Case**    | Real-time document classification | Rule testing and validation           |
| **Performance** | Fast for incoming documents       | Fast for rule testing                 |
| **Scalability** | Scales with number of rules       | Scales with number of comments        |

## Best Practices

### 1. Comment Indexing

- Index representative comments from your dataset
- Include diverse comment types and topics
- Maintain comment metadata (timestamp, source, etc.)

### 2. Rule Testing

- Test rules against a representative sample
- Use realistic test comments
- Validate rule performance metrics

### 3. Template Management

- Organize rule templates by topic
- Version control rule templates
- Document rule purposes and logic

### 4. Performance Optimization

- Use appropriate analyzers
- Index comment metadata for filtering
- Monitor query performance

## Example Workflow

1. **Create Rule Template**: Define a new rule in the rule templates index
2. **Test Rule**: Use the reverse percolator to test the rule against existing comments
3. **Analyze Results**: Review which comments would match the rule
4. **Refine Rule**: Adjust the rule based on test results
5. **Deploy Rule**: Add the validated rule to the production comment_rules index

This reverse percolator pattern provides a powerful way to validate and test rules before deploying them to production, ensuring better rule quality and reducing the risk of unexpected matches.
