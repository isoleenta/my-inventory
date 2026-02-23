import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome({ auth }) {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [clickedCta, setClickedCta] = useState(false);

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-black text-green-light">
                <div className="relative mx-auto max-w-4xl px-6 py-12">
                    <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
                        <span className="text-xl font-semibold text-green">
                            Inventory Organizer
                        </span>
                        <nav className="flex gap-3">
                            {auth?.user ? (
                                <Link
                                    href={route('inventory.index')}
                                    className="rounded-lg border border-green/50 bg-green/10 px-4 py-2 text-green transition hover:bg-green/20 hover:border-green focus:outline-none focus-visible:ring-2 focus-visible:ring-green"
                                >
                                    Go to inventory
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg border border-green/50 px-4 py-2 text-green transition hover:bg-green/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-green"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-lg bg-green px-4 py-2 text-black transition hover:bg-green-light focus:outline-none focus-visible:ring-2 focus-visible:ring-green"
                                    >
                                        Get started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="space-y-16">
                        <section className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                Keep track of what you own
                            </h1>
                            <p className="mt-4 text-lg text-green-light/90">
                                Organize items by category and place. Add
                                photos, filter your list, and find anything
                                quickly.
                            </p>
                        </section>

                        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    title: 'Categories & places',
                                    description:
                                        'Use prebuilt categories like Electronics, Tools, Food, and places like Garage, Kitchen, Fridge.',
                                    id: 'cat',
                                },
                                {
                                    title: 'Photos',
                                    description:
                                        'Attach up to 10 photos per item so you can see what you have at a glance.',
                                    id: 'photos',
                                },
                                {
                                    title: 'Filter & search',
                                    description:
                                        'Filter your inventory by category or place to find items fast.',
                                    id: 'filter',
                                },
                            ].map((card) => (
                                <div
                                    key={card.id}
                                    onMouseEnter={() => setHoveredCard(card.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    onClick={() => setHoveredCard(card.id)}
                                    onBlur={() => setHoveredCard(null)}
                                    role="button"
                                    tabIndex={0}
                                    className={`cursor-pointer rounded-xl border p-6 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                                        hoveredCard === card.id
                                            ? 'border-green bg-green/10 scale-[1.02]'
                                            : 'border-green/30 bg-black-light hover:border-green/60'
                                    }`}
                                >
                                    <h2 className="text-lg font-semibold text-white">
                                        {card.title}
                                    </h2>
                                    <p className="mt-2 text-sm text-green-light/80">
                                        {card.description}
                                    </p>
                                </div>
                            ))}
                        </section>

                        <section className="flex flex-col items-center gap-6 text-center">
                            <p className="text-lg text-green-light/90">
                                Ready to organize your inventory?
                            </p>
                            {auth?.user ? (
                                <Link
                                    href={route('inventory.index')}
                                    className="rounded-lg bg-green px-6 py-3 text-lg font-medium text-black transition hover:bg-green-light focus:outline-none focus-visible:ring-2 focus-visible:ring-green"
                                >
                                    Open my inventory
                                </Link>
                            ) : (
                                <Link
                                    href={route('register')}
                                    onFocus={() => setClickedCta(true)}
                                    onBlur={() => setClickedCta(false)}
                                    className={`rounded-lg px-6 py-3 text-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                                        clickedCta
                                            ? 'bg-green-light text-black'
                                            : 'bg-green text-black hover:bg-green-light'
                                    }`}
                                >
                                    Get started
                                </Link>
                            )}
                        </section>
                    </main>

                    <footer className="mt-20 border-t border-green/20 pt-8 text-center text-sm text-green-light/60">
                        Inventory Organizer — track what you own
                    </footer>
                </div>
            </div>
        </>
    );
}
