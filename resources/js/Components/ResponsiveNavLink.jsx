import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-green bg-green/10 text-green-light focus:border-green focus:bg-green/20 focus:text-green-light'
                    : 'border-transparent text-green-light/70 hover:border-green/50 hover:bg-black-light hover:text-green-light focus:border-green/50 focus:bg-black-light focus:text-green-light'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
