#!/bin/bash

echo "Testing percolate query with the comment..."
echo "Comment: 'I want more career opportunities for growth and advancement.'"
echo ""

# Test 1: Basic percolate query
echo "=== Test 1: Basic percolate query ==="
curl -X GET "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "I want more career opportunities for growth and advancement."
      }
    }
  },
  "highlight": {
    "fields": {
      "comment_text": {
        "pre_tags": ["<mark>"],
        "post_tags": ["</mark>"],
        "fragment_size": 150,
        "number_of_fragments": 3
      }
    }
  }
}' | jq '.'

echo ""
echo "=== Test 2: Check if synonyms are working ==="
# Test synonym expansion
curl -X POST "localhost:9200/_analyze" -H 'Content-Type: application/json' -d '{
  "analyzer": "search_analyzer",
  "text": "career opportunities"
}' | jq '.'

echo ""
echo "=== Test 3: Test individual terms ==="
# Test individual terms
curl -X POST "localhost:9200/_analyze" -H 'Content-Type: application/json' -d '{
  "analyzer": "search_analyzer",
  "text": "career"
}' | jq '.'

curl -X POST "localhost:9200/_analyze" -H 'Content-Type: application/json' -d '{
  "analyzer": "search_analyzer",
  "text": "opportunities"
}' | jq '.'

echo ""
echo "=== Test 4: Check if career_1 rule exists ==="
# Check if the rule exists
curl -X GET "localhost:9200/comment_rules/_doc/career_1" | jq '.'

echo ""
echo "=== Test 5: Test with simpler query ==="
# Test with a simpler query that should definitely match
curl -X GET "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "career opportunity"
      }
    }
  }
}' | jq '.' 