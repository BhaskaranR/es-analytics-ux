#!/usr/bin/env node
/**
 * Test script to validate Oracle and Elasticsearch connections
 * Run this before the main migration job to ensure all connections work
 */

// Load environment variables from .env file
require('dotenv').config();

const https = require('https');
const oracledb = require('oracledb');

// Configuration (same as main job)
const config = {
    oracle: {
        user: process.env.ORACLE_USER || 'your_username',
        password: process.env.ORACLE_PASSWORD || 'your_password',
        connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.ORACLE_HOST || 'localhost'})(PORT=${process.env.ORACLE_PORT || '1521'}))(CONNECT_DATA=(SID=${process.env.ORACLE_SID || 'XE'})))`,
        poolMin: 2,
        poolMax: 2,
        poolIncrement: 0
    }
};

// Elasticsearch configuration (matching route.ts pattern)
const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST || 'localhost:9200';
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME || '';
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || '';
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY || '';
const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '1';

// Create HTTPS agent that ignores SSL certificate issues for development
const httpsAgent = new https.Agent({
    rejectUnauthorized: NODE_TLS_REJECT_UNAUTHORIZED === '0'
});

/**
 * Test Oracle connection
 */
async function testOracleConnection() {
    console.log('Testing Oracle connection...');

    try {
        // Create a simple connection pool
        const pool = await oracledb.createPool(config.oracle);

        // Get a connection
        const connection = await pool.getConnection();

        try {
            // Test basic query
            const result = await connection.execute('SELECT 1 as test FROM dual');
            console.log('✅ Oracle connection successful');

            // Test if comments_2024 table exists
            const tableCheck = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM user_tables 
                WHERE table_name = 'COMMENTS_2024'
            `);

            if (tableCheck.rows[0][0] > 0) {
                console.log('✅ comments_2024 table found');

                // Get record count
                const countResult = await connection.execute('SELECT COUNT(*) as total FROM comments_2024');
                const totalRecords = countResult.rows[0][0];
                console.log(`📊 Total records in comments_2024: ${totalRecords}`);

                // Show sample data structure
                const sampleResult = await connection.execute(`
                    SELECT QUESTION_ID, COMMENTS, TOPICS 
                    FROM comments_2024 
                    WHERE ROWNUM <= 3
                `);

                console.log('📋 Sample data structure:');
                sampleResult.rows.forEach((row, index) => {
                    console.log(`  Record ${index + 1}:`);
                    console.log(`    QUESTION_ID: ${row[0]}`);
                    console.log(`    COMMENTS: ${row[1] ? row[1].substring(0, 100) + '...' : 'NULL'}`);
                    console.log(`    TOPICS: ${row[2] || 'NULL'}`);
                });
            } else {
                console.log('❌ comments_2024 table not found');
                console.log('Available tables:');
                const tables = await connection.execute('SELECT table_name FROM user_tables ORDER BY table_name');
                tables.rows.forEach((row) => {
                    console.log(`  - ${row[0]}`);
                });
            }
        } finally {
            await connection.close();
        }

        await pool.close();
    } catch (error) {
        console.error('❌ Oracle connection failed:', error.message);
        throw error;
    }
}

/**
 * Test Elasticsearch connection using fetch (matching route.ts pattern)
 */
async function testElasticsearchConnection() {
    console.log('\nTesting Elasticsearch connection...');

    try {
        // Handle ELASTICSEARCH_HOST that might contain protocol
        let baseUrl;
        if (ELASTICSEARCH_HOST.startsWith('http://') || ELASTICSEARCH_HOST.startsWith('https://')) {
            baseUrl = ELASTICSEARCH_HOST;
        } else {
            baseUrl = `http://${ELASTICSEARCH_HOST}`;
        }

        const headers = { 'Content-Type': 'application/json' };

        // Support both local (Basic Auth) and cloud (API Key) authentication
        if (ELASTICSEARCH_API_KEY) {
            // Cloud Elasticsearch with API Key
            headers['Authorization'] = `ApiKey ${ELASTICSEARCH_API_KEY}`;
        } else if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
            // Local Elasticsearch with username/password
            const auth = Buffer.from(`${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${auth}`;
        }

        // Test basic connection
        const infoResponse = await fetch(`${baseUrl}/`, {
            method: 'GET',
            headers,
            // Use HTTPS agent for self-signed certificates in development
            // @ts-ignore - Node.js specific option
            agent: baseUrl.startsWith('https://') ? httpsAgent : undefined
        });

        if (!infoResponse.ok) {
            throw new Error(`Elasticsearch info request failed: ${infoResponse.status} ${infoResponse.statusText}`);
        }

        const info = await infoResponse.json();
        console.log('✅ Elasticsearch connection successful');
        console.log(`📊 Cluster: ${info.cluster_name}`);
        console.log(`🔗 Version: ${info.version.number}`);

        // Test index operations
        const testIndex = 'test_connection_index';

        // Create test index
        const createResponse = await fetch(`${baseUrl}/${testIndex}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                mappings: {
                    properties: {
                        test_field: { type: 'text' }
                    }
                }
            }),
            // @ts-ignore - Node.js specific option
            agent: baseUrl.startsWith('https://') ? httpsAgent : undefined
        });

        if (!createResponse.ok) {
            throw new Error(`Index creation failed: ${createResponse.status} ${createResponse.statusText}`);
        }
        console.log('✅ Index creation successful');

        // Index a test document
        const indexResponse = await fetch(`${baseUrl}/${testIndex}/_doc`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                test_field: 'test value',
                timestamp: new Date().toISOString()
            }),
            // @ts-ignore - Node.js specific option
            agent: baseUrl.startsWith('https://') ? httpsAgent : undefined
        });

        if (!indexResponse.ok) {
            throw new Error(`Document indexing failed: ${indexResponse.status} ${indexResponse.statusText}`);
        }
        console.log('✅ Document indexing successful');

        // Search test document
        const searchResponse = await fetch(`${baseUrl}/${testIndex}/_search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: {
                    match: {
                        test_field: 'test'
                    }
                }
            }),
            // @ts-ignore - Node.js specific option
            agent: baseUrl.startsWith('https://') ? httpsAgent : undefined
        });

        if (!searchResponse.ok) {
            throw new Error(`Search operation failed: ${searchResponse.status} ${searchResponse.statusText}`);
        }
        console.log('✅ Search operation successful');

        // Clean up test index
        const deleteResponse = await fetch(`${baseUrl}/${testIndex}`, {
            method: 'DELETE',
            headers,
            // @ts-ignore - Node.js specific option
            agent: baseUrl.startsWith('https://') ? httpsAgent : undefined
        });

        if (!deleteResponse.ok) {
            console.warn('⚠️ Index cleanup failed (this is not critical)');
        } else {
            console.log('✅ Index cleanup successful');
        }
    } catch (error) {
        console.error('❌ Elasticsearch connection failed:', error.message);
        throw error;
    }
}

/**
 * Main test function
 */
async function runTests() {
    console.log('🔍 Running connection tests...\n');

    try {
        await testOracleConnection();
        await testElasticsearchConnection();

        console.log('\n✅ All connection tests passed!');
        console.log('🚀 Ready to run the migration job.');
    } catch (error) {
        console.error('\n❌ Connection tests failed!');
        console.error('Please check your configuration and try again.');
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = {
    testOracleConnection,
    testElasticsearchConnection,
    runTests
};
