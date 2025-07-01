'use client';
import React, { useState } from 'react';

const ELASTIC_URL = 'http://<elasticsearch-host>:9200'; // Replace with your ES host

interface RuleMatch {
  _id: string;
  _score: number;
  _source?: {
    topic?: string;
    [key: string]: any;
  };
}

interface StoreResult {
  rule_id: string;
  topic?: string;
  status: string;
}

export default function TextAnalyticsInputPage() {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchedRules, setMatchedRules] = useState<RuleMatch[]>([]);
  const [results, setResults] = useState<StoreResult[]>([]);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMatchedRules([]);
    setResults([]);
    setError('');
    try {
      // 1. Percolate: Find matching rules
      const percolateRes = await fetch(`${ELASTIC_URL}/comment_rules/_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: {
            percolate: {
              field: 'query',
              document: { comment_text: comment },
            },
          },
        }),
      });
      const percolateData = await percolateRes.json();
      const matches: RuleMatch[] = percolateData.hits?.hits || [];
      setMatchedRules(matches);

      // 2. For each match, POST to matched_comments/_doc (flat)
      const postResults: StoreResult[] = [];
      for (const match of matches) {
        const doc = {
          rule_id: match._id,
          comment_text: comment,
          topic: match._source?.topic,
          score: match._score,
          matched_terms: [], // You may want to extract matched terms if available
          timestamp: new Date().toISOString(),
        };
        const postRes = await fetch(`${ELASTIC_URL}/matched_comments/_doc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doc),
        });
        const postData = await postRes.json();
        postResults.push({ rule_id: match._id, topic: match._source?.topic, status: postData.result || postData });
      }
      setResults(postResults);
    } catch (err) {
      setError('Error during percolation or storing matched comments.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6  rounded shadow">
      <h2 className="font-bold text-xl mb-4">Text Analytics: Percolate Comment</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border rounded p-2 mb-4 min-h-[100px]"
          placeholder="Enter a comment to analyze..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading || !comment.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze & Store'}
        </button>
      </form>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {matchedRules.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Matched Rules:</h3>
          <ul className="list-disc ml-6">
            {matchedRules.map(rule => (
              <li key={rule._id}>
                <span className="font-mono text-sm">{rule._id}</span> - <span>{rule._source?.topic || 'No topic'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Store Results:</h3>
          <ul className="list-disc ml-6">
            {results.map((res, idx) => (
              <li key={idx}>
                Rule <span className="font-mono">{res.rule_id}</span> ({res.topic}): <span className="text-green-600">{res.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 