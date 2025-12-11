import OracleTextAnalyticsInputPage from '../../components/OracleTextAnalyticsInputPage';

export default function OracleNewCommentPage() {
    return (
        <div className='container mx-auto p-6'>
            <div className='mb-6'>
                <h1 className='text-3xl font-bold'>Oracle Text Analytics: New Comment</h1>
                <p className='mt-2 text-gray-600'>
                    Enter a new comment to analyze using Oracle Text. The system will search for matching rules and
                    store the results in the matched_comments table.
                </p>
            </div>
            <OracleTextAnalyticsInputPage />
        </div>
    );
}
