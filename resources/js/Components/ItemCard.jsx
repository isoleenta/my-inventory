import { Link } from '@inertiajs/react';
import { formatPrice, useDisplayCurrency } from '@/lib/currency';
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

export default function ItemCard({ item }) {
    const [photoIndex, setPhotoIndex] = useState(0);
    const { displayCurrency, usdToUahRate } = useDisplayCurrency();
    const photos = item.photos ?? [];
    const hasMultiple = photos.length > 1;
    const currentPhoto = photos[photoIndex];
    const canPrev = hasMultiple && photoIndex > 0;
    const canNext = hasMultiple && photoIndex < photos.length - 1;

    const goPrev = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (canPrev) setPhotoIndex((i) => i - 1);
    };

    const goNext = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (canNext) setPhotoIndex((i) => i + 1);
    };

    return (
        <Link
            href={route('items.show', item.id)}
            aria-label={item.title ? String(item.title) : 'View item'}
            className="group block overflow-hidden rounded-xl border border-white/10 bg-surface transition hover:border-primary/30 hover:bg-surface-light"
        >
            <div className="flex flex-col sm:flex-row">
                <div className="relative aspect-square w-full shrink-0 bg-surface-light sm:w-48 sm:aspect-auto sm:h-44">
                    {currentPhoto ? (
                        <img
                            src={currentPhoto.url}
                            alt=""
                            className="h-full w-full object-cover"
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
                                onClick={goPrev}
                                disabled={!canPrev}
                                className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none"
                                aria-label="Previous photo"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={!canNext}
                                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none"
                                aria-label="Next photo"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                                {photoIndex + 1} / {photos.length}
                            </div>
                        </>
                    )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center p-4 pr-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-500">
                        {item.category && <span>{item.category.name}</span>}
                        {item.price != null && item.price !== '' && (
                            <span className="font-medium text-primary">
                                {formatPrice(item.price, {
                                    sourceCurrency: 'USD',
                                    displayCurrency,
                                    usdToUahRate,
                                })}
                            </span>
                        )}
                    </div>
                    {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                            {item.description}
                        </p>
                    )}
                    {photos.length > 0 && !hasMultiple && (
                        <span className="mt-1 text-xs text-gray-500">
                            1 photo
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
