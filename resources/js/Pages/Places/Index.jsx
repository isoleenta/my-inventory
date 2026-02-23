import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';

function slugFromName(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

export default function Index({ places }) {
    const addForm = useForm({
        name: '',
        value: '',
    });

    const handleAddPlace = (e) => {
        e.preventDefault();
        addForm.post(route('places.store'), {
            onSuccess: () => addForm.reset(),
        });
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        addForm.setData('name', name);
        if (!addForm.data.value) {
            addForm.setData('value', slugFromName(name));
        }
    };

    const handleDelete = (place) => {
        if (confirm(`Delete "${place.name}"? Items using this place will keep the value but it will no longer appear in the list.`)) {
            router.delete(route('places.destroy', place.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Places for storing
                </h2>
            }
        >
            <Head title="Places" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {/* Add place form - always visible at top */}
                    <div className="mb-8 rounded-xl border border-green/30 bg-black-light p-6">
                        <h3 className="mb-4 text-lg font-medium text-white">
                            Add new place
                        </h3>
                        <form onSubmit={handleAddPlace} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="new-place-name" value="Name" />
                                <TextInput
                                    id="new-place-name"
                                    value={addForm.data.name}
                                    onChange={handleNameChange}
                                    className="mt-1 block w-full"
                                    placeholder="e.g. Garage, Kitchen, Fridge"
                                    required
                                />
                                <InputError message={addForm.errors.name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="new-place-value" value="Value (slug)" />
                                <TextInput
                                    id="new-place-value"
                                    value={addForm.data.value}
                                    onChange={(e) => addForm.setData('value', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="e.g. garage"
                                />
                                <p className="mt-1 text-xs text-green-light/60">
                                    Lowercase letters, numbers, underscores. Auto-filled from name if left blank.
                                </p>
                                <InputError message={addForm.errors.value} className="mt-2" />
                            </div>
                            <PrimaryButton type="submit" disabled={addForm.processing}>
                                Add place
                            </PrimaryButton>
                        </form>
                    </div>

                    <h3 className="mb-3 text-lg font-medium text-white">
                        Your places
                    </h3>

                    {places.length === 0 ? (
                        <div className="rounded-xl border border-green/30 bg-black-light p-8 text-center text-green-light">
                            <p>No places yet. Use the form above to add your first place.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {places.map((place) => (
                                <li
                                    key={place.id}
                                    className="flex items-center justify-between rounded-xl border border-green/30 bg-black-light p-4"
                                >
                                    <div>
                                        <span className="font-medium text-white">
                                            {place.name}
                                        </span>
                                        <span className="ml-2 text-sm text-green-light/70">
                                            {place.value}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={route('places.edit', place.id)}
                                            className="rounded-lg border border-green/50 px-3 py-1.5 text-sm text-green-light hover:bg-green/10"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(place)}
                                            className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
