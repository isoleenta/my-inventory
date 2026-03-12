import ItemCard from '@/Components/ItemCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { categoryTreeOptions } from '@/lib/categoryTree';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

const inputClass =
    'block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-gray-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary';

const SORT_OPTIONS = [
    { value: 'title', label: 'Title A–Z' },
    { value: '-title', label: 'Title Z–A' },
    { value: 'price', label: 'Price low–high' },
    { value: '-price', label: 'Price high–low' },
    { value: '-created_at', label: 'Newest' },
    { value: 'created_at', label: 'Oldest' },
    { value: 'place', label: 'Place A–Z' },
    { value: '-place', label: 'Place Z–A' },
];

function buildParams(filters, sort) {
    const params = {};
    const f = filters || {};
    if (f.category_id != null && f.category_id !== '') params['filter[category_id]'] = f.category_id;
    if (f.place_id != null && f.place_id !== '') params['filter[place_id]'] = f.place_id;
    if (f.name != null && f.name !== '') params['filter[name]'] = f.name;
    if (f.price_min != null && f.price_min !== '') params['filter[price_min]'] = f.price_min;
    if (f.price_max != null && f.price_max !== '') params['filter[price_max]'] = f.price_max;
    if (sort != null && sort !== '') params.sort = sort;
    return params;
}

export default function InventoryIndex({ items, categories, placeOptions, filters, sort }) {
    const categoryOptions = categoryTreeOptions(categories ?? []);
    const [localName, setLocalName] = useState(filters?.name ?? '');
    const [localPriceMin, setLocalPriceMin] = useState(filters?.price_min ?? '');
    const [localPriceMax, setLocalPriceMax] = useState(filters?.price_max ?? '');

    useEffect(() => {
        setLocalName(filters?.name ?? '');
    }, [filters?.name]);
    useEffect(() => {
        setLocalPriceMin(filters?.price_min ?? '');
    }, [filters?.price_min]);
    useEffect(() => {
        setLocalPriceMax(filters?.price_max ?? '');
    }, [filters?.price_max]);

    const hasActiveFilters =
        (filters?.category_id != null && filters.category_id !== '') ||
        (filters?.place_id != null && filters.place_id !== '') ||
        (filters?.name != null && filters.name !== '') ||
        (filters?.price_min != null && filters.price_min !== '') ||
        (filters?.price_max != null && filters.price_max !== '');

    const apply = useCallback(
        (newFilters, newSort) => {
            const params = buildParams(newFilters ?? filters, newSort ?? sort);
            router.get(route('inventory.index'), params, { preserveState: false });
        },
        [filters, sort]
    );

    const handleFilterChange = useCallback(
        (key, value) => {
            const next = { ...filters, [key]: value };
            apply(next, sort);
        },
        [filters, sort, apply]
    );

    const handleSortChange = useCallback(
        (e) => {
            const value = e.target.value;
            apply(filters, value);
        },
        [filters, apply]
    );

    const handleNameBlur = useCallback(() => {
        const value = localName.trim() || undefined;
        if (value === (filters?.name ?? undefined)) return;
        apply({ ...filters, name: value }, sort);
    }, [localName, filters, sort, apply]);

    const handlePriceBlur = useCallback(() => {
        const min = localPriceMin || undefined;
        const max = localPriceMax || undefined;
        if (min === (filters?.price_min ?? undefined) && max === (filters?.price_max ?? undefined)) return;
        apply({ ...filters, price_min: min, price_max: max }, sort);
    }, [localPriceMin, localPriceMax, filters, sort, apply]);

    const clearFilters = () => {
        setLocalName('');
        setLocalPriceMin('');
        setLocalPriceMax('');
        router.get(route('inventory.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventory" />

            <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Inventory
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Filter by category, place, name, or price.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <label htmlFor="sort" className="sr-only">
                        Sort
                    </label>
                    <select
                        id="sort"
                        className={`${inputClass} h-9 min-w-[10rem]`}
                        value={sort ?? 'title'}
                        onChange={handleSortChange}
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <Link
                        href={route('items.create')}
                        className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                    >
                        Add item
                    </Link>
                </div>
            </section>

            <div className="flex flex-col gap-6 lg:flex-row">
                <aside className="shrink-0 lg:w-56 xl:w-64">
                    <div className="rounded-xl border border-white/10 bg-surface p-4">
                        <h2 className="mb-4 text-sm font-semibold text-white">Filters</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="filter-category" className="mb-1 block text-xs font-medium text-gray-400">
                                    Category
                                </label>
                                <select
                                    id="filter-category"
                                    className={inputClass}
                                    value={filters?.category_id ?? ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'category_id',
                                            e.target.value ? e.target.value : undefined
                                        )
                                    }
                                >
                                    <option value="">All</option>
                                    {categoryOptions.map(({ id, name, depth }) => (
                                        <option key={id} value={id}>
                                            {'\u00A0'.repeat(depth * 2)}{depth > 0 ? '└ ' : ''}{name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="filter-place_id" className="mb-1 block text-xs font-medium text-gray-400">
                                    Place
                                </label>
                                <select
                                    id="filter-place_id"
                                    className={inputClass}
                                    value={filters?.place_id ?? ''}
                                    onChange={(e) =>
                                        handleFilterChange('place_id', e.target.value || undefined)
                                    }
                                >
                                    <option value="">All</option>
                                    {Object.entries(placeOptions ?? {}).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="filter-name" className="mb-1 block text-xs font-medium text-gray-400">
                                    Name
                                </label>
                                <input
                                    id="filter-name"
                                    type="search"
                                    placeholder="Search…"
                                    className={inputClass}
                                    value={localName}
                                    onChange={(e) => setLocalName(e.target.value)}
                                    onBlur={handleNameBlur}
                                />
                            </div>
                            <div>
                                <label htmlFor="filter-price-min" className="mb-1 block text-xs font-medium text-gray-400">
                                    Price min
                                </label>
                                <input
                                    id="filter-price-min"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className={inputClass}
                                    value={localPriceMin}
                                    onChange={(e) => setLocalPriceMin(e.target.value)}
                                    onBlur={handlePriceBlur}
                                />
                            </div>
                            <div>
                                <label htmlFor="filter-price-max" className="mb-1 block text-xs font-medium text-gray-400">
                                    Price max
                                </label>
                                <input
                                    id="filter-price-max"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Any"
                                    className={inputClass}
                                    value={localPriceMax}
                                    onChange={(e) => setLocalPriceMax(e.target.value)}
                                    onBlur={handlePriceBlur}
                                />
                            </div>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                <main className="min-w-0 flex-1">
                    {items.length === 0 ? (
                        <div className="rounded-xl border border-white/10 bg-surface p-10 text-center">
                            <p className="text-gray-400">
                                {hasActiveFilters
                                    ? 'No items match your filters.'
                                    : 'No items yet.'}
                            </p>
                            {hasActiveFilters ? (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary-light"
                                >
                                    Clear filters
                                </button>
                            ) : (
                                <Link
                                    href={route('items.create')}
                                    className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary-light"
                                >
                                    Add one
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="mb-3 text-sm text-gray-400">
                                {items.length} item{items.length !== 1 ? 's' : ''}
                            </p>
                            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <ItemCard item={item} />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
