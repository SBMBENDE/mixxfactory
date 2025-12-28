"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface NewsFlash {
  _id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  published: boolean;
  startDate: string;
  endDate: string;
  priority: number;
  link?: string | null;
}

const priorityMap = {
  1: { label: "High", color: "danger" },
  2: { label: "Medium", color: "warning" },
  3: { label: "Low", color: "success" },
};

const typeMap = {
  success: { label: "Success", color: "success" },
  warning: { label: "Warning", color: "warning" },
  error: { label: "Danger", color: "danger" },
  info: { label: "Info", color: "info" },
};

// EditNewsFlashForm component
function EditNewsFlashForm({ newsFlash, onClose, onSave }: {
  newsFlash: NewsFlash;
  onClose: () => void;
  onSave: (updated: NewsFlash) => void;
}) {
  const [form, setForm] = useState({
    title: newsFlash.title,
    message: newsFlash.message,
    type: newsFlash.type,
    priority: newsFlash.priority,
    link: newsFlash.link || "",
    published: newsFlash.published,
    startDate: newsFlash.startDate.slice(0, 16),
    endDate: newsFlash.endDate.slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/news-flash/${newsFlash._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          link: form.link || null,
          priority: Number(form.priority),
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to update news flash");
      onSave(data.news);
    } catch (err: any) {
      setError(err.message || "Failed to update news flash");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleEditSubmit} className="p-4 w-full max-w-lg">
      <h2 className="text-lg font-bold mb-4">Edit News Flash</h2>

      {/* Start & End Date */}
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

      {/* Title */}
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

      {/* Message */}
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

      {/* Type & Priority */}
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
          >
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Danger</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.priority}
            onChange={(e) => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
          >
            <option value={1}>High</option>
            <option value={2}>Medium</option>
            <option value={3}>Low</option>
          </select>
        </div>
      </div>

      {/* Link */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Link (optional)</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={form.link}
          onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
          type="url"
          placeholder="https://... or /internal"
        />
      </div>

      {/* Published */}
      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm(f => ({ ...f, published: e.target.checked }))}
          id="edit-published"
        />
        <label htmlFor="edit-published" className="text-sm">Published</label>
      </div>

      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <Button type="submit" size="md" variant="primary" loading={loading} disabled={loading}>Save</Button>
        <Button type="button" size="md" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

// Main Admin Page
export default function AdminNewsFlashPage() {
  const [items, setItems] = useState<NewsFlash[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsFlash | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    message: "",
    type: "success",
    priority: 1,
    link: "",
    published: true,
    startDate: new Date().toISOString().slice(0,16),
    endDate: new Date(Date.now()+7*24*60*60*1000).toISOString().slice(0,16),
  });

  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);

  // Fetch items
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/news-flash");
        const data = await res.json();
        setItems(data.news || []);
      } catch(err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchNews();
  }, []);

  // Add NewsFlash
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch("/api/admin/news-flash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...addForm, link: addForm.link||null, priority: Number(addForm.priority),
          startDate: new Date(addForm.startDate).toISOString(), endDate: new Date(addForm.endDate).toISOString() })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data?.error?.message || "Failed to add news flash");
      setItems(prev => [data.news, ...prev]);
      setAddModalOpen(false);
      setAddForm({title:"",message:"",type:"success",priority:1,link:"",published:true,startDate:new Date().toISOString().slice(0,16),endDate:new Date(Date.now()+7*24*60*60*1000).toISOString().slice(0,16)});
    } catch(err:any) {
      setAddError(err.message || "Failed to add news flash");
    } finally { setAddLoading(false); }
  };

  return (
    <div className="p-6">
      <Button size="md" variant="primary" onClick={()=>setAddModalOpen(true)}>Add News Flash</Button>

      {/* Add Modal */}
      {addModalOpen && (
        <Modal open={addModalOpen} onClose={()=>setAddModalOpen(false)}>
          <form onSubmit={handleAddSubmit} className="p-4 w-full max-w-lg">
            {/* Start & End Date */}
            <div className="mb-3 flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                <input type="datetime-local" className="w-full border rounded px-2 py-1" value={addForm.startDate} onChange={e=>setAddForm(f=>({...f,startDate:e.target.value}))} required/>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Date & Time</label>
                <input type="datetime-local" className="w-full border rounded px-2 py-1" value={addForm.endDate} onChange={e=>setAddForm(f=>({...f,endDate:e.target.value}))} required/>
              </div>
            </div>

            {/* Title & Message */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input className="w-full border rounded px-2 py-1" value={addForm.title} onChange={e=>setAddForm(f=>({...f,title:e.target.value}))} required minLength={3} maxLength={120}/>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea className="w-full border rounded px-2 py-1" value={addForm.message} onChange={e=>setAddForm(f=>({...f,message:e.target.value}))} required minLength={5}/>
            </div>

            {/* Type & Priority */}
            <div className="mb-3 flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full border rounded px-2 py-1" value={addForm.type} onChange={e=>setAddForm(f=>({...f,type:e.target.value}))}>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Danger</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select className="w-full border rounded px-2 py-1" value={addForm.priority} onChange={e=>setAddForm(f=>({...f,priority:Number(e.target.value)}))}>
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
              </div>
            </div>

            {/* Link */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Link (optional)</label>
              <input className="w-full border rounded px-2 py-1" value={addForm.link} onChange={e=>setAddForm(f=>({...f,link:e.target.value}))} type="url" placeholder="https://... or /internal"/>
            </div>

            {/* Published */}
            <div className="mb-3 flex items-center gap-2">
              <input type="checkbox" checked={addForm.published} onChange={e=>setAddForm(f=>({...f,published:e.target.checked}))} id="add-published"/>
              <label htmlFor="add-published" className="text-sm">Published</label>
            </div>

            {/* Error */}
            {addError && <div className="text-red-600 text-sm mb-2">{addError}</div>}

            {/* Buttons */}
            <div className="flex gap-2 mt-4">
              <Button type="submit" size="md" variant="primary" loading={addLoading} disabled={addLoading}>Add</Button>
              <Button type="button" size="md" variant="secondary" onClick={()=>setAddModalOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Table */}
      {loading ? <p>Loading...</p> : (
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
            {items.map(n => (
              <tr key={n._id}>
                <td className="border px-3 py-2 font-medium">{n.title}</td>
                <td className="border px-3 py-2">
                  <Badge color={typeMap[n.type]?.color || "info"}>{typeMap[n.type]?.label || n.type}</Badge>
                </td>
                <td className="border px-3 py-2">
                  <Badge color={priorityMap[n.priority as 1|2|3]?.color || "info"}>
                    {priorityMap[n.priority as 1|2|3]?.label || n.priority}
                  </Badge>
                </td>
                <td className="border px-3 py-2">{n.published ? "Published" : "Draft"}</td>
                <td className="border px-3 py-2">{n.message}</td>
                <td className="border px-3 py-2 flex gap-2 justify-center">
                  {/* Edit */}
                  <Button size="sm" variant="outline" onClick={()=>{setEditing(n);setEditModalOpen(true);}}>Edit</Button>
                  {/* Unpublish */}
                  {n.published && (
                    <Button size="sm" variant="warning" onClick={async()=>{
                      setUnpublishingId(n._id);
                      try{
                        await fetch(`/api/admin/news-flash/${n._id}`, {method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({published:false})});
                        setItems(prev=>prev.map(i=>i._id===n._id?{...i,published:false}:i));
                      }catch(err){console.error(err);}finally{setUnpublishingId(null);}
                    }} disabled={unpublishingId===n._id}>Unpublish</Button>
                  )}
                  {/* Delete */}
                  <Button size="sm" variant="secondary" onClick={async()=>{
                    if(!confirm("Delete this news flash?")) return;
                    try{
                      await fetch(`/api/admin/news-flash/${n._id}`, {method:"DELETE"});
                      setItems(prev=>prev.filter(i=>i._id!==n._id));
                    }catch(err){console.error(err);}
                  }}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editModalOpen && editing && (
        <Modal open={editModalOpen} onClose={()=>setEditModalOpen(false)}>
          <EditNewsFlashForm newsFlash={editing} onClose={()=>setEditModalOpen(false)} onSave={(updated)=>{
            setItems(prev=>prev.map(i=>i._id===updated._id?updated:i));
            setEditModalOpen(false);
          }}/>
        </Modal>
      )}
    </div>
  );
}
