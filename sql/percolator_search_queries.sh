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
  }
}' 
