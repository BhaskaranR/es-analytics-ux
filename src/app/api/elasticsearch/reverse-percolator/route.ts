import { NextRequest, NextResponse } from 'next/server';

import { callElasticsearch } from '@/lib/elasticsearch';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, query, document, templateId } = body;

        switch (action) {
            case 'test_rule': {
                // Test a new rule against existing comments
                const testResponse = await callElasticsearch({
                    endpoint: '/comment_percolator/_search',
                    method: 'POST',
                    body: {
                        query: {
                            percolate: {
                                field: 'query',
                                document: document || { comment_text: 'test comment' }
                            }
                        },
                        size: 50
                    }
                });

                return NextResponse.json({
                    success: true,
                    matches: testResponse.hits.hits,
                    total: testResponse.hits.total.value
                });
            }

            case 'test_template': {
                // Test a specific rule template
                if (!templateId) {
                    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
                }

                const templateResponse = await callElasticsearch({
                    endpoint: '/comment_percolator/_search',
                    method: 'POST',
                    body: {
                        query: {
                            percolate: {
                                field: 'query',
                                document: document || { comment_text: 'test comment' }
                            }
                        },
                        size: 50
                    }
                });

                return NextResponse.json({
                    success: true,
                    matches: templateResponse.hits.hits,
                    total: templateResponse.hits.total.value
                });
            }

            case 'get_templates': {
                // Get all available rule templates
                const templatesResponse = await callElasticsearch({
                    endpoint: '/rule_templates/_search',
                    method: 'POST',
                    body: {
                        size: 100,
                        sort: [{ created_at: { order: 'desc' } }]
                    }
                });

                return NextResponse.json({
                    success: true,
                    templates: templatesResponse.hits.hits
                });
            }

            case 'create_template': {
                // Create a new rule template
                const { rule_name, rule_description, rule_query, topic } = body;

                if (!rule_name || !rule_description || !rule_query || !topic) {
                    return NextResponse.json(
                        { error: 'Missing required fields: rule_name, rule_description, rule_query, topic' },
                        { status: 400 }
                    );
                }

                const createResponse = await callElasticsearch({
                    endpoint: '/rule_templates/_doc',
                    method: 'POST',
                    body: {
                        rule_name,
                        rule_description,
                        rule_query,
                        topic,
                        created_at: new Date().toISOString()
                    }
                });

                return NextResponse.json({
                    success: true,
                    template_id: createResponse._id
                });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Reverse percolator API error:', error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'templates') {
            // Get all rule templates
            const response = await callElasticsearch({
                endpoint: '/rule_templates/_search',
                method: 'POST',
                body: {
                    size: 100,
                    sort: [{ created_at: { order: 'desc' } }]
                }
            });

            return NextResponse.json({
                success: true,
                templates: response.hits.hits
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Reverse percolator GET error:', error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
