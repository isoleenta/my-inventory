import { useState, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CategoryEditForm from '@/Components/CategoryEditForm';
import { getCategoryTree } from '@/lib/categoryTree';
import { Head, Link, router } from '@inertiajs/react';

function CategoryTreeNode({
    node,
    depth,
    isExpanded,
    onToggle,
    selectedId,
    onSelect,
    onDelete,
}) {
    const hasChildren = node.children?.length > 0;
    const expanded = isExpanded(node.id);
    const isSelected = selectedId === node.id;

    return (
        <li className="category-tree-node">
            <div
                className={`group category-tree-row flex w-full items-center gap-1 rounded-lg pl-2 text-left text-sm transition ${
                    isSelected ? 'bg-primary/20 font-medium text-primary' : 'text-gray-200 hover:bg-white/5 hover:text-white'
                }`}
            >
                <span className="category-tree-toggle w-6 shrink-0">
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle(node.id);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded text-gray-500 transition hover:bg-white/10 hover:text-gray-300"
                            aria-expanded={expanded}
                            aria-label={expanded ? 'Collapse' : 'Expand'}
                        >
                            <svg
                                className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <span className="inline-block w-6" aria-hidden />
                    )}
                </span>
                <button
                    type="button"
                    onClick={() => onSelect(node.id)}
                    className="min-w-0 flex-1 py-2 pr-1 text-left"
                >
                    {node.name}
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(node.id, node.name);
                    }}
                    className="shrink-0 rounded p-1.5 text-red-400 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                    aria-label={`Delete ${node.name}`}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>
            {hasChildren && expanded && (
                <ul className="category-tree-children relative mt-0.5 ml-4 space-y-0.5">
                    {node.children.map((child) => (
                        <CategoryTreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            isExpanded={isExpanded}
                            onToggle={onToggle}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function CategoriesIndex({
    categories,
    selectedCategory = null,
    eligibleParents = [],
}) {
    const tree = getCategoryTree(categories);
    const [expandedIds, setExpandedIds] = useState(() => new Set(tree.map((n) => n.id)));

    const isExpanded = useCallback(
        (id) => expandedIds.has(id),
        [expandedIds]
    );

    const toggleExpanded = useCallback((id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const selectCategory = (id) => {
        router.get(route('categories.index', { category: id }), {}, {
            preserveState: true,
            only: ['selectedCategory', 'eligibleParents'],
        });
    };

    const clearSelection = () => {
        router.get(route('categories.index'), {}, {
            preserveState: true,
            only: ['selectedCategory', 'eligibleParents'],
        });
    };

    const deleteCategory = (id, name) => {
        if (window.confirm(`Delete category "${name}"?`)) {
            router.delete(route('categories.destroy', id), {
                onSuccess: () => {
                    if (selectedCategory?.id === id) {
                        clearSelection();
                    }
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Categories" />

            <div className="flex flex-col">
                <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Categories
                        </h1>
                        {/* <p className="mt-1 text-gray-300">
                            Group items by type. Select one to edit.
                        </p> */}
                    </div>
                    <Link
                        href={route('categories.create')}
                        className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/30"
                    >
                        New category
                    </Link>
                </section>

                <div className="flex min-h-0 flex-1 gap-6 overflow-hidden rounded-xl border border-white/10 bg-surface">
                    {/* Left: Category tree (Table of Contents) */}
                    <aside className="flex w-72 shrink-0 flex-col border-r border-white/10">
                        <div className="border-b border-white/10 px-4 py-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                                Table of Contents
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {categories.length === 0 ? (
                                <p className="px-2 py-4 text-sm text-gray-500">
                                    No categories yet.{' '}
                                    <Link
                                        href={route('categories.create')}
                                        className="text-primary hover:underline"
                                    >
                                        Create one
                                    </Link>
                                </p>
                            ) : (
                                <ul className="category-tree space-y-0.5">
                                    {tree.map((node) => (
                                        <CategoryTreeNode
                                            key={node.id}
                                            node={node}
                                            depth={0}
                                            isExpanded={isExpanded}
                                            onToggle={toggleExpanded}
                                            selectedId={selectedCategory?.id ?? null}
                                            onSelect={selectCategory}
                                            onDelete={deleteCategory}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    </aside>

                    {/* Right: Edit form or empty state */}
                    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
                        {selectedCategory ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-white">
                                        Edit category
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Update name, parent, and item detail
                                        fields.
                                    </p>
                                </div>
                                <div className="max-w-xl">
                                    <CategoryEditForm
                                        key={selectedCategory.id}
                                        category={selectedCategory}
                                        eligibleParents={eligibleParents}
                                        onCancel={clearSelection}
                                        cancelLabel="Clear selection"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex min-h-0 flex-1 flex-col">
                                <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 px-8 py-16 text-center">
                                    <p className="text-gray-400">
                                        Select a category from the list to edit it.
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Or{' '}
                                        <Link
                                            href={route('categories.create')}
                                            className="text-primary hover:underline"
                                        >
                                            create a new category
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
