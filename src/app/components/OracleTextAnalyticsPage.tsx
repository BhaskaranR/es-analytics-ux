'use client';

import React, { useEffect, useState } from 'react';

import { callOracle } from '@/lib/oracle';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Checkbox } from '@/registry/new-york-v4/ui/checkbox';
import { ScrollArea } from '@/registry/new-york-v4/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';

import { Copy, Edit, Trash2 } from 'lucide-react';

interface Topic {
    id: string;
    name: string;
}

interface OracleTextAnalyticsPageProps {
    initialTopics?: Topic[];
}

interface Rule {
    id: string;
    description: string;
    topic?: string;
    unique: number;
    total: number;
    excluded: boolean;
    loading?: boolean;
}

interface MatchedComment {
    comment_text: string;
    highlighted_text?: string;
    description?: string;
    [key: string]: any;
}

export default function OracleTextAnalyticsPage({ initialTopics = [] }: OracleTextAnalyticsPageProps) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [selectedRule, setSelectedRule] = useState<string | null>(null);
    const [selectedRules, setSelectedRules] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [comments, setComments] = useState<MatchedComment[]>([]);
    const [viewMode, setViewMode] = useState<'topic' | 'rule'>('topic');
    const [topicCounts, setTopicCounts] = useState<{ total: number; unique: number }>({ total: 0, unique: 0 });
    const [isLoadingCounts, setIsLoadingCounts] = useState(false);
    const [isLoadingTopic, setIsLoadingTopic] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<string>(initialTopics[0]?.id || '');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Handle refresh trigger
    useEffect(() => {
        if (selectedTopic && refreshTrigger > 0) {
            handleTopicChange(selectedTopic);
        }
    }, [refreshTrigger]);

    // Initial data fetch
    useEffect(() => {
        if (selectedTopic) {
            handleTopicChange(selectedTopic);
        }
    }, []);

    // Function to fetch topic-level counts
    const fetchTopicCounts = async (topic: string) => {
        try {
            const topicData = initialTopics.find((t: Topic) => t.id === topic);
            const backendTopic = topicData ? topicData.name : topic;

            const data = await callOracle({
                operation: 'getTopicCounts',
                params: { topic: backendTopic }
            });

            return {
                total: data[0]?.TOTAL || 0,
                unique: data[0]?.UNIQUE_COUNT || 0
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
            const topicData = initialTopics.find((t: Topic) => t.id === topic);
            const backendTopic = topicData ? topicData.name : topic;

            const data = await callOracle({
                operation: 'getMatchedComments',
                params: {
                    topic: backendTopic,
                    limit: 100,
                    offset: 0
                }
            });

            const topicComments = (data || []).map((item: any) => ({
                comment_text: item.COMMENT_TEXT,
                highlighted_text: item.HIGHLIGHTED_TEXT || item.COMMENT_TEXT,
                description: item.DESCRIPTION || 'No description available',
                topic: item.TOPIC,
                rule_id: item.RULE_ID,
                score: item.SCORE,
                timestamp: item.TIMESTAMP
            }));
            setComments(topicComments);
        } catch (error) {
            console.error('Error fetching topic comments:', error);
            setComments([]);
        } finally {
            setIsLoadingComments(false);
        }
    };

    // Fetch comments based on view mode
    useEffect(() => {
        if (viewMode === 'topic' && selectedTopic) {
            fetchCommentsForTopic(selectedTopic);
        } else if (viewMode === 'rule' && selectedRule) {
            callOracle({
                operation: 'getMatchedComments',
                params: {
                    rule_id: selectedRule,
                    limit: 100,
                    offset: 0
                }
            })
                .then((data) => {
                    setComments(
                        (data || []).map((item: any) => ({
                            comment_text: item.COMMENT_TEXT,
                            highlighted_text: item.HIGHLIGHTED_TEXT || item.COMMENT_TEXT,
                            description: item.DESCRIPTION || 'No description available',
                            topic: item.TOPIC,
                            rule_id: item.RULE_ID,
                            score: item.SCORE,
                            timestamp: item.TIMESTAMP
                        }))
                    );
                })
                .catch(() => {
                    setComments([]);
                });
        }
    }, [viewMode, selectedTopic, selectedRule]);

    const toggleSelectAll = async (checked: boolean) => {
        const newSelectedRules = checked ? rules.map((rule) => rule.id) : [];
        setSelectedRules(newSelectedRules);
        await fetchCommentsForSelectedRules(newSelectedRules);
    };

    // Function to fetch comments for multiple selected rules
    const fetchCommentsForSelectedRules = async (ruleIds: string[]) => {
        try {
            if (ruleIds.length === 0) {
                await fetchCommentsForTopic(selectedTopic);

                return;
            }

            // Fetch comments for all selected rules
            const allComments: MatchedComment[] = [];
            for (const ruleId of ruleIds) {
                const data = await callOracle({
                    operation: 'getMatchedComments',
                    params: {
                        rule_id: ruleId,
                        limit: 50,
                        offset: 0
                    }
                });
                const ruleComments = (data || []).map((item: any) => ({
                    comment_text: item.COMMENT_TEXT,
                    highlighted_text: item.HIGHLIGHTED_TEXT || item.COMMENT_TEXT,
                    description: item.DESCRIPTION || 'No description available',
                    topic: item.TOPIC,
                    rule_id: item.RULE_ID,
                    score: item.SCORE,
                    timestamp: item.TIMESTAMP
                }));
                allComments.push(...ruleComments);
            }
            setComments(allComments);
        } catch (error) {
            console.error('Error fetching comments for selected rules:', error);
            await fetchCommentsForTopic(selectedTopic);
        }
    };

    const handleTopicChange = async (newTopic: string) => {
        setIsLoadingTopic(true);
        setSelectedTopic(newTopic);

        try {
            const topicData = initialTopics.find((t: Topic) => t.id === newTopic);
            const backendTopic = topicData ? topicData.name : newTopic;

            // Fetch rules for this topic
            const rulesData = await callOracle({
                operation: 'getRulesByTopic',
                params: { topic: backendTopic }
            });

            const rulesList: Rule[] = (rulesData || []).map((item: any) => ({
                id: item.ID,
                description: item.DESCRIPTION || 'No description',
                topic: item.TOPIC,
                unique: item.UNIQUE_COUNT || 0,
                total: item.TOTAL_COUNT || 0,
                excluded: false,
                loading: false
            }));

            setRules(rulesList);
            if (rulesList.length > 0) setSelectedRule(rulesList[0].id);

            // Fetch topic counts
            const counts = await fetchTopicCounts(newTopic);
            setTopicCounts(counts);

            // Fetch comments for the topic
            await fetchCommentsForTopic(newTopic);
        } catch (error) {
            console.error('Error fetching rules:', error);
            setRules([]);
        } finally {
            setIsLoadingTopic(false);
        }
    };

    const toggleRuleSelection = async (ruleId: string) => {
        const newSelectedRules = selectedRules.includes(ruleId)
            ? selectedRules.filter((id) => id !== ruleId)
            : [...selectedRules, ruleId];

        setSelectedRules(newSelectedRules);
        await fetchCommentsForSelectedRules(newSelectedRules);
    };

    return (
        <div className='min-h-screen'>
            <div className='flex h-[calc(100vh-20px)]'>
                {/* Left Panel */}
                <div className='w-3/5 border-r bg-white'>
                    <div className='p-6'>
                        {/* Topic Rules Header */}
                        <div className='mb-6 flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <span className='font-medium'>Topics rules for</span>
                                <Select value={selectedTopic} onValueChange={handleTopicChange}>
                                    <SelectTrigger className='w-100'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialTopics.map((topic) => (
                                            <SelectItem key={topic.id} value={topic.id}>
                                                {topic.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {isLoadingTopic && (
                                    <div className='ml-2 flex items-center gap-2 text-sm text-blue-600'>
                                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
                                        <span>Loading...</span>
                                    </div>
                                )}
                            </div>
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
                                        checked={selectedRules.length === rules.length && rules.length > 0}
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
                                                                    className='leading-relaxed text-gray-700 [&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:px-1 [&_mark]:font-semibold dark:[&_mark]:bg-yellow-900'
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
