import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import { Tag, Plus, Pencil, Trash2, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAllCategories,
  getAllTags,
  createTag,
  updateTag,
  deleteTag
} from "../firebase/tagsApi";
import { toastError, toastSuccess } from "../utils/toastHandler";

export default function Tags() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState("");

  const [editingTagId, setEditingTagId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategory, setEditingCategory] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      setIsLoading(true);
      const [categoryResults, tagResults] = await Promise.all([
        getAllCategories(),
        getAllTags()
      ]);

      setCategories(categoryResults);
      setTags(tagResults);

      if (categoryResults.length > 0 && !newTagCategory) {
        setNewTagCategory(categoryResults[0].name);
      }
    } catch (error) {
      console.error("Failed to load tag page:", error);
      toastError("Failed to load tags.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      const matchesSearch = tag.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ? true : tag.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [tags, search, categoryFilter]);

  async function handleCreateTag() {
    const trimmedName = newTagName.trim();

    if (!trimmedName) {
      toastError("Tag name is required.");
      return;
    }

    if (!newTagCategory) {
      toastError("Please select a category.");
      return;
    }

    const duplicate = tags.some(
      (tag) =>
        tag.name.toLowerCase() === trimmedName.toLowerCase() &&
        tag.category === newTagCategory
    );

    if (duplicate) {
      toastError("That tag already exists in this category.");
      return;
    }

    try {
      setIsCreating(true);
      await createTag({
        name: trimmedName,
        category: newTagCategory
      });

      setNewTagName("");
      toastSuccess("Tag created.");
      await loadPage();
    } catch (error) {
      console.error("Failed to create tag:", error);
      toastError("Failed to create tag.");
    } finally {
      setIsCreating(false);
    }
  }

  function startEditing(tag) {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditingCategory(tag.category || "");
  }

  function cancelEditing() {
    setEditingTagId(null);
    setEditingName("");
    setEditingCategory("");
  }

  async function handleSaveEdit(tagId) {
    const trimmedName = editingName.trim();

    if (!trimmedName) {
      toastError("Tag name cannot be empty.");
      return;
    }

    if (!editingCategory) {
      toastError("Please select a category.");
      return;
    }

    const duplicate = tags.some(
      (tag) =>
        tag.id !== tagId &&
        tag.name.toLowerCase() === trimmedName.toLowerCase() &&
        tag.category === editingCategory
    );

    if (duplicate) {
      toastError("That tag already exists in this category.");
      return;
    }

    try {
      setWorkingId(tagId);
      await updateTag(tagId, {
        name: trimmedName,
        category: editingCategory
      });
      toastSuccess("Tag updated.");
      cancelEditing();
      await loadPage();
    } catch (error) {
      console.error("Failed to update tag:", error);
      toastError("Failed to update tag.");
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDeleteTag(tag) {
    const confirmed = window.confirm(`Delete tag "${tag.name}"?`);
    if (!confirmed) return;

    try {
      setWorkingId(tag.id);
      await deleteTag(tag.id);
      toastSuccess("Tag deleted.");
      await loadPage();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      toastError("Failed to delete tag.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <PageContainer>
      <div className="mb-12 mt-8">
        <div className="mb-6">
          <Link
            to="/settings"
            className="mb-3 inline-flex items-center gap-2 text-sm text-ui-muted hover:text-ui-text"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </Link>

          <h1 className="text-3xl font-bold text-ui-text md:text-4xl">
            Manage Tags
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ui-muted md:text-base">
            Create, search, edit, and remove tags across categories.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Plus size={18} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-ui-text">Add Tag</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />

                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value)}
                  className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  text={isCreating ? "Creating..." : "Create"}
                  rounded="sm"
                  className="bg-brand-primary text-white"
                  disabled={isCreating}
                  onClick={handleCreateTag}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-brand-primary" />
                  <h2 className="text-lg font-semibold text-ui-text">Tags</h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_220px] w-full lg:w-auto">
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tags"
                      className="block w-full rounded-md border border-ui-border bg-ui-surface pl-9 pr-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <option value="all">All categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoading ? (
                <p className="text-sm text-ui-muted">Loading tags...</p>
              ) : filteredTags.length === 0 ? (
                <p className="text-sm text-ui-muted">No matching tags found.</p>
              ) : (
                <div className="space-y-3">
                  {filteredTags.map((tag) => {
                    const isEditing = editingTagId === tag.id;
                    const isWorking = workingId === tag.id;

                    return (
                      <div
                        key={tag.id}
                        className="rounded-xl border border-ui-border bg-ui-background p-4"
                      >
                        {isEditing ? (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            />

                            <select
                              value={editingCategory}
                              onChange={(e) =>
                                setEditingCategory(e.target.value)
                              }
                              className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <option value="">Select category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                  {category.name}
                                </option>
                              ))}
                            </select>

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                text={isWorking ? "Saving..." : "Save"}
                                rounded="sm"
                                className="bg-brand-primary text-white"
                                disabled={isWorking}
                                onClick={() => handleSaveEdit(tag.id)}
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
                                {tag.name}
                              </p>
                              <p className="text-sm text-ui-muted">
                                {tag.category || "Uncategorized"}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-ui-border bg-ui-surface hover:bg-ui-background"
                                onClick={() => startEditing(tag)}
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-ui-border bg-ui-surface hover:bg-ui-background"
                                onClick={() => handleDeleteTag(tag)}
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
                <p>Tags power filtering, defaults, and per-image metadata.</p>
                <p>
                  Duplicate tag names may be acceptable across different
                  categories, but not usually within the same category.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-ui-text">
                Summary
              </h2>
              <p className="text-sm text-ui-muted">Total tags: {tags.length}</p>
              <p className="text-sm text-ui-muted">
                Showing: {filteredTags.length}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
