import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { categoryTreeOptions } from '@/lib/categoryTree';
import { USD } from '@/lib/currency';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-gray-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary';

export default function CreateItem({ categories = [], placeOptions = {} }) {
    const categoryOptions = categoryTreeOptions(categories);
    const firstPlaceId = Object.keys(placeOptions)[0] ?? '';
    const { data, setData, post, transform, processing, errors } = useForm({
        title: '',
        description: '',
        category_id: '',
        place_id: firstPlaceId,
        price: '',
        price_currency: USD,
        details: {},
        photos: [],
    });

    const selectedCategory = data.category_id
        ? categories.find(
              (c) => String(c.id) === String(data.category_id)
          )
        : null;
    const detailFields = selectedCategory?.fields ?? [];

    const setDetail = (key, value) => {
        setData('details', { ...data.details, [key]: value });
    };

    const submit = (e) => {
        e.preventDefault();
        const addAnother =
            e.nativeEvent?.submitter?.getAttribute('name') === 'add_another';
        transform((d) => {
            const payload = {
                ...d,
                category_id: d.category_id ? parseInt(d.category_id, 10) : null,
                place_id: d.place_id ? parseInt(d.place_id, 10) : null,
                price: (d.price && String(d.price).trim()) ? d.price : null,
                price_currency: d.price && String(d.price).trim() ? d.price_currency : USD,
            };
            if (addAnother) payload.add_another = true;
            return payload;
        });
        post(route('items.store'));
    };

    const hasPlaces = Object.keys(placeOptions).length > 0;

    if (!hasPlaces) {
        return (
            <AuthenticatedLayout>
                <Head title="Add item" />
                <div className="mx-auto flex w-full max-w-2xl flex-col">
                    <section className="mb-8 text-center">
                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Add item
                        </h1>
                        <p className="mt-4 text-gray-400">
                            Create a place first so you can assign items to it.
                        </p>
                        <Link
                            href={route('places.create')}
                            className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black"
                        >
                            New place
                        </Link>
                    </section>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Add item" />

            <div className="mx-auto flex w-full max-w-2xl flex-col">
                <section className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Add item
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Create a new item with title, place, and optional category and photos.
                    </p>
                </section>

                <div className="rounded-xl border border-white/10 bg-surface p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="title" value="Title" />
                            <TextInput
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description (optional)" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                rows={3}
                                className={inputClass}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="category_id" value="Category (optional)" />
                            <select
                                id="category_id"
                                value={data.category_id}
                                onChange={(e) =>
                                    setData('category_id', e.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">— None —</option>
                                {categoryOptions.map(({ id, name, depth }) => (
                                    <option key={id} value={id}>
                                        {'\u00A0'.repeat(depth * 2)}{depth > 0 ? '└ ' : ''}{name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {detailFields.length > 0 && (
                            <div>
                                <InputLabel value="Details" />
                                <p className="mt-1 text-sm text-gray-500">
                                    Optional details for this category.
                                </p>
                                <div className="mt-3 space-y-3">
                                    {detailFields.map((field) => (
                                        <div key={field.key}>
                                            <label
                                                htmlFor={`detail_${field.key}`}
                                                className="mb-1 block text-sm text-gray-400"
                                            >
                                                {field.label}
                                            </label>
                                            {field.type === 'number' ? (
                                                <input
                                                    id={`detail_${field.key}`}
                                                    type="number"
                                                    value={
                                                        data.details[field.key] ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        setDetail(
                                                            field.key,
                                                            e.target.value
                                                        )}
                                                    className={inputClass}
                                                />
                                            ) : (
                                                <input
                                                    id={`detail_${field.key}`}
                                                    type="text"
                                                    value={
                                                        data.details[field.key] ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        setDetail(
                                                            field.key,
                                                            e.target.value
                                                        )}
                                                    className={inputClass}
                                                />
                                            )}
                                            {errors[`details.${field.key}`] && (
                                                <p className="mt-1 text-sm text-red-400">
                                                    {errors[`details.${field.key}`]}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="place_id" value="Place" />
                            <select
                                id="place_id"
                                value={data.place_id}
                                onChange={(e) => setData('place_id', e.target.value)}
                                className={inputClass}
                                required
                            >
                                {Object.entries(placeOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.place_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="price" value="Price (optional)" />
                            <div className="mt-1 grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
                                <TextInput
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="block w-full"
                                />
                                <select
                                    value={data.price_currency}
                                    onChange={(e) => setData('price_currency', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="USD">USD</option>
                                    <option value="UAH">UAH</option>
                                </select>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                UAH prices are converted to USD on save using the current NBU rate.
                            </p>
                            <InputError message={errors.price} className="mt-2" />
                            <InputError message={errors.price_currency} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Photos (optional)" />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) =>
                                    setData('photos', Array.from(e.target.files || []))
                                }
                                className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-black file:transition hover:file:bg-primary-light"
                            />
                            <InputError message={errors.photos} className="mt-2" />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <Link
                                href={route('inventory.index')}
                                className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                            >
                                Cancel
                            </Link>
                            <div className="flex flex-wrap items-center gap-4">
                                <PrimaryButton disabled={processing}>
                                    Create item
                                </PrimaryButton>
                                <button
                                    type="submit"
                                    name="add_another"
                                    value="1"
                                    disabled={processing}
                                    className="rounded-lg border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {processing ? 'Creating…' : 'Create & Add Another'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
