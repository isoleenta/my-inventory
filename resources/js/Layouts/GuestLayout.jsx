import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#0a0a0a] pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="text-primary hover:text-primary-light">
                    <ApplicationLogo className="h-20 w-20 fill-current text-primary" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden border border-white/10 bg-surface px-6 py-4 sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
