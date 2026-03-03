import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CategoryEditForm from '@/Components/CategoryEditForm';
import { Head, router } from '@inertiajs/react';

export default function CreateCategory({ categories = [] }) {
    return (
        <AuthenticatedLayout>
            <Head title="New category" />

            <div className="mx-auto flex w-full max-w-2xl flex-col">
                <section className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        New category
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Add a category and define which detail fields items in
                        this category will have.
                    </p>
                </section>

                <div className="rounded-xl border border-white/10 bg-surface p-6 sm:p-8">
                    <CategoryEditForm
                        category={null}
                        eligibleParents={categories}
                        onCancel={() =>
                            router.visit(route('categories.index'))
                        }
                        cancelLabel="Back to list"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
