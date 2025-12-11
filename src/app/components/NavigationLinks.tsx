'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAVIGATION_LINKS = [
    { href: '/', label: 'Elasticsearch' },
    { href: '/examples', label: 'ES New Comment' },
    { href: '/oracle-analytics', label: 'Oracle Analytics' },
    { href: '/oracle-analytics/new-comment', label: 'Oracle New Comment' },
    { href: '/rules-builder', label: 'Rules Builder' },
    { href: '/reverse-percolator', label: 'Reverse Percolator' }
];

const NavigationLinks = () => {
    const pathname = usePathname();

    return (
        <div className='flex items-center gap-3'>
            {NAVIGATION_LINKS.map((link) => {
                const active = link.href === '/' ? pathname === link.href : pathname.includes(link.href);

                return (
                    <Link
                        className={`${active ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-transparent'} rounded-xl px-3 py-2`}
                        key={link.href}
                        href={link.href}>
                        {link.label}
                    </Link>
                );
            })}
        </div>
    );
};

export default NavigationLinks;
