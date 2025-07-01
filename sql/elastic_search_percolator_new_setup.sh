#!/bin/bash

# Step 1: Create the comment_rules index with percolator mapping
curl -X PUT "localhost:9200/comment_rules" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "topic": {
        "type": "keyword"
      },
      "group_refs": {
        "type": "keyword"
      }
    }
  }
}'

# Step 2: Bulk insert percolator queries
curl -X POST "localhost:9200/comment_rules/_bulk" -H 'Content-Type: application/json' -d'
{ "index": { "_id": "1" } }
{ "topic": "Client Support", "group_refs": ["#bacghr_client", "#bacghr_support"], "query": { "match": { "text": "client support" } } }
{ "index": { "_id": "2" } }
{ "topic": "Career Concerns", "group_refs": ["#bacghr_career"], "query": { "match": { "text": "lack of promotion" } } }
{ "index": { "_id": "3" } }
{ "topic": "Team Collaboration", "group_refs": ["#bacghr_team"], "query": { "match_phrase": { "text": "great team" } } }
'

# Step 3: Create the comments index
curl -X PUT "localhost:9200/comments" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "text": {
        "type": "text"
      }
    }
  }
}'

# Step 4: Run percolate query to test matching rules
curl -X GET "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "text": "The client support team was extremely helpful and responsive."
      }
    }
  }
}'  
