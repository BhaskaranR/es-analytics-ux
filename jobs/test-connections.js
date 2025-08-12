#!/usr/bin/env node
/**
 * Test script to validate Oracle and Elasticsearch connections
 * Run this before the main migration job to ensure all connections work
 */

// Load environment variables from .env file
require('dotenv').config();

const { Client } = require('@elastic/elasticsearch');
const oracledb = require('oracledb');

// Configuration (same as main job)
const config = {
    oracle: {
        user: process.env.ORACLE_USER || 'your_username',
        password: process.env.ORACLE_PASSWORD || 'your_password',
        connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/XE',
        poolMin: 2,
        poolMax: 2,
        poolIncrement: 0
    },
    elasticsearch: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: {
            username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
            password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
        },
        tls: {
            rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0'
        }
    }
};

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
 * Test Elasticsearch connection
 */
async function testElasticsearchConnection() {
    console.log('\nTesting Elasticsearch connection...');

    try {
        const client = new Client(config.elasticsearch);

        // Test basic connection
        const info = await client.info();
        console.log('✅ Elasticsearch connection successful');
        console.log(`📊 Cluster: ${info.body.cluster_name}`);
        console.log(`🔗 Version: ${info.body.version.number}`);

        // Test index operations
        const testIndex = 'test_connection_index';

        // Create test index
        await client.indices.create({
            index: testIndex,
            body: {
                mappings: {
                    properties: {
                        test_field: { type: 'text' }
                    }
                }
            }
        });
        console.log('✅ Index creation successful');

        // Index a test document
        await client.index({
            index: testIndex,
            body: {
                test_field: 'test value',
                timestamp: new Date().toISOString()
            }
        });
        console.log('✅ Document indexing successful');

        // Search test document
        const searchResult = await client.search({
            index: testIndex,
            body: {
                query: {
                    match: {
                        test_field: 'test'
                    }
                }
            }
        });
        console.log('✅ Search operation successful');

        // Clean up test index
        await client.indices.delete({
            index: testIndex
        });
        console.log('✅ Index cleanup successful');

        await client.close();
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
