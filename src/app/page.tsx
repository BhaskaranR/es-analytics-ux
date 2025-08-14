import TextAnalyticsPage from './components/TextAnalyticsPage';

export interface Topic {
    id: string;
    name: string;
    count: number;
}

/**
 * The main page component that renders the TextAnalyticsPage component with SSR topics.
 *
 * @returns {Promise<JSX.Element>} The rendered TextAnalyticsPage component with topics.
 */
const Page = async () => {
    // Fetch distinct topics server-side using the existing API route
    let topics: Topic[] = [];

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/elasticsearch`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/comment_rules/_search',
                    method: 'POST',
                    body: {
                        size: 0,
                        aggs: {
                            topics: {
                                terms: {
                                    field: 'topic.keyword',
                                    size: 100
                                },
                                aggs: {
                                    rule_count: {
                                        value_count: {
                                            field: '_id'
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            topics =
                data.aggregations?.topics?.buckets?.map((bucket: any) => ({
                    id: bucket.key.toLowerCase().replace(/\s+/g, '-'),
                    name: bucket.key,
                    count: bucket.rule_count.value
                })) || [];
        }
    } catch (error) {
        console.error('Error fetching topics server-side:', error);
    }

    // Fallback to default topics if no data found
    if (topics.length === 0) {
        topics = [
            { id: 'career-development', name: 'Career Development', count: 0 },
            { id: 'client-support', name: 'Client Support', count: 0 },
            { id: 'team-collaboration', name: 'Team Collaboration', count: 0 }
        ];
    }

    return <TextAnalyticsPage initialTopics={topics} />;
};

export default Page;
