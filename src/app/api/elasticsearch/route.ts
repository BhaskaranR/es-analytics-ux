import { NextRequest, NextResponse } from 'next/server';

const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST || 'localhost:9200';
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME || '';
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || '';

export async function POST(request: NextRequest) {
    try {
        const { endpoint, method = 'POST', body } = await request.json();
        const url = `http://${ELASTICSEARCH_HOST}${endpoint}`;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
            const auth = Buffer.from(`${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${auth}`;
        }
        const esResponse = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await esResponse.json();

        return NextResponse.json(data, { status: esResponse.status });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to connect to Elasticsearch' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}
