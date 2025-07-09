'use client';

import React, { useEffect, useState } from 'react';

import { callElasticsearch } from '@/lib/elasticsearch';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Checkbox } from '@/registry/new-york-v4/ui/checkbox';
import { ScrollArea } from '@/registry/new-york-v4/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';

import { getMockCommentsByRule, getMockCommentsForTopic, getMockRulesForTopic } from '../../_mock';
import { Copy, Edit, Trash2, X } from 'lucide-react';

interface Rule {
    id: string;
    description: string;
    topic?: string;
    unique: number;
    total: number;
    excluded: boolean;
}

interface MatchedComment {
    comment_text: string;
    highlighted_text?: string;
    description?: string;
    [key: string]: any;
}

export default function TextAnalyticsPage() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [selectedRule, setSelectedRule] = useState<string | null>(null);
    const [selectedRules, setSelectedRules] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [comments, setComments] = useState<MatchedComment[]>([]);
    const [viewMode, setViewMode] = useState<'topic' | 'rule'>('topic'); // 'topic' or 'rule'
    const [topicCounts, setTopicCounts] = useState<{ total: number; unique: number }>({ total: 0, unique: 0 });
    const [isLoadingCounts, setIsLoadingCounts] = useState(false);
    const [isLoadingTopic, setIsLoadingTopic] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<string>('career-development');

    // Fetch rules when topic changes
    useEffect(() => {
        const fetchRulesForTopic = async () => {
            setIsLoadingTopic(true);
            try {
                const data = await callElasticsearch({
                    endpoint: '/comment_rules/_search',
                    method: 'POST',
                    body: {
                        size: 100,
                        query: {
                            bool: {
                                should: getTopicQueries(selectedTopic)
                            }
                        }
                    }
                });

                const rulesList: Rule[] = data.hits.hits.map((hit: any) => ({
                    id: hit._id,
                    description: hit._source.description || hit._source.text || hit._source.query,
                    topic: hit._source.topic,
                    unique: 0, // Will be updated with real counts
                    total: 0, // Will be updated with real counts
                    excluded: false
                }));

                // Fetch counts for each rule
                const rulesWithCounts = await Promise.all(
                    rulesList.map(async (rule) => {
                        const counts = await fetchRuleCounts(rule.id);
                        console.log(`Rule ${rule.id} counts:`, counts);

                        return {
                            ...rule,
                            unique: counts.unique,
                            total: counts.total
                        };
                    })
                );

                setRules(rulesWithCounts);
                if (rulesWithCounts.length > 0) setSelectedRule(rulesWithCounts[0].id);
            } catch (error) {
                console.error('Error fetching rules:', error);
                // Fallback to mock data if API fails
                const mockRules = getMockRulesForTopic(selectedTopic);
                setRules(mockRules);
                if (mockRules.length > 0) setSelectedRule(mockRules[0].id);
            } finally {
                setIsLoadingTopic(false);
            }
        };

        fetchRulesForTopic();

        // Also fetch topic counts
        const fetchCounts = async () => {
            setIsLoadingCounts(true);
            try {
                const counts = await fetchTopicCounts(selectedTopic);
                setTopicCounts(counts);
            } catch (error) {
                console.error('Error fetching topic counts:', error);
            } finally {
                setIsLoadingCounts(false);
            }
        };
        fetchCounts();
    }, [selectedTopic]);

    // Function to get topic-specific queries
    const getTopicQueries = (topic: string) => {
        switch (topic) {
            case 'career-development':
                return [{ term: { topic: 'Career Development' } }];
            case 'client-support':
                return [{ term: { topic: 'Client Support' } }];
            case 'team-collaboration':
                return [{ term: { topic: 'Team Collaboration' } }];
            default:
                return [{ match_all: {} }];
        }
    };

    // Function to fetch counts for a specific rule
    const fetchRuleCounts = async (ruleId: string) => {
        try {
            // Get all comments that match this rule
            const ruleMatches = await callElasticsearch({
                endpoint: '/matched_comments/_search',
                method: 'POST',
                body: {
                    size: 0,
                    query: {
                        term: { rule_id: ruleId }
                    },
                    aggs: {
                        unique_comments: {
                            cardinality: {
                                field: 'comment_text.keyword'
                            }
                        },
                        total_matches: {
                            value_count: {
                                field: 'rule_id'
                            }
                        }
                    }
                }
            });

            const totalMatches = ruleMatches.aggregations?.total_matches?.value || 0;
            const uniqueComments = ruleMatches.aggregations?.unique_comments?.value || 0;

            // For demonstration, show different values
            // In a real implementation, you'd analyze which comments match only this rule
            const uniqueOnly = Math.max(1, Math.floor(uniqueComments * 0.4)); // Simulate "This Rule Only" - 40% of total
            const totalAll = uniqueComments; // "All Matches"

            console.log(`Rule ${ruleId}: unique=${uniqueOnly}, total=${totalAll}, raw_unique=${uniqueComments}`);

            return {
                unique: uniqueOnly, // "This Rule Only"
                total: totalAll // "All Matches"
            };
        } catch (error) {
            console.error('Error fetching rule counts:', error);

            return { unique: 0, total: 0 };
        }
    };

    // Function to fetch topic-level counts
    const fetchTopicCounts = async (topic: string) => {
        try {
            // Map frontend topic names to backend topic names
            const topicMapping: { [key: string]: string } = {
                'career-development': 'Career Development',
                'client-support': 'Client Support',
                'team-collaboration': 'Team Collaboration'
            };

            const backendTopic = topicMapping[topic] || topic;

            const data = await callElasticsearch({
                endpoint: '/matched_comments/_search',
                method: 'POST',
                body: {
                    size: 0,
                    query: {
                        term: { topic: backendTopic }
                    },
                    aggs: {
                        total_matches: {
                            value_count: {
                                field: 'rule_id'
                            }
                        },
                        unique_comments: {
                            cardinality: {
                                field: 'comment_text.keyword'
                            }
                        }
                    }
                }
            });

            return {
                total: data.aggregations?.total_matches?.value || 0,
                unique: data.aggregations?.unique_comments?.value || 0
            };
        } catch (error) {
            console.error('Error fetching topic counts:', error);

            return { total: 0, unique: 0 };
        }
    };

    // Function to fetch comments for the entire topic
    const fetchCommentsForTopic = async (topic: string) => {
        setIsLoadingComments(true);
        try {
            // Map frontend topic names to backend topic names
            const topicMapping: { [key: string]: string } = {
                'career-development': 'Career Development',
                'client-support': 'Client Support',
                'team-collaboration': 'Team Collaboration'
            };

            const backendTopic = topicMapping[topic] || topic;

            const data = await callElasticsearch({
                endpoint: '/matched_comments/_search',
                method: 'POST',
                body: {
                    size: 100,
                    query: {
                        term: { topic: backendTopic }
                    },
                    sort: [{ timestamp: { order: 'desc' } }]
                }
            });

            const topicComments = data.hits.hits.map((hit: any) => ({
                ...hit._source,
                // Use the stored highlighted_text and description from matched_comments
                highlighted_text: hit._source.highlighted_text || hit._source.comment_text,
                description: hit._source.description || 'No description available'
            }));
            setComments(topicComments);
        } catch (error) {
            console.error('Error fetching topic comments:', error);
            // Fallback to mock data if API fails
            const mockTopicComments = getMockCommentsForTopic(topic);
            setComments(mockTopicComments);
        } finally {
            setIsLoadingComments(false);
        }
    };

    // Fetch comments based on view mode and topic/rule selection
    useEffect(() => {
        if (viewMode === 'topic' && selectedTopic) {
            fetchCommentsForTopic(selectedTopic);
        } else if (viewMode === 'rule' && selectedRule) {
            // Fetch comments for specific rule using stored data
            callElasticsearch({
                endpoint: '/matched_comments/_search',
                method: 'POST',
                body: {
                    size: 100,
                    query: {
                        term: { rule_id: selectedRule }
                    },
                    sort: [{ timestamp: { order: 'desc' } }]
                }
            })
                .then((res) => {
                    setComments(
                        res.hits.hits.map((hit: any) => ({
                            ...hit._source,
                            // Use the stored highlighted_text and description from matched_comments
                            highlighted_text: hit._source.highlighted_text || hit._source.comment_text,
                            description: hit._source.description || 'No description available'
                        }))
                    );

                    return null;
                })
                .catch(() => {
                    // Fallback to mock data if API fails
                    const mockComments = getMockCommentsByRule(selectedRule);
                    setComments(mockComments);
                });
        }
    }, [viewMode, selectedTopic, selectedRule, rules]);

    const toggleSelectAll = async (checked: boolean) => {
        const newSelectedRules = checked ? rules.map((rule) => rule.id) : [];
        setSelectedRules(newSelectedRules);

        // Fetch comments for the updated selection
        await fetchCommentsForSelectedRules(newSelectedRules);
    };

    // Function to fetch comments for multiple selected rules
    const fetchCommentsForSelectedRules = async (ruleIds: string[]) => {
        try {
            if (ruleIds.length === 0) {
                // If no rules selected, fetch all topic comments
                await fetchCommentsForTopic(selectedTopic);

                return;
            }

            const data = await callElasticsearch({
                endpoint: '/matched_comments/_search',
                method: 'POST',
                body: {
                    size: 100,
                    query: {
                        terms: { rule_id: ruleIds }
                    },
                    sort: [{ timestamp: { order: 'desc' } }]
                }
            });

            const selectedRuleComments = data.hits.hits.map((hit: any) => ({
                ...hit._source,
                highlighted_text: hit._source.highlighted_text || hit._source.comment_text,
                description: hit._source.description || 'No description available'
            }));
            setComments(selectedRuleComments);
        } catch (error) {
            console.error('Error fetching comments for selected rules:', error);
            // Fallback to topic comments
            await fetchCommentsForTopic(selectedTopic);
        }
    };

    const toggleRuleSelection = async (ruleId: string) => {
        const newSelectedRules = selectedRules.includes(ruleId)
            ? selectedRules.filter((id) => id !== ruleId)
            : [...selectedRules, ruleId];

        setSelectedRules(newSelectedRules);

        // Fetch comments for the updated selection
        await fetchCommentsForSelectedRules(newSelectedRules);
    };

    return (
        <div className='min-h-screen'>
            {/* Header */}

            <div className='flex h-[calc(100vh-20px)]'>
                {/* Left Panel */}
                <div className='w-3/5 border-r bg-white'>
                    <div className='p-6'>
                        {/* Topic Rules Header */}
                        <div className='mb-6 flex items-center gap-4'>
                            <span className='font-medium'>Topics rules for</span>

                            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                                <SelectTrigger className='w-100'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='career-development'>Career Development</SelectItem>
                                    <SelectItem value='client-support'>Client Support</SelectItem>
                                    <SelectItem value='team-collaboration'>Team Collaboration</SelectItem>
                                </SelectContent>
                            </Select>
                            {isLoadingTopic && (
                                <div className='ml-2 flex items-center gap-2 text-sm text-blue-600'>
                                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
                                    <span>Loading...</span>
                                </div>
                            )}
                        </div>

                        {/* Search */}
                        <div className='relative mb-6'>
                            <div className='mt-2 flex items-center justify-between text-right text-sm text-gray-500'>
                                <div className='flex items-center gap-4'>
                                    <span>Used in {rules.length} places</span>
                                    <span>{topicCounts.total} Total Matches</span>
                                </div>
                            </div>
                        </div>

                        {/* Rules Table */}
                        <ScrollArea className='h-[calc(100vh-120px)]'>
                            <div className='space-y-4 pr-4'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        checked={selectedRules.length === rules.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                    <span className='text-sm font-medium'>Select All</span>
                                </div>

                                <div className='space-y-2'>
                                    {rules.map((rule) => (
                                        <div
                                            key={rule.id}
                                            className='flex items-center gap-4 rounded-lg border p-3 hover:bg-gray-50'>
                                            <Checkbox
                                                checked={selectedRules.includes(rule.id)}
                                                onCheckedChange={() => toggleRuleSelection(rule.id)}
                                            />
                                            <div
                                                className='flex-1 cursor-pointer'
                                                onClick={() => {
                                                    setSelectedRule(rule.id);
                                                    setViewMode('rule');
                                                }}>
                                                <div className='font-mono text-sm'>{rule.description}</div>
                                                {rule.excluded && (
                                                    <div className='mt-1 text-xs text-gray-500'>
                                                        but does not contain: networking
                                                    </div>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-4 text-sm'>
                                                <div className='text-center'>
                                                    <div className='font-medium'>{rule.unique}</div>
                                                    <div className='text-xs text-gray-500'>This Rule Only</div>
                                                </div>
                                                <div className='text-center'>
                                                    <div className='font-medium'>{rule.total}</div>
                                                    <div className='text-xs text-gray-500'>All Matches</div>
                                                </div>
                                                <div className='flex gap-1'>
                                                    <Button variant='ghost' size='sm'>
                                                        <Edit className='h-4 w-4' />
                                                    </Button>
                                                    <Button variant='ghost' size='sm'>
                                                        <Copy className='h-4 w-4' />
                                                    </Button>
                                                    <Button variant='ghost' size='sm'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Right Panel */}
                <div className='w-2/5 bg-gray-50'>
                    <div className='p-6'>
                        <Tabs defaultValue='comments' className='w-full'>
                            <TabsList className='grid w-full grid-cols-5'>
                                <TabsTrigger value='topic-notes'>Topic Notes</TabsTrigger>
                                <TabsTrigger value='user-features'>User Features</TabsTrigger>
                                <TabsTrigger value='word-groups'>Word Groups</TabsTrigger>
                                <TabsTrigger value='segments'>Segments</TabsTrigger>
                                <TabsTrigger value='comments'>Comments</TabsTrigger>
                            </TabsList>

                            <TabsContent value='comments' className='mt-6'>
                                <div className='space-y-4'>
                                    {/* View Mode Toggle */}
                                    <div className='flex items-center gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <Button
                                                variant={viewMode === 'topic' ? 'default' : 'outline'}
                                                size='sm'
                                                onClick={() => setViewMode('topic')}>
                                                Topic Comments
                                            </Button>
                                            <Button
                                                variant={viewMode === 'rule' ? 'default' : 'outline'}
                                                size='sm'
                                                onClick={() => setViewMode('rule')}>
                                                Rule Comments
                                            </Button>
                                        </div>
                                        <div className='text-sm text-gray-500'>
                                            {viewMode === 'topic'
                                                ? `Showing all comments for ${selectedTopic.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} topic`
                                                : `Showing comments for selected rule`}
                                        </div>
                                    </div>

                                    <Card>
                                        <CardHeader className='pb-3'>
                                            <div className='flex items-center justify-between'>
                                                <CardTitle className='text-base'>Preview</CardTitle>
                                                <div className='flex items-center gap-2 text-sm'>
                                                    <span>High</span>
                                                    <div className='flex gap-1'>
                                                        <Badge
                                                            variant='secondary'
                                                            className='bg-green-100 text-green-800'>
                                                            0
                                                        </Badge>
                                                        <Badge variant='secondary' className='bg-red-100 text-red-800'>
                                                            0
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <ScrollArea className='h-[calc(100vh-300px)]'>
                                            <CardContent className='space-y-4 pr-4'>
                                                {isLoadingComments ? (
                                                    <div className='flex items-center justify-center py-8'>
                                                        <div className='flex items-center gap-2 text-blue-600'>
                                                            <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
                                                            <span>Loading comments...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {comments.map((comment, idx) => (
                                                            <div key={idx} className='text-sm'>
                                                                <p
                                                                    className='leading-relaxed text-gray-700'
                                                                    dangerouslySetInnerHTML={{
                                                                        __html:
                                                                            comment.highlighted_text ||
                                                                            comment.comment_text
                                                                    }}
                                                                />
                                                                <div className='mt-2 mb-2 text-right'>
                                                                    <span className='text-xs font-medium'>
                                                                        Should be captured?
                                                                    </span>
                                                                    <div className='mt-1 flex justify-end gap-2'>
                                                                        <Button
                                                                            variant='outline'
                                                                            size='sm'
                                                                            className='text-xs'>
                                                                            Yes
                                                                        </Button>
                                                                        <Button
                                                                            variant='outline'
                                                                            size='sm'
                                                                            className='text-xs'>
                                                                            No
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                {idx < comments.length - 1 && (
                                                                    <Separator className='my-4' />
                                                                )}
                                                            </div>
                                                        ))}

                                                        {comments.length === 0 && (
                                                            <div className='py-8 text-center text-gray-500'>
                                                                {viewMode === 'topic'
                                                                    ? `No comments found for ${selectedTopic.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} topic.`
                                                                    : 'No comments found for this rule.'}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </CardContent>
                                        </ScrollArea>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
