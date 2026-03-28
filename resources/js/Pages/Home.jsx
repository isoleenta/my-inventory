import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { formatPrice } from '@/lib/currency';
import Layout from '../Layouts/Layout';

const BENTO_CARD_CLASS = 'border border-white/10 bg-surface backdrop-blur-sm transition hover:border-primary/30 hover:bg-surface-light';

const BENTO_ITEMS = [
    {
        id: 'homeowners',
        title: 'Homeowners & Renters',
        statement: 'Insurance-ready in minutes. Don\'t guess what you own—prove it.',
        className: 'col-span-2 row-span-2 rounded-2xl p-6 sm:p-8 flex flex-col justify-center text-left',
    },
    {
        id: 'tracking-value',
        title: 'Tracking Value',
        statement: 'Stop leaving money on the table. Track appreciation and total value automatically.',
        className: 'col-span-1 row-span-2 rounded-2xl p-6 flex flex-col justify-center text-left',
    },
    {
        id: 'collectors',
        title: 'Collectors',
        statement: 'Ditch the spreadsheets. A visual inventory built for true enthusiasts.',
        className: 'col-span-3 row-span-1 rounded-2xl p-6 sm:p-8 flex flex-col justify-center text-left',
    },
    {
        id: 'moving',
        title: 'People Moving',
        statement: 'Lose the stress, not your stuff. Every item has a digital home before it moves.',
        className: 'col-span-1 rounded-2xl p-6 flex flex-col justify-center text-left',
    },
    {
        id: 'organizing',
        title: 'Anyone Organizing',
        statement: 'Tame the junk drawer. From the garage to the fridge, see it all at a glance.',
        className: 'col-span-2 rounded-2xl p-6 sm:p-8 flex flex-col justify-center text-left',
    },
];

const FEATURE_BULLETS = [
    { title: 'Titles & descriptions', desc: 'Name items and add notes so you never forget what\'s where.' },
    { title: 'Categories', desc: 'Group by type (tools, groceries, documents) or create your own; nested categories and custom fields per category.' },
    { title: 'Places', desc: 'Garage, kitchen, fridge, drawers, bedroom, or "anywhere." Browse and filter by where things live.' },
    { title: 'Photos', desc: 'Attach multiple photos per item; view them in a simple gallery on the item page.' },
    { title: 'Search & filter', desc: 'Find by name (title/description), category, place, and price range; sort by title, price, date, or place.' },
    { title: 'Dashboard', desc: 'Total items, category count, items (and value) per category, and items per place—click through to filtered lists.' },
];

/** Example items matching project inventory shape (title, category, place, price) for the preview block. */
const EXAMPLE_INVENTORY_ITEMS = [
    { id: 1, title: 'Power drill', category: { name: 'Tools' }, placeLabel: 'Garage', price: 89.99, photos: [] },
    { id: 2, title: 'Spare bulbs', category: { name: 'Household' }, placeLabel: 'Kitchen', price: 12.5, photos: [] },
    { id: 3, title: 'Passport & documents', category: { name: 'Documents' }, placeLabel: 'Drawer', price: null, photos: [] },
    { id: 4, title: 'First aid kit', category: { name: 'Household' }, placeLabel: 'Kitchen', price: 24.99, photos: [] },
    { id: 5, title: 'Suitcase', category: { name: 'Household' }, placeLabel: 'Garage', price: 24.99, photos: [] },
    { id: 6, title: 'Laptop', category: { name: 'Household' }, placeLabel: 'Bedroom', price: 24.99, photos: [] },
];

