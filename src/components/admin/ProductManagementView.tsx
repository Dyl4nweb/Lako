"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/server/actions/admin";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Package,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  published: boolean;
  categoryId: string;
  category: {
    name: string;
  };
}

interface ProductManagementViewProps {
  initialProducts: ProductItem[];
  categories: CategoryOption[];
}

export function ProductManagementView({
  initialProducts,
  categories,
}: ProductManagementViewProps) {
  const [products, setProducts] = useState(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [published, setPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80");
    setCategoryId(categories[0]?.id || "");
    setPublished(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setStock(p.stock.toString());
    setImageUrl(p.imageUrl);
    setCategoryId(p.categoryId);
    setPublished(p.published);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please provide a valid price greater than zero.");
      setLoading(false);
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setError("Please provide a valid non-negative stock count.");
      setLoading(false);
      return;
    }

    if (editingProduct) {
      // Update
      const res = await updateProductAction(editingProduct.id, {
        name,
        description,
        price: priceNum,
        stock: stockNum,
        imageUrl,
        categoryId,
        published,
      });

      if (!res.success) {
        setError(res.error || "Failed to update product.");
        setLoading(false);
      } else {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name,
                  description,
                  price: priceNum,
                  stock: stockNum,
                  imageUrl,
                  categoryId,
                  published,
                  category: {
                    name: categories.find((c) => c.id === categoryId)?.name || p.category.name,
                  },
                }
              : p
          )
        );
        setSuccessMsg("Product updated successfully!");
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg(null);
        }, 800);
        setLoading(false);
      }
    } else {
      // Create
      const res = await createProductAction({
        name,
        description,
        price: priceNum,
        stock: stockNum,
        imageUrl,
        categoryId,
        published,
      });

      if (!res.success || !res.product) {
        setError(res.error || "Failed to create product.");
        setLoading(false);
      } else {
        const newProd: ProductItem = {
          id: res.product.id,
          name: res.product.name,
          slug: res.product.slug,
          description: res.product.description,
          price: Number(res.product.price),
          stock: res.product.stock,
          imageUrl: res.product.imageUrl,
          published: res.product.published,
          categoryId: res.product.categoryId,
          category: {
            name: categories.find((c) => c.id === categoryId)?.name || "General",
          },
        };
        setProducts((prev) => [newProd, ...prev]);
        setSuccessMsg("Product created successfully!");
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg(null);
        }, 800);
        setLoading(false);
      }
    }
  };

  const handleTogglePublish = async (p: ProductItem) => {
    const nextState = !p.published;
    const res = await updateProductAction(p.id, {
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId,
      published: nextState,
    });

    if (res.success) {
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, published: nextState } : item))
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or unpublish "${name}"?`)) {
      return;
    }

    const res = await deleteProductAction(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert(res.message);
    } else {
      alert(res.error || "Failed to delete product.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your inventory, prices, photographs, and categories
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-neutral-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-700">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-700">
                      {p.category.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-orange-600">
                    ₱{p.price.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        p.stock === 0
                          ? "bg-red-100 text-red-700"
                          : p.stock <= 5
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {p.stock} in stock
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePublish(p)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        p.published
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {p.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{p.published ? "Published" : "Draft"}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete product"
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
      </div>

      {/* Modal Dialog for Add/Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black text-neutral-900">
                {editingProduct ? "Edit Product" : "Add New Marketplace Product"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lingayen Boneless Bangus"
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Price (₱ PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="245.00"
                    className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Publish to Catalog</label>
                  <select
                    value={published ? "true" : "false"}
                    onChange={(e) => setPublished(e.target.value === "true")}
                    className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="true">Published (Visible)</option>
                    <option value="false">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Image URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product flavor, freshness, or size..."
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
