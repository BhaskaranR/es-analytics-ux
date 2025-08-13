#!/usr/bin/env node

/**
 * Oracle Comments Rule Matching Job
 *
 * This job reads all records from Oracle table 'comments_2024' and
 * for each comment, runs percolator queries against existing rules
 * and stores matches in the 'matched_comments' index.
 *
 * Oracle table structure:
 * - QUESTION_ID: Identifies the survey question
 * - COMMENTS: Free-text responses from users
 * - TOPICS: Tag(s) assigned to the comment, possibly auto-detected or manually labeled
 */

// Load environment variables from .env file
require('dotenv').config();

const oracledb = require('oracledb');
const https = require('https');

// Configuration
const config = {
    // Oracle Configuration
    oracle: {
        user: process.env.ORACLE_USER || 'your_username',
        password: process.env.ORACLE_PASSWORD || 'your_password',
        connectString:
            process.env.ORACLE_CONNECT_STRING ||
            `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.ORACLE_HOST || 'localhost'})(PORT=${process.env.ORACLE_PORT || '1521'}))(CONNECT_DATA=(SID=${process.env.ORACLE_SID || 'XE'})))`,
        poolMin: 10,
        poolMax: 10,
        poolIncrement: 0
    },

    // Job Configuration
    job: {
        batchSize: parseInt(process.env.BATCH_SIZE) || 1000,
        matchedCommentsIndex: process.env.MATCHED_COMMENTS_INDEX || 'matched_comments',
        commentRulesIndex: process.env.COMMENT_RULES_INDEX || 'comment_rules',
        maxRetries: 3,
        retryDelay: 5000 // 5 seconds
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

// Elasticsearch base URL
let esBaseUrl;

// Oracle connection pool
let oraclePool;

/**
 * Initialize Oracle connection pool
 */
async function initializeOracle() {
    try {
        console.log('Initializing Oracle connection pool...');

        // Create connection pool
        oraclePool = await oracledb.createPool(config.oracle);

        console.log('Oracle connection pool created successfully');
    } catch (error) {
        console.error('Failed to initialize Oracle connection pool:', error);
        throw error;
    }
}

/**
 * Initialize Elasticsearch connection
 */
function initializeElasticsearch() {
    try {
        console.log('Initializing Elasticsearch connection...');

        // Handle ELASTICSEARCH_HOST that might contain protocol
        if (ELASTICSEARCH_HOST.startsWith('http://') || ELASTICSEARCH_HOST.startsWith('https://')) {
            esBaseUrl = ELASTICSEARCH_HOST;
        } else {
            esBaseUrl = `http://${ELASTICSEARCH_HOST}`;
        }

        console.log(`Elasticsearch base URL: ${esBaseUrl}`);
        console.log('Elasticsearch connection initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Elasticsearch connection:', error);
        throw error;
    }
}

/**
 * Helper function to make Elasticsearch requests
 */
async function esRequest(endpoint, method = 'GET', body = null) {
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

    const response = await fetch(`${esBaseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        // Use HTTPS agent for self-signed certificates in development
        // @ts-ignore - Node.js specific option
        agent: esBaseUrl.startsWith('https://') ? httpsAgent : undefined
    });

    if (!response.ok) {
        throw new Error(`Elasticsearch request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Create matched_comments index with proper mapping
 */
async function createMatchedCommentsIndex() {
    try {
        console.log(`Creating matched_comments index: ${config.job.matchedCommentsIndex}`);

        // Check if index exists
        try {
            await esRequest(`/${config.job.matchedCommentsIndex}`);
            console.log(`Index ${config.job.matchedCommentsIndex} already exists`);

            return;
        } catch (error) {
            // Index doesn't exist, create it
        }

        // Create matched_comments index with mapping
        await esRequest(`/${config.job.matchedCommentsIndex}`, 'PUT', {
            settings: {
                number_of_shards: 1,
                number_of_replicas: 0
            },
            mappings: {
                properties: {
                    rule_id: {
                        type: 'keyword'
                    },
                    comment_text: {
                        type: 'text',
                        analyzer: 'standard'
                    },
                    topic: {
                        type: 'keyword'
                    },
                    description: {
                        type: 'text'
                    },
                    score: {
                        type: 'float'
                    },
                    matched_terms: {
                        type: 'keyword'
                    },
                    max_gaps: {
                        type: 'integer'
                    },
                    ordered: {
                        type: 'boolean'
                    },
                    highlighted_text: {
                        type: 'text'
                    },
                    timestamp: {
                        type: 'date'
                    },
                    oracle_id: {
                        type: 'keyword'
                    },
                    question_id: {
                        type: 'keyword'
                    }
                }
            }
        });

        console.log(`Index ${config.job.matchedCommentsIndex} created successfully`);
    } catch (error) {
        console.error('Failed to create matched_comments index:', error);
        throw error;
    }
}

/**
 * Read data from Oracle in batches
 */
async function readOracleData(offset = 0) {
    try {
        const connection = await oraclePool.getConnection();

        try {
            const query = `
                SELECT 
                    QUESTION_ID,
                    COMMENTS,
                    TOPICS,
                    ROWID as ORACLE_ID
                FROM comments_2024
                ORDER BY QUESTION_ID
                OFFSET :offset ROWS FETCH NEXT :batchSize ROWS ONLY
            `;

            const result = await connection.execute(
                query,
                {
                    offset: offset,
                    batchSize: config.job.batchSize
                },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            return result.rows || [];
        } finally {
            await connection.close();
        }
    } catch (error) {
        console.error('Failed to read data from Oracle:', error);
        throw error;
    }
}

/**
 * Get total count of records in Oracle table
 */
async function getOracleRecordCount() {
    try {
        const connection = await oraclePool.getConnection();

        try {
            const result = await connection.execute(
                'SELECT COUNT(*) as total FROM comments_2024',
                {},
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            return result.rows[0].TOTAL;
        } finally {
            await connection.close();
        }
    } catch (error) {
        console.error('Failed to get Oracle record count:', error);
        throw error;
    }
}

/**
 * Run percolator query for a comment and store matches
 */
async function runPercolatorForComment(commentText, oracleId, questionId) {
    try {
        // Run percolator query
        const percolateResponse = await esRequest(`/${config.job.commentRulesIndex}/_search`, 'POST', {
            query: {
                percolate: {
                    field: 'query',
                    document: {
                        comment_text: commentText
                    }
                }
            },
            highlight: {
                fields: {
                    comment_text: {
                        pre_tags: ['<mark>'],
                        post_tags: ['</mark>'],
                        fragment_size: 150,
                        number_of_fragments: 3
                    }
                }
            }
        });

        const matches = percolateResponse.hits.hits;

        if (matches.length === 0) {
            return;
        }

        // Store each match as a separate document
        const matchOperations = [];

        for (const match of matches) {
            const ruleSource = match._source;
            const highlightedText = match.highlight?.comment_text?.[0] || commentText;

            // Extract matched terms from the query if possible
            let matchedTerms = [];
            if (ruleSource.query?.intervals?.comment_text?.all_of?.intervals) {
                matchedTerms = ruleSource.query.intervals.comment_text.all_of.intervals
                    .map((interval) => interval.match?.query)
                    .filter((term) => term);
            }

            // Extract max_gaps and ordered from the query
            const maxGaps = ruleSource.query?.intervals?.comment_text?.all_of?.intervals?.[0]?.match?.max_gaps || 0;
            const ordered = ruleSource.query?.intervals?.comment_text?.all_of?.ordered || false;

            matchOperations.push({
                index: {
                    _index: config.job.matchedCommentsIndex,
                    _id: `${oracleId}_${match._id}_${Date.now()}`
                }
            });

            matchOperations.push({
                rule_id: match._id,
                comment_text: commentText,
                topic: ruleSource.topic || 'Unknown',
                description: ruleSource.description || '',
                score: match._score || 0,
                matched_terms: matchedTerms,
                max_gaps: maxGaps,
                ordered: ordered,
                highlighted_text: highlightedText,
                timestamp: new Date().toISOString(),
                oracle_id: oracleId,
                question_id: questionId
            });
        }

        if (matchOperations.length > 0) {
            console.log(
                `Found ${matches.length} rule matches for comment ${oracleId}, inserting into ${config.job.matchedCommentsIndex}...`
            );

            const bulkResponse = await esRequest('/_bulk', 'POST', matchOperations.join('\n') + '\n');

            if (bulkResponse.errors) {
                const errors = bulkResponse.items
                    .filter((item) => item.index && item.index.error)
                    .map((item) => item.index.error);

                console.error('Failed to store percolator matches:', errors);
            } else {
                console.log(
                    `✅ Successfully stored ${matches.length} rule matches for comment ${oracleId} in ${config.job.matchedCommentsIndex}`
                );

                // Log details of each match
                matches.forEach((match, index) => {
                    console.log(
                        `  - Match ${index + 1}: Rule "${match._id}" (${match._source.topic || 'Unknown'}) - Score: ${match._score}`
                    );
                });
            }
        } else {
            console.log(`No rule matches found for comment ${oracleId}`);
        }
    } catch (error) {
        console.error(`Failed to run percolator for comment ${oracleId}:`, error.message);
        // Don't throw error to continue processing other comments
    }
}

/**
 * Process batch of comments from Oracle
 */
async function processComments(records) {
    try {
        if (records.length === 0) {
            return;
        }

        console.log(`Processing ${records.length} comments for rule matching...`);

        // Process each comment for rule matching
        for (const record of records) {
            await runPercolatorForComment(record.COMMENTS, record.ORACLE_ID, record.QUESTION_ID);
        }

        console.log(`Completed processing ${records.length} comments`);
    } catch (error) {
        console.error('Failed to process comments:', error);
        throw error;
    }
}

/**
 * Main migration function
 */
async function migrateData() {
    try {
        console.log('Starting Oracle to Elasticsearch migration...');

        // Get total record count
        const totalRecords = await getOracleRecordCount();
        console.log(`Total records to migrate: ${totalRecords}`);

        if (totalRecords === 0) {
            console.log('No records found in Oracle table');

            return;
        }

        let processedRecords = 0;
        let offset = 0;

        while (processedRecords < totalRecords) {
            console.log(
                `Processing batch: ${processedRecords + 1} to ${Math.min(processedRecords + config.job.batchSize, totalRecords)} of ${totalRecords}`
            );

            // Read batch from Oracle
            const records = await readOracleData(offset);

            if (records.length === 0) {
                break;
            }

            // Process comments for rule matching with retry logic
            let retryCount = 0;
            while (retryCount < config.job.maxRetries) {
                try {
                    await processComments(records);
                    break;
                } catch (error) {
                    retryCount++;
                    if (retryCount >= config.job.maxRetries) {
                        throw error;
                    }
                    console.log(`Retry ${retryCount}/${config.job.maxRetries} after error:`, error.message);
                    await new Promise((resolve) => setTimeout(resolve, config.job.retryDelay));
                }
            }

            processedRecords += records.length;
            offset += config.job.batchSize;

            // Progress update
            const progress = ((processedRecords / totalRecords) * 100).toFixed(2);
            console.log(`Progress: ${progress}% (${processedRecords}/${totalRecords})`);
        }

        console.log('Rule matching completed successfully!');

        // Verify matched_comments index
        try {
            const matchedStats = await esRequest(`/${config.job.matchedCommentsIndex}/_stats`);

            const matchedCount = matchedStats.indices[config.job.matchedCommentsIndex].total.docs.count;
            console.log(`Matched comments index contains ${matchedCount} rule matches`);

            // Show sample of matched comments
            const sampleMatches = await esRequest(`/${config.job.matchedCommentsIndex}/_search`, 'POST', {
                size: 3,
                sort: [{ timestamp: { order: 'desc' } }]
            });

            if (sampleMatches.hits.hits.length > 0) {
                console.log('\n📋 Sample matched comments:');
                sampleMatches.hits.hits.forEach((hit, index) => {
                    const source = hit._source;
                    console.log(
                        `  ${index + 1}. Rule: ${source.rule_id} | Topic: ${source.topic} | Score: ${source.score}`
                    );
                    console.log(`     Comment: ${source.comment_text.substring(0, 100)}...`);
                });
            }
        } catch (error) {
            console.error('Failed to verify matched_comments index:', error.message);
        }
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

/**
 * Cleanup function
 */
async function cleanup() {
    try {
        if (oraclePool) {
            await oraclePool.close();
            console.log('Oracle connection pool closed');
        }

        // No need to close fetch-based connection
        console.log('Elasticsearch connection cleanup completed');
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

/**
 * Main execution function
 */
async function main() {
    try {
        // Initialize connections
        await initializeOracle();
        initializeElasticsearch();

        // Create matched_comments index
        await createMatchedCommentsIndex();

        // Perform rule matching
        await migrateData();

        console.log('Job completed successfully!');
    } catch (error) {
        console.error('Job failed:', error);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, cleaning up...');
    await cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, cleaning up...');
    await cleanup();
    process.exit(0);
});

// Run the job
if (require.main === module) {
    main();
}

module.exports = {
    migrateData,
    initializeOracle,
    initializeElasticsearch,
    createMatchedCommentsIndex,
    runPercolatorForComment,
    processComments,
    cleanup
};
