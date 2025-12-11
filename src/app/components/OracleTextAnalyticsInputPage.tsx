'use client';

import React, { useState } from 'react';

import { callOracle } from '@/lib/oracle';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Separator } from '@/registry/new-york-v4/ui/separator';

import { toast } from 'sonner';

interface RuleMatch {
    RULE_ID: string;
    SCORE: number;
    TOPIC?: string;
    DESCRIPTION?: string;
    HIGHLIGHTED_TEXT?: string;
}

interface StoreResult {
    rule_id: string;
    topic?: string;
    status: string;
}

export default function OracleTextAnalyticsInputPage() {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [matchedRules, setMatchedRules] = useState<RuleMatch[]>([]);
    const [results, setResults] = useState<StoreResult[]>([]);

    // Store a single match in matched_comments table
    async function storeMatch(match: RuleMatch, commentText: string): Promise<StoreResult> {
        const highlightedText = match.HIGHLIGHTED_TEXT || commentText;

        // Store match in Oracle database
        await callOracle({
            operation: 'storeMatch',
            params: {
                rule_id: match.RULE_ID,
                comment_text: commentText,
                topic: match.TOPIC || 'Unknown',
                description: match.DESCRIPTION || '',
                score: match.SCORE || 0,
                highlighted_text: highlightedText,
                matched_terms: [] // Oracle Text doesn't provide matched terms extraction like ES
            }
        });

        return {
            rule_id: match.RULE_ID,
            topic: match.TOPIC || 'Unknown',
            status: 'created'
        };
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMatchedRules([]);
        setResults([]);

        try {
            // 1. Match comment against rules using Oracle Text
            const matches = await callOracle({
                operation: 'matchRules',
                params: {
                    comment_text: comment
                }
            });

            const ruleMatches: RuleMatch[] = matches || [];
            setMatchedRules(ruleMatches);

            if (ruleMatches.length === 0) {
                toast.info('No matching rules found', {
                    description: 'This comment did not match any rules.',
                    duration: 3000
                });
                setLoading(false);

                return;
            }

            // 2. Loop through each match and store in matched_comments table
            const postResults: StoreResult[] = [];

            for (const match of ruleMatches) {
                try {
                    const result = await storeMatch(match, comment);
                    postResults.push(result);
                } catch (matchError: any) {
                    console.error(`Error storing match for rule ${match.RULE_ID}:`, matchError);
                    postResults.push({
                        rule_id: match.RULE_ID,
                        topic: match.TOPIC || 'Unknown',
                        status: `Error: ${matchError.message || 'Failed to store'}`
                    });
                }
            }

            setResults(postResults);

            // Show success toast
            const successCount = postResults.filter((r) => !r.status.startsWith('Error')).length;
            if (successCount > 0) {
                toast.success(`Successfully stored ${successCount} match${successCount > 1 ? 'es' : ''}`, {
                    description: `Found ${ruleMatches.length} matching rule${ruleMatches.length > 1 ? 's' : ''} and stored in matched_comments table.`,
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
            console.error('Error during matching or storing:', err);
            const errorMessage = err.message || 'An error occurred during matching or storing matched comments.';
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
            <h2 className='mb-4 text-xl font-bold'>Text Analytics: Oracle Text Analysis</h2>
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
                    <h3 className='mb-4 text-lg font-semibold'>Matched Rules ({matchedRules.length}):</h3>
                    <div className='space-y-4'>
                        {matchedRules.map((rule) => {
                            const topic = rule.TOPIC || 'No topic';
                            const description = rule.DESCRIPTION || 'No description';
                            const highlightedText = rule.HIGHLIGHTED_TEXT || comment;
                            const ruleId = rule.RULE_ID;
                            const score = rule.SCORE || 0;

                            return (
                                <Card key={rule.RULE_ID} className='w-full'>
                                    <CardHeader>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex-1'>
                                                <div className='mb-2 flex items-center gap-2'>
                                                    <Badge variant='secondary' className='font-semibold'>
                                                        {topic}
                                                    </Badge>
                                                    <Badge variant='outline' className='font-mono text-xs'>
                                                        Score: {score.toFixed(2)}
                                                    </Badge>
                                                </div>
                                                <CardTitle className='text-base font-medium'>
                                                    Rule: <span className='font-mono text-sm'>{ruleId}</span>
                                                </CardTitle>
                                                {description && (
                                                    <CardDescription className='mt-1'>{description}</CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Separator className='mb-3' />
                                        <div>
                                            <p className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                                                Highlighted Match:
                                            </p>
                                            <div className='rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-800 [&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:px-1 [&_mark]:font-semibold dark:[&_mark]:bg-yellow-900'>
                                                <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
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
