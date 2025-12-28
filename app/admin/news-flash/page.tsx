
"use client";
import { useEffect, useState } from "react";

const API = "/api/admin/news-flash";

const defaultForm = {
  title: "",
  message: "",
  type: "info",
  published: false,
  startDate: "",
  endDate: "",
  priority: 0,
  link: "",
};

export default function AdminNewsFlashPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setNews(data.news || []);
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      message: item.message,
      type: item.type,
      published: item.published,
      startDate: item.startDate ? item.startDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
      priority: item.priority ?? 0,
      link: item.link || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this news flash?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchNews();
  };

  const handlePublish = async (id, published) => {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    fetchNews();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      priority: Number(form.priority) || 0,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      endDate: form.endDate ? new Date(form.endDate) : undefined,
      link: form.link || undefined,
    };
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/${editingId}` : API;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ? JSON.stringify(data.error) : "Error");
      return;

      const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
      };
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Manage News Flashes</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Create, edit, publish, and delete news flashes for the platform.</p>

      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
      >
        + New News Flash
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded shadow p-6 mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block font-medium">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="border rounded px-2 py-1">
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} required className="w-full border rounded px-2 py-1 min-h-[60px]" />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block font-medium">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block font-medium">End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block font-medium">Priority</label>
              <input type="number" name="priority" value={form.priority} onChange={handleChange} className="border rounded px-2 py-1 w-20" />
            </div>
          </div>
          <div>
            <label className="block font-medium">Link (optional)</label>
            <input name="link" value={form.link} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
              Published
            </label>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {editingId ? "Update" : "Create"}
            </button>
            <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }}>Cancel</button>
            {error && <span className="text-red-600 ml-4">{error}</span>}
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        {loading ? (
          <div>Loading...</div>
        ) : news.length === 0 ? (
          <div>No news flashes found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Title</th>
                <th className="py-2 text-left">Type</th>
                <th className="py-2 text-left">Priority</th>
                <th className="py-2 text-left">Published</th>
                <th className="py-2 text-left">Start</th>
                <th className="py-2 text-left">End</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-2 font-medium">{item.title}</td>
                  <td className="py-2">{item.type}</td>
                  <td className="py-2">{item.priority}</td>
                  <td className="py-2">
                    <button
                      className={`px-2 py-1 rounded ${item.published ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                      onClick={() => handlePublish(item._id, item.published)}
                    >
                      {item.published ? "Published" : "Unpublished"}
                    </button>
                  </td>
                  <td className="py-2">{item.startDate ? item.startDate.slice(0, 10) : ""}</td>
                  <td className="py-2">{item.endDate ? item.endDate.slice(0, 10) : ""}</td>
                  <td className="py-2 flex gap-2">
                    <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="px-2 py-1 bg-red-100 text-red-700 rounded" onClick={() => handleDelete(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminNewsFlashPage;
