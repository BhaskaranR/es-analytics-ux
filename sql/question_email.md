✅ Summary of Work So Far
We've implemented a text analytics system using Elasticsearch with a percolator-based rule engine. Rules (stored in comment_rules) include proximity and synonym group logic via custom macros (word groups stored in word_groups). Comments are matched against these rules using percolation, and matched rule metadata is reattached to the comments for downstream use.

❓Key Questions for Elasticsearch Consultants
🔧 Architecture & Performance
Is percolator the best fit given we have static rules (~1.2K) and dynamic incoming documents (~1M)?

What are the performance tradeoffs between using percolator vs reverse matching (rules as search queries against bulk comments)?

How can we scale percolation across a large volume of documents efficiently — batching, parallelization, or ingestion pipelines?

🔁 Macro Expansion & Rule Maintenance
Can we maintain word groups (#macros) more dynamically without having to regenerate and reindex rules each time a macro changes?

Is there a way to store group logic in a shared field or external enrichment pipeline?

Can we automate or version-control rule regeneration when a word group is updated (maybe using transforms or watchers)?

💾 Data Flow & Indexing
What’s the best practice for re-indexing comments after they’ve been matched with percolator rules?

Should we enrich at ingest time, store separately, or decorate on-demand?

Can we use ingest pipelines or enrich processors to apply these rules dynamically instead of relying on app-side logic?

🧠 Advanced Features
Would using ELSER (Elastic Learned Sparse Encoder) or vector search improve matching accuracy for more semantic or fuzzy scenarios (like feedback interpretation)?

Are there better strategies to apply NEAR/WITHIN logic for multi-term proximity without maintaining custom span_near query generation ourselves?