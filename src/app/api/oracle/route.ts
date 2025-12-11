import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for oracledb (only available in Node.js environment)
let oracledb: any;
try {
    oracledb = require('oracledb');
} catch (error) {
    console.warn('oracledb not available. Make sure to install it: npm install oracledb');
}

// Oracle Configuration
const ORACLE_USER = process.env.ORACLE_USER || '';
const ORACLE_PASSWORD = process.env.ORACLE_PASSWORD || '';
const ORACLE_CONNECT_STRING =
    process.env.ORACLE_CONNECT_STRING ||
    `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.ORACLE_HOST || 'localhost'})(PORT=${process.env.ORACLE_PORT || '1521'}))(CONNECT_DATA=(SID=${process.env.ORACLE_SID || 'XE'})))`;

// Initialize Oracle connection pool
let oraclePool: oracledb.Pool | null = null;

async function getOraclePool(): Promise<oracledb.Pool> {
    if (!oraclePool) {
        try {
            oraclePool = await oracledb.createPool({
                user: ORACLE_USER,
                password: ORACLE_PASSWORD,
                connectString: ORACLE_CONNECT_STRING,
                poolMin: 2,
                poolMax: 10,
                poolIncrement: 1
            });
        } catch (error) {
            console.error('Failed to create Oracle connection pool:', error);
            throw error;
        }
    }

    return oraclePool;
}

