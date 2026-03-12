import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function EditPlace({ place }) {
    const { data, setData, post, transform, processing, errors } = useForm({
        name: place.name,
    });

    const submit = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, _method: 'PUT' }));
        post(route('places.update', place.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit: ${place.name}`} />

            <div className="mx-auto flex w-full max-w-2xl flex-col">
                <section className="mb-8">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Edit place
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Update the place name.
                    </p>
                </section>

                <div className="rounded-xl border border-white/10 bg-surface p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
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

                        <div className="flex gap-3">
                            <PrimaryButton disabled={processing}>
                                Save
                            </PrimaryButton>
                            <Link
                                href={route('places.index')}
                                className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10"
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
