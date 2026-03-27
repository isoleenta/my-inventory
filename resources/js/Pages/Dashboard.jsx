import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPrice, useDisplayCurrency } from '@/lib/currency';
import { Head, Link } from '@inertiajs/react';

function StatCard({ icon, label, value, sub, href, className = '' }) {
    const content = (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 ${className}`}
        >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
                <span className="text-3xl" aria-hidden>{icon}</span>
                <p className="mt-2 text-2xl font-bold tabular-nums text-white">
                    {value}
                </p>
                <p className="text-sm font-medium text-primary">{label}</p>
                {sub != null && (
                    <p className="mt-1 text-xs text-gray-500">{sub}</p>
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={route(href)} className="block">
                {content}
            </Link>
        );
    }
    return content;
}

export default function Dashboard({ stats, places, categoriesWithStats }) {
    const { displayCurrency, usdToUahRate } = useDisplayCurrency();
    const { totalItems, categoriesCount } = stats ?? {};
    const placesWithItems = (places ?? []).filter((p) => p.count > 0);
    const maxPlaceCount = Math.max(1, ...placesWithItems.map((p) => p.count));
    const categories = (categoriesWithStats ?? []).filter((c) => (c.items_count ?? 0) > 0);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface to-surface-light px-6 py-16 text-center sm:py-20">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.18),transparent)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(34,197,94,0.08),transparent)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Welcome back
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-base text-gray-300 sm:text-lg">
                            Here’s what’s in your inventory.
                        </p>
                    </div>
                </section>

                {/* Stats row */}
                <section className="mt-8 grid gap-4 sm:grid-cols-2">
                    <StatCard
                        icon="📦"
                        label="Total items"
                        value={totalItems ?? 0}
                        sub={totalItems === 0 ? 'Add your first item' : null}
                        href="inventory.index"
                    />
                    <StatCard
                        icon="📁"
                        label="Categories"
                        value={categoriesCount ?? 0}
                        href="categories.index"
                        sub={categoriesCount === 0 ? 'Create a category' : null}
                    />
                </section>

                {/* By category */}
                {categories.length > 0 && (
                    <section className="mt-10">
                        <h2 className="text-xl font-semibold text-white sm:text-2xl">
                            By category
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Item count and total value per category.
                        </p>
                        <ul className="mt-6 space-y-3">
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        href={route('inventory.index', {
                                            filter: { category_id: cat.id },
                                        })}
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface py-3 px-4 transition hover:border-primary/30 hover:bg-surface-light"
                                    >
                                        <span className="font-medium text-white">
                                            {cat.name}
                                        </span>
                                        <span className="flex items-center gap-6 tabular-nums text-sm text-gray-400">
                                            <span>
                                                {cat.items_count} item
                                                {cat.items_count !== 1
                                                    ? 's'
                                                    : ''}
                                            </span>
                                            <span className="font-medium text-primary">
                                                {formatPrice(cat.items_sum_price ?? 0, {
                                                    sourceCurrency: 'USD',
                                                    displayCurrency,
                                                    usdToUahRate,
                                                })}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Items by place — interactive bar chart */}
                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-white sm:text-2xl">
                        Items by place
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Click a place to view its items.
                    </p>
                    {totalItems === 0 ? (
                        <div className="mt-6 rounded-xl border border-white/10 bg-surface/50 p-8 text-center">
                            <p className="text-gray-500">
                                No items yet. Add items and they’ll show here by place.
                            </p>
                            <Link
                                href={route('items.create')}
                                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-light"
                            >
                                Add item
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-6 space-y-3">
                            {placesWithItems.map((place) => {
                                const width = maxPlaceCount > 0 ? (place.count / maxPlaceCount) * 100 : 0;
                                return (
                                    <li key={place.value}>
                                        <Link
                                            href={route('inventory.show', {
                                                place: place.value,
                                            })}
                                            className="group flex items-center gap-4 rounded-xl border border-white/10 bg-surface py-3 pl-4 pr-4 transition hover:border-primary/30 hover:bg-surface-light"
                                        >
                                            <span
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xl transition group-hover:bg-primary/20"
                                                aria-hidden
                                            >
                                                📦
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <span className="font-medium text-white">
                                                        {place.label}
                                                    </span>
                                                    <span className="tabular-nums text-sm text-gray-400">
                                                        {place.count} item
                                                        {place.count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        className="h-full rounded-full bg-primary/80 transition-all duration-500 group-hover:bg-primary"
                                                        style={{ width: `${Math.max(width, place.count > 0 ? 8 : 0)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

            </div>
        </AuthenticatedLayout>
    );
}
