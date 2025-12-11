# Text Analytics with Elasticsearch - Presentation Guide

## 🎯 Overview

A modern Next.js application that leverages Elasticsearch's **Percolator** feature to analyze and categorize text comments in real-time using intelligent rule matching with synonyms and proximity searches.

---

## 🏗️ System Architecture

### Core Components

1. **Frontend (Next.js App Router)**
   - Modern React UI with shadcn/ui components
   - Real-time comment analysis
   - Interactive rules builder
   - Visual feedback with highlighted matches

2. **Backend API Proxy**
   - Secure Elasticsearch communication
   - Handles authentication (API Key / Basic Auth)
   - SSL/TLS support for cloud instances

3. **Elasticsearch Indices**
   - `comment_rules` - Percolator index storing matching rules
   - `matched_comments` - Stores analyzed comments with rule matches

---

## ✨ Key Features

### 1. **Text Analytics Input Page** (`/examples`)
   - **Live Comment Analysis**: Enter comments and get instant rule matching
   - **Percolation Search**: Real-time matching against all stored rules
   - **Rich Display**: Shows topic, rule details, and highlighted matched text
   - **Automatic Storage**: Stores matches in `matched_comments` index

### 2. **Text Analytics Dashboard** (`/`)
   - **Topic-Based Analysis**: View comments organized by topics
   - **Rule Management**: Browse and manage matching rules
   - **Advanced Search**: Filter comments by rule, topic, or text
   - **Real-time Counts**: Total matches and unique comment counts

### 3. **Rules Builder** (`/rules-builder`)
   - **Dynamic Rule Creation**: Build Elasticsearch percolator rules via UI
   - **Query Types**: Intervals, Match, Multi-Match, Boolean queries
   - **Synonym Support**: Leverages word groups for flexible matching
   - **Preview & Test**: See query JSON before saving

### 4. **Reverse Percolator** (`/reverse-percolator`)
   - **Rule Testing**: Test new rules against existing comments
   - **Pre-match Validation**: Verify rules before deploying

---

## 🔍 How It Works

### 1. Rule Matching Process

```
Comment Input
    ↓
Percolation Query → Elasticsearch Percolator
    ↓
Matches Rules (with scores)
    ↓
Extract Metadata (matched terms, highlights)
    ↓
Store in matched_comments index
```

### 2. Percolation Query Example

```json
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "comment_text": "I need support from the client"
      }
    }
  },
  "highlight": {
    "fields": {
      "comment_text": {
        "pre_tags": ["<mark>"],
        "post_tags": ["</mark>"]
      }
    }
  }
}
```

### 3. Rule Structure

Rules use **Interval Queries** with:
- **Synonym Groups**: `hr_client`, `hr_support`, `hr_career`, etc.
- **Proximity Matching**: `max_gaps` parameter (words within distance)
- **Order Flexibility**: `ordered: false` for flexible matching

Example Rule:
```json
{
  "topic": "Client Support",
  "description": "Comments about client support issues",
  "query": {
    "intervals": {
      "comment_text": {
        "all_of": {
          "ordered": false,
          "intervals": [
            {"match": {"query": "hr_client", "analyzer": "search_analyzer", "max_gaps": 5}},
            {"match": {"query": "hr_support", "analyzer": "search_analyzer", "max_gaps": 5}}
          ]
        }
      }
    }
  }
}
```

---

## 🎨 UI Highlights

### Text Analytics Input Page Features

1. **Clean Interface**
   - Large text area for comment input
   - Loading states with disabled controls
   - Real-time feedback

2. **Match Display Cards**
   - **Topic Badge**: Color-coded topic identification
   - **Score Badge**: Relevance score display
   - **Rule ID**: Unique identifier in monospace font
   - **Description**: Rule explanation
   - **Highlighted Text**: Matched portions with yellow highlighting
   - **Multiple Fragments**: Shows all highlighted matches

3. **Success/Error Feedback**
   - Toast notifications for operations
   - Detailed error messages
   - Success counts

### Example Display

```
Matched Rules (2):

┌─────────────────────────────────────┐
│ [Client Support]  [Score: 1.50]    │
│ Rule: rule-123-abc                  │
│ Comments about client support       │
│ ─────────────────────────────────── │
│ Highlighted Match:                  │
│ I need <mark>support</mark> from   │
│ the <mark>client</mark>             │
└─────────────────────────────────────┘
```

---

## 📊 Data Flow

### Comment Processing Flow

1. **Input**: User enters comment via UI
2. **Percolation**: Query sent to `comment_rules/_search` with percolate query
3. **Matching**: Elasticsearch returns matching rules with scores
4. **Enrichment**: Extract metadata (matched terms, highlights, topic)
5. **Storage**: Create documents in `matched_comments` index
6. **Feedback**: Display results to user with visual highlights

### Stored Document Structure

