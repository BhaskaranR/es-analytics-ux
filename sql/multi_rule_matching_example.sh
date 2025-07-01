#!/bin/bash

# Multi-Rule Matching Example - Flattened Structure

## Example: A comment that matches multiple rules
# Comment: "I received excellent support from the customer service team."
# This comment matches:
# - Rule 1: Client Support (hr_client + hr_support)
# - Rule 7: Client Help (client + support)

echo "Storing a comment that matches multiple rules..."

# Store the same comment multiple times - once for each matched rule
# This is the key concept of the flattened structure

# Store for Rule 1 (Client Support)
curl -X POST "localhost:9200/matched_comments_flat/_doc" -H 'Content-Type: application/json' -d '{
  "comment_text": "I received excellent support from the customer service team.",
  "rule_id": "1",
  "topic": "Client Support",
  "score": 0.8,
  "matched_terms": ["hr_client", "hr_support"],
  "max_gaps": 5,
  "ordered": false,
  "timestamp": "2024-03-20T10:00:00Z",
  "comment_id": "comment_002"
}'

# Store for Rule 7 (Client Help) - same comment, different rule
curl -X POST "localhost:9200/matched_comments_flat/_doc" -H 'Content-Type: application/json' -d '{
  "comment_text": "I received excellent support from the customer service team.",
  "rule_id": "7",
  "topic": "Client Help",
  "score": 0.6,
  "matched_terms": ["client", "support"],
  "max_gaps": 4,
  "ordered": false,
  "timestamp": "2024-03-20T10:00:00Z",
  "comment_id": "comment_002"
}'

## Another example: Comment with multiple matches
# Comment: "Team collaboration and communication have been excellent lately."
# This matches:
# - Rule 5: Team Collaboration (team + collaboration)
# - Rule 9: Team Support (team + help)

# Store for Rule 5
curl -X POST "localhost:9200/matched_comments_flat/_doc" -H 'Content-Type: application/json' -d '{
  "comment_text": "Team collaboration and communication have been excellent lately.",
  "rule_id": "5",
  "topic": "Team Collaboration",
  "score": 0.85,
  "matched_terms": ["team", "collaboration"],
  "max_gaps": 4,
  "ordered": false,
  "timestamp": "2024-03-20T10:02:00Z",
  "comment_id": "comment_003"
}'

# Store for Rule 9
curl -X POST "localhost:9200/matched_comments_flat/_doc" -H 'Content-Type: application/json' -d '{
  "comment_text": "Team collaboration and communication have been excellent lately.",
  "rule_id": "9",
  "topic": "Team Support",
  "score": 0.7,
  "matched_terms": ["team", "help"],
  "max_gaps": 3,
  "ordered": false,
  "timestamp": "2024-03-20T10:02:00Z",
  "comment_id": "comment_003"
}'

## Now let's retrieve and see how this works

echo "=== Retrieving comments by specific rule ==="

# Get all comments that matched Rule 1
echo "Comments that matched Rule 1 (Client Support):"
curl -X GET "localhost:9200/matched_comments_flat/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "term": {
      "rule_id": "1"
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
  },
  "_source": ["comment_text", "rule_id", "topic", "score", "matched_terms", "comment_id"],
  "size": 20
}'

# Get all comments that matched Rule 7
echo "Comments that matched Rule 7 (Client Help):"
curl -X GET "localhost:9200/matched_comments_flat/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "term": {
      "rule_id": "7"
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
  },
  "_source": ["comment_text", "rule_id", "topic", "score", "matched_terms", "comment_id"],
  "size": 20
}'

## Get all rules that a specific comment matched
echo "=== Getting all rules for a specific comment ==="

# Get all rules that comment_002 matched
echo "All rules that comment_002 matched:"
curl -X GET "localhost:9200/matched_comments_flat/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "term": {
      "comment_id": "comment_002"
    }
  },
  "_source": ["comment_text", "rule_id", "topic", "score", "matched_terms"],
  "size": 20,
  "sort": [
    {"score": {"order": "desc"}}
  ]
}'

## Get unique comments that matched any rule
echo "=== Getting unique comments ==="

