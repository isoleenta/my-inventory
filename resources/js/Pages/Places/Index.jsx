import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function PlacesIndex({ places = [] }) {
    const deletePlace = (id, name) => {
        if (window.confirm(`Delete place "${name}"? Items in this place will need to be moved.`)) {
            router.delete(route('places.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Places" />

            <div className="flex flex-col">
                <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Places
                        </h1>
                        <p className="mt-1 text-gray-300">
                            Where you keep items. Add or edit places, then assign them to items.
                        </p>
                    </div>
                    <Link
                        href={route('places.create')}
                        className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                    >
                        New place
                    </Link>
                </section>

                <div className="rounded-xl border border-white/10 bg-surface">
                    {places.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-400">
                            <p>No places yet.</p>
                            <Link
                                href={route('places.create')}
                                className="mt-2 inline-block text-primary hover:underline"
                            >
                                Create your first place
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-white/10">
                            {places.map((place) => (
                                <li
                                    key={place.id}
                                    className="group flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition hover:bg-white/5"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-4">
                                        <span className="text-2xl" aria-hidden>📦</span>
                                        <div>
                                            <p className="font-medium text-white">
                                                {place.name}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {place.items_count} item{place.items_count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={route('inventory.index', {
                                                filter: { place_id: place.id },
                                            })}
                                            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                                        >
                                            View items
                                        </Link>
                                        <Link
                                            href={route('places.edit', place.id)}
                                            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => deletePlace(place.id, place.name)}
                                            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
