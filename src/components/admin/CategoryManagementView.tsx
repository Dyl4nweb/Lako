"use client";

import React, { useState } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/server/actions/admin";
import { Plus, Edit2, Trash2, Check, X, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  _count: {
    products: number;
  };
}

export function CategoryManagementView({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (c: CategoryItem) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || "");
    setImageUrl(c.imageUrl || "");
    setActive(c.active);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (editingCategory) {
      const res = await updateCategoryAction(editingCategory.id, {
        name,
        description,
        imageUrl,
        active,
      });

      if (!res.success) {
        setError(res.error || "Failed to update category.");
        setLoading(false);
      } else {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, name, description, imageUrl, active } : c
          )
        );
        setModalOpen(false);
        setLoading(false);
      }
    } else {
      const res = await createCategoryAction({
        name,
        description,
        imageUrl,
        active,
      });

      if (!res.success || !res.category) {
        setError(res.error || "Failed to create category.");
        setLoading(false);
      } else {
        const newCat: CategoryItem = {
          id: res.category.id,
          name: res.category.name,
          slug: res.category.slug,
          description: res.category.description,
          imageUrl: res.category.imageUrl,
          active: res.category.active,
          _count: { products: 0 },
        };
        setCategories((prev) => [newCat, ...prev]);
        setModalOpen(false);
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    const res = await deleteCategoryAction(id);
    if (!res.success) {
      alert(res.error);
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize products into curated marketplace sections
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Products Linked</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-neutral-900">
                  <div>
                    <p>{c.name}</p>
                    {c.description && (
                      <p className="text-[11px] text-neutral-400 font-normal">{c.description}</p>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-neutral-500 text-[11px]">{c.slug}</td>
                <td className="py-3.5 px-4 font-bold text-neutral-700">
                  {c._count.products} products
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black text-neutral-900">
                {editingCategory ? "Edit Category" : "New Marketplace Category"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fresh Seafood"
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Image URL (Optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for category tags..."
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCat"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="activeCat" className="font-bold text-neutral-700 select-none">
                  Active (Show on marketplace storefront)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 font-bold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white shadow-xs flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
