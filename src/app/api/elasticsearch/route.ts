import { NextRequest, NextResponse } from 'next/server';

import https from 'https';

const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST || 'localhost:9200';
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME || '';
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || '';
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY || '';
const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '1';

// Create HTTPS agent that ignores SSL certificate issues for development
const httpsAgent = new https.Agent({
    rejectUnauthorized: NODE_TLS_REJECT_UNAUTHORIZED === '0'
});

export async function POST(request: NextRequest) {
    try {
        const { endpoint, method = 'POST', body } = await request.json();

        // Handle ELASTICSEARCH_HOST that might contain protocol
        let baseUrl: string;
        if (ELASTICSEARCH_HOST.startsWith('http://') || ELASTICSEARCH_HOST.startsWith('https://')) {
            baseUrl = ELASTICSEARCH_HOST;
        } else {
            baseUrl = `http://${ELASTICSEARCH_HOST}`;
        }

        const url = `${baseUrl}${endpoint}`;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };

        // Support both local (Basic Auth) and cloud (API Key) authentication
        if (ELASTICSEARCH_API_KEY) {
            // Cloud Elasticsearch with API Key
            headers['Authorization'] = `ApiKey ${ELASTICSEARCH_API_KEY}`;
        } else if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
            // Local Elasticsearch with username/password
            const auth = Buffer.from(`${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${auth}`;
        }

        const esResponse = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            // Use HTTPS agent for self-signed certificates in development
            // @ts-ignore - Node.js specific option
            agent: url.startsWith('https://') ? httpsAgent : undefined
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
