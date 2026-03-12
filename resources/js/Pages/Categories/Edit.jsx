import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CategoryEditForm from '@/Components/CategoryEditForm';
import { Head, router } from '@inertiajs/react';

export default function EditCategory({ category, eligibleParents = [] }) {
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
                    <CategoryEditForm
                        category={category}
                        eligibleParents={eligibleParents}
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
