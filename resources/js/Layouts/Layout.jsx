import { Link, usePage } from '@inertiajs/react';

export default function Layout({ children, header = null }) {
    const { auth } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-gray-100 font-sans">
            <header className="shrink-0 border-b border-white/10 bg-[#111]">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="text-xl font-semibold text-primary hover:text-primary-light"
                    >
                        Inventory Organizer
                    </Link>
                    <nav className="flex items-center gap-4">
                        {auth?.user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="rounded-md px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/inventory"
                                    className="rounded-md px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    Inventory
                                </Link>
                                <Link
                                    href="/categories"
                                    className="rounded-md px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    Categories
                                </Link>
                                <Link
                                    href={route('profile.edit')}
                                    className="rounded-md px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="rounded-md px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
                                >
                                    Logout
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-md px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary-light"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {header && (
                <header className="bg-surface">
                    <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>

            <footer className="shrink-0 border-t border-white/10 bg-[#111]">
                <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Inventory Organizer
                </div>
            </footer>
        </div>
    );
}
