import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from '../Layouts/Layout';

const PLACES = [
    { id: 'garage', label: 'Garage', icon: '🔧' },
    { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { id: 'fridge', label: 'Fridge', icon: '🧊' },
    { id: 'drawers', label: 'Drawers', icon: '🗄️' },
    { id: 'other', label: 'Anywhere', icon: '📦' },
];

const FEATURES = [
    { title: 'Titles & descriptions', desc: 'Name items and add notes so you never forget what’s where.' },
    { title: 'Categories', desc: 'Group by type: tools, groceries, documents, or your own categories.' },
    { title: 'Places', desc: 'Garage, kitchen, fridge, drawers—organize by where things live.' },
    { title: 'Photos', desc: 'Attach photos to items for quick visual reference.' },
];

export default function Home() {
    const [hoveredPlace, setHoveredPlace] = useState(null);
    const { auth } = usePage().props;

    return (
        <Layout>
            <div className="flex flex-col">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface to-surface-light px-6 py-20 text-center sm:py-28">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.15),transparent)]" />
                    <div className="relative">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Organize your inventory{' '}
                            <span className="text-primary">everywhere</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
                            Track what you have by place—garage, bedroom, kitchen, fridge, drawers—with titles, categories, and photos. Simple and fast.
                        </p>
                        {!auth?.user && (
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href="/register"
                                    className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                                >
                                    Get started
                                </Link>
                                <Link
                                    href="/login"
                                    className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-base font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                                >
                                    Log in
                                </Link>
                            </div>
                        )}
                        {auth?.user && (
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href="/inventory"
                                    className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                                >
                                    Open inventory
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Organize by place — interactive cards */}
                <section className="mt-20">
                    <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
                        Organize by place
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-center text-gray-300">
                        Pick a spot. Add items. Find anything later.
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {PLACES.map((place) => (
                            <button
                                key={place.id}
                                type="button"
                                onMouseEnter={() => setHoveredPlace(place.id)}
                                onMouseLeave={() => setHoveredPlace(null)}
                                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-6 text-center transition-all duration-200 ${
                                    hoveredPlace === place.id
                                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105'
                                        : 'border-white/10 bg-surface hover:border-primary/50 hover:bg-surface-light'
                                }`}
                            >
                                <span className="text-3xl">{place.icon}</span>
                                <span className="text-sm font-medium text-gray-100">
                                    {place.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="mt-24">
                    <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
                        Everything you need
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-center text-gray-300">
                        Titles, descriptions, categories, places, and photos—all in one place.
                    </p>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-xl border border-white/10 bg-surface p-6 transition hover:border-primary/30 hover:bg-surface-light"
                            >
                                <h3 className="font-semibold text-primary">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-300">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                {!auth?.user && (
                    <section className="mt-24 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-12 text-center">
                        <h2 className="text-xl font-semibold text-white sm:text-2xl">
                            Ready to get organized?
                        </h2>
                        <p className="mt-2 text-gray-300">
                            Create a free account and start in seconds.
                        </p>
                        <Link
                            href="/register"
                            className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-black hover:bg-primary-light"
                        >
                            Create account
                        </Link>
                    </section>
                )}
            </div>
        </Layout>
    );
}
