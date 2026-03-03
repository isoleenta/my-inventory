import ItemCard from '@/Components/ItemCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { categoryTreeOptions } from '@/lib/categoryTree';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    if (f.place != null && f.place !== '') params['filter[place]'] = f.place;
    if (f.name != null && f.name !== '') params['filter[name]'] = f.name;
    if (f.price_min != null && f.price_min !== '') params['filter[price_min]'] = f.price_min;
    if (f.price_max != null && f.price_max !== '') params['filter[price_max]'] = f.price_max;
    if (sort != null && sort !== '') params.sort = sort;
    return params;
}

export default function InventoryIndex({ items, categories, placeOptions, filters, sort }) {
    const categoryOptions = categoryTreeOptions(categories ?? []);
    const [localName, setLocalName] = useState(filters?.name ?? '');
    const debounceRef = useRef(null);

    useEffect(() => {
        setLocalName(filters?.name ?? '');
    }, [filters?.name]);

    const hasActiveFilters =
        (filters?.category_id != null && filters.category_id !== '') ||
        (filters?.place != null && filters.place !== '') ||
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

    const handleNameChange = useCallback(
        (e) => {
            const value = e.target.value;
            setLocalName(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                handleFilterChange('name', value.trim() || undefined);
            }, 300);
        },
        [handleFilterChange]
    );

    const clearFilters = () => {
        setLocalName('');
        router.get(route('inventory.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventory" />

            <div className="flex flex-col">
                <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Inventory
                        </h1>
                        <p className="mt-1 text-gray-300">
                            Filter by category, place, name, or price.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <Link
                            href={route('items.create')}
                            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                        >
                            Add item
                        </Link>
                    </div>
                </section>

                <div className="mb-6 rounded-xl border border-white/10 bg-surface p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-3">
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
                                <label htmlFor="filter-place" className="mb-1 block text-xs font-medium text-gray-400">
                                    Place
                                </label>
                                <select
                                    id="filter-place"
                                    className={inputClass}
                                    value={filters?.place ?? ''}
                                    onChange={(e) =>
                                        handleFilterChange('place', e.target.value || undefined)
                                    }
                                >
                                    <option value="">All</option>
                                    {Object.entries(placeOptions).map(([value, label]) => (
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
                                    placeholder="Search title or description…"
                                    className={inputClass}
                                    value={localName}
                                    onChange={handleNameChange}
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
                                    value={filters?.price_min ?? ''}
                                    onChange={(e) =>
                                        handleFilterChange('price_min', e.target.value || undefined)
                                    }
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
                                    value={filters?.price_max ?? ''}
                                    onChange={(e) =>
                                        handleFilterChange('price_max', e.target.value || undefined)
                                    }
                                />
                            </div>
                            <div>
                                <label htmlFor="sort" className="mb-1 block text-xs font-medium text-gray-400">
                                    Sort
                                </label>
                                <select
                                    id="sort"
                                    className={inputClass}
                                    value={sort ?? 'title'}
                                    onChange={handleSortChange}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

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
                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => (
                                <li key={item.id}>
                                    <ItemCard item={item} />
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
