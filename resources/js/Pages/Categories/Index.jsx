import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function CategoriesIndex({ categories }) {
    const deleteCategory = (id, name) => {
        if (window.confirm(`Delete category "${name}"?`)) {
            router.delete(route('categories.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Categories" />

            <div className="flex flex-col">
                <section className="mb-10">
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Categories
                    </h1>
                    <p className="mt-1 text-gray-300">
                        Group items by type. Create and manage your categories.
                    </p>
                    <div className="mt-4">
                        <Link
                            href={route('categories.create')}
                            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                        >
                            New category
                        </Link>
                    </div>
                </section>

                {categories.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-surface p-10 text-center">
                        <p className="text-gray-400">
                            No categories yet.
                        </p>
                        <Link
                            href={route('categories.create')}
                            className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary-light"
                        >
                            Create one
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                className="flex items-center justify-between rounded-xl border border-white/10 bg-surface px-5 py-4 transition hover:border-primary/30 hover:bg-surface-light"
                            >
                                <Link
                                    href={route('categories.edit', category.id)}
                                    className="font-medium text-white hover:text-primary"
                                >
                                    {category.name}
                                </Link>
                                <div className="flex gap-3">
                                    <Link
                                        href={route(
                                            'categories.edit',
                                            category.id
                                        )}
                                        className="rounded-md px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteCategory(
                                                category.id,
                                                category.name
                                            )
                                        }
                                        className="rounded-md px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
