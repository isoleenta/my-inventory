import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-green text-green-light focus:border-green'
                    : 'border-transparent text-green-light/70 hover:border-green/50 hover:text-green-light focus:border-green/50 focus:text-green-light') +
                className
            }
        >
            {children}
        </Link>
    );
}
