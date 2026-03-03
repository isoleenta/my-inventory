/**
 * Builds a list of categories in tree order with depth for indented display (e.g. dropdowns).
 * @param {Array<{ id: number, name: string, parent_id: number|null }>} categories
 * @returns {Array<{ id: number, name: string, depth: number }>}
 */
export function categoryTreeOptions(categories) {
    if (!categories?.length) return [];
    const byParent = {};
    categories.forEach((c) => {
        const pid = c.parent_id ?? 'root';
        if (!byParent[pid]) byParent[pid] = [];
        byParent[pid].push(c);
    });
    const result = [];
    function visit(pid, depth) {
        (byParent[pid] || []).forEach((c) => {
            result.push({ id: c.id, name: c.name, depth });
            visit(c.id, depth + 1);
        });
    }
    visit('root', 0);
    return result;
}
