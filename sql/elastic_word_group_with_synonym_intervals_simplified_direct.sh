#!/bin/bash
set -e  # Exit on any command failure

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

# Step 1: Create percolator index with standard analyzer (no synonyms)
curl -X PUT "http://$ELASTICSEARCH_HOST/comment_rules_direct" $AUTH_HEADER -H 'Content-Type: application/json' -d '
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "topic": {
        "type": "keyword"
      },
      "comment_text": {
        "type": "text",
        "analyzer": "standard_analyzer"
      }
    }
  }
}'

# Step 2: Bulk index percolator rules with direct terms (no synonym groups)
curl -X POST "http://$ELASTICSEARCH_HOST/comment_rules_direct/_bulk" $AUTH_HEADER -H 'Content-Type: application/x-ndjson' -d '
{"index":{"_id":"career_1"}}
{"topic":"Career Development","description":"career NEAR opportunity WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"career","analyzer":"standard_analyzer","max_gaps":5}},{"match":{"query":"opportunity","analyzer":"standard_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"career_2"}}
{"topic":"Career Development","description":"learning NEAR career WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"learning","analyzer":"standard_analyzer","max_gaps":3}},{"match":{"query":"career","analyzer":"standard_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"career_3"}}
{"topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"promotion","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"career","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"career_4"}}
{"topic":"Career Development","description":"lack NEAR career WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"lack","analyzer":"standard_analyzer","max_gaps":3}},{"match":{"query":"career","analyzer":"standard_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"career_5"}}
{"topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"skill","analyzer":"standard_analyzer","max_gaps":3}},{"match":{"query":"development","analyzer":"standard_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"career_6"}}
{"topic":"Career Development","description":"advancement NEAR opportunity WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"advancement","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"opportunity","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"career_7"}}
{"topic":"Career Development","description":"(mentor OR guidance) NEAR (career OR professional OR development) WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"any_of":{"intervals":[{"match":{"query":"mentor","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"guidance","analyzer":"standard_analyzer","max_gaps":4}}]}},{"any_of":{"intervals":[{"match":{"query":"career","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"professional","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"development","analyzer":"standard_analyzer","max_gaps":4}}]}}]}}}}}
{"index":{"_id":"career_8"}}
{"topic":"Career Development","description":"\"career path\" NEAR (clear OR defined OR structured) WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"career path","analyzer":"standard_analyzer","ordered":true,"max_gaps":2}},{"any_of":{"intervals":[{"match":{"query":"clear","analyzer":"standard_analyzer","max_gaps":5}},{"match":{"query":"defined","analyzer":"standard_analyzer","max_gaps":5}},{"match":{"query":"structured","analyzer":"standard_analyzer","max_gaps":5}}]}}]}}}}}
{"index":{"_id":"career_9"}}
{"topic":"Career Development","description":"(training OR workshop OR seminar) NEAR opportunity WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"any_of":{"intervals":[{"match":{"query":"training","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"workshop","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"seminar","analyzer":"standard_analyzer","max_gaps":4}}]}},{"match":{"query":"opportunity","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"career_10"}}
{"topic":"Career Development","description":"(goal OR objective OR target) NEAR career WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"any_of":{"intervals":[{"match":{"query":"goal","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"objective","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"target","analyzer":"standard_analyzer","max_gaps":4}}]}},{"match":{"query":"career","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_1"}}
{"topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","analyzer":"standard_analyzer","max_gaps":5}},{"match":{"query":"support","analyzer":"standard_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"client_2"}}
{"topic":"Client Support","description":"client NEAR help WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","analyzer":"standard_analyzer","max_gaps":5}},{"match":{"query":"help","analyzer":"standard_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"client_3"}}
{"topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"customer","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"help","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_4"}}
{"topic":"Client Support","description":"user NEAR assistance WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"user","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"assistance","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_5"}}
{"topic":"Client Support","description":"\"end user\" NEAR (support OR help OR assistance) WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"end user","analyzer":"standard_analyzer","ordered":true,"max_gaps":2}},{"any_of":{"intervals":[{"match":{"query":"support","analyzer":"standard_analyzer","max_gaps":5}},{"match":{"query":"help","analyzer":"standard_analyzer","max_gaps":5}},{"match":{"query":"assistance","analyzer":"standard_analyzer","max_gaps":5}}]}}]}}}}}
{"index":{"_id":"client_6"}}
{"topic":"Client Support","description":"client NEAR issue WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"issue","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_7"}}
{"topic":"Client Support","description":"customer NEAR service WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"customer","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"service","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_8"}}
{"topic":"Client Support","description":"client NEAR problem WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"problem","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_9"}}
{"topic":"Client Support","description":"user NEAR support WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"user","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"support","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_10"}}
{"topic":"Client Support","description":"customer NEAR support WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"customer","analyzer":"standard_analyzer","max_gaps":5}},{"match":{"query":"support","analyzer":"standard_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"team_1"}}
{"topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"collaboration","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_2"}}
{"topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":3}},{"match":{"query":"help","analyzer":"standard_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"team_3"}}
{"topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"collaboration","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"work","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_4"}}
{"topic":"Team Collaboration","description":"team NEAR communication WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"communication","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_5"}}
{"topic":"Team Collaboration","description":"\"cross functional\" NEAR (team OR group) WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"cross functional","analyzer":"standard_analyzer","ordered":true,"max_gaps":2}},{"any_of":{"intervals":[{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":3}},{"match":{"query":"group","analyzer":"standard_analyzer","max_gaps":3}}]}}]}}}}}
{"index":{"_id":"team_6"}}
{"topic":"Team Collaboration","description":"team NEAR project WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"project","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_7"}}
{"topic":"Team Collaboration","description":"team NEAR success WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"success","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_8"}}
{"topic":"Team Collaboration","description":"team NEAR performance WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"performance","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_9"}}
{"topic":"Team Collaboration","description":"virtual NEAR team WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"virtual","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_10"}}
{"topic":"Team Collaboration","description":"team NEAR innovation WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"standard_analyzer","max_gaps":4}},{"match":{"query":"innovation","analyzer":"standard_analyzer","max_gaps":4}}]}}}}}
'

echo "Direct rules created successfully!"
echo ""
echo "Now test the percolate query:"
echo "curl -X GET 'http://$ELASTICSEARCH_HOST/comment_rules_direct/_search' $AUTH_HEADER -H 'Content-Type: application/json' -d '{"
echo "  \"query\": {"
echo "    \"percolate\": {"
echo "      \"field\": \"query\","
echo "      \"document\": {"
echo "        \"comment_text\": \"I want more career opportunities for growth and advancement.\""
echo "      }"
echo "    }"
echo "  }"
echo "}'" 