# Get unique comment IDs that matched any rule
echo "Unique comments that matched any rule:"
curl -X GET "localhost:9200/matched_comments_flat/_search" -H 'Content-Type: application/json' -d '{
  "size": 0,
  "aggs": {
    "unique_comments": {
      "terms": {
        "field": "comment_id",
        "size": 100
      },
      "aggs": {
        "comment_text": {
          "terms": {
            "field": "comment_text",
            "size": 1
          }
        },
        "rule_count": {
          "value_count": {
            "field": "rule_id"
          }
        },
        "top_rules": {
          "terms": {
            "field": "rule_id",
            "size": 5
          }
        }
      }
    }
  }
}'

## Get comments that matched multiple rules
echo "=== Comments that matched multiple rules ==="

# Get comments that matched more than one rule
echo "Comments that matched multiple rules:"
curl -X GET "localhost:9200/matched_comments_flat/_search" -H 'Content-Type: application/json' -d '{
  "size": 0,
  "aggs": {
    "unique_comments": {
      "terms": {
        "field": "comment_id",
        "size": 100
      },
      "aggs": {
        "rule_count": {
          "value_count": {
            "field": "rule_id"
          }
        },
        "multiple_rules": {
          "bucket_selector": {
            "buckets_path": {
              "rule_count": "rule_count"
            },
            "script": "params.rule_count > 1"
          }
        }
      }
    }
  }
}'

## Get statistics showing how many rules each comment matched
echo "=== Statistics: Rules per comment ==="

curl -X GET "localhost:9200/matched_comments_flat/_search" -H 'Content-Type: application/json' -d '{
  "size": 0,
  "aggs": {
    "unique_comments": {
      "terms": {
        "field": "comment_id",
        "size": 100
      },
      "aggs": {
        "rule_count": {
          "value_count": {
            "field": "rule_id"
          }
        }
      }
    },
    "rules_per_comment_stats": {
      "nested": {
        "path": "unique_comments"
      },
      "aggs": {
        "avg_rules_per_comment": {
          "avg": {
            "field": "rule_count"
          }
        },
        "max_rules_per_comment": {
          "max": {
            "field": "rule_count"
          }
        },
        "min_rules_per_comment": {
          "min": {
            "field": "rule_count"
          }
        }
      }
    }
  }
}'

## Create a function to get all rules for a specific comment
echo "=== Function to get all rules for a comment ==="

get_rules_for_comment() {
    local comment_id=$1
    echo "Getting all rules for comment: $comment_id"
    
    curl -X GET "localhost:9200/matched_comments_flat/_search" -H 'Content-Type: application/json' -d "{
      \"query\": {
        \"term\": {
          \"comment_id\": \"$comment_id\"
        }
      },
      \"_source\": [\"comment_text\", \"rule_id\", \"topic\", \"score\", \"matched_terms\"],
      \"size\": 20,
      \"sort\": [
        {\"score\": {\"order\": \"desc\"}}
      ]
    }"
}

# Example usage:
# get_rules_for_comment "comment_002"
# get_rules_for_comment "comment_003"

## Create a function to get all comments for a specific rule
echo "=== Function to get all comments for a rule ==="

get_comments_for_rule() {
    local rule_id=$1
    echo "Getting all comments for rule: $rule_id"
    
    curl -X GET "localhost:9200/matched_comments_flat/_search" -H 'Content-Type: application/json' -d "{
      \"query\": {
        \"term\": {
          \"rule_id\": \"$rule_id\"
        }
      },
      \"highlight\": {
        \"fields\": {
          \"comment_text\": {
            \"pre_tags\": [\"<mark>\"],
            \"post_tags\": [\"</mark>\"],
            \"fragment_size\": 150,
            \"number_of_fragments\": 3
          }
        }
      },
      \"_source\": [\"comment_text\", \"rule_id\", \"topic\", \"score\", \"matched_terms\", \"comment_id\"],
      \"size\": 20,
      \"sort\": [
        {\"score\": {\"order\": \"desc\"}},
        {\"timestamp\": {\"order\": \"desc\"}}
      ]
    }"
}

# Example usage:
# get_comments_for_rule "1"
# get_comments_for_rule "7" 