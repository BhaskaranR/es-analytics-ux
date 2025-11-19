'use client';

import React, { useState } from 'react';

import { callElasticsearch } from '@/lib/elasticsearch';

import { toast } from 'sonner';

interface RuleMatch {
    _id: string;
    _score: number;
    _source?: {
        topic?: string;
        description?: string;
        query?: any;
        [key: string]: any;
    };
    highlight?: {
        comment_text?: string[];
    };
}

interface StoreResult {
    rule_id: string;
    topic?: string;
    status: string;
}

// Extract matched terms from the query structure
function extractMatchedTerms(ruleSource: any): string[] {
    if (ruleSource.query?.intervals?.comment_text?.all_of?.intervals) {
        return ruleSource.query.intervals.comment_text.all_of.intervals
            .map((interval: any) => interval.match?.query)
            .filter(Boolean);
    }

    return [];
}

export default function TextAnalyticsInputPage() {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [matchedRules, setMatchedRules] = useState<RuleMatch[]>([]);
    const [results, setResults] = useState<StoreResult[]>([]);

    // Store a single match in matched_comments index
    async function storeMatch(match: RuleMatch, commentText: string): Promise<StoreResult> {
        const ruleSource = match._source || {};
        const highlightedText = match.highlight?.comment_text?.[0] || commentText;
        const matchedTerms = extractMatchedTerms(ruleSource);

        // Extract max_gaps and ordered from the query
        const maxGaps = ruleSource.query?.intervals?.comment_text?.all_of?.intervals?.[0]?.match?.max_gaps || 0;
        const ordered = ruleSource.query?.intervals?.comment_text?.all_of?.ordered || false;

        // Create document to store in matched_comments index
        const doc = {
            rule_id: match._id,
            comment_text: commentText,
            topic: ruleSource.topic || 'Unknown',
            description: ruleSource.description || '',
            score: match._score || 0,
            matched_terms: matchedTerms,
            max_gaps: maxGaps,
            ordered: ordered,
            highlighted_text: highlightedText,
            timestamp: new Date().toISOString()
        };

        // Store each match as a separate document in matched_comments index
        const postData = await callElasticsearch({
            endpoint: '/matched_comments/_doc',
            method: 'POST',
            body: doc
        });

        // Check for errors
        if (postData.error) {
            throw new Error(postData.error.reason || 'Failed to store match');
        }

        return {
            rule_id: match._id,
            topic: ruleSource.topic || 'Unknown',
            status: postData.result || 'created'
        };
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMatchedRules([]);
        setResults([]);

        try {
            // 1. Percolate: Find matching rules using percolation query
            const percolateData = await callElasticsearch({
                endpoint: '/comment_rules/_search',
                method: 'POST',
                body: {
                    query: {
                        percolate: {
                            field: 'query',
                            document: {
                                comment_text: comment
                            }
                        }
                    },
                    highlight: {
                        fields: {
                            comment_text: {
                                pre_tags: ['<mark>'],
                                post_tags: ['</mark>'],
                                fragment_size: 150,
                                number_of_fragments: 3
                            }
                        }
                    }
                }
            });

            // Check if there's an error in the response
            if (percolateData.error) {
                throw new Error(percolateData.error.reason || 'Percolation query failed');
            }

            const matches: RuleMatch[] = percolateData.hits?.hits || [];
            setMatchedRules(matches);

            if (matches.length === 0) {
                toast.info('No matching rules found', {
                    description: 'This comment did not match any rules.',
                    duration: 3000
                });
                setLoading(false);

                return;
            }

            // 2. Loop through each match and store in matched_comments index
            const postResults: StoreResult[] = [];

            for (const match of matches) {
                try {
                    const result = await storeMatch(match, comment);
                    postResults.push(result);
                } catch (matchError: any) {
                    console.error(`Error storing match for rule ${match._id}:`, matchError);
                    postResults.push({
                        rule_id: match._id,
                        topic: match._source?.topic || 'Unknown',
                        status: `Error: ${matchError.message || 'Failed to store'}`
                    });
                }
            }

            setResults(postResults);

            // Show success toast
            const successCount = postResults.filter((r) => !r.status.startsWith('Error')).length;
            if (successCount > 0) {
                toast.success(`Successfully stored ${successCount} match${successCount > 1 ? 'es' : ''}`, {
                    description: `Found ${matches.length} matching rule${matches.length > 1 ? 's' : ''} and stored in matched_comments index.`,
                    duration: 5000
                });
            }

            // Show warnings for any failures
            const errorCount = postResults.filter((r) => r.status.startsWith('Error')).length;
            if (errorCount > 0) {
                toast.warning(`Failed to store ${errorCount} match${errorCount > 1 ? 'es' : ''}`, {
                    description: 'Some matches could not be stored. Please check the details below.',
                    duration: 5000
                });
            }
        } catch (err: any) {
            console.error('Error during percolation or storing:', err);
            const errorMessage = err.message || 'An error occurred during percolation or storing matched comments.';
            toast.error('Operation failed', {
                description: errorMessage,
                duration: 5000
            });
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
                                <span className={res.status.startsWith('Error') ? 'text-red-600' : 'text-green-600'}>
                                    {res.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
