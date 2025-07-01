#!/bin/bash

# Script to retrieve comments by rule_id using the flattened document structure

echo "=== Retrieving Comments by Rule ID ==="

# Function to retrieve comments for a specific rule
retrieve_comments_by_rule() {
    local rule_id=$1
    echo "Retrieving comments for Rule ID: $rule_id"
    echo "----------------------------------------"
    
    curl -X GET "localhost:9200/matched_comments/_search" -H 'Content-Type: application/json' -d "{
        \"query\": {
            \"term\": {
                \"rule_id\": \"$rule_id\"
            }
        },
        \"sort\": [
            {
                \"timestamp\": {
                    \"order\": \"desc\"
                }
            }
        ],
        \"size\": 10
    }" | jq '.hits.hits[] | {rule_id: ._source.rule_id, topic: ._source.topic, comment: ._source.comment_text, score: ._source.score, matched_terms: ._source.matched_terms, timestamp: ._source.timestamp}'
    echo ""
}

# Function to get statistics for a rule
get_rule_statistics() {
    local rule_id=$1
    echo "Statistics for Rule ID: $rule_id"
    echo "----------------------------------------"
    
    curl -X GET "localhost:9200/matched_comments/_search" -H 'Content-Type: application/json' -d "{
        \"size\": 0,
        \"query\": {
            \"term\": {
                \"rule_id\": \"$rule_id\"
            }
        },
        \"aggs\": {
            \"avg_score\": {
                \"avg\": {
                    \"field\": \"score\"
                }
            },
            \"total_comments\": {
                \"value_count\": {
                    \"field\": \"rule_id\"
                }
            },
            \"topics\": {
                \"terms\": {
                    \"field\": \"topic.keyword\"
                }
            }
        }
    }" | jq '.aggregations'
    echo ""
}

# Function to search comments within a rule
search_comments_in_rule() {
    local rule_id=$1
    local search_term=$2
    echo "Searching for '$search_term' in comments for Rule ID: $rule_id"
    echo "----------------------------------------"
    
    curl -X GET "localhost:9200/matched_comments/_search" -H 'Content-Type: application/json' -d "{
        \"query\": {
            \"bool\": {
                \"must\": [
                    {
                        \"term\": {
                            \"rule_id\": \"$rule_id\"
                        }
                    },
                    {
                        \"match\": {
                            \"comment_text\": \"$search_term\"
                        }
                    }
                ]
            }
        },
        \"highlight\": {
            \"fields\": {
                \"comment_text\": {}
            }
        },
        \"sort\": [
            {
                \"score\": {
                    \"order\": \"desc\"
                }
            }
        ],
        \"size\": 10
    }" | jq '.hits.hits[] | {rule_id: ._source.rule_id, topic: ._source.topic, comment: ._source.comment_text, score: ._source.score, highlights: .highlight.comment_text}'
    echo ""
}

# Function to get all rules with their comment counts
get_all_rules_with_counts() {
    echo "All Rules with Comment Counts"
    echo "----------------------------------------"
    
    curl -X GET "localhost:9200/matched_comments/_search" -H 'Content-Type: application/json' -d '{
        "size": 0,
        "aggs": {
            "rules": {
                "terms": {
                    "field": "rule_id",
                    "size": 100
                },
                "aggs": {
                    "topics": {
                        "terms": {
                            "field": "topic.keyword",
                            "size": 1
                        }
                    },
                    "avg_score": {
                        "avg": {
                            "field": "score"
                        }
                    }
                }
            }
        }
    }' | jq '.aggregations.rules.buckets[] | {rule_id: .key, comment_count: .doc_count, topic: .topics.buckets[0].key, avg_score: .avg_score.value}'
    echo ""
}

# Function to get comments by topic
get_comments_by_topic() {
    local topic=$1
    echo "Retrieving comments for Topic: $topic"
    echo "----------------------------------------"
    
    curl -X GET "localhost:9200/matched_comments/_search" -H 'Content-Type: application/json' -d "{
        \"query\": {
            \"term\": {
                \"topic.keyword\": \"$topic\"
            }
        },
        \"sort\": [
            {
                \"timestamp\": {
                    \"order\": \"desc\"
                }
            }
        ],
        \"size\": 10
    }" | jq '.hits.hits[] | {rule_id: ._source.rule_id, topic: ._source.topic, comment: ._source.comment_text, score: ._source.score, matched_terms: ._source.matched_terms}'
    echo ""
}

# Main execution
echo "1. Getting all rules with comment counts..."
get_all_rules_with_counts

echo "2. Retrieving comments for Rule ID: 1 (Client Support)..."
retrieve_comments_by_rule "1"

echo "3. Getting statistics for Rule ID: 1..."
get_rule_statistics "1"

echo "4. Searching for 'support' in Rule ID: 1..."
search_comments_in_rule "1" "support"

echo "5. Retrieving comments for Rule ID: 2 (Career Concerns)..."
retrieve_comments_by_rule "2"

echo "6. Getting comments by topic: 'Client Support'..."
get_comments_by_topic "Client Support"

echo "7. Getting comments by topic: 'Career Concerns'..."
get_comments_by_topic "Career Concerns"

echo "=== Additional Query Examples ==="

echo "8. Get comments with high scores (>0.8) for Rule ID: 1..."
curl -X GET "localhost:9200/matched_comments/_search" -H 'Content-Type: application/json' -d '{
    "query": {
        "bool": {
            "must": [
                {
                    "term": {
                        "rule_id": "1"
                    }
                },
                {
                    "range": {
                        "score": {
                            "gte": 0.8
                        }
                    }
                }
            ]
        }
    },
    "sort": [
        {
            "score": {
                "order": "desc"
            }
        }
    ],
    "size": 10
}' | jq '.hits.hits[] | {rule_id: ._source.rule_id, topic: ._source.topic, comment: ._source.comment_text, score: ._source.score}'

echo ""
echo "9. Get recent comments (last 24 hours) for all rules..."
curl -X GET "localhost:9200/matched_comments/_search" -H 'Content-Type: application/json' -d '{
    "query": {
        "range": {
            "timestamp": {
                "gte": "now-1d"
            }
        }
    },
    "sort": [
        {
            "timestamp": {
                "order": "desc"
            }
        }
    ],
    "size": 10
}' | jq '.hits.hits[] | {rule_id: ._source.rule_id, topic: ._source.topic, comment: ._source.comment_text, timestamp: ._source.timestamp}'

echo ""
echo "10. Get comments that match multiple terms for Rule ID: 1..."
curl -X GET "localhost:9200/matched_comments/_search" -H 'Content-Type: application/json' -d '{
    "query": {
        "bool": {
            "must": [
                {
                    "term": {
                        "rule_id": "1"
                    }
                },
                {
                    "script": {
                        "script": "doc[\"matched_terms\"].size() > 1"
                    }
                }
            ]
        }
    },
    "size": 10
}' | jq '.hits.hits[] | {rule_id: ._source.rule_id, topic: ._source.topic, comment: ._source.comment_text, matched_terms: ._source.matched_terms}' 