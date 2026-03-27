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

export default function EditItem({ item, categories = [], placeOptions = {} }) {
    const categoryOptions = categoryTreeOptions(categories);
    const { data, setData, post, transform, processing, errors } = useForm({
        title: item.title,
        description: item.description || '',
        category_id: item.category_id?.toString() || '',
        place_id: item.place_id?.toString() ?? '',
        price: item.price != null ? String(item.price) : '',
        price_currency: USD,
        details: item.details ?? {},
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
        transform((d) => ({
            ...d,
            _method: 'PUT',
            category_id: d.category_id ? parseInt(d.category_id, 10) : null,
            place_id: d.place_id ? parseInt(d.place_id, 10) : null,
            price: (d.price && String(d.price).trim()) ? d.price : null,
            price_currency: d.price && String(d.price).trim() ? d.price_currency : USD,
        }));
        post(route('items.update', item.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit: ${item.title}`} />

            <div className="flex flex-col">
                <section className="mb-8">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Edit item
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Update title, place, category, and photos.
                    </p>
                </section>

                <div className="max-w-2xl rounded-xl border border-white/10 bg-surface p-6 sm:p-8">
                    {item.photos?.length > 0 && (
                        <div className="mb-6">
                            <InputLabel value="Current photos" />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {item.photos.map((photo) => (
                                    <img
                                        key={photo.id}
                                        src={photo.url}
                                        alt=""
                                        className="h-24 w-24 rounded-lg border border-white/10 object-cover"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

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
                            <InputLabel value="Add more photos (optional)" />
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

                        <div className="flex flex-wrap gap-4">
                            <PrimaryButton disabled={processing}>
                                Update item
                            </PrimaryButton>
                            <Link
                                href={route('items.show', item.id)}
                                className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
