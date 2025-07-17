'use client';

import React, { useEffect, useState } from 'react';

import { makeRequest } from '../../utils/api';
import { toast } from 'sonner';

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

    // Example useEffect with toast error handling
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const result = await makeRequest<any>({
                    endpoint: '/api/initial-data',
                    method: 'GET',
                    authToken: 'your-auth-token' // optional
                });

                if (result.ok) {
                    console.log('Data loaded successfully:', result.data);
                } else {
                    // Show error toast with actual error message from API
                    const errorMessage = result.error.message || 'Unknown error occurred';
                    const errorDetails = result.error.details
                        ? Object.entries(result.error.details)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')
                        : undefined;

                    toast.error(`Request failed: ${errorMessage}`, {
                        description: errorDetails || 'Please try again later.',
                        duration: 5000
                    });
                }
            } catch (err) {
                // Handle unexpected errors
                toast.error('Network error occurred', {
                    description: 'Please check your connection and try again.',
                    duration: 5000
                });
            }
        };

        fetchInitialData();
    }, []);

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
                            document: { comment_text: comment }
                        }
                    }
                })
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
                    timestamp: new Date().toISOString()
                };
                const postRes = await fetch(`${ELASTIC_URL}/matched_comments/_doc`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doc)
                });
                const postData = await postRes.json();
                postResults.push({
                    rule_id: match._id,
                    topic: match._source?.topic,
                    status: postData.result || postData
                });
            }
            setResults(postResults);
        } catch (err) {
            setError('Error during percolation or storing matched comments.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='mx-auto mt-10 max-w-xl rounded p-6 shadow'>
            <h2 className='mb-4 text-xl font-bold'>Text Analytics: Percolate Comment</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    className='mb-4 min-h-[100px] w-full rounded border p-2'
                    placeholder='Enter a comment to analyze...'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
                <button
                    type='submit'
                    className='rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50'
                    disabled={loading || !comment.trim()}>
                    {loading ? 'Analyzing...' : 'Analyze & Store'}
                </button>
            </form>
            {error && <div className='mt-4 text-red-500'>{error}</div>}
            {matchedRules.length > 0 && (
                <div className='mt-6'>
                    <h3 className='mb-2 font-semibold'>Matched Rules:</h3>
                    <ul className='ml-6 list-disc'>
                        {matchedRules.map((rule) => (
                            <li key={rule._id}>
                                <span className='font-mono text-sm'>{rule._id}</span> -{' '}
                                <span>{rule._source?.topic || 'No topic'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {results.length > 0 && (
                <div className='mt-6'>
                    <h3 className='mb-2 font-semibold'>Store Results:</h3>
                    <ul className='ml-6 list-disc'>
                        {results.map((res, idx) => (
                            <li key={idx}>
                                Rule <span className='font-mono'>{res.rule_id}</span> ({res.topic}):{' '}
                                <span className='text-green-600'>{res.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