const INVENTORY_FEATURE_CARDS = [
    {
        title: 'Categories & places',
        desc: 'Organize by type and location. Nested categories and custom fields per category; filter by where things live.',
        icon: (
            <svg className="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
    },
    {
        title: 'Search & filter',
        desc: 'Find by name, category, place, or price. Sort by title, price, date, or location—no more hunting through lists.',
        icon: (
            <svg className="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
        ),
    },
    {
        title: 'Value at a glance',
        desc: 'Optional prices per item. See total value per category on the dashboard and track what your inventory is worth.',
        icon: (
            <svg className="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75V20.25h19.5V18.75M12 6.75a2.25 2.25 0 00-2.25 2.25v.75h-4.5v-.75a2.25 2.25 0 10-4.5 0v.75h-1.5v7.5h19.5v-7.5h-1.5v-.75a2.25 2.25 0 10-4.5 0v.75h-4.5v-.75A2.25 2.25 0 0012 6.75z" />
            </svg>
        ),
    },
];

const INVENTORY_METRICS = [
    { label: 'Total items', value: '—', sub: 'Across all categories' },
    { label: 'Categories', value: '—', sub: 'Custom or built-in' },
    { label: 'Places', value: '—', sub: 'Where things live' },
];

function useSlideVisible(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold, rootMargin: '0px 0px -10% 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, visible];
}

export default function Home() {
    const [slide1Ref, slide1Visible] = useSlideVisible(0.1);
    const [slide2Ref, slide2Visible] = useSlideVisible(0.08);
    const [slide3Ref, slide3Visible] = useSlideVisible(0.08);
    const { auth } = usePage().props;

    return (
        <Layout>
            <div className="flex flex-col">
                {/* Hero — full-bleed */}
                <section className="relative -mx-4 min-h-[85vh] overflow-hidden sm:-mx-6 lg:-mx-8">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.15),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(34,197,94,0.06),transparent_45%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_20%_80%,rgba(74,222,128,0.05),transparent_45%)]" />
                    <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-glow-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-float" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#0a0a0a_85%)]" />

                    <div className="relative mx-auto flex min-h-[85vh] max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
                            <img src="/images/logo.png" alt="" className="h-4 w-4 object-contain invert" aria-hidden />
                            isoleenta
                        </span>
                        <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
                            Know what you have.
                            <br />
                            <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent animate-gradient">
                                Find it in seconds.
                            </span>
                        </h1>
                        <p className="mt-8 max-w-xl text-lg leading-relaxed text-gray-400">
                            Save each item with a name, description, category, and place. Add a photo if you like. Never lose track again.
                        </p>
                        {!auth?.user && (
                            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href="/register"
                                    className="group relative rounded-xl bg-primary px-8 py-4 text-base font-semibold text-black shadow-[0_0_30px_rgba(34,197,94,0.3)] transition hover:bg-primary-light hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                                >
                                    Get started free
                                </Link>
                                <Link
                                    href="/login"
                                    className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-gray-200 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                                >
                                    Log in
                                </Link>
                            </div>
                        )}
                        {auth?.user && (
                            <div className="mt-12">
                                <Link
                                    href="/inventory"
                                    className="inline-block rounded-xl bg-primary px-8 py-4 text-base font-semibold text-black shadow-[0_0_30px_rgba(34,197,94,0.25)] transition hover:bg-primary-light hover:shadow-[0_0_40px_rgba(34,197,94,0.35)]"
                                >
                                    Open inventory →
                                </Link>
                            </div>
                        )}

                        {/* Decorative floating cards */}
                        <div className="pointer-events-none absolute left-[10%] top-[25%] hidden opacity-40 lg:block">
                            <div className="animate-float rounded-lg border border-white/10 bg-surface/80 p-3 shadow-xl backdrop-blur">
                                <div className="h-2 w-16 rounded bg-primary/40" />
                                <div className="mt-2 h-2 w-12 rounded bg-white/20" />
                            </div>
                        </div>
                        <div className="pointer-events-none absolute right-[15%] top-[35%] hidden opacity-30 lg:block">
                            <div className="animate-float rounded-lg border border-white/10 bg-surface/80 p-3 shadow-xl backdrop-blur" style={{ animationDelay: '1s' }}>
                                <div className="h-2 w-14 rounded bg-primary/30" />
                                <div className="mt-2 h-2 w-10 rounded bg-white/20" />
                            </div>
                        </div>
                        <div className="pointer-events-none absolute bottom-[20%] left-[20%] hidden opacity-25 lg:block">
                            <div className="animate-float rounded-lg border border-white/10 bg-surface/80 p-3 shadow-xl backdrop-blur" style={{ animationDelay: '2s' }}>
                                <div className="h-2 w-12 rounded bg-white/20" />
                                <div className="mt-2 h-2 w-8 rounded bg-primary/20" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Slide 1: Who it's for — Bento grid */}
                <section
                    ref={slide1Ref}
                    className={`slide-section min-h-[85vh] px-6 py-24 sm:px-8 md:py-32 ${slide1Visible ? 'is-visible' : ''}`}
                >
                    <div className="mx-auto max-w-5xl">
                        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Who it's for
                        </h2>
                        <p className="mt-3 text-center text-gray-400">
                            Anyone who wants to know what they have and where it lives.
                        </p>
                        <div className="mt-14 grid grid-cols-3 gap-4 sm:gap-5">
                            {BENTO_ITEMS.map((item, i) => (
                                <div
                                    key={item.id}
                                    className={`slide-stagger-${Math.min((i % 5) + 1, 5)} ${item.className} ${BENTO_CARD_CLASS}`}
                                >
                                    <h3 className="text-lg font-semibold text-white sm:text-xl">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-300 sm:text-base">
                                        {item.statement}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* Slide 2: Feature bullets */}
                <section
                    ref={slide2Ref}
                    className={`slide-section min-h-[85vh] px-6 py-24 sm:px-8 md:py-32 ${slide2Visible ? 'is-visible' : ''}`}
                >
                    <div className="mx-auto max-w-4xl">
                        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Everything you need
                        </h2>
                        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:gap-6">
                            {FEATURE_BULLETS.map((f, i) => (
                                <div
                                    key={f.title}
                                    className={`slide-stagger-${Math.min((i % 5) + 1, 5)} rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition hover:border-primary/20 hover:bg-white/[0.04]`}
                                >
                                    <h3 className="font-semibold text-white">{f.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Slide 3: Inventory features — dashboard-style cards */}
                <section
                    ref={slide3Ref}
                    className={`slide-section font-sans min-h-[85vh] px-6 py-24 sm:px-8 md:py-32 ${slide3Visible ? 'is-visible' : ''}`}
                >
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Track inventory and stay in control
                                </h2>
                                <p className="mt-2 max-w-xl text-gray-400">
                                    See recent activity, organize by categories and places, and get a clear picture of what you own and where it lives.
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                            {/* Example inventory — same style as project inventory list */}
                            <div className={`slide-stagger-1 rounded-2xl border border-white/10 bg-surface-light p-5 backdrop-blur-sm transition hover:border-primary/20 lg:col-span-2`}>
                                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                    </span>
                                    Example inventory
                                </h3>
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {EXAMPLE_INVENTORY_ITEMS.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex overflow-hidden rounded-xl border border-white/10 bg-surface transition hover:border-primary/20 hover:bg-surface-light"
                                        >
                                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center bg-surface-light text-gray-500">
                                                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                                </svg>
                                                <span
                                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-500/80"
                                                    title="Remove photo"
                                                    aria-hidden
                                                >
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 px-3 py-2">
                                                <span className="block truncate font-medium text-white">{item.title}</span>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
                                                    {item.category && <span>{item.category.name}</span>}
                                                    <span>{item.placeLabel}</span>
                                                    {item.price != null && (
                                                        <span className="font-medium text-primary">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Metrics card */}
                            <div className={`slide-stagger-2 rounded-2xl border border-white/10 bg-surface-light p-5 backdrop-blur-sm transition hover:border-primary/20`}>
                                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                    </span>
                                    At a glance
                                </h3>
                                <ul className="space-y-4">
                                    {INVENTORY_METRICS.map((m) => (
                                        <li key={m.label} className="flex flex-col gap-0.5 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                            <span className="text-2xl font-bold text-white">{m.value}</span>
                                            <span className="text-sm font-medium text-gray-300">{m.label}</span>
                                            <span className="text-xs text-gray-500">{m.sub}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Feature cards */}
                            {INVENTORY_FEATURE_CARDS.map((card, i) => (
                                <div
                                    key={card.title}
                                    className={`slide-stagger-${Math.min(i + 3, 5)} rounded-2xl border border-white/10 bg-surface-light p-5 backdrop-blur-sm transition hover:border-primary/20`}
                                >
                                    <div className="flex items-start gap-3">
                                        {card.icon}
                                        <div>
                                            <h3 className="font-semibold text-white">{card.title}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-gray-400">{card.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                {!auth?.user && (
                    <section className="relative mt-24 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent px-6 py-16 text-center">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(34,197,94,0.08),transparent)]" />
                        <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
                            Ready to get organized?
                        </h2>
                        <p className="relative mt-3 text-gray-400">
                            Create a free account and start in seconds.
                        </p>
                        <Link
                            href="/register"
                            className="relative mt-8 inline-block rounded-xl bg-primary px-8 py-4 font-semibold text-black shadow-[0_0_30px_rgba(34,197,94,0.25)] transition hover:bg-primary-light hover:shadow-[0_0_40px_rgba(34,197,94,0.35)]"
                        >
                            Create account
                        </Link>
                    </section>
                )}
            </div>
        </Layout>
    );
}
