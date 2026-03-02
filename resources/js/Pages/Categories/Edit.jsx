import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-gray-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary';

function slugFromLabel(label) {
    const s = String(label)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'field';
    return /^[a-z]/.test(s) ? s : 'f_' + s;
}

const emptyField = () => ({ label: '', type: 'text' });

export default function EditCategory({ category }) {
    const { data, setData, put, transform, processing, errors } = useForm({
        name: category.name,
        fields: category.fields ?? [],
    });

    const addField = () => {
        setData('fields', [...data.fields, emptyField()]);
    };

    const updateField = (index, part, value) => {
        const next = [...data.fields];
        next[index] = { ...next[index], [part]: value };
        setData('fields', next);
    };

    const removeField = (index) => {
        setData(
            'fields',
            data.fields.filter((_, i) => i !== index)
        );
    };

    const submit = (e) => {
        e.preventDefault();
        transform((d) => {
            const withLabels = d.fields.filter(
                (f) => f.label && String(f.label).trim()
            );
            const seen = {};
            const fields = withLabels.map((f) => {
                let key = slugFromLabel(f.label);
                if (seen[key]) {
                    let n = 1;
                    while (seen[key + '_' + n]) n++;
                    key = key + '_' + n;
                }
                seen[key] = true;
                return {
                    key,
                    label: String(f.label).trim(),
                    type: f.type || 'text',
                };
            });
            return { ...d, fields };
        });
        put(route('categories.update', category.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit: ${category.name}`} />

            <div className="flex flex-col">
                <section className="mb-8">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Edit category
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Update the category name and item detail fields.
                    </p>
                </section>

                <div className="max-w-2xl rounded-xl border border-white/10 bg-surface p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel value="Item detail fields (optional)" />
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="text-sm font-medium text-primary hover:text-primary-light"
                                >
                                    + Add field
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Define custom fields for items in this category.
                            </p>
                            {data.fields.length > 0 && (
                                <ul className="mt-3 space-y-3">
                                    {data.fields.map((field, index) => (
                                        <li
                                            key={index}
                                            className="flex flex-wrap items-end gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <label className="mb-1 block text-xs text-gray-500">
                                                    Label
                                                </label>
                                                <input
                                                    type="text"
                                                    value={field.label ?? ''}
                                                    onChange={(e) =>
                                                        updateField(
                                                            index,
                                                            'label',
                                                            e.target.value
                                                        )}
                                                    placeholder="Serial number"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div className="w-28">
                                                <label className="mb-1 block text-xs text-gray-500">
                                                    Type
                                                </label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) =>
                                                        updateField(
                                                            index,
                                                            'type',
                                                            e.target.value
                                                        )}
                                                    className={inputClass}
                                                >
                                                    <option value="text">
                                                        Text
                                                    </option>
                                                    <option value="number">
                                                        Number
                                                    </option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeField(index)
                                                }
                                                className="rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                aria-label="Remove field"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {(errors['fields'] ||
                                errors['fields.0.label']) && (
                                <InputError
                                    message={
                                        errors['fields'] ||
                                        errors['fields.0.label']
                                    }
                                    className="mt-2"
                                />
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <PrimaryButton disabled={processing}>
                                Update category
                            </PrimaryButton>
                            <Link
                                href={route('categories.index')}
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
