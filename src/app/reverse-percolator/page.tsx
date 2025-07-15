import { ReversePercolatorDemo } from '../components/ReversePercolatorDemo';

export default function ReversePercolatorPage() {
    return (
        <div className='container mx-auto p-6'>
            <div className='mb-6'>
                <h1 className='text-3xl font-bold'>Reverse Percolator Demo</h1>
                <p className='mt-2 text-gray-600'>
                    Test new rules against existing comments to see what they would match
                </p>
            </div>
            <ReversePercolatorDemo />
        </div>
    );
}
