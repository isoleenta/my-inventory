import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { useEffect, useRef } from 'react';

function isEditableTarget(target) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
    );
}

function clipboardImageFiles(event) {
    const items = Array.from(event.clipboardData?.items || []);

    return items
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter(Boolean);
}

export default function ItemPhotoManager({
    items = [],
    label,
    hint,
    errorMessage,
    onAddFiles,
    onMove,
    onRemove,
}) {
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handlePaste = (event) => {
            if (isEditableTarget(event.target)) {
                return;
            }

            const files = clipboardImageFiles(event);
            if (files.length === 0) {
                return;
            }

            event.preventDefault();
            onAddFiles(files);
        };

        window.addEventListener('paste', handlePaste);

        return () => window.removeEventListener('paste', handlePaste);
    }, [onAddFiles]);

    return (
        <div>
            <InputLabel value={label} />
            {hint ? <p className="mt-1 text-sm text-gray-500">{hint}</p> : null}

            <div className="mt-3 rounded-xl border border-dashed border-white/20 bg-white/5 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light"
                    >
                        Choose photos
                    </button>
                    <p className="text-sm text-gray-400">
                        Or press Ctrl+V / Cmd+V outside text inputs to paste an image.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                        onAddFiles(Array.from(event.target.files || []));
                        event.target.value = '';
                    }}
                    className="hidden"
                />

                {items.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {items.map((item, index) => (
                            <div
                                key={item.key}
                                className="overflow-hidden rounded-xl border border-white/10 bg-surface"
                            >
                                <div className="aspect-square bg-surface-light">
                                    <img
                                        src={item.url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="space-y-2 p-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-xs text-gray-400">
                                            {item.kind === 'existing' ? 'Saved' : 'New'}
                                        </span>
                                        <span className="text-xs font-medium text-primary">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onMove(index, -1)}
                                            disabled={index === 0}
                                            className="flex-1 rounded-md border border-white/10 px-2 py-1 text-xs text-gray-200 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
                                        >
                                            Left
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onMove(index, 1)}
                                            disabled={index === items.length - 1}
                                            className="flex-1 rounded-md border border-white/10 px-2 py-1 text-xs text-gray-200 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
                                        >
                                            Right
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="w-full rounded-md border border-red-500/30 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-gray-500">
                        No photos selected.
                    </p>
                )}
            </div>

            <InputError message={errorMessage} className="mt-2" />
        </div>
    );
}
