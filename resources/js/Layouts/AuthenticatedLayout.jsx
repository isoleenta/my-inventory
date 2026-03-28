import CurrencyToggle from '@/Components/CurrencyToggle';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const flash = page.props.flash;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-gray-100 font-sans">
            <header className="shrink-0 border-b border-white/10 bg-[#111]">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-primary transition hover:opacity-90"
                    >
                        <img src="/images/logo.png" alt="isoleenta" className="h-8 w-8 object-contain invert" />
                        <span className="text-xl font-semibold text-primary hover:text-primary-light">isoleenta</span>
                    </Link>
                    <nav className="flex items-center gap-1">
                        <div className="hidden gap-1 sm:flex">
                            <Link
                                href={route('dashboard')}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                                    route().current('dashboard')
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route('inventory.index')}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                                    route().current('inventory.*')
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                Inventory
                            </Link>
                            <Link
                                href={route('categories.index')}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                                    route().current('categories.*')
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                Categories
                            </Link>
                            <Link
                                href={route('places.index')}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                                    route().current('places.*')
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                Places
                            </Link>
                        </div>
                        <div className="hidden pl-2 sm:block">
                            <CurrencyToggle />
                        </div>
                        <div className="relative ml-2">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white focus:outline-none"
                                        >
                                            {user.name}
                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route('profile.edit')}
                                    >
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setShowingNavigationDropdown(
                                    (prev) => !prev,
                                )
                            }
                            className="rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-gray-300 sm:hidden"
                        >
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                {!showingNavigationDropdown ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                )}
                            </svg>
                        </button>
                    </nav>
                </div>
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' border-t border-white/10 sm:hidden'
                    }
                >
                    <div className="space-y-1 px-4 py-3">
                        <div className="mb-3 flex justify-start">
                            <CurrencyToggle />
                        </div>
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('inventory.index')}
                            active={route().current('inventory.*')}
                        >
                            Inventory
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('categories.index')}
                            active={route().current('categories.*')}
                        >
                            Categories
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('places.index')}
                            active={route().current('places.*')}
                        >
                            Places
                        </ResponsiveNavLink>
                    </div>
                    <div className="border-t border-white/10 px-4 py-3">
                        <div className="text-sm font-medium text-gray-200">
                            {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                            {user.email}
                        </div>
                        <div className="mt-2 flex gap-2">
                            <Link
                                href={route('profile.edit')}
                                className="rounded-md px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
                            >
                                Profile
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-white/5"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {header && (
                <header className="bg-surface">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {flash?.success ? (
                    <div
                        className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
                        role="status"
                    >
                        {flash.success}
                    </div>
                ) : null}
                {flash?.error ? (
                    <div
                        className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                        role="alert"
                    >
                        {flash.error}
                    </div>
                ) : null}
                {children}
            </main>

            <footer className="shrink-0 border-t border-white/10 bg-[#111]">
                <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-gray-400 sm:px-6 lg:px-8">
                    &copy; {new Date().getFullYear()} isoleenta
                </div>
            </footer>
        </div>
    );
}