export async function POST(request: NextRequest) {
    try {
        if (!oracledb) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'oracledb package not installed. Please run: npm install oracledb'
                },
                { status: 500 }
            );
        }

        const { operation, params } = await request.json();

        const pool = await getOraclePool();
        const connection = await pool.getConnection();

        try {
            let result;

            switch (operation) {
                case 'matchRules': {
                    // Match comment against rules using Oracle Text
                    // For percolation-style matching, we need to create a temp comment record
                    // Then match it against all rules using Oracle Text CONTAINS
                    const { comment_text } = params;

                    // Create a temporary comment record and test against rules
                    // Use a temp table approach or inline test
                    // Note: Oracle Text CONTAINS requires a column, so we need to use a different approach
                    // We'll iterate through rules or use a temp table

                    // Simple approach: Test each rule expression against the comment text
                    // Using a subquery that tests the comment text as if it were in a table
                    // Note: This requires a workaround since CONTAINS needs an indexed column

                    // Better approach: Create temp table with the comment, index it, then query
                    const tempTableName = `TEMP_COMMENT_${Date.now()}`;

                    try {
                        // Create temporary table for the comment
                        await connection.execute(
                            `CREATE GLOBAL TEMPORARY TABLE ${tempTableName} (
                                id NUMBER PRIMARY KEY,
                                comment_text CLOB
                            ) ON COMMIT DELETE ROWS`
                        );

                        // Insert comment
                        await connection.execute(
                            `INSERT INTO ${tempTableName} (id, comment_text) VALUES (1, :comment_text)`,
                            { comment_text }
                        );

                        // Create temporary CONTEXT index (if possible) or use simpler matching
                        // For simplicity, we'll query rules and test expressions manually
                        // Actually, let's fetch all rules and test them in application code or use a different SQL approach

                        // Alternative: Use a function-based approach or test rules one by one
                        // For now, let's get all rules and let the application test them
                        // OR use a simpler pattern matching approach

                        // Best working approach: Use LIKE/REGEXP_LIKE for basic matching until Oracle Text is set up properly
                        // For production, you'd want to use a proper temp table with CONTEXT index

                        // Query rules and check if comment matches (simplified - may need Oracle Text setup)
                        result = await connection.execute(
                            `SELECT 
                                r.RULE_ID,
                                r.TOPIC,
                                r.DESCRIPTION,
                                1.0 as SCORE,
                                :comment_text as HIGHLIGHTED_TEXT
                            FROM COMMENT_RULES r
                            WHERE REGEXP_LIKE(:comment_text, 
                                REGEXP_REPLACE(
                                    REGEXP_REPLACE(
                                        NVL(r.RULE_EXPR_RAW, ''),
                                        'NEAR|WITHIN|OR|AND',
                                        '|',
                                        1, 0, 'i'
                                    ),
                                    '"',
                                    ''
                                ),
                                'i'
                            )
                            ORDER BY r.RULE_ID`,
                            { comment_text },
                            {
                                outFormat: oracledb.OUT_FORMAT_OBJECT
                            }
                        );

                        // Cleanup
                        await connection.execute(`DROP TABLE ${tempTableName}`);
                    } catch (tempError: any) {
                        // If temp table fails, use simple rule fetch (will need app-side matching)
                        console.warn('Temp table approach failed, using simple query:', tempError.message);
                        result = await connection.execute(
                            `SELECT 
                                RULE_ID,
                                TOPIC,
                                DESCRIPTION,
                                1.0 as SCORE,
                                :comment_text as HIGHLIGHTED_TEXT
                            FROM COMMENT_RULES
                            ORDER BY RULE_ID`,
                            { comment_text },
                            {
                                outFormat: oracledb.OUT_FORMAT_OBJECT
                            }
                        );
                    }
                    break;
                }

                case 'getTopics': {
                    // Get distinct topics
                    result = await connection.execute(
                        `SELECT DISTINCT TOPIC as NAME, 
                         LOWER(REPLACE(TOPIC, ' ', '-')) as ID
                        FROM COMMENT_RULES
                        ORDER BY TOPIC`,
                        {},
                        {
                            outFormat: oracledb.OUT_FORMAT_OBJECT
                        }
                    );
                    break;
                }

                case 'getRulesByTopic': {
                    // Get rules by topic
                    const { topic } = params;
                    result = await connection.execute(
                        `SELECT 
                            RULE_ID as ID,
                            DESCRIPTION,
                            TOPIC,
                            (SELECT COUNT(DISTINCT COMMENT_TEXT) FROM MATCHED_COMMENTS WHERE RULE_ID = COMMENT_RULES.RULE_ID) as UNIQUE_COUNT,
                            (SELECT COUNT(*) FROM MATCHED_COMMENTS WHERE RULE_ID = COMMENT_RULES.RULE_ID) as TOTAL_COUNT
                        FROM COMMENT_RULES
                        WHERE TOPIC = :topic
                        ORDER BY RULE_ID`,
                        { topic },
                        {
                            outFormat: oracledb.OUT_FORMAT_OBJECT
                        }
                    );
                    break;
                }

                case 'getMatchedComments': {
                    // Get matched comments
                    const { topic, rule_id, search_term, limit = 50, offset = 0 } = params;
                    let query = `SELECT 
                        COMMENT_TEXT,
                        HIGHLIGHTED_TEXT,
                        DESCRIPTION,
                        TOPIC,
                        RULE_ID,
                        SCORE,
                        TIMESTAMP
                    FROM MATCHED_COMMENTS
                    WHERE 1=1`;
                    const binds: any = {};

                    if (topic) {
                        query += ` AND TOPIC = :topic`;
                        binds.topic = topic;
                    }

                    if (rule_id) {
                        query += ` AND RULE_ID = :rule_id`;
                        binds.rule_id = rule_id;
                    }

                    if (search_term) {
                        query += ` AND CONTAINS(COMMENT_TEXT, :search_term, 1) > 0`;
                        binds.search_term = search_term;
                    }

                    query += ` ORDER BY TIMESTAMP DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
                    binds.offset = offset;
                    binds.limit = limit;

                    result = await connection.execute(query, binds, {
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                    });
                    break;
                }

                case 'storeMatch': {
                    // Store matched comment
                    const { rule_id, comment_text, topic, description, score, highlighted_text, matched_terms } =
                        params;
                    result = await connection.execute(
                        `INSERT INTO MATCHED_COMMENTS 
                        (RULE_ID, COMMENT_TEXT, TOPIC, DESCRIPTION, SCORE, HIGHLIGHTED_TEXT, MATCHED_TERMS, TIMESTAMP)
                        VALUES (:rule_id, :comment_text, :topic, :description, :score, :highlighted_text, :matched_terms, SYSTIMESTAMP)
                        RETURNING ROWID INTO :rowid`,
                        {
                            rule_id,
                            comment_text,
                            topic,
                            description: description || null,
                            score: score || 0,
                            highlighted_text: highlighted_text || comment_text,
                            matched_terms: matched_terms ? JSON.stringify(matched_terms) : null,
                            rowid: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                        },
                        {
                            outFormat: oracledb.OUT_FORMAT_OBJECT,
                            autoCommit: true
                        }
                    );
                    break;
                }

                case 'getTopicCounts': {
                    // Get topic-level counts
                    const { topic } = params;
                    result = await connection.execute(
                        `SELECT 
                            COUNT(*) as TOTAL,
                            COUNT(DISTINCT COMMENT_TEXT) as UNIQUE_COUNT
                        FROM MATCHED_COMMENTS
                        WHERE TOPIC = :topic`,
                        { topic },
                        {
                            outFormat: oracledb.OUT_FORMAT_OBJECT
                        }
                    );
                    break;
                }

                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }

            await connection.close();

            return NextResponse.json({
                success: true,
                data: result.rows || []
            });
        } catch (dbError: any) {
            await connection.close();
            console.error('Oracle query error:', dbError);

            return NextResponse.json(
                {
                    success: false,
                    error: dbError.message || 'Database query failed'
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Oracle API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to connect to Oracle'
            },
            { status: 500 }
        );
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
