🔍 What That Blog Actually Covers
The article discusses vector-based similarity search, primarily used for:

Image similarity (ORD_IMAGE / ORD_DATA)

Audio/video metadata

Semantic similarity (via ML/embedding vectors)

Approximate nearest neighbors (ANN) with vector indexing

👉 Think: "Find documents most similar to this one" — not "Find if 'career' is within 5 words of 'growth'".

🧠 What You Are Looking For: Proximity Text Search
You're doing token-level word proximity matching, which is purely about position of words in a document.


Feature Type	Similarity Search	Oracle Text NEARn
Use Case	"Find similar meaning"	"Check if 2 words are N words apart"
Works on	Vectors, embeddings, feature spaces	Tokens in CLOB/text columns
Available in Oracle 19c	✅ With vector setup	❌ (no NEARn support)
Available in 23ai	✅ Advanced	✅ NEARn natively
✅ Your Realistic Options in Oracle 19c

Goal	Approach in Oracle 19c
Word within N words (NEARn)	❌ Not natively supported
Approximate proximity	Use NEAR + SCORE()
Manual proximity estimation	Tokenize + PL/SQL distance
Switch to Oracle 23ai	✅ Fully supported
Use Elasticsearch for proximity	✅ "career growth"~5
🔧 Recommendation
If NEARn is essential for your rule engine, you should:

❗Avoid relying on similarity search — it’s for vector AI-based matching

✅ Use Oracle Text NEAR + SCORE() for relevance

✅ Consider upgrading to Oracle 23ai for full syntax

✅ Or use Elasticsearch if upgrade isn’t possible