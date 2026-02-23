import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ item: itemProp, categories, places }) {
    const item = itemProp?.data ?? itemProp;
    const { data, setData, post, processing, errors } = useForm({
        title: item?.title ?? '',
        description: item?.description ?? '',
        category: item?.category ?? '',
        place: item?.place ?? '',
        photos: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.update', item.id), {
            forceFormData: true,
            _method: 'put',
        });
    };

    const onPhotoChange = (e) => {
        const files = Array.from(e.target.files || []);
        setData('photos', files);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Edit item
                </h2>
            }
        >
            <Head title={`Edit: ${item?.title}`} />

            <div className="py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 rounded-xl border border-green/30 bg-black-light p-6"
                    >
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-green-light"
                            >
                                Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                className="mt-1 w-full rounded border border-green/50 bg-black px-3 py-2 text-white focus:border-green focus:ring-green"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-green-light"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="mt-1 w-full rounded border border-green/50 bg-black px-3 py-2 text-white focus:border-green focus:ring-green"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-green-light">
                                Category
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) =>
                                    setData('category', e.target.value)
                                }
                                className="mt-1 w-full rounded border border-green/50 bg-black px-3 py-2 text-white focus:border-green focus:ring-green"
                            >
                                <option value="">—</option>
                                {categories?.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-green-light">
                                Place
                            </label>
                            <select
                                value={data.place}
                                onChange={(e) =>
                                    setData('place', e.target.value)
                                }
                                className="mt-1 w-full rounded border border-green/50 bg-black px-3 py-2 text-white focus:border-green focus:ring-green"
                            >
                                <option value="">—</option>
                                {places?.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                            {errors.place && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.place}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-green-light">
                                Add more photos (max 10 total)
                            </label>
                            {item?.photos?.length > 0 && (
                                <p className="mt-1 text-sm text-green-light/70">
                                    {item.photos.length} photo(s) attached.
                                </p>
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                multiple
                                onChange={onPhotoChange}
                                className="mt-1 text-green-light"
                            />
                            {errors.photos && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.photos}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-green px-4 py-2 text-black hover:bg-green-light disabled:opacity-50"
                            >
                                Update
                            </button>
                            <a
                                href={route('inventory.show', item.id)}
                                className="rounded-lg border border-green/50 px-4 py-2 text-green-light hover:bg-green/10"
                            >
                                Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
