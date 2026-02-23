import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ item: itemProp }) {
    // Support both flat item and JsonResource-wrapped item.data
    const item = itemProp?.data ?? itemProp;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    {item?.title}
                </h2>
            }
        >
            <Head title={item?.title} />

            <div className="py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-green/30 bg-black-light p-6">
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm text-green-light/70">
                                    Title
                                </dt>
                                <dd className="text-white">
                                    {item?.title}
                                </dd>
                            </div>
                            {item?.description && (
                                <div>
                                    <dt className="text-sm text-green-light/70">
                                        Description
                                    </dt>
                                    <dd className="text-white whitespace-pre-wrap">
                                        {item.description}
                                    </dd>
                                </div>
                            )}
                            {item?.category && (
                                <div>
                                    <dt className="text-sm text-green-light/70">
                                        Category
                                    </dt>
                                    <dd className="text-white">
                                        {item.category}
                                    </dd>
                                </div>
                            )}
                            {item?.place && (
                                <div>
                                    <dt className="text-sm text-green-light/70">
                                        Place
                                    </dt>
                                    <dd className="text-white">
                                        {item.place}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        {item?.photos?.length > 0 && (
                            <div className="mt-6">
                                <dt className="mb-2 text-sm text-green-light/70">
                                    Photos
                                </dt>
                                <dd className="flex flex-wrap gap-2">
                                    {item.photos.map((photo) => (
                                        <img
                                            key={photo.id}
                                            src={photo.url}
                                            alt=""
                                            className="h-24 w-24 rounded object-cover"
                                        />
                                    ))}
                                </dd>
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                            {item?.id != null && (
                                <>
                                    <Link
                                        href={route('inventory.edit', item.id)}
                                        className="rounded-lg bg-green px-4 py-2 text-black hover:bg-green-light"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('inventory.index')}
                                        className="rounded-lg border border-green/50 px-4 py-2 text-green-light hover:bg-green/10"
                                    >
                                        Back to list
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Delete this item?')) {
                                                router.delete(
                                                    route('inventory.destroy', item.id)
                                                );
                                            }
                                        }}
                                        className="rounded-lg border border-red-500/50 px-4 py-2 text-red-400 hover:bg-red-500/10"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
