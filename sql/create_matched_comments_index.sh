#!/bin/bash

# Create matched_comments index with appropriate mappings
# This index stores comments that have been matched against percolator rules

curl -X PUT "localhost:9200/matched_comments" -H 'Content-Type: application/json' -d '{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "rule_id": {
        "type": "keyword"
      },
      "comment_text": {
        "type": "text",
        "analyzer": "standard"
      },
      "topic": {
        "type": "keyword"
      },
      "description": {
        "type": "text"
      },
      "score": {
        "type": "float"
      },
      "matched_terms": {
        "type": "keyword"
      },
      "max_gaps": {
        "type": "integer"
      },
      "ordered": {
        "type": "boolean"
      },
      "highlighted_text": {
        "type": "text"
      },
      "timestamp": {
        "type": "date"
      }
    }
  }
}'

echo "matched_comments index created successfully!"
echo ""
echo "You can now run the bulk insert script:"
echo "bash sql/bulk_insert_matched_comments.sh" 