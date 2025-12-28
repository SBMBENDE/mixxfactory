"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminNewsFlashPage() {
  const [items] = useState<
    { id: string; title: string; status: string }[]
  >([]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        News Flash Admin
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-500">
          No news flashes yet.
        </p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-3 py-2">Title</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id}>
                <td className="border px-3 py-2">{n.title}</td>
                <td className="border px-3 py-2">{n.status}</td>
                <td className="border px-3 py-2 text-center">
                  <Button size="sm" variant="danger">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
