import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const PLACE_ICONS = {
    garage: '🔧',
    bedroom: '🛏️',
    kitchen: '🍳',
    fridge: '🧊',
    drawer: '🗄️',
    other: '📦',
};

export default function InventoryPlaces({ places }) {
    return (
        <AuthenticatedLayout>
            <Head title="Inventory" />

            <div className="flex flex-col">
                <section className="mb-10">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Inventory by place
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Pick a place to see items or add new ones.
                    </p>
                    <div className="mt-4">
                        <Link
                            href={route('items.create')}
                            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                        >
                            Add item
                        </Link>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {places.map((place) => (
                        <Link
                            key={place.value}
                            href={route('inventory.show', { place: place.value })}
                            className="flex flex-col gap-2 rounded-xl border-2 border-white/10 bg-surface p-6 transition hover:border-primary/50 hover:bg-surface-light"
                        >
                            <span className="text-3xl">
                                {PLACE_ICONS[place.value] ?? '📦'}
                            </span>
                            <h3 className="font-semibold text-white">
                                {place.label}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {place.count} item{place.count !== 1 ? 's' : ''}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
