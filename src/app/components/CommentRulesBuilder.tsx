'use client';

import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/registry/new-york-v4/ui/form';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { Switch } from '@/registry/new-york-v4/ui/switch';
import { Textarea } from '@/registry/new-york-v4/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';

import { Eye, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Zod schema for rule validation
const ruleSchema = z.object({
    topic: z.string().min(1, 'Topic is required'),
    description: z.string().min(1, 'Description is required'),
    queryType: z.enum(['intervals', 'match', 'multi_match', 'bool']),
    field: z.string(),
    analyzer: z.string(),
    maxGaps: z.number().min(0).max(10),
    ordered: z.boolean(),
    // For intervals queries
    intervals: z
        .array(
            z.object({
                query: z.string().min(1, 'Query term is required'),
                maxGaps: z.number().min(0).max(10)
            })
        )
        .optional(),
    // For simple match queries
    matchQuery: z.string().optional(),
    // For multi-match queries
    multiMatchFields: z.array(z.string()).optional(),
    multiMatchQuery: z.string().optional(),
    // For bool queries
    boolQueries: z
        .array(
            z.object({
                type: z.enum(['must', 'should', 'must_not', 'filter']),
                query: z.string().min(1, 'Query is required'),
                field: z.string()
            })
        )
        .optional()
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface CommentRulesBuilderProps {
    onRuleCreated?: (rule: any) => void;
    onRuleUpdated?: (ruleId: string, rule: any) => void;
    onRuleDeleted?: (ruleId: string) => void;
}

export function CommentRulesBuilder({ onRuleCreated, onRuleUpdated, onRuleDeleted }: CommentRulesBuilderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [previewQuery, setPreviewQuery] = useState<any>(null);
    const [savedRules, setSavedRules] = useState<any[]>([]);

    const form = useForm<RuleFormData>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            topic: '',
            description: '',
            queryType: 'intervals',
            field: 'comment_text',
            analyzer: 'search_analyzer',
            maxGaps: 5,
            ordered: false,
            intervals: [{ query: '', maxGaps: 5 }]
        }
    });

    const queryType = form.watch('queryType');
    const intervals = form.watch('intervals');

    const generateElasticsearchQuery = (data: RuleFormData) => {
        switch (data.queryType) {
            case 'intervals':
                if (!data.intervals || data.intervals.length === 0) return null;

                if (data.intervals.length === 1) {
                    return {
                        intervals: {
                            [data.field]: {
                                match: {
                                    query: data.intervals[0].query,
                                    analyzer: data.analyzer,
                                    ordered: data.ordered,
                                    max_gaps: data.intervals[0].maxGaps
                                }
                            }
                        }
                    };
                } else {
                    return {
                        intervals: {
                            [data.field]: {
                                all_of: {
                                    ordered: data.ordered,
                                    intervals: data.intervals.map((interval) => ({
                                        match: {
                                            query: interval.query,
                                            analyzer: data.analyzer,
                                            max_gaps: interval.maxGaps
                                        }
                                    }))
                                }
                            }
                        }
                    };
                }

            case 'match':
                return {
                    match: {
                        [data.field]: {
                            query: data.matchQuery,
                            analyzer: data.analyzer
                        }
                    }
                };

            case 'multi_match':
                return {
                    multi_match: {
                        query: data.multiMatchQuery,
                        fields: data.multiMatchFields,
                        analyzer: data.analyzer
                    }
                };

            case 'bool': {
                if (!data.boolQueries || data.boolQueries.length === 0) return null;

                const boolQuery: any = {};
                data.boolQueries.forEach((boolQueryItem) => {
                    if (!boolQuery[boolQueryItem.type]) {
                        boolQuery[boolQueryItem.type] = [];
                    }
                    boolQuery[boolQueryItem.type].push({
                        match: {
                            [boolQueryItem.field]: boolQueryItem.query
                        }
                    });
                });

                return { bool: boolQuery };
            }

            default:
                return null;
        }
    };

    const handlePreview = () => {
        const data = form.getValues();
        const query = generateElasticsearchQuery(data);
        setPreviewQuery(query);
    };

    const handleSubmit = async (data: RuleFormData) => {
        setIsLoading(true);
        try {
            const query = generateElasticsearchQuery(data);
            if (!query) {
                toast.error('Invalid query configuration');

                return;
            }

            const rule = {
                topic: data.topic,
                description: data.description,
                query: query
            };

            // Here you would typically save to your backend/Elasticsearch
            const response = await fetch('/api/elasticsearch/rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rule)
            });

            if (response.ok) {
                const savedRule = await response.json();
                setSavedRules((prev) => [...prev, savedRule]);
                onRuleCreated?.(savedRule);
                toast.success('Rule created successfully!');
                form.reset();
                setPreviewQuery(null);
            } else {
                throw new Error('Failed to create rule');
            }
        } catch (error) {
            toast.error('Failed to create rule');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const addInterval = () => {
        const currentIntervals = form.getValues('intervals') || [];
        form.setValue('intervals', [...currentIntervals, { query: '', maxGaps: 5 }]);
    };

    const removeInterval = (index: number) => {
        const currentIntervals = form.getValues('intervals') || [];
        if (currentIntervals.length > 1) {
            form.setValue(
                'intervals',
                currentIntervals.filter((_, i) => i !== index)
            );
        }
    };

    const addBoolQuery = () => {
        const currentBoolQueries = form.getValues('boolQueries') || [];
        form.setValue('boolQueries', [...currentBoolQueries, { type: 'must', query: '', field: 'comment_text' }]);
    };

    const removeBoolQuery = (index: number) => {
        const currentBoolQueries = form.getValues('boolQueries') || [];
        form.setValue(
            'boolQueries',
            currentBoolQueries.filter((_, i) => i !== index)
        );
    };

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Comment Rules Builder</CardTitle>
                    <CardDescription>
                        Create dynamic Elasticsearch percolator rules for comment analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            {/* Basic Information */}
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                <FormField
                                    control={form.control}
                                    name='topic'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Topic</FormLabel>
                                            <FormControl>
                                                <Input placeholder='e.g., Career Development' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='description'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='e.g., career NEAR development WITHIN 5 WORDS'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Query Configuration */}
                            <div className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='queryType'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Query Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select query type' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='intervals'>Intervals Query</SelectItem>
                                                    <SelectItem value='match'>Match Query</SelectItem>
                                                    <SelectItem value='multi_match'>Multi-Match Query</SelectItem>
                                                    <SelectItem value='bool'>Boolean Query</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Choose the type of Elasticsearch query to build
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <FormField
                                        control={form.control}
                                        name='field'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Field</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='analyzer'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Analyzer</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='maxGaps'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Max Gaps</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='number'
                                                        min='0'
                                                        max='10'
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {queryType === 'intervals' && (
                                    <FormField
                                        control={form.control}
                                        name='ordered'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                                <div className='space-y-0.5'>
                                                    <FormLabel className='text-base'>Ordered Intervals</FormLabel>
                                                    <FormDescription>
                                                        Whether the intervals should appear in order
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {/* Query Type Specific Configuration */}
                            {queryType === 'intervals' && (
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <h4 className='text-sm font-medium'>Intervals</h4>
                                        <Button type='button' variant='outline' size='sm' onClick={addInterval}>
                                            <Plus className='mr-2 h-4 w-4' />
                                            Add Interval
                                        </Button>
                                    </div>

                                    {intervals?.map((_, index) => (
                                        <div key={index} className='flex items-center space-x-2'>
                                            <div className='grid flex-1 grid-cols-1 gap-2 md:grid-cols-2'>
                                                <Input
                                                    placeholder='Query term'
                                                    value={intervals[index]?.query || ''}
                                                    onChange={(e) => {
                                                        const newIntervals = [...(intervals || [])];
                                                        newIntervals[index] = {
                                                            ...newIntervals[index],
                                                            query: e.target.value
                                                        };
                                                        form.setValue('intervals', newIntervals);
                                                    }}
                                                />
                                                <Input
                                                    type='number'
                                                    placeholder='Max gaps'
                                                    min='0'
                                                    max='10'
                                                    value={intervals[index]?.maxGaps || 5}
                                                    onChange={(e) => {
                                                        const newIntervals = [...(intervals || [])];
                                                        newIntervals[index] = {
                                                            ...newIntervals[index],
                                                            maxGaps: parseInt(e.target.value)
                                                        };
                                                        form.setValue('intervals', newIntervals);
                                                    }}
                                                />
                                            </div>
                                            {intervals.length > 1 && (
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => removeInterval(index)}>
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {queryType === 'match' && (
                                <FormField
                                    control={form.control}
                                    name='matchQuery'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Match Query</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder='Enter your match query' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {queryType === 'multi_match' && (
                                <div className='space-y-4'>
                                    <FormField
                                        control={form.control}
                                        name='multiMatchQuery'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Multi-Match Query</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder='Enter your multi-match query' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='multiMatchFields'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fields (comma-separated)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder='comment_text,title,description' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {queryType === 'bool' && (
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <h4 className='text-sm font-medium'>Boolean Queries</h4>
                                        <Button type='button' variant='outline' size='sm' onClick={addBoolQuery}>
                                            <Plus className='mr-2 h-4 w-4' />
                                            Add Query
                                        </Button>
                                    </div>

                                    {form.watch('boolQueries')?.map((_, index) => (
                                        <div key={index} className='flex items-center space-x-2'>
                                            <Select
                                                value={form.watch(`boolQueries.${index}.type`)}
                                                onValueChange={(value) => {
                                                    const boolQueries = form.getValues('boolQueries') || [];
                                                    boolQueries[index] = { ...boolQueries[index], type: value as any };
                                                    form.setValue('boolQueries', boolQueries);
                                                }}>
                                                <SelectTrigger className='w-32'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='must'>Must</SelectItem>
                                                    <SelectItem value='should'>Should</SelectItem>
                                                    <SelectItem value='must_not'>Must Not</SelectItem>
                                                    <SelectItem value='filter'>Filter</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Input
                                                placeholder='Field'
                                                value={form.watch(`boolQueries.${index}.field`) || 'comment_text'}
                                                onChange={(e) => {
                                                    const boolQueries = form.getValues('boolQueries') || [];
                                                    boolQueries[index] = {
                                                        ...boolQueries[index],
                                                        field: e.target.value
                                                    };
                                                    form.setValue('boolQueries', boolQueries);
                                                }}
                                                className='w-32'
                                            />

                                            <Input
                                                placeholder='Query'
                                                value={form.watch(`boolQueries.${index}.query`) || ''}
                                                onChange={(e) => {
                                                    const boolQueries = form.getValues('boolQueries') || [];
                                                    boolQueries[index] = {
                                                        ...boolQueries[index],
                                                        query: e.target.value
                                                    };
                                                    form.setValue('boolQueries', boolQueries);
                                                }}
                                                className='flex-1'
                                            />

                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={() => removeBoolQuery(index)}>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Preview and Submit */}
                            <div className='flex items-center space-x-2'>
                                <Button type='button' variant='outline' onClick={handlePreview}>
                                    <Eye className='mr-2 h-4 w-4' />
                                    Preview Query
                                </Button>
                                <Button type='submit' disabled={isLoading}>
                                    {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                    <Save className='mr-2 h-4 w-4' />
                                    Create Rule
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Query Preview */}
            {previewQuery && (
                <Card>
                    <CardHeader>
                        <CardTitle>Query Preview</CardTitle>
                        <CardDescription>Preview of the generated Elasticsearch query</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className='bg-muted overflow-x-auto rounded-lg p-4 text-sm'>
                            {JSON.stringify(previewQuery, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {/* Saved Rules */}
            {savedRules.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Saved Rules</CardTitle>
                        <CardDescription>Recently created rules</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            {savedRules.map((rule, index) => (
                                <div key={index} className='flex items-center justify-between rounded-lg border p-3'>
                                    <div>
                                        <div className='font-medium'>{rule.topic}</div>
                                        <div className='text-muted-foreground text-sm'>{rule.description}</div>
                                    </div>
                                    <Badge variant='secondary'>{rule._id}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
