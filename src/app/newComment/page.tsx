import TextAnalyticsInputPage from '../components/TextAnalyticsInputPage';

export default function ExamplesPage() {
    return (
        <div className='container mx-auto p-6'>
            <div className='mb-6'>
                <h1 className='text-3xl font-bold'>New Comment Analysis</h1>
                <p className='mt-2 text-gray-600'>
                    Enter a new comment to analyze. The system will search for matching rules using percolation and
                    store the results in the matched_comments index.
                </p>
            </div>
            <TextAnalyticsInputPage />
        </div>
    );
}