```json
{
  "rule_id": "rule-123-abc",
  "comment_text": "Original comment text",
  "topic": "Client Support",
  "description": "Rule description",
  "score": 1.5,
  "matched_terms": ["support", "client"],
  "max_gaps": 5,
  "ordered": false,
  "highlighted_text": "I need <mark>support</mark> from the <mark>client</mark>",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔧 Technical Features

### 1. Security
- ✅ API proxy (no direct Elasticsearch access from client)
- ✅ Environment-based authentication
- ✅ SSL/TLS support for cloud instances

### 2. Error Handling
- ✅ Per-match error handling (one failure doesn't block others)
- ✅ User-friendly error messages
- ✅ Toast notifications for all operations

### 3. Performance
- ✅ Efficient percolation queries
- ✅ Highlighting for visual feedback
- ✅ Bulk operations for batch processing

### 4. Flexibility
- ✅ Supports multiple query types
- ✅ Synonym group expansion
- ✅ Configurable proximity matching
- ✅ Ordered/unordered matching

---

## 📈 Use Cases

1. **Employee Feedback Analysis**
   - Categorize survey responses
   - Identify common themes
   - Track sentiment by topic

2. **Customer Comments Processing**
   - Auto-categorize support tickets
   - Extract key topics from reviews
   - Monitor feedback trends

3. **Content Moderation**
   - Match against policy rules
   - Flag inappropriate content
   - Automated categorization

---

## 🚀 Demo Flow

### Suggested Presentation Flow

1. **Introduction** (2 min)
   - Problem: Manual comment analysis is slow and inconsistent
   - Solution: Automated rule-based matching with Elasticsearch

2. **Live Demo - Text Analytics Input** (5 min)
   - Enter sample comment: "I need help from the customer support team"
   - Show real-time percolation matching
   - Display matched rules with highlights
   - Explain storage process

3. **Rules Builder Demo** (3 min)
   - Show rule creation interface
   - Create a simple rule
   - Test it with the input page

4. **Dashboard Walkthrough** (3 min)
   - Show topic-based organization
   - Filter by rules
   - View matched comments

5. **Technical Deep Dive** (5 min)
   - Explain percolator concept
   - Show synonym groups
   - Discuss interval queries
   - Performance considerations

6. **Q&A** (5 min)

---

## 💡 Key Talking Points

1. **Percolator is Perfect For**:
   - Static rules, dynamic documents
   - Real-time matching requirements
   - Rule-based categorization

2. **Synonym Groups Enable**:
   - Flexible matching (client = customer = user)
   - Maintainable word groups
   - Consistent categorization

3. **Interval Queries Provide**:
   - Proximity matching (words within X distance)
   - Order flexibility
   - Phrase-like matching with gaps

4. **Modern UI Benefits**:
   - Easy to use for non-technical users
   - Visual feedback improves understanding
   - Real-time results enhance productivity

---

## 📝 Sample Comments for Demo

1. **Career Development**:
   - "I want to grow in my career and get promoted"
   - "Career development opportunities are important"

2. **Client Support**:
   - "The client needs more support from our team"
   - "Customer service was helpful during the issue"

3. **Team Collaboration**:
   - "Great teamwork and collaboration on the project"
   - "The team worked together effectively"

4. **Internal Transfer**:
   - "I'm interested in an internal transfer"
   - "Lateral movement opportunities would be great"

---

## 🔗 Navigation Structure

```
/                          → Text Analytics Dashboard
/examples                  → New Comment Analysis (TextAnalyticsInputPage)
/rules-builder             → Rules Builder
/reverse-percolator        → Reverse Percolator Testing
```

---

## 🎯 Success Metrics

- **Speed**: Real-time matching (< 100ms per comment)
- **Accuracy**: Precise rule matching with relevance scores
- **Scalability**: Handles ~1.2K rules, ~1M comments
- **Usability**: Intuitive UI for non-technical users

---

## 📦 Technical Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Search**: Elasticsearch (Percolator feature)
- **Notifications**: Sonner (toast notifications)

---

## 🔐 Environment Setup

```bash
ELASTICSEARCH_HOST=your-host:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password
ELASTICSEARCH_API_KEY=your-api-key  # For cloud instances
NODE_TLS_REJECT_UNAUTHORIZED=0  # Development only
```

---

## 📸 Screenshot Locations

Check `public/images/` for existing screenshots:
- `screenshot1.png`
- `screenshot2.png`

Consider adding screenshots of:
1. Text Analytics Input Page with matched rules
2. Rules Builder interface
3. Dashboard with topic view
4. Highlighted match display

---

## 🎬 Demo Script Example

**"Let me show you how this works in real-time..."**

1. Navigate to `/examples`
2. Enter comment: "I need support from the client team"
3. Click "Analyze & Store"
4. **Show**: Matching animation
5. **Explain**: "Elasticsearch is running percolation queries against all ~1,200 rules"
6. **Display**: Matched rules appear with:
   - Topic badge (Client Support)
   - Score (relevance)
   - Highlighted text showing exact matches
7. **Explain**: "The system automatically stores this match in the `matched_comments` index"
8. **Show**: Success toast with match count
9. **Navigate**: Show the match in the dashboard under "Client Support" topic

---

Good luck with your presentation! 🚀


