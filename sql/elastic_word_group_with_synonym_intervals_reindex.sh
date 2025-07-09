# Reindex Comments with Topic and Count

## Step 1: Match and Reindex Comment with Topic

```bash
POST /comment_rules/_search
{
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
}
```

Assume response returns:
```json
{
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "hits": [
      {
        "_id": "career_1",
        "_score": 0.8,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "bacghr_career", "analyzer": "search_analyzer", "max_gaps": 5}},
                    {"match": {"query": "bacghr_opportunity", "analyzer": "search_analyzer", "max_gaps": 5}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "I want more <mark>career</mark> <mark>opportunities</mark> for growth and advancement."
          ]
        }
      },
      {
        "_id": "career_2",
        "_score": 0.6,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "bacghr_learning", "analyzer": "search_analyzer", "max_gaps": 3}},
                    {"match": {"query": "bacghr_career", "analyzer": "search_analyzer", "max_gaps": 3}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "I want more <mark>career</mark> opportunities for growth and advancement."
          ]
        }
      }
    ]
  }
}
```

# Store each rule match as a separate document for easy retrieval
POST /matched_comments/_doc
{
  "rule_id": "career_1",
  "comment_text": "I want more career opportunities for growth and advancement.",
  "topic": "Career Development",
  "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
  "score": 0.8,
  "matched_terms": ["bacghr_career", "bacghr_opportunity"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "I want more <mark>career</mark> <mark>opportunities</mark> for growth and advancement.",
  "timestamp": "2024-03-20T10:00:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_2",
  "comment_text": "I want more career opportunities for growth and advancement.",
  "topic": "Career Development",
  "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.6,
  "matched_terms": ["bacghr_learning", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "I want more <mark>career</mark> opportunities for growth and advancement.",
  "timestamp": "2024-03-20T10:00:00Z"
}

## Step 2: Count of Comments per Topic
```bash
GET /matched_comments/_search
{
  "size": 0,
  "aggs": {
    "topic_counts": {
      "terms": {
        "field": "topic.keyword",
        "size": 100
      }
    }
  }
}
```

## Step 3: Retrieve Comments by Rule ID
```bash
GET /matched_comments/_search
{
  "query": {
    "term": {
      "rule_id": "1"
    }
  },
  "sort": [
    {
      "timestamp": {
        "order": "desc"
      }
    }
  ]
}
```

## Step 4: Rematch All Comments When a New Rule or Synonym is Added

### Trigger Rematch (manually or via a job)
```bash
POST /_reindex
{
  "source": {
    "index": "comments"
  },
  "dest": {
    "index": "rematch_temp"
  },
  "script": {
    "source": "ctx._source.reprocess = true"
  }
}
```

- Then for each reprocessed comment:
- Run `percolate` search
- Update/add entries in `matched_comments` with rule_id as separate documents

---

## Example Percolate Queries

```bash
POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "I received excellent support from the customer service team." }
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
}

Response:
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      {
        "_id": "client_1",
        "_score": 0.8,
        "_source": {
          "topic": "Client Support",
          "description": "bacghr_client NEAR bacghr_support WITHIN 5 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "bacghr_client", "analyzer": "search_analyzer", "max_gaps": 5}},
                    {"match": {"query": "bacghr_support", "analyzer": "search_analyzer", "max_gaps": 5}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "I received excellent <mark>support</mark> from the <mark>customer</mark> service team."
          ]
        }
      },
      {
        "_id": "client_2",
        "_score": 0.6,
        "_source": {
          "topic": "Client Support",
          "description": "client NEAR support WITHIN 5 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "client", "analyzer": "search_analyzer", "max_gaps": 5}},
                    {"match": {"query": "support", "analyzer": "search_analyzer", "max_gaps": 5}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "I received excellent <mark>support</mark> from the customer service team."
          ]
        }
      }
    ]
  }
}

# Store each rule match as separate document
POST /matched_comments/_doc
{
  "rule_id": "client_1",
  "comment_text": "I received excellent support from the customer service team.",
  "topic": "Client Support",
  "description": "bacghr_client NEAR bacghr_support WITHIN 5 WORDS",
  "score": 0.8,
  "matched_terms": ["bacghr_client", "bacghr_support"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "I received excellent <mark>support</mark> from the <mark>customer</mark> service team.",
  "timestamp": "2024-03-20T10:00:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "client_2",
  "comment_text": "I received excellent support from the customer service team.",
  "topic": "Client Support",
  "description": "client NEAR support WITHIN 5 WORDS",
  "score": 0.6,
  "matched_terms": ["client", "support"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "I received excellent <mark>support</mark> from the customer service team.",
  "timestamp": "2024-03-20T10:00:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "The training session helped me understand the new tools better." }
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
}

Response:
{
  "hits": {
    "total": { "value": 1, "relation": "eq" },
    "hits": [
      {
        "_id": "career_2",
        "_score": 0.9,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "bacghr_learning", "analyzer": "search_analyzer", "max_gaps": 3}},
                    {"match": {"query": "bacghr_career", "analyzer": "search_analyzer", "max_gaps": 3}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "The <mark>training</mark> session helped me understand the new tools better."
          ]
        }
      }
    ]
  }
}

# Store matched comment
POST /matched_comments/_doc
{
  "rule_id": "career_2",
  "comment_text": "The training session helped me understand the new tools better.",
  "topic": "Career Development",
  "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.9,
  "matched_terms": ["bacghr_learning", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "The <mark>training</mark> session helped me understand the new tools better.",
  "timestamp": "2024-03-20T10:01:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "Team collaboration and communication have been excellent lately." }
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
}

Response:
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      {
        "_id": "team_1",
        "_score": 0.85,
        "_source": {
          "topic": "Team Collaboration",
          "description": "team NEAR collaboration WITHIN 4 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "team", "analyzer": "search_analyzer", "max_gaps": 4}},
                    {"match": {"query": "collaboration", "analyzer": "search_analyzer", "max_gaps": 4}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "<mark>Team</mark> <mark>collaboration</mark> and communication have been excellent lately."
          ]
        }
      },
      {
        "_id": "team_2",
        "_score": 0.7,
        "_source": {
          "topic": "Team Collaboration",
          "description": "team NEAR help WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "team", "analyzer": "search_analyzer", "max_gaps": 3}},
                    {"match": {"query": "help", "analyzer": "search_analyzer", "max_gaps": 3}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "<mark>Team</mark> collaboration and communication have been excellent lately."
          ]
        }
      }
    ]
  }
}

# Store each rule match as separate document
POST /matched_comments/_doc
{
  "rule_id": "team_1",
  "comment_text": "Team collaboration and communication have been excellent lately.",
  "topic": "Team Collaboration",
  "description": "team NEAR collaboration WITHIN 4 WORDS",
  "score": 0.85,
  "matched_terms": ["team", "collaboration"],
  "max_gaps": 4,
  "ordered": false,
  "highlighted_text": "<mark>Team</mark> <mark>collaboration</mark> and communication have been excellent lately.",
  "timestamp": "2024-03-20T10:02:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "team_2",
  "comment_text": "Team collaboration and communication have been excellent lately.",
  "topic": "Team Collaboration",
  "description": "team NEAR help WITHIN 3 WORDS",
  "score": 0.7,
  "matched_terms": ["team", "help"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "<mark>Team</mark> collaboration and communication have been excellent lately.",
  "timestamp": "2024-03-20T10:02:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "Onboarding process was smooth and orientation was helpful." }
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
}

Response:
{
  "hits": {
    "total": { "value": 1, "relation": "eq" },
    "hits": [
      {
        "_id": "career_2",
        "_score": 0.9,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "bacghr_learning", "analyzer": "search_analyzer", "max_gaps": 3}},
                    {"match": {"query": "bacghr_career", "analyzer": "search_analyzer", "max_gaps": 3}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "Onboarding process was smooth and <mark>orientation</mark> was helpful."
          ]
        }
      }
    ]
  }
}

# Store matched comment
POST /matched_comments/_doc
{
  "rule_id": "career_2",
  "comment_text": "Onboarding process was smooth and orientation was helpful.",
  "topic": "Career Development",
  "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.9,
  "matched_terms": ["bacghr_learning", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "Onboarding process was smooth and <mark>orientation</mark> was helpful.",
  "timestamp": "2024-03-20T10:03:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "Career growth seems stagnant without promotion opportunities." }
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
}

Response:
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      {
        "_id": "career_4",
        "_score": 0.95,
        "_source": {
          "topic": "Career Development",
          "description": "lack NEAR bacghr_career WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "lack", "analyzer": "search_analyzer", "max_gaps": 3}},
                    {"match": {"query": "bacghr_career", "analyzer": "search_analyzer", "max_gaps": 3}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "<mark>Career</mark> growth seems stagnant without <mark>promotion</mark> opportunities."
          ]
        }
      },
      {
        "_id": "career_3",
        "_score": 0.8,
        "_source": {
          "topic": "Career Development",
          "description": "promotion NEAR career WITHIN 4 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "promotion", "analyzer": "search_analyzer", "max_gaps": 4}},
                    {"match": {"query": "career", "analyzer": "search_analyzer", "max_gaps": 4}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "<mark>Career</mark> growth seems stagnant without <mark>promotion</mark> opportunities."
          ]
        }
      }
    ]
  }
}

# Store each rule match as separate document
POST /matched_comments/_doc
{
  "rule_id": "career_4",
  "comment_text": "Career growth seems stagnant without promotion opportunities.",
  "topic": "Career Development",
  "description": "lack NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.95,
  "matched_terms": ["lack", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "<mark>Career</mark> growth seems stagnant without <mark>promotion</mark> opportunities.",
  "timestamp": "2024-03-20T10:04:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_3",
  "comment_text": "Career growth seems stagnant without promotion opportunities.",
  "topic": "Career Development",
  "description": "promotion NEAR career WITHIN 4 WORDS",
  "score": 0.8,
  "matched_terms": ["promotion", "career"],
  "max_gaps": 4,
  "ordered": false,
  "highlighted_text": "<mark>Career</mark> growth seems stagnant without <mark>promotion</mark> opportunities.",
  "timestamp": "2024-03-20T10:04:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "Internal transfers offer great opportunities for career development." }
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
}

Response:
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      {
        "_id": "career_1",
        "_score": 0.85,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "internal", "analyzer": "search_analyzer", "max_gaps": 3}},
                    {"match": {"query": "opportunity", "analyzer": "search_analyzer", "max_gaps": 3}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "<mark>Internal</mark> transfers offer great <mark>opportunities</mark> for career development."
          ]
        }
      },
      {
        "_id": "career_4",
        "_score": 0.7,
        "_source": {
          "topic": "Career Development",
          "description": "lack NEAR bacghr_career WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "lack", "analyzer": "search_analyzer", "max_gaps": 2}},
                    {"match": {"query": "bacghr_career", "analyzer": "search_analyzer", "max_gaps": 2}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "Internal transfers offer great opportunities for <mark>career</mark> development."
          ]
        }
      }
    ]
  }
}

# Store each rule match as separate document
POST /matched_comments/_doc
{
  "rule_id": "career_1",
  "comment_text": "Internal transfers offer great opportunities for career development.",
  "topic": "Career Development",
  "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
  "score": 0.85,
  "matched_terms": ["bacghr_career", "bacghr_opportunity"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "<mark>Internal</mark> transfers offer great <mark>opportunities</mark> for career development.",
  "timestamp": "2024-03-20T10:05:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_4",
  "comment_text": "Internal transfers offer great opportunities for career development.",
  "topic": "Career Development",
  "description": "lack NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.7,
  "matched_terms": ["lack", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "Internal transfers offer great opportunities for <mark>career</mark> development.",
  "timestamp": "2024-03-20T10:05:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "The new learning program supports employee growth and skill-building." }
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
}

Response:
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      {
        "_id": "career_2",
        "_score": 0.9,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "learning", "analyzer": "search_analyzer", "max_gaps": 5}},
                    {"match": {"query": "growth", "analyzer": "search_analyzer", "max_gaps": 5}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "The new <mark>learning</mark> program supports employee <mark>growth</mark> and skill-building."
          ]
        }
      },
      {
        "_id": "career_2",
        "_score": 0.75,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "match": {
                  "query": "learning growth",
                  "analyzer": "search_analyzer",
                  "ordered": true,
                  "max_gaps": 3
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "The new <mark>learning</mark> <mark>growth</mark> program supports employee skill-building."
          ]
        }
      }
    ]
  }
}

# Store each rule match as separate document
POST /matched_comments/_doc
{
  "rule_id": "career_2",
  "comment_text": "The new learning program supports employee growth and skill-building.",
  "topic": "Career Development",
  "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.9,
  "matched_terms": ["bacghr_learning", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "The new <mark>learning</mark> program supports employee <mark>growth</mark> and skill-building.",
  "timestamp": "2024-03-20T10:06:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_5",
  "comment_text": "The new learning program supports employee growth and skill-building.",
  "topic": "Career Development",
  "description": "skill NEAR development WITHIN 3 WORDS",
  "score": 0.75,
  "matched_terms": ["skill", "development"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "The new learning program supports employee growth and <mark>skill</mark>-building.",
  "timestamp": "2024-03-20T10:06:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "Our client was satisfied with the prompt assistance provided." }
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
}

Response:
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      {
        "_id": "client_1",
        "_score": 0.85,
        "_source": {
          "topic": "Client Support",
          "description": "bacghr_client NEAR bacghr_support WITHIN 5 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "client", "max_gaps": 5}},
                    {"match": {"query": "support", "max_gaps": 5}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "Our <mark>client</mark> was satisfied with the prompt <mark>assistance</mark> provided."
          ]
        }
      },
      {
        "_id": "client_2",
        "_score": 0.7,
        "_source": {
          "topic": "Client Support",
          "description": "client NEAR support WITHIN 5 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "client", "max_gaps": 4}},
                    {"match": {"query": "support", "max_gaps": 4}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "Our <mark>client</mark> was satisfied with the prompt assistance provided."
          ]
        }
      }
    ]
  }
}

# Store each rule match as separate document
POST /matched_comments/_doc
{
  "rule_id": "client_1",
  "comment_text": "Our client was satisfied with the prompt assistance provided.",
  "topic": "Client Support",
  "description": "bacghr_client NEAR bacghr_support WITHIN 5 WORDS",
  "score": 0.85,
  "matched_terms": ["bacghr_client", "bacghr_support"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "Our <mark>client</mark> was satisfied with the prompt <mark>assistance</mark> provided.",
  "timestamp": "2024-03-20T10:07:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "client_2",
  "comment_text": "Our client was satisfied with the prompt assistance provided.",
  "topic": "Client Support",
  "description": "client NEAR support WITHIN 5 WORDS",
  "score": 0.7,
  "matched_terms": ["client", "support"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "Our <mark>client</mark> was satisfied with the prompt assistance provided.",
  "timestamp": "2024-03-20T10:07:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "Orientation experience could be improved to reduce confusion." }
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
}

Response:
{
  "hits": {
    "total": { "value": 1, "relation": "eq" },
    "hits": [
      {
        "_id": "career_2",
        "_score": 0.95,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "match": {
                  "query": "orientation experience",
                  "analyzer": "search_analyzer",
                  "ordered": true,
                  "max_gaps": 2
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "<mark>Orientation</mark> <mark>experience</mark> could be improved to reduce confusion."
          ]
        }
      }
    ]
  }
}

# Store matched comment
POST /matched_comments/_doc
{
  "rule_id": "career_2",
  "comment_text": "Orientation experience could be improved to reduce confusion.",
  "topic": "Career Development",
  "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.95,
  "matched_terms": ["bacghr_learning", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "<mark>Orientation</mark> <mark>experience</mark> could be improved to reduce confusion.",
  "timestamp": "2024-03-20T10:08:00Z"
}

POST /comment_rules/_search
{ 
  "query": { 
    "percolate": {
      "field": "query",
      "document": { "comment_text": "IJP offers a good internal opportunity for advancement." }
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
}

Response:
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      {
        "_id": "career_1",
        "_score": 0.9,
        "_source": {
          "topic": "Career Development",
          "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "internal", "analyzer": "search_analyzer", "max_gaps": 3}},
                    {"match": {"query": "opportunity", "analyzer": "search_analyzer", "max_gaps": 3}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "IJP offers a good <mark>internal</mark> <mark>opportunity</mark> for advancement."
          ]
        }
      },
      {
        "_id": "career_1",
        "_score": 0.8,
        "_source": {
          "topic": "Career Development", 
          "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
          "query": {
            "intervals": {
              "comment_text": {
                "all_of": {
                  "ordered": false,
                  "intervals": [
                    {"match": {"query": "bacghr_internalmove", "analyzer": "search_analyzer", "max_gaps": 4}},
                    {"match": {"query": "departments", "analyzer": "search_analyzer", "max_gaps": 4}}
                  ]
                }
              }
            }
          }
        },
        "highlight": {
          "comment_text": [
            "IJP offers a good <mark>internal</mark> opportunity for advancement."
          ]
        }
      }
    ]
  }
}

# Store each rule match as separate document
POST /matched_comments/_doc
{
  "rule_id": "career_1",
  "comment_text": "IJP offers a good internal opportunity for advancement.",
  "topic": "Career Development",
  "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
  "score": 0.9,
  "matched_terms": ["bacghr_career", "bacghr_opportunity"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "IJP offers a good <mark>internal</mark> <mark>opportunity</mark> for advancement.",
  "timestamp": "2024-03-20T10:09:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_3",
  "comment_text": "IJP offers a good internal opportunity for advancement.",
  "topic": "Career Development",
  "description": "promotion NEAR career WITHIN 4 WORDS",
  "score": 0.8,
  "matched_terms": ["promotion", "career"],
  "max_gaps": 4,
  "ordered": false,
  "highlighted_text": "IJP offers a good internal opportunity for <mark>advancement</mark>.",
  "timestamp": "2024-03-20T10:09:00Z"
}

# Career Development Rules Matches

POST /matched_comments/_doc
{
  "rule_id": "career_1",
  "comment_text": "I want more career opportunities for growth and advancement.",
  "topic": "Career Development",
  "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
  "score": 0.8,
  "matched_terms": ["bacghr_career", "bacghr_opportunity"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "I want more <mark>career</mark> <mark>opportunities</mark> for growth and advancement.",
  "timestamp": "2024-03-20T10:10:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_2",
  "comment_text": "Learning is important for my career development and growth.",
  "topic": "Career Development",
  "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.8,
  "matched_terms": ["bacghr_learning", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "<mark>Learning</mark> is important for my <mark>career</mark> development and growth.",
  "timestamp": "2024-03-20T10:11:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_3",
  "comment_text": "I want promotion and advancement opportunities in my role.",
  "topic": "Career Development",
  "description": "promotion NEAR career WITHIN 4 WORDS",
  "score": 0.8,
  "matched_terms": ["promotion", "career"],
  "max_gaps": 4,
  "ordered": false,
  "highlighted_text": "I want <mark>promotion</mark> and <mark>advancement</mark> opportunities in my role.",
  "timestamp": "2024-03-20T10:12:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_4",
  "comment_text": "I need a clear career path to understand my future direction.",
  "topic": "Career Development",
  "description": "lack NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.8,
  "matched_terms": ["lack", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "I need a <mark>clear</mark> <mark>career path</mark> to understand my future direction.",
  "timestamp": "2024-03-20T10:13:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_5",
  "comment_text": "I need mentorship for my career development and guidance.",
  "topic": "Career Development",
  "description": "skill NEAR development WITHIN 3 WORDS",
  "score": 0.8,
  "matched_terms": ["skill", "development"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "I need <mark>mentorship</mark> for my <mark>career</mark> development and guidance.",
  "timestamp": "2024-03-20T10:14:00Z"
}

# Multiple Rule Matches - Same Comment Matching Multiple Rules

POST /matched_comments/_doc
{
  "rule_id": "client_1",
  "comment_text": "Client support and career development are both important to me.",
  "topic": "Client Support",
  "description": "bacghr_client NEAR bacghr_support WITHIN 5 WORDS",
  "score": 0.8,
  "matched_terms": ["bacghr_client", "bacghr_support"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "<mark>Client</mark> <mark>support</mark> and career development are both important to me.",
  "timestamp": "2024-03-20T10:25:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_2",
  "comment_text": "Client support and career development are both important to me.",
  "topic": "Career Development",
  "description": "bacghr_learning NEAR bacghr_career WITHIN 3 WORDS",
  "score": 0.8,
  "matched_terms": ["bacghr_learning", "bacghr_career"],
  "max_gaps": 3,
  "ordered": false,
  "highlighted_text": "Client <mark>support</mark> and <mark>career</mark> development are both important to me.",
  "timestamp": "2024-03-20T10:25:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "team_1",
  "comment_text": "Team collaboration helps with career growth and development.",
  "topic": "Team Collaboration",
  "description": "team NEAR collaboration WITHIN 4 WORDS",
  "score": 0.8,
  "matched_terms": ["team", "collaboration"],
  "max_gaps": 4,
  "ordered": false,
  "highlighted_text": "<mark>Team</mark> <mark>collaboration</mark> helps with career growth and development.",
  "timestamp": "2024-03-20T10:26:00Z"
}

POST /matched_comments/_doc
{
  "rule_id": "career_1",
  "comment_text": "Team collaboration helps with career growth and development.",
  "topic": "Career Development",
  "description": "bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS",
  "score": 0.8,
  "matched_terms": ["bacghr_career", "bacghr_opportunity"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "Team collaboration helps with <mark>career</mark> <mark>growth</mark> and development.",
  "timestamp": "2024-03-20T10:26:00Z"
}
