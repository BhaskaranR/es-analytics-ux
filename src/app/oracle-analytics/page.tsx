import OracleTextAnalyticsPage from '../components/OracleTextAnalyticsPage';

export interface Topic {
    id: string;
    name: string;
}

/**
 * Oracle Analytics main page component that renders the OracleTextAnalyticsPage with SSR topics.
 */
const Page = async () => {
    // Fetch distinct topics server-side using Oracle API
    let topics: Topic[] = [];

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/oracle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operation: 'getTopics',
                params: {}
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                topics = result.data.map((item: any) => ({
                    id: item.ID || item.id || item.NAME?.toLowerCase().replace(/\s+/g, '-'),
                    name: item.NAME || item.name
                }));
            }
        }
    } catch (error) {
        console.error('Error fetching topics server-side:', error);
    }

    // Fallback to default topics if no data found
    if (topics.length === 0) {
        topics = [
            { id: 'career-development', name: 'Career Development' },
            { id: 'client-support', name: 'Client Support' },
            { id: 'team-collaboration', name: 'Team Collaboration' }
        ];
    }

    return <OracleTextAnalyticsPage initialTopics={topics} />;
};

export default Page;
