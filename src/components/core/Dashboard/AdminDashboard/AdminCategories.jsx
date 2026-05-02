import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminCategories,
  createAdminCategory,
  deleteAdminCategory,
} from "../../../../services/operations/adminAPI";
import { FiPlus, FiTrash2, FiX, FiTag, FiBook } from "react-icons/fi";

function ConfirmDeleteModal({ category, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-richblack-800 rounded-2xl border border-richblack-600 p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <FiTrash2 className="text-red-400 text-lg" />
          </div>
          <h2 className="text-white font-semibold text-lg">Delete Category</h2>
        </div>
        <p className="text-richblack-300 text-sm mb-2">
          Are you sure you want to delete{" "}
          <span className="text-white font-semibold">"{category.name}"</span>?
        </p>
        <p className="text-red-400/80 text-xs mb-6">
          This action cannot be undone. Courses in this category will lose their category association.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-richblack-600 text-richblack-300 hover:text-white hover:border-richblack-500 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { categories } = useSelector((s) => s.admin);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getAdminCategories(token));
  }, [dispatch, token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await dispatch(createAdminCategory(name.trim(), description.trim(), token));
    setName("");
    setDescription("");
    setShowForm(false);
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await dispatch(deleteAdminCategory(toDelete._id, token));
    setToDelete(null);
  };

  return (
    <div className="w-full px-6 py-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-richblack-400 mt-1">{categories.length} categories available</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-500/20"
        >
          {showForm ? <FiX /> : <FiPlus />}
          {showForm ? "Cancel" : "New Category"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-2xl bg-richblack-800 border border-violet-500/30 p-6 shadow-lg shadow-violet-500/5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiTag className="text-violet-400" /> Create New Category
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-richblack-300 text-xs font-medium block mb-1.5">
                Category Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Web Development"
                required
                className="w-full px-4 py-3 rounded-xl bg-richblack-700 border border-richblack-600 focus:border-violet-500 text-white placeholder:text-richblack-500 outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="text-richblack-300 text-xs font-medium block mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this category..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-richblack-700 border border-richblack-600 focus:border-violet-500 text-white placeholder:text-richblack-500 outline-none text-sm resize-none transition-colors"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-richblack-600 text-richblack-300 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
              >
                {submitting ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-20 text-richblack-400">
          <FiTag className="text-5xl mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No categories yet</p>
          <p className="text-sm mt-1">Create your first category to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="group rounded-2xl bg-richblack-800 border border-richblack-700 p-5 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                  <FiTag className="text-violet-400" />
                </div>
                <button
                  onClick={() => setToDelete(cat)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-richblack-400 hover:text-red-400 transition-all"
                  title="Delete category"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>

              <h3 className="text-white font-semibold text-base mb-1">{cat.name}</h3>
              {cat.description && (
                <p className="text-richblack-400 text-xs leading-relaxed line-clamp-2 mb-3">
                  {cat.description}
                </p>
              )}

              <div className="flex items-center gap-1 text-richblack-400 text-xs mt-auto pt-2 border-t border-richblack-700">
                <FiBook className="text-xs" />
                <span>{cat.courses?.length || 0} courses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <ConfirmDeleteModal
          category={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
