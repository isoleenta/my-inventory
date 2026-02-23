import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ items, categories, places, filters }) {
    const handleFilter = (key, value) => {
        const next = { ...filters, [key]: value || undefined };
        router.get(route('inventory.index'), next, { preserveState: true });
    };

    // Support both paginated ({ data, links }) and plain array from backend
    const itemList = Array.isArray(items) ? items : (items?.data ?? []);
    const paginationLinks = items?.links ?? [];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    My inventory
                </h2>
            }
        >
            <Head title="Inventory" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                        <Link
                            href={route('inventory.create')}
                            className="rounded-lg bg-green px-4 py-2 text-black hover:bg-green-light"
                        >
                            Add item
                        </Link>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filters?.category ?? ''}
                                onChange={(e) =>
                                    handleFilter('category', e.target.value)
                                }
                                className="rounded border border-green/50 bg-black-light text-green-light"
                            >
                                <option value="">All categories</option>
                                {categories?.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters?.place ?? ''}
                                onChange={(e) =>
                                    handleFilter('place', e.target.value)
                                }
                                className="rounded border border-green/50 bg-black-light text-green-light"
                            >
                                <option value="">All places</option>
                                {places?.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {itemList.length === 0 ? (
                        <div className="rounded-xl border border-green/30 bg-black-light p-8 text-center text-green-light">
                            <p className="mb-4">No items yet.</p>
                            <Link
                                href={route('inventory.create')}
                                className="text-green underline hover:no-underline"
                            >
                                Create your first item
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {itemList.map((item) => (
                                <li
                                    key={item.id}
                                    className="rounded-xl border border-green/30 bg-black-light p-4"
                                >
                                    <Link
                                        href={route('inventory.show', item.id)}
                                        className="flex items-center justify-between text-green-light hover:text-green"
                                    >
                                        <span className="font-medium">
                                            {item.title}
                                        </span>
                                        <span className="text-sm text-green-light/70">
                                            {item.category && (
                                                <span className="mr-2">
                                                    {categories?.find(
                                                        (c) =>
                                                            c.value ===
                                                            item.category
                                                    )?.label ?? item.category}
                                                </span>
                                            )}
                                            {item.place && (
                                                <span>
                                                    {places?.find(
                                                        (p) =>
                                                            p.value ===
                                                            item.place
                                                    )?.label ?? item.place}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {paginationLinks.length > 3 && (
                        <div className="mt-4 flex justify-center gap-2">
                            {paginationLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={`rounded px-3 py-1 ${
                                        link.active
                                            ? 'bg-green text-black'
                                            : 'text-green-light hover:underline'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
