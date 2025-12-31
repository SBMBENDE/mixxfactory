"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Category } from "@/types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';
import EditCategoryModal from "@/components/EditCategoryModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    featured: false,
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  // Removed unused editError state
    // Edit Category handler
    const handleEditCategory = async (id: string, form: Partial<Category>) => {
      setEditLoading(true);
      // Removed: setEditError(null)
      try {
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to update category");
        await fetchCategories();
        setEditingCategoryId(null);
      } catch (err: any) {
        // Removed: setEditError(err.message || "Failed to update category")
      } finally {
        setEditLoading(false);
      }
    };

    // Delete Category handler
    const handleDeleteCategory = async (id: string) => {
      if (!confirm("Delete this category?")) return;
      try {
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to delete category");
        }
        fetchCategories();
      } catch (err: any) {
        alert(err.message || "Failed to delete category");
      }
    };
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.data || []);
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (form: typeof categoryForm) => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add category");
      setAddCategoryOpen(false);
      setCategoryForm({ name: '', slug: '', description: '', icon: '', featured: false });
      fetchCategories();
    } catch (err: any) {
      setCategoryError(err.message || "Failed to add category");
    } finally {
      setCategoryLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <Button size="md" variant="primary" onClick={() => setAddCategoryOpen(true)}>
          Add Category
        </Button>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">All Categories</h2>
        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat._id} className="border rounded px-3 py-2 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Icon rendering: emoji or dynamic FontAwesome, fallback if missing */}
                {cat.icon ? (
                  cat.icon.startsWith('fa-') ? (
                    (() => {
                      // Convert 'fa-paint-brush' to 'faPaintBrush'
                      const iconKey =
                        'fa' +
                        cat.icon
                          .replace(/^fa-/, '-')
                          .split('-')
                          .map((part, i) => (i === 0 ? '' : part.charAt(0).toUpperCase() + part.slice(1)))
                          .join('');
                      const faIcon = (SolidIcons as any)[iconKey] || (SolidIcons as any)['faPaintBrush'];
                      return (
                        <span className="text-xl">
                          <FontAwesomeIcon icon={faIcon} />
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-xl">{cat.icon}</span>
                  )
                ) : (
                  <span className="text-xl text-gray-400">🖌️</span>
                )}
                <span className="font-medium truncate max-w-[120px]">{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</span>
                <span className="text-xs text-gray-500 ml-2 truncate max-w-[80px]">{cat.slug}</span>
                {cat.description && <span className="ml-4 text-gray-600 truncate max-w-[200px]">{cat.description}</span>}
                {/* Removed: featured flag not present in Category type */}
              </div>
              <div className="flex flex-col gap-2 min-w-[90px] items-end">
                <div className="flex flex-col gap-2 w-full sm:w-20">
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => setEditingCategoryId(cat._id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => handleDeleteCategory(cat._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
            {/* Edit Category Modal */}
            {editingCategoryId && (() => {
              const cat = categories.find(c => c._id === editingCategoryId);
              if (!cat) return null;
              return (
                <Modal open={!!editingCategoryId} onClose={() => setEditingCategoryId(null)}>
                  <EditCategoryModal
                    category={cat}
                    onSave={form => handleEditCategory(cat._id, form)}
                    onCancel={() => setEditingCategoryId(null)}
                    loading={editLoading}
                  />
                </Modal>
              );
            })()}
      </div>
      {/* Add Category Modal */}
      {addCategoryOpen && (
        <Modal open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)}>
          <form
            className="p-4 w-full max-w-md"
            onSubmit={e => {
              e.preventDefault();
              handleAddCategory(categoryForm);
            }}
          >
            <h2 className="text-lg font-bold mb-4">Add Category</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={categoryForm.name}
                onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Slug (optional)</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={categoryForm.slug}
                onChange={e => setCategoryForm(f => ({ ...f, slug: e.target.value }))}
                maxLength={100}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded px-2 py-1"
                value={categoryForm.description}
                onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))}
                maxLength={500}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Icon (optional)</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={categoryForm.icon}
                onChange={e => setCategoryForm(f => ({ ...f, icon: e.target.value }))}
                maxLength={100}
              />
            </div>
            {categoryError && <div className="text-red-600 text-sm mb-2">{categoryError}</div>}
            <div className="flex gap-2 mt-4">
              <Button type="submit" size="md" variant="primary" loading={categoryLoading} disabled={categoryLoading}>
                Save
              </Button>
              <Button type="button" size="md" variant="secondary" onClick={() => setAddCategoryOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
