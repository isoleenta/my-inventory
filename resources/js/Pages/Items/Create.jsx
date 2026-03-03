import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { categoryTreeOptions } from '@/lib/categoryTree';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-gray-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary';

export default function CreateItem({ categories = [], placeOptions }) {
    const categoryOptions = categoryTreeOptions(categories);
    const { data, setData, post, transform, processing, errors } = useForm({
        title: '',
        description: '',
        category_id: '',
        place: 'other',
        custom_place: '',
        price: '',
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
        transform((d) => ({
            ...d,
            category_id: d.category_id ? parseInt(d.category_id, 10) : null,
            custom_place: (d.custom_place && String(d.custom_place).trim()) || null,
            price: (d.price && String(d.price).trim()) ? d.price : null,
        }));
        post(route('items.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add item" />

            <div className="flex flex-col">
                <section className="mb-8">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Add item
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Create a new item with title, place, and optional category and photos.
                    </p>
                </section>

                <div className="max-w-2xl rounded-xl border border-white/10 bg-surface p-6 sm:p-8">
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
                            <InputLabel htmlFor="place" value="Place" />
                            <select
                                id="place"
                                value={data.place}
                                onChange={(e) => setData('place', e.target.value)}
                                className={inputClass}
                                required
                            >
                                {Object.entries(placeOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.place} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="custom_place" value="Custom place (optional)" />
                            <TextInput
                                id="custom_place"
                                value={data.custom_place}
                                onChange={(e) =>
                                    setData('custom_place', e.target.value)
                                }
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="price" value="Price (optional)" />
                            <TextInput
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.price} className="mt-2" />
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

                        <div className="flex flex-wrap gap-4">
                            <PrimaryButton disabled={processing}>
                                Create item
                            </PrimaryButton>
                            <Link
                                href={route('inventory.index')}
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
