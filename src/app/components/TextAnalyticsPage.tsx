'use client';

import React, { useEffect, useState } from 'react';

import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Checkbox } from '@/registry/new-york-v4/ui/checkbox';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';

import { getMockCommentsByRule, getMockCommentsForTopic, getMockRulesForTopic } from '../../_mock';
import { Copy, Edit, Search, Trash2, X } from 'lucide-react';

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

    const [selectedTopic, setSelectedTopic] = useState<string>('career-development');

    // Fetch rules when topic changes
    useEffect(() => {
        const fetchRulesForTopic = async () => {
            try {
                const response = await fetch('http://<elasticsearch-host>:9200/comment_rules/_search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        size: 100,
                        query: {
                            bool: {
                                should: getTopicQueries(selectedTopic)
                            }
                        }
                    })
                });

                const data = await response.json();
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
                return [
                    { term: { topic: 'Career Growth Opportunities' } },
                    { term: { topic: 'Learning and Development' } },
                    { term: { topic: 'Promotion and Advancement' } },
                    { term: { topic: 'Career Path Clarity' } },
                    { term: { topic: 'Mentorship and Guidance' } },
                    { term: { topic: 'Skill Development' } },
                    { term: { topic: 'Career Progression Concerns' } },
                    { term: { topic: 'Training and Education' } },
                    { term: { topic: 'Career Goals and Aspirations' } },
                    { term: { topic: 'Professional Growth' } },
                    { term: { topic: 'Career Development Support' } },
                    { term: { topic: 'Advancement Opportunities' } },
                    { term: { topic: 'Career Planning' } },
                    { term: { topic: 'Learning Opportunities' } },
                    { term: { topic: 'Career Development Feedback' } }
                ];
            case 'employee-networks':
                return [
                    { term: { topic: 'Employee Networks' } },
                    { term: { topic: 'Jewish Heritage' } },
                    { term: { topic: 'Arab Heritage' } },
                    { term: { topic: 'Culture Heritage' } },
                    { term: { topic: 'Veteran Network' } }
                ];
            case 'client-support':
                return [
                    { term: { topic: 'Client Support' } },
                    { term: { topic: 'Client Satisfaction' } },
                    { term: { topic: 'Client Help' } }
                ];
            case 'team-collaboration':
                return [{ term: { topic: 'Team Collaboration' } }, { term: { topic: 'Team Support' } }];
            case 'onboarding':
                return [{ term: { topic: 'Onboarding Feedback' } }, { term: { topic: 'Onboarding Process' } }];
            case 'internal-movement':
                return [{ term: { topic: 'Internal Movement' } }, { term: { topic: 'Internal Department Movement' } }];
            case 'training-education':
                return [{ term: { topic: 'Employee Training' } }, { term: { topic: 'Training and Education' } }];
            case 'learning-growth':
                return [
                    { term: { topic: 'Learning and Growth' } },
                    { term: { topic: 'Learning Growth Opportunities' } },
                    { term: { topic: 'Simple Learning Growth' } },
                    { term: { topic: 'Learning Opportunities' } }
                ];
            case 'career-progression':
                return [{ term: { topic: 'Career Progression' } }, { term: { topic: 'Career Progression Concerns' } }];
            case 'career-concerns':
                return [{ term: { topic: 'Career Concerns' } }, { term: { topic: 'Career Progression Concerns' } }];
            default:
                return [{ match_all: {} }];
        }
    };

    // Function to fetch counts for a specific rule
    const fetchRuleCounts = async (ruleId: string) => {
        try {
            const response = await fetch('http://<elasticsearch-host>:9200/matched_comments/_search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                })
            });

            const data = await response.json();

            return {
                unique: data.aggregations?.unique_comments?.value || 0,
                total: data.aggregations?.total_matches?.value || 0
            };
        } catch (error) {
            console.error('Error fetching rule counts:', error);

            return { unique: 0, total: 0 };
        }
    };

    // Function to fetch topic-level counts
    const fetchTopicCounts = async (topic: string) => {
        try {
            const response = await fetch('http://<elasticsearch-host>:9200/matched_comments/_search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: 0,
                    query: {
                        bool: {
                            should: getTopicQueries(topic)
                        }
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
                })
            });

            const data = await response.json();

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
        try {
            const response = await fetch('http://<elasticsearch-host>:9200/matched_comments/_search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: 100,
                    query: {
                        bool: {
                            should: getTopicQueries(topic)
                        }
                    },
                    highlight: {
                        fields: {
                            comment_text: {}
                        }
                    },
                    sort: [{ timestamp: { order: 'desc' } }]
                })
            });

            const data = await response.json();
            const topicComments = data.hits.hits.map((hit: any) => ({
                ...hit._source,
                highlighted_text:
                    hit.highlight?.comment_text?.[0] || hit._source.highlighted_text || hit._source.comment_text
            }));
            setComments(topicComments);
        } catch (error) {
            console.error('Error fetching topic comments:', error);
            // Fallback to mock data if API fails
            const mockTopicComments = getMockCommentsForTopic(topic);
            setComments(mockTopicComments);
        }
    };

    // Fetch comments based on view mode and topic/rule selection
    useEffect(() => {
        if (viewMode === 'topic' && selectedTopic) {
            fetchCommentsForTopic(selectedTopic);
        } else if (viewMode === 'rule' && selectedRule) {
            // Find the selected rule's description for highlighting
            const ruleText = rules.find((r) => r.id === selectedRule)?.description || '';
            fetch('http://<elasticsearch-host>:9200/matched_comments/_search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: 100,
                    query: {
                        bool: {
                            must: [
                                { term: { rule_id: selectedRule } },
                                ...(ruleText ? [{ match: { comment_text: ruleText } }] : [])
                            ]
                        }
                    },
                    highlight: {
                        fields: {
                            comment_text: {}
                        }
                    },
                    sort: [{ timestamp: { order: 'desc' } }]
                })
            })
                .then((res) => res.json())
                .then((data) => {
                    setComments(
                        data.hits.hits.map((hit: any) => ({
                            ...hit._source,
                            highlighted_text:
                                hit.highlight?.comment_text?.[0] ||
                                hit._source.highlighted_text ||
                                hit._source.comment_text
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

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRules(rules.map((rule) => rule.id));
        } else {
            setSelectedRules([]);
        }
    };

    const toggleRuleSelection = (ruleId: string) => {
        setSelectedRules((prev) => (prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]));
    };

    return (
        <div className='min-h-screen'>
            {/* Header */}

            <div className='flex h-[calc(100vh-73px)]'>
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
                                    <SelectItem value='core-topics'>Core Topics</SelectItem>
                                    <SelectItem value='career-development'>Career Development</SelectItem>
                                    <SelectItem value='employee-networks'>Employee Networks</SelectItem>
                                    <SelectItem value='client-support'>Client Support</SelectItem>
                                    <SelectItem value='team-collaboration'>Team Collaboration</SelectItem>
                                    <SelectItem value='onboarding'>Onboarding</SelectItem>
                                    <SelectItem value='internal-movement'>Internal Movement</SelectItem>
                                    <SelectItem value='training-education'>Training & Education</SelectItem>
                                    <SelectItem value='learning-growth'>Learning & Growth</SelectItem>
                                    <SelectItem value='career-progression'>Career Progression</SelectItem>
                                    <SelectItem value='career-concerns'>Career Concerns</SelectItem>
                                    <SelectItem value='career-goals'>Career Goals</SelectItem>
                                    <SelectItem value='career-planning'>Career Planning</SelectItem>
                                    <SelectItem value='career-feedback'>Career Feedback</SelectItem>
                                    <SelectItem value='mentorship-guidance'>Mentorship & Guidance</SelectItem>
                                    <SelectItem value='skill-development'>Skill Development</SelectItem>
                                    <SelectItem value='advancement-opportunities'>Advancement Opportunities</SelectItem>
                                    <SelectItem value='professional-growth'>Professional Growth</SelectItem>
                                    <SelectItem value='career-support'>Career Development Support</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search */}
                        <div className='relative mb-6'>
                            <div className='mt-2 flex items-center justify-between text-sm text-gray-500'>
                                <div className='flex items-center gap-4'>
                                    <span>Used in {rules.length} places</span>
                                    <span>{topicCounts.total} Total Matches</span>
                                    <span>{topicCounts.unique} Comments (This Rule Only)</span>
                                </div>
                            </div>
                        </div>

                        {/* Rules Table */}
                        <div className='space-y-4'>
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

                                    <div className='rounded-lg border border-blue-200 p-4'>
                                        <div className='mb-2 flex items-center justify-between'>
                                            <span className='text-sm font-medium'>
                                                {viewMode === 'topic'
                                                    ? `Displaying comments captured by ${selectedTopic.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} topic rules`
                                                    : 'Displaying comments captured by highlighted rule'}
                                            </span>
                                            <X className='h-4 w-4 text-gray-400' />
                                        </div>
                                        <div className='flex items-center gap-2 text-sm'>
                                            <Checkbox />
                                            <span>Show comments that match only this rule</span>
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
                                        <CardContent className='space-y-4'>
                                            {comments.map((comment, idx) => (
                                                <div key={idx} className='text-sm'>
                                                    <p
                                                        className='leading-relaxed text-gray-700'
                                                        dangerouslySetInnerHTML={{
                                                            __html: comment.highlighted_text || comment.comment_text
                                                        }}
                                                    />
                                                    <div className='mt-2 mb-2 text-right'>
                                                        <span className='text-xs font-medium'>Should be captured?</span>
                                                        <div className='mt-1 flex justify-end gap-2'>
                                                            <Button variant='outline' size='sm' className='text-xs'>
                                                                Yes
                                                            </Button>
                                                            <Button variant='outline' size='sm' className='text-xs'>
                                                                No
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {idx < comments.length - 1 && <Separator className='my-4' />}
                                                </div>
                                            ))}

                                            {comments.length === 0 && (
                                                <div className='py-8 text-center text-gray-500'>
                                                    {viewMode === 'topic'
                                                        ? `No comments found for ${selectedTopic.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} topic.`
                                                        : 'No comments found for this rule.'}
                                                </div>
                                            )}

                                            <div className='mt-4 text-xs text-gray-500'>
                                                Last updated 3/27/2025 1:09 PM
                                            </div>
                                        </CardContent>
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
