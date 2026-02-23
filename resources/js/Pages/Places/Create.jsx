import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        value: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('places.store'));
    };

    const slugFromName = (name) =>
        name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

    const handleNameChange = (e) => {
        const name = e.target.value;
        setData('name', name);
        if (!data.value) {
            setData('value', slugFromName(name));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Add place
                </h2>
            }
        >
            <Head title="Add place" />

            <div className="py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="space-y-4 rounded-xl border border-green/30 bg-black-light p-6"
                    >
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={handleNameChange}
                                className="mt-1 block w-full"
                                placeholder="e.g. Garage"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="value" value="Value (slug)" />
                            <TextInput
                                id="value"
                                value={data.value}
                                onChange={(e) =>
                                    setData('value', e.target.value)
                                }
                                className="mt-1 block w-full"
                                placeholder="e.g. garage"
                            />
                            <p className="mt-1 text-xs text-green-light/60">
                                Lowercase letters, numbers and underscores only.
                                Used when filtering and in URLs.
                            </p>
                            <InputError message={errors.value} className="mt-2" />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <PrimaryButton disabled={processing}>
                                Create place
                            </PrimaryButton>
                            <Link
                                href={route('places.index')}
                                className="rounded-lg border border-green/50 px-4 py-2 text-green-light hover:bg-green/10"
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
