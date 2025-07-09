#!/bin/bash
set -e  # Exit on any command failure

# Step 1: Define synonym set (requires Elasticsearch 8.8+ and xpack.synonyms.enabled=true)
curl -X PUT "localhost:9200/_synonyms/word_groups" -H 'Content-Type: application/json' -d '
{
  "synonyms_set": [
    {
      "id": "bacghr_client",
      "synonyms": "bacghr_client => client, customer, user, end user"
    },
    {
      "id": "bacghr_career",
      "synonyms": "bacghr_career => career, promotion, growth, development, advancement, progression"
    },
    {
      "id": "bacghr_team",
      "synonyms": "bacghr_team => team, collaboration, cooperation, group"
    },
    {
      "id": "bacghr_support",
      "synonyms": "bacghr_support => support, assistance, help, aid"
    },
    {
      "id": "bacghr_learning",
      "synonyms": "bacghr_learning => learning, training, education, skill, knowledge, development"
    },
    {
      "id": "bacghr_opportunity",
      "synonyms": "bacghr_opportunity => opportunity, chance, possibility, potential, prospect"
    }
  ]
}'

# Step 2: Create percolator index with synonym analyzer
curl -X PUT "localhost:9200/comment_rules" -H 'Content-Type: application/json' -d '
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
      "topic": {
        "type": "keyword"
      },
      "comment_text": {
        "type": "text",
        "analyzer": "index_analyzer",
        "search_analyzer": "search_analyzer"
      }
    }
  }
}'

# Step 3: Create matched_comments index
curl -X PUT "https://your-cluster-url:443/matched_comments" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer your-api-key" \
-d '{
  "mappings": {
    "properties": {
      "rule_id": {
        "type": "keyword"
      },
      "comment_text": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
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

# Step 4: Bulk index percolator rules - 10 RULES PER TOPIC (30 TOTAL)
curl -X POST "localhost:9200/comment_rules/_bulk" -H 'Content-Type: application/x-ndjson' -d '
{"index":{"_id":"career_1"}}
{"topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"bacghr_opportunity","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"career_2"}}
{"topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_learning","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"career_3"}}
{"topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"promotion","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"career","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"career_4"}}
{"topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"lack","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"career_5"}}
{"topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"skill","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"development","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"career_6"}}
{"topic":"Career Development","description":"bacghr_advancement NEAR bacghr_opportunity WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_advancement","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"bacghr_opportunity","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"career_7"}}
{"topic":"Career Development","description":"(bacghr_mentorship OR mentor OR guidance) NEAR (bacghr_career OR professional OR development) WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"any_of":{"intervals":[{"match":{"query":"bacghr_mentorship","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"mentor","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"guidance","analyzer":"search_analyzer","max_gaps":4}}]}},{"any_of":{"intervals":[{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"professional","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"development","analyzer":"search_analyzer","max_gaps":4}}]}}]}}}}}
{"index":{"_id":"career_8"}}
{"topic":"Career Development","description":"\"career path\" NEAR (clear OR defined OR structured) WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"career path","analyzer":"search_analyzer","ordered":true,"max_gaps":2}},{"any_of":{"intervals":[{"match":{"query":"clear","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"defined","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"structured","analyzer":"search_analyzer","max_gaps":5}}]}}]}}}}}
{"index":{"_id":"career_9"}}
{"topic":"Career Development","description":"(training OR workshop OR seminar) NEAR bacghr_opportunity WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"any_of":{"intervals":[{"match":{"query":"training","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"workshop","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"seminar","analyzer":"search_analyzer","max_gaps":4}}]}},{"match":{"query":"bacghr_opportunity","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"career_10"}}
{"topic":"Career Development","description":"(goal OR objective OR target) NEAR bacghr_career WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"any_of":{"intervals":[{"match":{"query":"goal","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"objective","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"target","analyzer":"search_analyzer","max_gaps":4}}]}},{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_1"}}
{"topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_client","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"bacghr_support","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"client_2"}}
{"topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"support","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"client_3"}}
{"topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"customer","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"help","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_4"}}
{"topic":"Client Support","description":"user NEAR assistance WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"user","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"assistance","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_5"}}
{"topic":"Client Support","description":"\"end user\" NEAR (support OR help OR assistance) WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"end user","analyzer":"search_analyzer","ordered":true,"max_gaps":2}},{"any_of":{"intervals":[{"match":{"query":"support","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"help","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"assistance","analyzer":"search_analyzer","max_gaps":5}}]}}]}}}}}
{"index":{"_id":"client_6"}}
{"topic":"Client Support","description":"client NEAR issue WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"issue","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_7"}}
{"topic":"Client Support","description":"customer NEAR service WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"customer","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"service","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_8"}}
{"topic":"Client Support","description":"client NEAR problem WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"problem","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_9"}}
{"topic":"Client Support","description":"user NEAR support WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"user","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"support","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"client_10"}}
{"topic":"Client Support","description":"customer NEAR support WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"customer","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"support","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"team_1"}}
{"topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"collaboration","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_2"}}
{"topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"help","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"team_3"}}
{"topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"collaboration","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"work","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_4"}}
{"topic":"Team Collaboration","description":"team NEAR communication WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"communication","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_5"}}
{"topic":"Team Collaboration","description":"\"cross functional\" NEAR (team OR group) WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"cross functional","analyzer":"search_analyzer","ordered":true,"max_gaps":2}},{"any_of":{"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"group","analyzer":"search_analyzer","max_gaps":3}}]}}]}}}}}
{"index":{"_id":"team_6"}}
{"topic":"Team Collaboration","description":"team NEAR project WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"project","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_7"}}
{"topic":"Team Collaboration","description":"team NEAR success WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"success","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_8"}}
{"topic":"Team Collaboration","description":"team NEAR performance WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"performance","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_9"}}
{"topic":"Team Collaboration","description":"virtual NEAR team WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"virtual","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"team_10"}}
{"topic":"Team Collaboration","description":"team NEAR innovation WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"innovation","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
' 