import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Category } from "@/types";

export default function EditCategoryModal({ category, onSave, onCancel, loading }: {
  category: Category,
  onSave: (form: Partial<Category>) => void,
  onCancel: () => void,
  loading: boolean,
}) {
  const [form, setForm] = useState<Partial<Category>>({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    icon: category.icon || '',
    // ...existing code...
  });
  return (
    <form
      className="p-4 w-full max-w-md"
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <h2 className="text-lg font-bold mb-4">Edit Category</h2>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
          minLength={2}
          maxLength={100}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.slug}
          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          required
          maxLength={100}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          maxLength={500}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Icon</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.icon}
          onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
          maxLength={100}
        />
      </div>
      {/* Removed: featured checkbox (not in Category type) */}
      <div className="flex gap-2 mt-4">
        <Button type="submit" size="md" variant="primary" loading={loading} disabled={loading}>
          Save
        </Button>
        <Button type="button" size="md" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
