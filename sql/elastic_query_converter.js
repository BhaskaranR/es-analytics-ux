/**
 * Elasticsearch Query to User-Friendly Description Converter
 * Converts Elasticsearch interval queries to Oracle-style descriptions
 */

class ElasticQueryConverter {
    constructor() {
        // Synonym group mappings for better descriptions
        this.synonymGroups = {
            bacghr_client: 'client/customer/user',
            bacghr_internalmove: 'internal/transfer/IJP',
            bacghr_career: 'career/promotion/growth',
            bacghr_onboarding: 'onboarding/orientation',
            bacghr_team: 'team/collaboration',
            bacghr_support: 'support/assistance/help',
            bacghr_learning: 'learning/training/education',
            bacghr_opportunity: 'opportunity/chance/possibility',
            bacghr_advancement: 'advancement/promotion/raise',
            bacghr_mentorship: 'mentor/guidance/coaching'
        };

        // Common word mappings for better readability
        this.wordMappings = {
            lack: 'lack of',
            clear: 'clear',
            future: 'future',
            goal: 'goal',
            skill: 'skill',
            professional: 'professional',
            feedback: 'feedback'
        };
    }

    /**
     * Convert Elasticsearch interval query to user-friendly description
     * @param {Object} query - The Elasticsearch query object
     * @returns {string} - User-friendly description
     */
    convertIntervalQuery(query) {
        try {
            if (!query.intervals) {
                return 'Invalid query format';
            }

            const intervals = query.intervals;
            if (!intervals.comment_text) {
                return 'No comment_text field found';
            }

            const commentTextQuery = intervals.comment_text;

            // Handle different interval query types
            if (commentTextQuery.all_of) {
                return this._convertAllOfQuery(commentTextQuery.all_of);
            } else if (commentTextQuery.match) {
                return this._convertMatchQuery(commentTextQuery.match);
            } else {
                return 'Unsupported query type';
            }
        } catch (error) {
            return `Error converting query: ${error.message}`;
        }
    }

    /**
     * Convert 'all_of' (AND) interval query to description
     * @param {Object} allOfQuery - The all_of query object
     * @returns {string} - User-friendly description
     */
    _convertAllOfQuery(allOfQuery) {
        const intervals = allOfQuery.intervals || [];
        const ordered = allOfQuery.ordered || false;

        if (!intervals.length) {
            return 'No intervals found';
        }

        // Extract terms and max_gaps
        const terms = [];
        let maxGaps = null;

        for (const interval of intervals) {
            if (interval.match) {
                const match = interval.match;
                const queryTerm = match.query || '';
                const currentMaxGaps = match.max_gaps;

                // Convert synonym groups to user-friendly terms
                const userTerm = this._convertSynonymGroup(queryTerm);
                terms.push(userTerm);

                // Use the first max_gaps value (they should be consistent)
                if (maxGaps === null) {
                    maxGaps = currentMaxGaps;
                }
            }
        }

        if (!terms.length) {
            return 'No matching terms found';
        }

        // Build description
        if (terms.length === 1) {
            return `'${terms[0]}'`;
        } else if (terms.length === 2) {
            const proximity = maxGaps ? ` WITHIN ${maxGaps} WORDS` : '';
            const orderDesc = ordered ? 'IN ORDER' : 'IN ANY ORDER';

            return `'${terms[0]}' NEAR '${terms[1]}'${proximity} (${orderDesc})`;
        } else {
            const proximity = maxGaps ? ` WITHIN ${maxGaps} WORDS` : '';
            const orderDesc = ordered ? 'IN ORDER' : 'IN ANY ORDER';
            const termsStr = terms.map((term) => `'${term}'`).join(' AND ');

            return `${termsStr}${proximity} (${orderDesc})`;
        }
    }

    /**
     * Convert single 'match' interval query to description
     * @param {Object} matchQuery - The match query object
     * @returns {string} - User-friendly description
     */
    _convertMatchQuery(matchQuery) {
        const queryTerm = matchQuery.query || '';
        const ordered = matchQuery.ordered !== undefined ? matchQuery.ordered : true;
        const maxGaps = matchQuery.max_gaps;

        // Convert synonym groups to user-friendly terms
        const userTerm = this._convertSynonymGroup(queryTerm);

        // Handle phrase vs single term
        if (userTerm.includes(' ')) {
            const proximity = maxGaps ? ` WITHIN ${maxGaps} WORDS` : '';
            const orderDesc = ordered ? 'AS PHRASE' : 'IN ANY ORDER';

            return `'${userTerm}'${proximity} (${orderDesc})`;
        } else {
            return `'${userTerm}'`;
        }
    }

