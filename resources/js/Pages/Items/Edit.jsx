import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ItemPhotoManager from '@/Components/ItemPhotoManager';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { categoryTreeOptions } from '@/lib/categoryTree';
import { USD } from '@/lib/currency';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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
        purchased_on: item.purchased_on || '',
        details: item.details ?? {},
    });
    const [photoItems, setPhotoItems] = useState(
        (item.photos ?? []).map((photo) => ({
            key: `existing-${photo.id}`,
            kind: 'existing',
            id: photo.id,
            url: photo.url,
        }))
    );
    const [removedPhotoIds, setRemovedPhotoIds] = useState([]);
    const photoItemsRef = useRef(photoItems);

    const selectedCategory = data.category_id
        ? categories.find(
              (c) => String(c.id) === String(data.category_id)
          )
        : null;
    const detailFields = selectedCategory?.fields ?? [];

    const setDetail = (key, value) => {
        setData('details', { ...data.details, [key]: value });
    };

    const addFiles = (files) => {
        if (files.length === 0) {
            return;
        }

        setPhotoItems((current) => [
            ...current,
            ...files
                .filter((file) => file instanceof File && file.type.startsWith('image/'))
                .map((file) => ({
                    key: `new-${crypto.randomUUID()}`,
                    kind: 'new',
                    file,
                    url: URL.createObjectURL(file),
                })),
        ]);
    };

    const movePhoto = (index, direction) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= photoItems.length) {
            return;
        }

        setPhotoItems((current) => {
            const next = [...current];
            [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
            return next;
        });
    };

    const removePhoto = (index) => {
        const removed = photoItems[index];
        if (!removed) {
            return;
        }

        if (removed.kind === 'existing') {
            setRemovedPhotoIds((current) => [...current, removed.id]);
        }

        if (removed.kind === 'new' && removed.url.startsWith('blob:')) {
            URL.revokeObjectURL(removed.url);
        }

        setPhotoItems((current) => current.filter((_, currentIndex) => currentIndex !== index));
    };

    useEffect(() => {
        photoItemsRef.current = photoItems;
    }, [photoItems]);

    useEffect(() => {
        return () => {
            photoItemsRef.current.forEach((photo) => {
                if (photo.kind === 'new' && photo.url.startsWith('blob:')) {
                    URL.revokeObjectURL(photo.url);
                }
            });
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        transform((d) => {
            const orderedPhotos = [];
            const photoOrder = photoItems.map((photo) => {
                if (photo.kind === 'existing') {
                    return `existing:${photo.id}`;
                }

                const newIndex = orderedPhotos.push(photo.file) - 1;

                return `new:${newIndex}`;
            });

            return {
                ...d,
                _method: 'PUT',
                category_id: d.category_id ? parseInt(d.category_id, 10) : null,
                place_id: d.place_id ? parseInt(d.place_id, 10) : null,
                price: (d.price && String(d.price).trim()) ? d.price : null,
                price_currency: d.price && String(d.price).trim() ? d.price_currency : USD,
                purchased_on: d.purchased_on || null,
                photos: orderedPhotos,
                photo_order: photoOrder,
                removed_photo_ids: removedPhotoIds,
            };
        });
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
                            <InputLabel htmlFor="purchased_on" value="Purchased on (optional)" />
                            <TextInput
                                id="purchased_on"
                                type="date"
                                value={data.purchased_on}
                                onChange={(e) => setData('purchased_on', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.purchased_on} className="mt-2" />
                        </div>

                        <ItemPhotoManager
                            label="Photos"
                            hint="Paste new images, reorder previews, or remove ones you do not want to keep."
                            items={photoItems}
                            errorMessage={errors.photos || errors.photo_order || errors.removed_photo_ids}
                            onAddFiles={addFiles}
                            onMove={movePhoto}
                            onRemove={removePhoto}
                        />

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
