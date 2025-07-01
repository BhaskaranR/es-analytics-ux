✅ 2. Update and Re-index the comment with rule references
After retrieving the rule IDs (e.g., ["1", "5"]), you can re-index or update the comment document like so:

🟩 Option A: Update the existing document
json
Copy
Edit
POST /comments/_update/<comment_id>
{
  "doc": {
    "matched_rules": ["1", "5"]
  }
}
🟦 Option B: Re-index the document to a new index with additional metadata
json
Copy
Edit
POST /comments_classified/_doc
{
  "comment_text": "The onboarding process was very helpful.",
  "matched_rules": ["4"],
  "timestamp": "2025-05-12T15:00:00Z"
}
