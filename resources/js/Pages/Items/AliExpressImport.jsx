import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { categoryTreeOptions } from '@/lib/categoryTree';
import { formatPrice as formatCurrencyPrice, useDisplayCurrency } from '@/lib/currency';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const inputClass =
    'mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-gray-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary';

function formatPrice(item, displayCurrency, usdToUahRate) {
    if (item.price) {
        return formatCurrencyPrice(item.price, {
            sourceCurrency: item.price_currency || 'USD',
            displayCurrency,
            usdToUahRate,
        }) || item.raw_price || 'Price not found';
    }

    return item.raw_price || 'Price not found';
}

function formatBoughtOn(value) {
    if (!value) {
        return null;
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function AliExpressImport({ categories = [], placeOptions = {} }) {
    const { displayCurrency, usdToUahRate } = useDisplayCurrency();
    const categoryOptions = categoryTreeOptions(categories);
    const firstPlaceId = Object.keys(placeOptions)[0] ?? '';
    const { data, setData, post, transform, processing, errors } = useForm({
        place_id: firstPlaceId,
        category_id: '',
        html: '',
        html_file: null,
    });
    const [previewItems, setPreviewItems] = useState([]);
    const [previewMessage, setPreviewMessage] = useState('');
    const [previewErrors, setPreviewErrors] = useState({});
    const [previewing, setPreviewing] = useState(false);

    useEffect(() => {
        setPreviewItems([]);
        setPreviewMessage('');
        setPreviewErrors({});
    }, [data.html, data.html_file]);

    const hasPlaces = Object.keys(placeOptions).length > 0;

    if (!hasPlaces) {
        return (
            <AuthenticatedLayout>
                <Head title="Import AliExpress" />
                <div className="mx-auto flex w-full max-w-2xl flex-col">
                    <section className="mb-8 text-center">
                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Import AliExpress
                        </h1>
                        <p className="mt-4 text-gray-400">
                            Create a place first so imported items have somewhere to go.
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

    const buildPayload = () => {
        const formData = new FormData();

        if (data.html_file) {
            formData.append('html_file', data.html_file);
        }

        if (data.html.trim()) {
            formData.append('html', data.html);
        }

        return formData;
    };

    const handlePreview = async (e) => {
        e.preventDefault();
        setPreviewing(true);
        setPreviewMessage('');
        setPreviewErrors({});

        try {
            const response = await window.axios.post(
                route('items.imports.aliexpress.preview'),
                buildPayload()
            );

            const items = response.data.items ?? [];
            setPreviewItems(items);
            setPreviewMessage(
                items.length === 0
                    ? 'No products were detected. Make sure the saved HTML contains rendered order cards.'
                    : `Detected ${items.length} products.`
            );
        } catch (error) {
            if (error.response?.status === 422) {
                setPreviewErrors(error.response.data.errors ?? {});
                return;
            }

            setPreviewItems([]);
            setPreviewErrors({
                html: ['Preview failed. Please try again with a saved HTML file or page source.'],
            });
        } finally {
            setPreviewing(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        transform((form) => ({
            ...form,
            place_id: parseInt(form.place_id, 10),
            category_id: form.category_id ? parseInt(form.category_id, 10) : null,
        }));
        post(route('items.imports.aliexpress.store'));
    };

    const sourceError = errors.html || errors.html_file || previewErrors.html?.[0] || previewErrors.html_file?.[0];

    return (
        <AuthenticatedLayout>
            <Head title="Import AliExpress" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Import AliExpress history
                        </h1>
                        <p className="mt-1 max-w-3xl text-gray-300">
                            Upload a saved AliExpress orders HTML file or paste rendered page
                            source. The importer extracts product titles, prices, and images,
                            then creates inventory items.
                        </p>
                    </div>
                    <Link
                        href={route('inventory.index')}
                        className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                    >
                        Back to inventory
                    </Link>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="rounded-xl border border-white/10 bg-surface p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
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
                                    <InputLabel htmlFor="category_id" value="Fallback category (optional)" />
                                    <select
                                        id="category_id"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">— None —</option>
                                        {categoryOptions.map(({ id, name, depth }) => (
                                            <option key={id} value={id}>
                                                {'\u00A0'.repeat(depth * 2)}{depth > 0 ? '└ ' : ''}{name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category_id} className="mt-2" />
                                </div>
                            </div>

                            <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">
                                <p className="font-medium">How to prepare the source</p>
                                <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-50/90">
                                    <li>Open your AliExpress order history in the browser.</li>
                                    <li>Scroll until the products you want are visible on the page.</li>
                                    <li>Save the page as HTML or paste the rendered page source here.</li>
                                </ol>
                            </div>

                            <div>
                                <InputLabel value="Saved HTML file" />
                                <input
                                    type="file"
                                    accept=".html,.htm,.txt,text/html,text/plain"
                                    onChange={(e) => setData('html_file', e.target.files?.[0] ?? null)}
                                    className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-black file:transition hover:file:bg-primary-light"
                                />
                                {data.html_file && (
                                    <p className="mt-2 text-sm text-gray-400">
                                        Selected: {data.html_file.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="html" value="Or paste HTML" />
                                <textarea
                                    id="html"
                                    rows={14}
                                    value={data.html}
                                    onChange={(e) => setData('html', e.target.value)}
                                    className={inputClass}
                                    placeholder="<html>...</html>"
                                />
                            </div>

                            <InputError message={sourceError} className="mt-2" />

                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    disabled={previewing}
                                    className="rounded-lg border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {previewing ? 'Parsing…' : 'Preview parsed items'}
                                </button>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Importing…' : 'Import items'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    <aside className="rounded-xl border border-white/10 bg-surface p-6">
                        <div className="flex items-baseline justify-between gap-4">
                            <h2 className="text-lg font-semibold text-white">Preview</h2>
                            <span className="text-sm text-gray-400">
                                {previewItems.length} parsed
                            </span>
                        </div>
                        {previewMessage && previewItems.length > 0 && (
                            <p className="mt-3 text-sm text-gray-400">
                                {previewMessage}
                            </p>
                        )}

                        {previewItems.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-400">
                                {previewMessage ||
                                    'Run a preview to confirm that titles, prices, and images are detected before import.'}
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {previewItems.map((item, index) => (
                                    <div
                                        key={`${item.title}-${index}`}
                                        className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                                    >
                                        <div className="aspect-[4/3] bg-black/20">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 p-4">
                                            <p className="text-sm font-medium text-white">
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-primary">
                                                {formatPrice(item, displayCurrency, usdToUahRate)}
                                            </p>
                                            {item.bought_on && (
                                                <p className="text-xs text-gray-400">
                                                    Bought: {formatBoughtOn(item.bought_on)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
