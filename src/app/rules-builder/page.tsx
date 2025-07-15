import { CommentRulesBuilder } from '../components/CommentRulesBuilder';

export default function RulesBuilderPage() {
    return (
        <div className='container mx-auto py-8'>
            <div className='mb-8'>
                <h1 className='mb-2 text-3xl font-bold'>Comment Rules Builder</h1>
                <p className='text-muted-foreground'>
                    Create and manage Elasticsearch percolator rules for comment analysis
                </p>
            </div>

            <CommentRulesBuilder />
        </div>
    );
}
