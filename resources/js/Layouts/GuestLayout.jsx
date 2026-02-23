import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-black pt-6 text-green-light sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">
                    <ApplicationLogo className="h-20 w-20" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden border border-green/30 bg-black-light px-6 py-6 sm:max-w-md sm:rounded-xl">
                {children}
            </div>
        </div>
    );
}
