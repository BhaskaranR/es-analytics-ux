import { NextRequest, NextResponse } from 'next/server';

import https from 'https';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'https://localhost:9200';
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME || 'elastic';
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || '';

// Create HTTPS agent that ignores SSL certificate validation in development
const httpsAgent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, description, query } = body;

        if (!topic || !description || !query) {
            return NextResponse.json({ error: 'Missing required fields: topic, description, query' }, { status: 400 });
        }

        // Generate a unique ID for the rule
        const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const ruleDocument = {
            topic,
            description,
            query
        };

        const response = await fetch(`${ELASTICSEARCH_URL}/comment_rules/_doc/${ruleId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}`).toString('base64')}`
            },
            body: JSON.stringify(ruleDocument),
            // @ts-ignore - https agent for development
            agent: httpsAgent
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Elasticsearch error:', errorText);

            return NextResponse.json({ error: 'Failed to create rule in Elasticsearch' }, { status: 500 });
        }

        const result = await response.json();

        return NextResponse.json({
            _id: ruleId,
            topic,
            description,
            query,
            ...result
        });
    } catch (error) {
        console.error('Error creating rule:', error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const topic = searchParams.get('topic');

        let query: any = {
            query: {
                match_all: {}
            },
            size: 100
        };

        if (topic) {
            query = {
                query: {
                    term: {
                        topic: topic
                    }
                },
                size: 100
            };
        }

        const response = await fetch(`${ELASTICSEARCH_URL}/comment_rules/_search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}`).toString('base64')}`
            },
            body: JSON.stringify(query),
            // @ts-ignore - https agent for development
            agent: httpsAgent
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Elasticsearch error:', errorText);

            return NextResponse.json({ error: 'Failed to fetch rules from Elasticsearch' }, { status: 500 });
        }

        const result = await response.json();
        const rules = result.hits.hits.map((hit: any) => ({
            _id: hit._id,
            ...hit._source
        }));

        return NextResponse.json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ruleId = searchParams.get('id');

        if (!ruleId) {
            return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
        }

        const response = await fetch(`${ELASTICSEARCH_URL}/comment_rules/_doc/${ruleId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Basic ${Buffer.from(`${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}`).toString('base64')}`
            },
            // @ts-ignore - https agent for development
            agent: httpsAgent
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Elasticsearch error:', errorText);

            return NextResponse.json({ error: 'Failed to delete rule from Elasticsearch' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting rule:', error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
