import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const PLACEHOLDER_SVG = (
    <svg
        className="h-full w-full text-gray-600"
        fill="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
);

export default function ShowItem({ item }) {
    const [photoIndex, setPhotoIndex] = useState(0);
    const placeLabel = item.place?.label ?? item.place ?? 'Other';
    const photos = item.photos ?? [];
    const hasMultiple = photos.length > 1;
    const currentPhoto = photos[photoIndex];
    const canPrev = hasMultiple && photoIndex > 0;
    const canNext = hasMultiple && photoIndex < photos.length - 1;

    return (
        <AuthenticatedLayout>
            <Head title={item.title} />

            <div className="flex flex-col">
                <div className="mb-6">
                    <Link
                        href={route('inventory.show', {
                            place: item.place?.value ?? item.place,
                        })}
                        className="text-sm text-gray-400 transition hover:text-primary"
                    >
                        ← Back to list
                    </Link>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                    {/* Left: photo gallery */}
                    <div className="shrink-0 lg:w-[min(420px,45%)]">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface">
                            <div className="relative aspect-square w-full bg-surface-light">
                                {currentPhoto ? (
                                    <img
                                        src={currentPhoto.url}
                                        alt=""
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        {PLACEHOLDER_SVG}
                                    </div>
                                )}
                                {hasMultiple && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPhotoIndex((i) =>
                                                    i > 0 ? i - 1 : i,
                                                )
                                            }
                                            disabled={!canPrev}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white transition hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none"
                                            aria-label="Previous photo"
                                        >
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 19l-7-7 7-7"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPhotoIndex((i) =>
                                                    i < photos.length - 1
                                                        ? i + 1
                                                        : i,
                                                )
                                            }
                                            disabled={!canNext}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white transition hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none"
                                            aria-label="Next photo"
                                        >
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                            {hasMultiple && (
                                <div className="flex gap-1 border-t border-white/10 bg-surface p-2">
                                    {photos.map((photo, i) => (
                                        <button
                                            key={photo.id}
                                            type="button"
                                            onClick={() => setPhotoIndex(i)}
                                            className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                                i === photoIndex
                                                    ? 'border-primary ring-1 ring-primary/30'
                                                    : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={photo.url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: details */}
                    <div className="min-w-0 flex-1">
                        <div className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
                            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                                {item.title}
                            </h1>
                            {item.category && (
                                <p className="mt-2 text-sm font-medium text-primary">
                                    {item.category.name}
                                </p>
                            )}
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                                <span>Place: {placeLabel}</span>
                                {item.category && (
                                    <span>Category: {item.category.name}</span>
                                )}
                                {item.price != null && item.price !== '' && (
                                    <span className="font-medium text-primary">
                                        ${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                )}
                            </div>
                            {item.description ? (
                                <div className="mt-6 border-t border-white/10 pt-6">
                                    <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
                                        Description
                                    </h2>
                                    <p className="mt-2 whitespace-pre-wrap text-gray-300">
                                        {item.description}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-6 border-t border-white/10 pt-6 text-sm text-gray-500">
                                    No description.
                                </p>
                            )}
                            {item.category?.fields?.length > 0 &&
                                (() => {
                                    const details = item.details ?? {};
                                    const hasAny = item.category.fields.some(
                                        (f) =>
                                            details[f.key] != null &&
                                            String(details[f.key]).trim() !== ''
                                    );
                                    if (!hasAny) return null;
                                    return (
                                        <div className="mt-6 border-t border-white/10 pt-6">
                                            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
                                                Details
                                            </h2>
                                            <dl className="mt-3 space-y-2">
                                                {item.category.fields.map(
                                                    (field) => {
                                                        const value =
                                                            details[field.key];
                                                        if (
                                                            value == null ||
                                                            String(value).trim() ===
                                                                ''
                                                        )
                                                            return null;
                                                        return (
                                                            <div
                                                                key={field.key}
                                                                className="flex gap-2"
                                                            >
                                                                <dt className="shrink-0 text-gray-500">
                                                                    {field.label}:
                                                                </dt>
                                                                <dd className="text-gray-300">
                                                                    {value}
                                                                </dd>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </dl>
                                        </div>
                                    );
                                })()}
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    href={route('items.edit', item.id)}
                                    className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route('inventory.show', {
                                        place: item.place?.value ?? item.place,
                                    })}
                                    className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                                >
                                    Back to list
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
