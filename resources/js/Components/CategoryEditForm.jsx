import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { categoryTreeOptions } from '@/lib/categoryTree';
import { useForm } from '@inertiajs/react';

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

const emptyCategoryStub = {
    name: '',
    parent_id: null,
    fields: [],
};

export default function CategoryEditForm({
    category = null,
    eligibleParents = [],
    onCancel,
    cancelLabel = 'Cancel',
}) {
    const resolved = category ?? emptyCategoryStub;
    const isCreate = !category?.id;

    const { data, setData, post, put, transform, processing, errors } =
        useForm({
            name: resolved.name,
            parent_id: resolved.parent_id?.toString() ?? '',
            fields: resolved.fields ?? [],
        });
    const parentOptions = categoryTreeOptions(eligibleParents);

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
        const addAnother =
            e.nativeEvent?.submitter?.getAttribute('name') === 'add_another';

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
            const parent_id = d.parent_id ? parseInt(d.parent_id, 10) : null;
            const payload = { ...d, fields, parent_id };
            if (isCreate && addAnother) {
                payload.add_another = true;
            }
            return payload;
        });
        if (isCreate) {
            post(route('categories.store'));
        } else {
            put(route('categories.update', category.id));
        }
    };

    const primaryButtonClass =
        'inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30 disabled:opacity-50 disabled:pointer-events-none';

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="max-w-md">
                    <InputLabel htmlFor="category-name" value="Name" />
                    <TextInput
                        id="category-name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="max-w-md">
                    <InputLabel
                        htmlFor="category-parent_id"
                        value="Parent category (optional)"
                    />
                    <select
                        id="category-parent_id"
                        value={data.parent_id}
                        onChange={(e) => setData('parent_id', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">— None (root) —</option>
                        {parentOptions.map(({ id, name, depth }) => (
                            <option key={id} value={id}>
                                {'\u00A0'.repeat(depth * 2)}
                                {depth > 0 ? '└ ' : ''}
                                {name}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.parent_id} className="mt-2" />
                </div>
            </div>

            <div>

                <p className="mt-1 text-sm text-gray-500">
                    Define custom fields for items in this category.
                </p>
                {data.fields.length > 0 ? (
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
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeField(index)}
                                    className="rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    aria-label="Remove field"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <button
                        type="button"
                        onClick={addField}
                        className="mt-3 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 py-8 text-center transition hover:border-primary/40 hover:bg-white/10"
                    >
                        <span className="text-sm font-medium text-gray-400">
                            No custom fields yet
                        </span>
                        <span className="mt-1 text-sm text-primary">
                            + Add your first field
                        </span>
                    </button>
                )}
                {(errors['fields'] || errors['fields.0.label']) && (
                    <InputError
                        message={
                            errors['fields'] || errors['fields.0.label']
                        }
                        className="mt-2"
                    />
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                    {onCancel ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                        >
                            {cancelLabel}
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className={primaryButtonClass}
                        >
                            {processing
                                ? isCreate
                                    ? 'Creating…'
                                    : 'Updating…'
                                : isCreate
                                  ? 'Create category'
                                  : 'Update category'}
                        </button>
                        {isCreate && (
                            <button
                                type="submit"
                                name="add_another"
                                value="1"
                                disabled={processing}
                                className="rounded-lg border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                            >
                                {processing ? 'Creating…' : 'Create & Add Another'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
