import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreatePlace() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('places.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="New place" />

            <div className="mx-auto flex w-full max-w-2xl flex-col">
                <section className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        New place
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Add a place (e.g. Garage, Kitchen) to organize where items live.
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
                                Create place
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
