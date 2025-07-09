#!/bin/bash

# Configuration for local vs cloud Elasticsearch
ELASTICSEARCH_HOST=${ELASTICSEARCH_HOST:-"localhost:9200"}
ELASTICSEARCH_API_KEY=${ELASTICSEARCH_API_KEY:-""}

# Set up authentication headers
if [ -n "$ELASTICSEARCH_API_KEY" ]; then
    # Cloud Elasticsearch with API Key
    AUTH_HEADER="-H 'Authorization: ApiKey $ELASTICSEARCH_API_KEY'"
    echo "Using API Key authentication for Elasticsearch Cloud"
else
    # Local Elasticsearch (no auth header)
    AUTH_HEADER=""
    echo "Using local Elasticsearch without authentication"
fi

echo "Testing direct percolate query..."
echo "Comment: 'I want more career opportunities for growth and advancement.'"
echo ""

# Test the percolate query with direct terms
curl -X GET "http://$ELASTICSEARCH_HOST/comment_rules_direct/_search" $AUTH_HEADER -H 'Content-Type: application/json' -d '{
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
echo "Expected matches:"
echo "- career_1: career NEAR opportunity WITHIN 5 WORDS"
echo "- career_6: advancement NEAR opportunity WITHIN 4 WORDS"
echo ""
echo "If this works, you can use the direct version instead of the synonym version." 