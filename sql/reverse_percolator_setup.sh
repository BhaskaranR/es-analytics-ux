#!/bin/bash
set -e  # Exit on any command failure

echo "Setting up reverse percolator for comments..."

# Step 1: Create comment percolator index
curl -X PUT "localhost:9200/comment_percolator" -H 'Content-Type: application/json' -d '
{
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

echo "Created comment_percolator index"

# Step 2: Bulk index sample comments as percolator documents
curl -X POST "localhost:9200/comment_percolator/_bulk" -H 'Content-Type: application/x-ndjson' -d '
{"index":{"_id":"comment_1"}}
{"comment_id":"1","comment_text":"I need help with my career development and growth opportunities","timestamp":"2024-01-15T10:00:00Z","source":"survey","query":{"match":{"comment_text":"career development"}}}
{"index":{"_id":"comment_2"}}
{"comment_id":"2","comment_text":"The client support team was very helpful with my issue","timestamp":"2024-01-15T11:00:00Z","source":"survey","query":{"match":{"comment_text":"client support"}}}
{"index":{"_id":"comment_3"}}
{"comment_id":"3","comment_text":"I want to learn new skills and advance in my career","timestamp":"2024-01-15T12:00:00Z","source":"survey","query":{"match":{"comment_text":"career advancement"}}}
{"index":{"_id":"comment_4"}}
{"comment_id":"4","comment_text":"Team collaboration has improved significantly","timestamp":"2024-01-15T13:00:00Z","source":"survey","query":{"match":{"comment_text":"team collaboration"}}}
{"index":{"_id":"comment_5"}}
{"comment_id":"5","comment_text":"I lack clear career progression opportunities","timestamp":"2024-01-15T14:00:00Z","source":"survey","query":{"match":{"comment_text":"career progression"}}}
{"index":{"_id":"comment_6"}}
{"comment_id":"6","comment_text":"The onboarding process was confusing and needs improvement","timestamp":"2024-01-15T15:00:00Z","source":"survey","query":{"match":{"comment_text":"onboarding process"}}}
{"index":{"_id":"comment_7"}}
{"comment_id":"7","comment_text":"I need more training sessions for skill development","timestamp":"2024-01-15T16:00:00Z","source":"survey","query":{"match":{"comment_text":"training sessions"}}}
{"index":{"_id":"comment_8"}}
{"comment_id":"8","comment_text":"Internal transfer opportunities are limited","timestamp":"2024-01-15T17:00:00Z","source":"survey","query":{"match":{"comment_text":"internal transfer"}}}
{"index":{"_id":"comment_9"}}
{"comment_id":"9","comment_text":"Mentorship programs would help with career guidance","timestamp":"2024-01-15T18:00:00Z","source":"survey","query":{"match":{"comment_text":"mentorship guidance"}}}
{"index":{"_id":"comment_10"}}
{"comment_id":"10","comment_text":"Professional growth opportunities are hard to find","timestamp":"2024-01-15T19:00:00Z","source":"survey","query":{"match":{"comment_text":"professional growth"}}}
'

echo "Indexed sample comments as percolator documents"

# Step 3: Create rule templates index for storing rule queries
curl -X PUT "localhost:9200/rule_templates" -H 'Content-Type: application/json' -d '
{
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

echo "Created rule_templates index"

# Step 4: Index some sample rule templates
curl -X POST "localhost:9200/rule_templates/_bulk" -H 'Content-Type: application/x-ndjson' -d '
{"index":{"_id":"rule_1"}}
{"rule_name":"career_development_rule","rule_description":"Matches comments about career development","rule_query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"career","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"development","analyzer":"search_analyzer","max_gaps":3}}]}}}},"topic":"Career Development","created_at":"2024-01-15T10:00:00Z"}
{"index":{"_id":"rule_2"}}
{"rule_name":"client_support_rule","rule_description":"Matches comments about client support","rule_query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"support","analyzer":"search_analyzer","max_gaps":3}}]}}}},"topic":"Client Support","created_at":"2024-01-15T10:00:00Z"}
{"index":{"_id":"rule_3"}}
{"rule_name":"team_collaboration_rule","rule_description":"Matches comments about team collaboration","rule_query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"collaboration","analyzer":"search_analyzer","max_gaps":3}}]}}}},"topic":"Team Collaboration","created_at":"2024-01-15T10:00:00Z"}
'

echo "Indexed sample rule templates"

echo "Reverse percolator setup complete!"
echo ""
echo "Usage examples:"
echo "1. Test a new rule against existing comments:"
echo "   curl -X POST 'localhost:9200/comment_percolator/_search' -H 'Content-Type: application/json' -d '{\"query\":{\"percolate\":{\"field\":\"query\",\"document\":{\"comment_text\":\"test comment\"}}}}'"
echo ""
echo "2. Get all comments that would match a specific rule:"
echo "   curl -X POST 'localhost:9200/comment_percolator/_search' -H 'Content-Type: application/json' -d '{\"query\":{\"percolate\":{\"field\":\"query\",\"document\":{\"comment_text\":\"I need career development help\"}}}}'" 