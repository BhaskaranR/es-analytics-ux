#!/bin/bash


# Step 4: Match an incoming comment
# 1. Client Support related
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "The client support team was very responsive and helped resolve my issue quickly"
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
}'

# 2. Career Concerns
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "There is a lack of career development opportunities in my current role"
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
}'

# 3. Client Satisfaction
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "The client support team was very helpful"
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
}'

# 4. Learning and Growth
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "The learning and growth opportunities here are excellent"
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
}'

# 5. Team Collaboration
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "Our team collaboration has improved significantly over the past quarter"
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
}'

# 6. Career Progression
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "I am interested in career advancement and promotion opportunities"
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
}'

# 7. Client Help
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "The customer support team provided excellent assistance"
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
}'

# 8. Onboarding Feedback
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "The orientation experience was well organized and informative"
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
}'

# 9. Team Support
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "My team provided excellent help during the project implementation"
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
}'

# 10. Internal Movement
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "I would like to explore internal opportunities in other departments"
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
}'

# 11. Employee Training
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "The training session on new tools was very helpful"
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
}'

# 12. Onboarding Process
curl -X POST "localhost:9200/comment_rules/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "The onboarding process was smooth and well-structured"
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
}' 
