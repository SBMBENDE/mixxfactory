"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

// -------------------- Types --------------------
interface NewsFlash {
  _id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  published: boolean;
  startDate: string;
  endDate: string;
  priority: 1 | 2 | 3;
  link?: string | null;
}

type BadgeColor = "info" | "success" | "warning" | "danger";

// -------------------- Mappings --------------------
const typeMap: Record<NewsFlash["type"], { label: string; color: BadgeColor }> = {
  success: { label: "Success", color: "success" },
  warning: { label: "Warning", color: "warning" },
  error: { label: "Danger", color: "danger" },
  info: { label: "Info", color: "info" },
};

const priorityMap: Record<NewsFlash["priority"], { label: string; color: BadgeColor }> = {
  1: { label: "High", color: "danger" },
  2: { label: "Medium", color: "warning" },
  3: { label: "Low", color: "success" },
};

// Explicit arrays for type-safe mapping
const priorityKeys: NewsFlash["priority"][] = [1, 2, 3];
const typeKeys: NewsFlash["type"][] = ["success", "warning", "error", "info"];

// -------------------- Form Component (Add/Edit) --------------------
function NewsFlashForm({
  initialData,
  onClose,
  onSave,
}: {
  initialData: NewsFlash;
  onClose: () => void;
  onSave: (news: NewsFlash) => void;
}) {
  const [form, setForm] = useState({ ...initialData });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = initialData._id ? "PUT" : "POST";
      const url = initialData._id
        ? `/api/admin/news-flash/${initialData._id}`
        : `/api/admin/news-flash`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priority: form.priority,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          link: form.link || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to save news flash");

      onSave(data.news);
    } catch (err: any) {
      setError(err.message || "Failed to save news flash");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 w-full max-w-lg">
      <h2 className="text-lg font-bold mb-4">{initialData._id ? "Edit" : "Add"} News Flash</h2>

      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Start Date & Time</label>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1"
            value={form.startDate}
            onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">End Date & Time</label>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1"
            value={form.endDate}
            onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.title}
          onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
          required
          minLength={3}
          maxLength={120}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={form.message}
          onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
          required
          minLength={5}
        />
      </div>

      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.type}
            onChange={(e) =>
              setForm(f => ({ ...f, type: e.target.value as NewsFlash["type"] }))
            }
          >
            {typeKeys.map((key) => (
              <option key={key} value={key}>
                {typeMap[key].label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.priority}
            onChange={(e) => setForm(f => ({ ...f, priority: Number(e.target.value) as 1 | 2 | 3 }))}
          >
            {priorityKeys.map((key) => (
              <option key={key} value={key}>
                {priorityMap[key].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Link (optional)</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.link || ""}
          onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
          type="url"
          placeholder="https://... or /internal"
        />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm(f => ({ ...f, published: e.target.checked }))}
        />
        <label className="text-sm">Published</label>
      </div>

      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      <div className="flex gap-2 mt-4">
        <Button type="submit" size="md" variant="primary" loading={loading} disabled={loading}>
          Save
        </Button>
        <Button type="button" size="md" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// -------------------- Main Admin Page --------------------
export default function AdminNewsFlashPage() {
  const [items, setItems] = useState<NewsFlash[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsFlash | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/news-flash");
        const data = await res.json();
        setItems(data.news || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const initialAddForm: NewsFlash = {
    _id: "",
    title: "",
    message: "",
    type: "success",
    priority: 1,
    link: "",
    published: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  };

  return (
    <div className="p-6">
      <Button size="md" variant="primary" onClick={() => setAddModalOpen(true)}>
        Add News Flash
      </Button>

      {/* Add Modal */}
      {addModalOpen && (
        <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
          <NewsFlashForm
            initialData={initialAddForm}
            onClose={() => setAddModalOpen(false)}
            onSave={(newItem) => {
              setItems(prev => [newItem, ...prev]);
              setAddModalOpen(false);
            }}
          />
        </Modal>
      )}

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border mt-4">
          <thead>
            <tr>
              <th className="border px-3 py-2">Title</th>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Priority</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Preview</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n._id}>
                <td className="border px-3 py-2 font-medium">{n.title}</td>
                <td className="border px-3 py-2">
                  <Badge color={typeMap[n.type].color}>{typeMap[n.type].label}</Badge>
                </td>
                <td className="border px-3 py-2">
                  <Badge color={priorityMap[n.priority].color}>{priorityMap[n.priority].label}</Badge>
                </td>
                <td className="border px-3 py-2">{n.published ? "Published" : "Draft"}</td>
                <td className="border px-3 py-2">{n.message}</td>
                <td className="border px-3 py-2 flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(n);
                      setEditModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>

                  {n.published && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={unpublishingId === n._id}
                      onClick={async () => {
                        setUnpublishingId(n._id);
                        try {
                          await fetch(`/api/admin/news-flash/${n._id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ published: false }),
                          });
                          setItems(prev => prev.map(i => i._id === n._id ? { ...i, published: false } : i));
                        } catch (err) { console.error(err); } finally { setUnpublishingId(null); }
                      }}
                    >
                      Unpublish
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      if (!confirm("Delete this news flash?")) return;
                      try {
                        await fetch(`/api/admin/news-flash/${n._id}`, { method: "DELETE" });
                        setItems(prev => prev.filter(i => i._id !== n._id));
                      } catch (err) { console.error(err); }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editModalOpen && editing && (
        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <NewsFlashForm
            initialData={editing}
            onClose={() => setEditModalOpen(false)}
            onSave={(updated) => {
              setItems(prev => prev.map(i => i._id === updated._id ? updated : i));
              setEditModalOpen(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
