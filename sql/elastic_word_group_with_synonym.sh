#!/bin/bash

# Step 1: Create a custom analyzer with synonym filter
curl -X PUT "localhost:9200/comments_index" -H 'Content-Type: application/json' -d '
{
  "settings": {
    "analysis": {
      "filter": {
        "custom_synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "#bacghr_client => client, customer, user, end user",
            "#bacghr_internalmove => internal, transfer, from_within, lateral, IJP",
            "#bacghr_career => career, promotion, growth, development",
            "#bacghr_onboarding => onboarding, orientation, induction",
            "#bacghr_team => team, collaboration, cooperation, group",
            "#bacghr_support => support, assistance, help, aid"
          ]
        }
      },
      "analyzer": {
        "custom_synonym_analyzer": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "custom_synonym_filter"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "custom_synonym_analyzer"
      }
    }
  }
}'

# Step 2: Create comment_rules index with percolator mapping
curl -X PUT "localhost:9200/comment_rules" -H 'Content-Type: application/json' -d '
{
  "settings": {
    "analysis": {
      "filter": {
        "custom_synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "#bacghr_client => client, customer, user, end user",
            "#bacghr_internalmove => internal, transfer, from_within, lateral, IJP",
            "#bacghr_career => career, promotion, growth, development",
            "#bacghr_onboarding => onboarding, orientation, induction",
            "#bacghr_team => team, collaboration, cooperation, group",
            "#bacghr_support => support, assistance, help, aid"
          ]
        }
      },
      "analyzer": {
        "custom_synonym_analyzer": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "custom_synonym_filter"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "query":    { "type": "percolator" },
      "topic":    { "type": "keyword" },
      "group_refs": { "type": "keyword" },
      "text":     { "type": "text", "analyzer": "custom_synonym_analyzer" }
    }
  }
}'


# Step 3: Add comment rules as percolator queries
curl -X POST "localhost:9200/comment_rules/_bulk" -H 'Content-Type: application/json' -d '
{ "index": { "_id": "1" } }
{ "topic": "Client Support", "group_refs": ["#bacghr_client", "#bacghr_support"], "query": { "match": { "text": "#bacghr_client #bacghr_support" } } }
{ "index": { "_id": "2" } }
{ "topic": "Career Concerns", "group_refs": ["#bacghr_career"], "query": { "match": { "text": "lack of promotion" } } }
{ "index": { "_id": "3" } }
{ "topic": "Team Collaboration", "group_refs": ["#bacghr_team"], "query": { "match_phrase": { "text": "great team" } } }
'

# Step 4: Match incoming comment to rules using _search with percolate query
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "text": "I got great support from the customer service team"
      }
    }
  }
}'

# Step 5: Optionally re-index matched comment with topic
# (This is manual and should be done based on search result IDs.)
