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
                    ? 'border-primary bg-primary/10 text-primary focus:border-primary-light focus:bg-primary/20'
                    : 'border-transparent text-gray-400 hover:border-white/30 hover:bg-white/5 hover:text-gray-200 focus:border-white/30 focus:bg-white/5 focus:text-gray-200'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
