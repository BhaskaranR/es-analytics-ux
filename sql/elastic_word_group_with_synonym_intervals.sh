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
      "id": "bacghr_internalmove",
      "synonyms": "bacghr_internalmove => internal, transfer, from_within, lateral, IJP"
    },
    {
      "id": "bacghr_career",
      "synonyms": "bacghr_career => career, promotion, growth, development"
    },
    {
      "id": "bacghr_onboarding",
      "synonyms": "bacghr_onboarding => onboarding, orientation, induction"
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
      "id": "bacghr_career",
      "synonyms": "bacghr_career => career, promotion, growth, development, advancement, progression"
    },
    {
      "id": "bacghr_learning",
      "synonyms": "bacghr_learning => learning, training, education, skill, knowledge, development"
    },
    {
      "id": "bacghr_opportunity",
      "synonyms": "bacghr_opportunity => opportunity, chance, possibility, potential, prospect"
    },
    {
      "id": "bacghr_advancement",
      "synonyms": "bacghr_advancement => advancement, promotion, raise, salary, compensation, benefits"
    },
    {
      "id": "bacghr_mentorship",
      "synonyms": "bacghr_mentorship => mentor, guidance, coaching, leadership, support"
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

# Step 3: Bulk index percolator rules
curl -X POST "localhost:9200/comment_rules/_bulk" -H 'Content-Type: application/x-ndjson' -d '
{"index":{"_id":"1"}}
{"topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_client","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"bacghr_support","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"2"}}
{"topic":"Career Concerns","description":"lack NEAR bacghr_career WITHIN 2 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"lack","analyzer":"search_analyzer","max_gaps":2}},{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":2}}]}}}}}
{"index":{"_id":"3"}}
{"topic":"Client Satisfaction","description":"client NEAR support WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","max_gaps":5}},{"match":{"query":"support","max_gaps":5}}]}}}}}
{"index":{"_id":"4"}}
{"topic":"Learning and Growth","description":"learning NEAR growth WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"learning","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"growth","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"5"}}
{"topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"collaboration","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"6"}}
{"topic":"Career Progression","description":"promotion NEAR career WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"promotion","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"career","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"7"}}
{"topic":"Client Help","description":"client NEAR support WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"client","max_gaps":4}},{"match":{"query":"support","max_gaps":4}}]}}}}}
{"index":{"_id":"8"}}
{"topic":"Onboarding Feedback","description":"\"orientation experience\" WITHIN 2 WORDS","query":{"intervals":{"comment_text":{"match":{"query":"orientation experience","analyzer":"search_analyzer","ordered":true,"max_gaps":2}}}}}
{"index":{"_id":"9"}}
{"topic":"Team Support","description":"team NEAR help WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"team","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"help","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"10"}}
{"topic":"Internal Movement","description":"internal NEAR opportunity WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"internal","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"opportunity","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"11"}}
{"topic":"Employee Training","description":"training NEAR session WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"training","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"session","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"12"}}
{"topic":"Onboarding Process","description":"onboarding NEAR process WITHIN 2 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"onboarding","analyzer":"search_analyzer","max_gaps":2}},{"match":{"query":"process","analyzer":"search_analyzer","max_gaps":2}}]}}}}}
{"index":{"_id":"13"}}
{"topic":"Learning Growth Opportunities","description":"learning NEAR growth WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"learning","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"growth","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"14"}}
{"topic":"Simple Learning Growth","description":"\"learning growth\" WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"match":{"query":"learning growth","analyzer":"search_analyzer","ordered":true,"max_gaps":3}}}}}
{"index":{"_id":"15"}}
{"topic":"Internal Department Movement","description":"bacghr_internalmove NEAR departments WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_internalmove","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"departments","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"cd_1"}}
{"topic":"Career Growth Opportunities","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"bacghr_opportunity","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"cd_2"}}
{"topic":"Learning and Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_learning","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"cd_3"}}
{"topic":"Promotion and Advancement","description":"promotion NEAR bacghr_advancement WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"promotion","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"bacghr_advancement","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"cd_4"}}
{"topic":"Career Path Clarity","description":"\"career path\" NEAR clear WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"career path","analyzer":"search_analyzer","ordered":true,"max_gaps":2}},{"match":{"query":"clear","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"cd_5"}}
{"topic":"Mentorship and Guidance","description":"bacghr_mentorship NEAR bacghr_career WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_mentorship","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"cd_6"}}
{"topic":"Skill Development","description":"skill NEAR development WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"skill","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"development","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"cd_7"}}
{"topic":"Career Progression Concerns","description":"lack NEAR bacghr_career WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"lack","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"cd_8"}}
{"topic":"Training and Education","description":"training NEAR bacghr_opportunity WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"training","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"bacghr_opportunity","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"cd_9"}}
{"topic":"Career Goals and Aspirations","description":"goal NEAR bacghr_career WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"goal","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"cd_10"}}
{"topic":"Professional Growth","description":"professional NEAR growth WITHIN 3 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"professional","analyzer":"search_analyzer","max_gaps":3}},{"match":{"query":"growth","analyzer":"search_analyzer","max_gaps":3}}]}}}}}
{"index":{"_id":"cd_11"}}
{"topic":"Career Development Support","description":"bacghr_career NEAR support WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"support","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"cd_12"}}
{"topic":"Advancement Opportunities","description":"bacghr_advancement NEAR bacghr_opportunity WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_advancement","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"bacghr_opportunity","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"cd_13"}}
{"topic":"Career Planning","description":"\"career plan\" NEAR future WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"career plan","analyzer":"search_analyzer","ordered":true,"max_gaps":2}},{"match":{"query":"future","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
{"index":{"_id":"cd_14"}}
{"topic":"Learning Opportunities","description":"bacghr_learning NEAR bacghr_opportunity WITHIN 4 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_learning","analyzer":"search_analyzer","max_gaps":4}},{"match":{"query":"bacghr_opportunity","analyzer":"search_analyzer","max_gaps":4}}]}}}}}
{"index":{"_id":"cd_15"}}
{"topic":"Career Development Feedback","description":"bacghr_career NEAR feedback WITHIN 5 WORDS","query":{"intervals":{"comment_text":{"all_of":{"ordered":false,"intervals":[{"match":{"query":"bacghr_career","analyzer":"search_analyzer","max_gaps":5}},{"match":{"query":"feedback","analyzer":"search_analyzer","max_gaps":5}}]}}}}}
'