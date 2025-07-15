'use client';

import React, { useState } from 'react';

import { callElasticsearch } from '@/lib/elasticsearch';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Textarea } from '@/registry/new-york-v4/ui/textarea';

import { Loader2, Play, Search, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface MatchedComment {
    _id: string;
    _source: {
        comment_id: string;
        comment_text: string;
        timestamp: string;
        source: string;
    };
}

interface RuleTemplate {
    _id: string;
    _source: {
        rule_name: string;
        rule_description: string;
        rule_query: any;
        topic: string;
        created_at: string;
    };
}

export function ReversePercolatorDemo() {
    const [isLoading, setIsLoading] = useState(false);
    const [matchedComments, setMatchedComments] = useState<MatchedComment[]>([]);
    const [ruleTemplates, setRuleTemplates] = useState<RuleTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [testQuery, setTestQuery] = useState('');
    const [testComment, setTestComment] = useState('');

    // Test a new rule against existing comments
    const testRuleAgainstComments = async () => {
        if (!testQuery.trim()) {
            toast.error('Please enter a query to test');

            return;
        }

        setIsLoading(true);
        try {
            const response = await callElasticsearch({
                endpoint: '/comment_percolator/_search',
                method: 'POST',
                body: {
                    query: {
                        percolate: {
                            field: 'query',
                            document: {
                                comment_text: testComment || 'test comment'
                            }
                        }
                    },
                    size: 20
                }
            });

            setMatchedComments(response.hits.hits);
            toast.success(`Found ${response.hits.hits.length} matching comments`);
        } catch (error) {
            console.error('Error testing rule:', error);
            toast.error('Failed to test rule');
        } finally {
            setIsLoading(false);
        }
    };

    // Load rule templates
    const loadRuleTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await callElasticsearch({
                endpoint: '/rule_templates/_search',
                method: 'POST',
                body: {
                    size: 50,
                    sort: [{ created_at: { order: 'desc' } }]
                }
            });

            setRuleTemplates(response.hits.hits);
        } catch (error) {
            console.error('Error loading rule templates:', error);
            toast.error('Failed to load rule templates');
        } finally {
            setIsLoading(false);
        }
    };

    // Test a specific rule template
    const testRuleTemplate = async (templateId: string) => {
        const template = ruleTemplates.find((t) => t._id === templateId);
        if (!template) return;

        setIsLoading(true);
        try {
            const response = await callElasticsearch({
                endpoint: '/comment_percolator/_search',
                method: 'POST',
                body: {
                    query: {
                        percolate: {
                            field: 'query',
                            document: {
                                comment_text: testComment || 'test comment'
                            }
                        }
                    },
                    size: 20
                }
            });

            setMatchedComments(response.hits.hits);
            toast.success(`Template "${template._source.rule_name}" matched ${response.hits.hits.length} comments`);
        } catch (error) {
            console.error('Error testing rule template:', error);
            toast.error('Failed to test rule template');
        } finally {
            setIsLoading(false);
        }
    };

    // Load templates on component mount
    React.useEffect(() => {
        loadRuleTemplates();
    }, []);

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <TestTube className='h-5 w-5' />
                        Reverse Percolator Demo
                    </CardTitle>
                    <CardDescription>
                        Test new rules against existing comments to see what they would match
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='test-rule' className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='test-rule'>Test New Rule</TabsTrigger>
                            <TabsTrigger value='test-template'>Test Rule Template</TabsTrigger>
                        </TabsList>

                        <TabsContent value='test-rule' className='space-y-4'>
                            <div className='space-y-4'>
                                <div>
                                    <Label htmlFor='test-comment'>Test Comment</Label>
                                    <Textarea
                                        id='test-comment'
                                        placeholder='Enter a comment to test against...'
                                        value={testComment}
                                        onChange={(e) => setTestComment(e.target.value)}
                                        className='mt-1'
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='test-query'>Elasticsearch Query (JSON)</Label>
                                    <Textarea
                                        id='test-query'
                                        placeholder='{"match": {"comment_text": "career development"}}'
                                        value={testQuery}
                                        onChange={(e) => setTestQuery(e.target.value)}
                                        className='mt-1 font-mono text-sm'
                                        rows={4}
                                    />
                                </div>

                                <Button onClick={testRuleAgainstComments} disabled={isLoading}>
                                    {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                    <Play className='mr-2 h-4 w-4' />
                                    Test Rule
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value='test-template' className='space-y-4'>
                            <div className='space-y-4'>
                                <div>
                                    <Label htmlFor='template-select'>Select Rule Template</Label>
                                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                        <SelectTrigger className='mt-1'>
                                            <SelectValue placeholder='Choose a rule template' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ruleTemplates.map((template) => (
                                                <SelectItem key={template._id} value={template._id}>
                                                    {template._source.rule_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedTemplate && (
                                    <div className='rounded-lg border p-4'>
                                        <h4 className='font-medium'>Template Details</h4>
                                        <div className='mt-2 space-y-2 text-sm'>
                                            <div>
                                                <span className='font-medium'>Description:</span>{' '}
                                                {
                                                    ruleTemplates.find((t) => t._id === selectedTemplate)?._source
                                                        .rule_description
                                                }
                                            </div>
                                            <div>
                                                <span className='font-medium'>Topic:</span>{' '}
                                                <Badge variant='secondary'>
                                                    {
                                                        ruleTemplates.find((t) => t._id === selectedTemplate)?._source
                                                            .topic
                                                    }
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor='template-test-comment'>Test Comment</Label>
                                    <Textarea
                                        id='template-test-comment'
                                        placeholder='Enter a comment to test against the selected template...'
                                        value={testComment}
                                        onChange={(e) => setTestComment(e.target.value)}
                                        className='mt-1'
                                    />
                                </div>

                                <Button
                                    onClick={() => testRuleTemplate(selectedTemplate)}
                                    disabled={isLoading || !selectedTemplate}>
                                    {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                    <Search className='mr-2 h-4 w-4' />
                                    Test Template
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Results */}
            {matchedComments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Matching Comments ({matchedComments.length})</CardTitle>
                        <CardDescription>Comments that would match the tested rule</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {matchedComments.map((comment, index) => (
                                <div key={comment._id} className='rounded-lg border p-4'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <p className='text-sm text-gray-700'>{comment._source.comment_text}</p>
                                            <div className='mt-2 flex items-center gap-2 text-xs text-gray-500'>
                                                <span>ID: {comment._source.comment_id}</span>
                                                <span>•</span>
                                                <span>Source: {comment._source.source}</span>
                                                <span>•</span>
                                                <span>{new Date(comment._source.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Badge variant='secondary' className='ml-2'>
                                            Match
                                        </Badge>
                                    </div>
                                    {index < matchedComments.length - 1 && <Separator className='mt-4' />}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Templates */}
            {ruleTemplates.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Rule Templates ({ruleTemplates.length})</CardTitle>
                        <CardDescription>Pre-defined rule templates for testing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            {ruleTemplates.map((template) => (
                                <div
                                    key={template._id}
                                    className='flex items-center justify-between rounded-lg border p-3'>
                                    <div className='flex-1'>
                                        <div className='font-medium'>{template._source.rule_name}</div>
                                        <div className='text-sm text-gray-600'>{template._source.rule_description}</div>
                                        <div className='mt-1 flex items-center gap-2'>
                                            <Badge variant='outline'>{template._source.topic}</Badge>
                                            <span className='text-xs text-gray-500'>
                                                {new Date(template._source.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            setSelectedTemplate(template._id);
                                            setTestQuery(JSON.stringify(template._source.rule_query, null, 2));
                                        }}>
                                        Use Template
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
