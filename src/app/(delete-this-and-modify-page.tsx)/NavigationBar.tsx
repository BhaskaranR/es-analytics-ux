
import NavigationLinks from '@/app/(delete-this-and-modify-page.tsx)/NavigationLinks';

const NavigationBar = () => {
    return (
        <div className='mx-auto mt-3 flex w-full max-w-7xl flex-col-reverse items-center justify-between gap-6 px-3 sm:flex-row sm:px-0 lg:mt-6'>
            <NavigationLinks />
            <div className='flex w-full justify-between gap-6 sm:w-auto sm:items-center'>
            </div>
        </div>
    );
};

export default NavigationBar;
