"use client";


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Category, Professional } from "@/types";
import ImageUpload from "@/components/ImageUpload";
import GalleryUpload from "@/components/GalleryUpload";

type ProfessionalWithCategory = Omit<Professional, 'category'> & { category?: Category | string };

// Removed unused badgeMap

function EditProfessionalForm({
  professional,
  categories,
  loading,
  onCancel,
  onSave,
}: {
  professional: ProfessionalWithCategory;
  categories: Category[];
  loading: boolean;
  onCancel: () => void;
  onSave: (form: Partial<Professional>) => Promise<{ success: boolean; error?: string }>;
}) {
  // Helper to get category translation by slug (use current language)


  const [form, setForm] = useState<Partial<Professional>>({
    name: professional.name || "",
    category: typeof professional.category === "object" ? professional.category._id : professional.category || "",
    description: professional.description || "",
    email: professional.email || "",
    phone: professional.phone || "",
    website: professional.website || "",
    images: professional.images || [],
    gallery: professional.gallery || [],
    featured: professional.featured ?? false,
    active: professional.active ?? true,
    verified: professional.verified ?? false,
    priority: professional.priority ?? 5,
  });

  // Removed unused error and success states

  return (
    <form
      className="p-4 w-full max-w-lg"
      onSubmit={async (e) => {
        e.preventDefault();
        console.log('EditProfessionalForm submit', form);
        const result = await onSave(form);
        if (result.success) {
          setTimeout(() => onCancel(), 1000);
        }
      }}
    >
      <h2 className="text-lg font-bold mb-4">{professional._id ? "Edit Professional" : "Add Professional"}</h2>

      {/* Name */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.name || ""}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          minLength={2}
          maxLength={120}
        />
      </div>

      {/* Category */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={form.category || ""}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={form.description || ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      {/* Email & Phone */}
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="w-full border rounded px-2 py-1"
            type="email"
            value={form.email || ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={form.phone || ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>

      {/* Profile Image */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Profile Image</label>
        <ImageUpload
          professionalId={professional._id || "new"}
          onImagesAdded={(urls) => setForm((f) => ({ ...f, images: urls }))}
          isLoading={loading}
          manualSave
        />
      </div>

      {/* Gallery */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Gallery Images</label>
        <GalleryUpload
          gallery={form.gallery || []}
          onGalleryUpdated={(gallery) => setForm((f) => ({ ...f, gallery }))}
          isLoading={loading}
        />
      </div>

      {/* Website */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Website</label>
        <input
          className="w-full border rounded px-2 py-1"
          type="url"
          value={form.website || ""}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
        />
      </div>

      {/* Priority, Featured, Verified */}
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Priority</label>
          <input
            className="w-full border rounded px-2 py-1"
            type="number"
            min={1}
            max={10}
            value={form.priority ?? 5}
            onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
          />
        </div>
        <div className="flex-1 flex flex-col gap-2 mt-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              id="featured"
            />
            <label htmlFor="featured" className="text-sm">
              Featured
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.verified}
              onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))}
              id="verified"
            />
            <label htmlFor="verified" className="text-sm">
              Verified
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" size="md" variant="primary" loading={loading} disabled={loading}>
          {professional._id ? "Save" : "Add"}
        </Button>
        <Button type="button" size="md" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<ProfessionalWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const resP = await fetch("/api/admin/professionals");
      const dataP = await resP.json();
      setProfessionals(dataP.data?.data || []);
      const resC = await fetch("/api/categories");
      const dataC = await resC.json();
      setCategories(dataC.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAdd = async (form: Partial<Professional>) => {
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add professional");
      setProfessionals((prev) => [data.data, ...prev]);
      setAddModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to add professional");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async (id: string, form: Partial<Professional>) => {
    setAddLoading(true);
    try {
      const res = await fetch(`/api/admin/professionals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update professional");
      setProfessionals((prev) => prev.map((p) => (p._id === id ? { ...p, ...data.data } : p)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update professional" };
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this professional?")) return;
    try {
      const res = await fetch(`/api/admin/professionals/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete professional");
      }
      setProfessionals((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete professional");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Professionals</h1>
        <Button size="md" variant="primary" onClick={() => setAddModalOpen(true)}>
          Add Professional
        </Button>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
  <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
    <div className="max-h-[90vh] overflow-y-auto w-full max-w-lg p-4">
      <EditProfessionalForm
        professional={{
          _id: "",
          name: "",
          category: categories[0]?._id || "",
          description: "",
          images: [],
          gallery: [],
          featured: false,
          verified: false,
          active: true,
          priority: 5,
          slug: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        categories={categories}
        loading={addLoading}
        onCancel={() => setAddModalOpen(false)}
        onSave={async (form) => {
          await handleAdd(form);
          return { success: true };
        }}
      />
    </div>
  </Modal>
)}


      {/* Edit Modal */}
      {editModalOpen && editingId && (() => {
        const editing = professionals.find((p) => p._id === editingId);
        if (!editing) return null;
        return (
          <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
            <div className="max-h-[90vh] overflow-y-auto w-full max-w-2xl p-4">
              <EditProfessionalForm
                professional={editing}
                categories={categories}
                loading={addLoading}
                onCancel={() => setEditModalOpen(false)}
                onSave={async (form) => await handleEdit(editing._id, form)}
              />
            </div>
          </Modal>
        );
      })()}


      {/* Professionals Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Category</th>
              <th className="px-3 py-2 border">Status</th>
              <th className="px-3 py-2 border">Badges</th>
              <th className="px-3 py-2 border">Priority</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : professionals.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  No professionals found.
                </td>
              </tr>
            ) : (
              professionals
                .sort((a, b) => (a.priority ?? 10) - (b.priority ?? 10))
                .map((pro) => (
                  <tr key={pro._id} className="border-b">
                    <td className="px-3 py-2 border font-medium">{pro.name}</td>
                    <td className="px-3 py-2 border">{
                      typeof pro.category === "object"
                        ? pro.category.name
                        : pro.category || "-"
                    }</td>
                    <td className="px-3 py-2 border">
                      <Badge color={pro.active ? "success" : "warning"}>
                        {pro.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 border space-x-1">
                      {pro.verified && <Badge color="success">Verified</Badge>}
                      {pro.featured && <Badge color="info">Featured</Badge>}
                    </td>
                    <td className="px-3 py-2 border text-center">{pro.priority ?? "-"}</td>
                    <td className="px-3 py-2 border flex gap-2 justify-center">
                      <Button size="sm" variant="outline" onClick={() => { setEditingId(pro._id); setEditModalOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDelete(pro._id)}>Delete</Button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