    /**
     * Convert synonym group terms to user-friendly descriptions
     * @param {string} term - The term to convert
     * @returns {string} - User-friendly term
     */
    _convertSynonymGroup(term) {
        // Check if it's a synonym group
        if (this.synonymGroups[term]) {
            return this.synonymGroups[term];
        }

        // Check word mappings
        if (this.wordMappings[term]) {
            return this.wordMappings[term];
        }

        return term;
    }

    /**
     * Convert multiple rules at once
     * @param {Array} rulesData - Array of rule objects from Elasticsearch
     * @returns {Array} - Array of converted descriptions
     */
    convertBulkRules(rulesData) {
        const results = [];

        for (const rule of rulesData) {
            const ruleId = rule._id || 'unknown';
            const topic = rule._source?.topic || 'Unknown Topic';
            const query = rule._source?.query || {};

            const description = this.convertIntervalQuery(query);

            results.push({
                rule_id: ruleId,
                topic: topic,
                description: description
            });
        }

        return results;
    }

    /**
     * Convert rules from Elasticsearch search response
     * @param {Object} esResponse - Elasticsearch search response
     * @returns {Array} - Array of converted descriptions
     */
    convertFromElasticsearchResponse(esResponse) {
        const hits = esResponse?.hits?.hits || [];

        return this.convertBulkRules(hits);
    }
}

// Example usage and testing
function runExamples() {
    const converter = new ElasticQueryConverter();

    // Example queries from your rules
    const testQueries = [
        {
            name: 'Client Support Rule',
            query: {
                intervals: {
                    comment_text: {
                        all_of: {
                            ordered: false,
                            intervals: [
                                { match: { query: 'bacghr_client', analyzer: 'search_analyzer', max_gaps: 5 } },
                                { match: { query: 'bacghr_support', analyzer: 'search_analyzer', max_gaps: 5 } }
                            ]
                        }
                    }
                }
            }
        },
        {
            name: 'Career Growth Rule',
            query: {
                intervals: {
                    comment_text: {
                        all_of: {
                            ordered: false,
                            intervals: [
                                { match: { query: 'bacghr_career', analyzer: 'search_analyzer', max_gaps: 5 } },
                                { match: { query: 'bacghr_opportunity', analyzer: 'search_analyzer', max_gaps: 5 } }
                            ]
                        }
                    }
                }
            }
        },
        {
            name: 'Onboarding Feedback Rule',
            query: {
                intervals: {
                    comment_text: {
                        match: {
                            query: 'orientation experience',
                            analyzer: 'search_analyzer',
                            ordered: true,
                            max_gaps: 2
                        }
                    }
                }
            }
        },
        {
            name: 'Career Path Rule',
            query: {
                intervals: {
                    comment_text: {
                        all_of: {
                            ordered: false,
                            intervals: [
                                {
                                    match: {
                                        query: 'career path',
                                        analyzer: 'search_analyzer',
                                        ordered: true,
                                        max_gaps: 2
                                    }
                                },
                                { match: { query: 'clear', analyzer: 'search_analyzer', max_gaps: 5 } }
                            ]
                        }
                    }
                }
            }
        }
    ];

    console.log('Elasticsearch Query to User-Friendly Description Converter');
    console.log('='.repeat(60));

    for (const test of testQueries) {
        const description = converter.convertIntervalQuery(test.query);
        console.log(`\n${test.name}:`);
        console.log(`Description: ${description}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Usage Examples:');
    console.log('1. converter.convertIntervalQuery(queryObject)');
    console.log('2. converter.convertBulkRules(rulesArray)');
    console.log('3. converter.convertFromElasticsearchResponse(esResponse)');
}

// Export for Node.js or browser use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElasticQueryConverter;
} else if (typeof window !== 'undefined') {
    window.ElasticQueryConverter = ElasticQueryConverter;
}

// Run examples if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    runExamples();
}
