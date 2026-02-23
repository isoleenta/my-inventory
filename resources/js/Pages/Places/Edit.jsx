import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ place }) {
    const { data, setData, put, processing, errors } = useForm({
        name: place.name,
        value: place.value,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('places.update', place.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Edit place
                </h2>
            }
        >
            <Head title={`Edit: ${place.name}`} />

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
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
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
                            />
                            <p className="mt-1 text-xs text-green-light/60">
                                Lowercase letters, numbers and underscores only.
                            </p>
                            <InputError message={errors.value} className="mt-2" />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <PrimaryButton disabled={processing}>
                                Save
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
