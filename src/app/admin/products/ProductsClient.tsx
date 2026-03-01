// ═══════════════════════════════════════════════════════════════
// FILE: ProductsClient.tsx
// PURPOSE: Client-side product management UI with Add/Edit/Delete
//          modal forms and dynamic perks list.
// LOCATION: src/app/admin/products/ProductsClient.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useTransition } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    Star,
    Tag,
    ImageIcon,
} from "lucide-react";
import { addProduct, updateProduct, deleteProduct } from "./actions";
import { uploadImageToImgBB } from "./uploadAction";
import type { ProductDoc } from "./page";

// ─── Category Options ──────────────────────────────────────────

const categoryOptions = [
    { value: "ranks", label: "Ranks" },
    { value: "kits", label: "Kits" },
    { value: "keys", label: "Keys" },
    { value: "misc", label: "Miscellaneous" },
];

// ─── Empty Form State ──────────────────────────────────────────

const emptyForm = {
    name: "",
    price: 0,
    category: "ranks",
    image: "",
    description: "",
    perks: [""],
    badge: "",
    popular: false,
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ProductsClient({
    products,
}: {
    products: ProductDoc[];
}) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // ── Open Add Modal ─────────────────────────────────────────
    const openAdd = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowModal(true);
    };

    // ── Open Edit Modal ────────────────────────────────────────
    const openEdit = (product: ProductDoc) => {
        setForm({
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image,
            description: product.description,
            perks: product.perks.length > 0 ? product.perks : [""],
            badge: product.badge || "",
            popular: product.popular || false,
        });
        setEditingId(product._id);
        setShowModal(true);
    };

    // ── Handle Submit ──────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanedPerks = form.perks.filter((p) => p.trim() !== "");

        startTransition(async () => {
            const data = {
                ...form,
                perks: cleanedPerks,
                badge: form.badge || undefined,
            };

            if (editingId) {
                await updateProduct(editingId, data);
            } else {
                await addProduct(data);
            }
            setShowModal(false);
            setEditingId(null);
        });
    };

    // ── Handle Delete ──────────────────────────────────────────
    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteProduct(id);
            setDeleteConfirm(null);
        });
    };

    // ── Handle Image Upload ────────────────────────────────────
    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        const result = await uploadImageToImgBB(formData);

        setIsUploading(false);
        if (result.success && result.url) {
            setForm((prev) => ({ ...prev, image: result.url! }));
        } else {
            alert(result.error || "Failed to upload image");
        }
    };

    // ── Drag & Drop Events ─────────────────────────────────────
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleImageUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleImageUpload(e.target.files[0]);
        }
    };

    // ── Add / Remove Perk Fields ───────────────────────────────
    const addPerkField = () => {
        setForm({ ...form, perks: [...form.perks, ""] });
    };
    const removePerkField = (index: number) => {
        setForm({
            ...form,
            perks: form.perks.filter((_, i) => i !== index),
        });
    };
    const updatePerk = (index: number, value: string) => {
        const newPerks = [...form.perks];
        newPerks[index] = value;
        setForm({ ...form, perks: newPerks });
    };

    // ── Category Badge Color ───────────────────────────────────
    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case "ranks":
                return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "kits":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "keys":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            default:
                return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        }
    };

    return (
        <div>
            {/* ── Add Button ── */}
            <button
                onClick={openAdd}
                className="mb-6 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer"
            >
                <Plus className="w-5 h-5" />
                Add New Product
            </button>

            {/* ── Products Grid ── */}
            {products.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800/50 rounded-2xl mb-3">
                        <ImageIcon className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">
                        No products yet. Add your first product!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-zinc-900/70 border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 transition-all group"
                        >
                            {/* Product Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold text-base truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-zinc-500 text-xs mt-0.5 truncate">
                                        {product.description}
                                    </p>
                                </div>
                                <p className="text-emerald-400 font-bold text-lg ml-3 shrink-0">
                                    ₹{product.price}
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${getCategoryColor(product.category)}`}
                                >
                                    <Tag className="w-3 h-3" />
                                    {product.category}
                                </span>
                                {product.badge && (
                                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
                                        {product.badge}
                                    </span>
                                )}
                                {product.popular && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium">
                                        <Star className="w-3 h-3" />
                                        Popular
                                    </span>
                                )}
                            </div>

                            {/* Perks Preview */}
                            <div className="mb-4">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                                    Perks ({product.perks.length})
                                </p>
                                <div className="space-y-1">
                                    {product.perks.slice(0, 3).map((perk, i) => (
                                        <p
                                            key={i}
                                            className="text-zinc-400 text-xs truncate"
                                        >
                                            • {perk}
                                        </p>
                                    ))}
                                    {product.perks.length > 3 && (
                                        <p className="text-zinc-600 text-xs">
                                            +{product.perks.length - 3} more...
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/50">
                                <button
                                    onClick={() => openEdit(product)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/20 transition-all cursor-pointer"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                {deleteConfirm === product._id ? (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() =>
                                                handleDelete(product._id)
                                            }
                                            disabled={isPending}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/30 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {isPending ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                "Confirm"
                                            )}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeleteConfirm(null)
                                            }
                                            className="px-3 py-2 text-zinc-400 rounded-xl text-xs font-medium hover:text-white transition-all cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() =>
                                            setDeleteConfirm(product._id)
                                        }
                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                ADD / EDIT MODAL
               ═══════════════════════════════════════════════════ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => !isPending && setShowModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                            <h2 className="text-lg font-bold text-white">
                                {editingId ? "Edit Product" : "Add New Product"}
                            </h2>
                            <button
                                onClick={() => !isPending && setShowModal(false)}
                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <form
                            onSubmit={handleSubmit}
                            className="overflow-y-auto flex-1 px-6 py-5 space-y-4"
                        >
                            {/* Name */}
                            <div>
                                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1.5 font-medium">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                    placeholder="e.g. Warrior Rank"
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>

                            {/* Price + Category (Row) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1.5 font-medium">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.price || ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                price: parseFloat(
                                                    e.target.value
                                                ) || 0,
                                            })
                                        }
                                        required
                                        placeholder="9.99"
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1.5 font-medium">
                                        Category *
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                category: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
                                    >
                                        {categoryOptions.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Image Dropzone */}
                            <div>
                                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1.5 font-medium">
                                    Product Image *
                                </label>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl transition-all duration-200 ${dragActive
                                            ? "border-emerald-500 bg-emerald-500/10"
                                            : form.image
                                                ? "border-emerald-500/30 bg-emerald-500/5 group"
                                                : "border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/30 hover:bg-zinc-800/50"
                                        }`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploading}
                                    />

                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                            <p className="text-zinc-400 text-xs font-medium">Uploading image...</p>
                                        </div>
                                    ) : form.image ? (
                                        <div className="relative w-full h-full overflow-hidden rounded-xl">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={form.image}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-sm font-medium flex items-center gap-2">
                                                    <Pencil className="w-4 h-4" /> Change Image
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-500 pointer-events-none">
                                            <ImageIcon className="w-8 h-8 opacity-70" />
                                            <p className="text-sm">
                                                <span className="text-emerald-400 font-medium">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs opacity-70">PNG, JPG, WEBP up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                                {/* Hidden input to ensure form submission includes standard URL if needed, but we bind state mostly */}
                                <input type="hidden" value={form.image} required />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1.5 font-medium">
                                    Description *
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    required
                                    rows={2}
                                    placeholder="Short description of the product..."
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                                />
                            </div>

                            {/* Badge + Popular (Row) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1.5 font-medium">
                                        Badge Label
                                    </label>
                                    <input
                                        type="text"
                                        value={form.badge}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                badge: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Popular, Hot, New"
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.popular}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    popular: e.target.checked,
                                                })
                                            }
                                            className="w-5 h-5 rounded-lg border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer accent-emerald-500"
                                        />
                                        <span className="text-zinc-300 text-sm font-medium">
                                            ⭐ Popular
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Dynamic Perks */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-zinc-400 text-xs uppercase tracking-wider font-medium">
                                        Perks / Features
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addPerkField}
                                        className="text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors cursor-pointer"
                                    >
                                        + Add Perk
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {form.perks.map((perk, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={perk}
                                                onChange={(e) =>
                                                    updatePerk(
                                                        i,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={`Perk ${i + 1}`}
                                                className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                            />
                                            {form.perks.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removePerkField(i)
                                                    }
                                                    className="text-zinc-600 hover:text-red-400 transition-colors p-1 cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : editingId ? (
                                        <>
                                            <Pencil className="w-4 h-4" />
                                            Update Product
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Add Product
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
