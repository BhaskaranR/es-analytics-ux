#!/bin/bash

# Elasticsearch URL
ES_URL="http://localhost:9200"

# Comment to test (you can adapt this to loop over multiple comments)
COMMENT_TEXT="The onboarding process was very helpful."
COMMENT_ID="sample-comment-1"

# Step 1: Percolate against rules
echo "🔍 Percolating comment..."
MATCHED_RULES=$(curl -s -X GET "$ES_URL/comment_rules/_search" -H 'Content-Type: application/json' -d "
{
  \"query\": {
    \"percolate\": {
      \"field\": \"query\",
      \"document\": {
        \"text\": \"$COMMENT_TEXT\"
      }
    }
  }
}" | jq -r '.hits.hits[]._id')

# Join matched rule IDs into JSON array
MATCHED_RULES_JSON=$(echo "$MATCHED_RULES" | jq -R . | jq -s .)

echo "✅ Matched Rules: $MATCHED_RULES_JSON"

# Step 2: Re-index the comment with matched rules into new index
echo "📝 Indexing enriched comment to comments_classified..."

curl -X POST "$ES_URL/comments_classified/_doc/$COMMENT_ID" -H 'Content-Type: application/json' -d "
{
  \"comment_text\": \"$COMMENT_TEXT\",
  \"matched_rules\": $MATCHED_RULES_JSON,
  \"timestamp\": \"$(date -Iseconds)\"
}"
