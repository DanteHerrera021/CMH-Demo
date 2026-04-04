import { useEffect, useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import { FolderTree, Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  renameCategory
} from "../firebase/tagsApi";
import { toastError, toastSuccess } from "../utils/toastHandler";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setIsLoading(true);
      const results = await getAllCategories();
      setCategories(results);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toastError("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateCategory() {
    const trimmed = newCategoryName.trim();

    if (!trimmed) {
      toastError("Category name is required.");
      return;
    }

    const duplicate = categories.some(
      (category) => category.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) {
      toastError("A category with that name already exists.");
      return;
    }

    try {
      setIsCreating(true);
      await createCategory({ name: trimmed });
      setNewCategoryName("");
      toastSuccess("Category created.");
      await loadCategories();
    } catch (error) {
      console.error("Failed to create category:", error);
      toastError("Failed to create category.");
    } finally {
      setIsCreating(false);
    }
  }

  function startEditing(category) {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  }

  function cancelEditing() {
    setEditingCategoryId(null);
    setEditingName("");
  }

  async function handleRenameCategory(categoryId) {
    const trimmed = editingName.trim();

    if (!trimmed) {
      toastError("Category name cannot be empty.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.id !== categoryId &&
        category.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) {
      toastError("A category with that name already exists.");
      return;
    }

    try {
      setWorkingId(categoryId);
      await renameCategory(categoryId, { name: trimmed });
      toastSuccess("Category renamed.");
      cancelEditing();
      await loadCategories();
    } catch (error) {
      console.error("Failed to rename category:", error);
      toastError("Failed to rename category.");
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(
      `Delete category "${category.name}"? This may affect tags using it.`
    );

    if (!confirmed) return;

    try {
      setWorkingId(category.id);
      await deleteCategory(category.id);
      toastSuccess("Category deleted.");
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toastError("Failed to delete category.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <PageContainer>
      <div className="mb-12 mt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              to="/settings"
              className="mb-3 inline-flex items-center gap-2 text-sm text-ui-muted hover:text-ui-text"
            >
              <ArrowLeft size={16} />
              Back to Settings
            </Link>

            <h1 className="text-3xl font-bold text-ui-text md:text-4xl">
              Manage Categories
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ui-muted md:text-base">
              Create, rename, and remove tag categories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Plus size={18} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-ui-text">
                  Add Category
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                />
                <Button
                  type="button"
                  text={isCreating ? "Creating..." : "Create"}
                  rounded="sm"
                  className="bg-brand-primary text-white"
                  disabled={isCreating}
                  onClick={handleCreateCategory}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <FolderTree size={18} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-ui-text">
                  Existing Categories
                </h2>
              </div>

              {isLoading ? (
                <p className="text-sm text-ui-muted">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-ui-muted">
                  No categories have been created yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => {
                    const isEditing = editingCategoryId === category.id;
                    const isWorking = workingId === category.id;

                    return (
                      <div
                        key={category.id}
                        className="rounded-xl border border-ui-border bg-ui-background p-4"
                      >
                        {isEditing ? (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            />

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                text={isWorking ? "Saving..." : "Save"}
                                rounded="sm"
                                className="bg-brand-primary text-white"
                                disabled={isWorking}
                                onClick={() =>
                                  handleRenameCategory(category.id)
                                }
                              />
                              <Button
                                type="button"
                                text="Cancel"
                                rounded="sm"
                                className="bg-brand-danger text-white"
                                onClick={cancelEditing}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium text-ui-text">
                                {category.name}
                              </p>
                              <p className="text-sm text-ui-muted">
                                ID: {category.id}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-ui-border bg-ui-surface hover:bg-ui-background"
                                onClick={() => startEditing(category)}
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-ui-border bg-ui-surface hover:bg-ui-background"
                                onClick={() => handleDeleteCategory(category)}
                                disabled={isWorking}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6 xl:sticky xl:top-6">
            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-ui-text">Notes</h2>
              <div className="space-y-3 text-sm text-ui-muted">
                <p>Categories control how tags are grouped across the app.</p>
                <p>
                  Renaming or deleting a category can affect upload defaults and
                  image editing flows.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-ui-text">
                Summary
              </h2>
              <p className="text-sm text-ui-muted">
                Total categories: {categories.length}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
