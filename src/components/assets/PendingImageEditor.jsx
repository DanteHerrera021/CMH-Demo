import { useEffect, useMemo, useState } from "react";
import { X, Tag, CalendarDays, IdCard } from "lucide-react";
import Button from "../ui/Button";
import TagCategoryField from "./TagCategoryField";
import { getAllCategories } from "../../firebase/tagsApi";

export default function PendingImageEditor({ image, isOpen, onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !image) return;

    setTitle(image.title || "");
    setDate(image.date || "");
    setSelectedTags(image.selectedTags || []);
  }, [isOpen, image]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCategories() {
      try {
        setIsLoading(true);
        const categoryList = await getAllCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, [isOpen]);

  const tagsByCategory = useMemo(() => {
    const grouped = {};

    for (const category of categories) {
      grouped[category.name] = [];
    }

    for (const tag of selectedTags) {
      const categoryName = tag.category || "Uncategorized";

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }

      grouped[categoryName].push(tag);
    }

    return grouped;
  }, [categories, selectedTags]);

  function handleTagSelect(tag) {
    if (!tag) return;

    setSelectedTags((prev) => {
      const alreadySelected = prev.some(
        (existingTag) => existingTag.id === tag.id
      );
      if (alreadySelected) return prev;
      return [...prev, tag];
    });
  }

  function handleRemoveTag(tagToRemove) {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagToRemove.id));
  }

  function handleSave() {
    onSave({
      title,
      date,
      selectedTags
    });
    onClose();
  }

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full md:flex md:items-center md:justify-center md:p-6">
        <div className="flex h-full w-full flex-col bg-ui-background md:h-[90vh] md:max-h-[850px] md:max-w-5xl md:rounded-3xl md:border md:border-ui-border md:shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-ui-border px-4 py-4 md:px-6">
            <div>
              <h2 className="text-xl font-semibold text-ui-text">Edit Image</h2>
              <p className="text-sm text-ui-muted">Apply tags before upload</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-h-10 min-w-10 rounded-full border border-ui-border bg-ui-surface flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-[360px_minmax(0,1fr)] md:p-6">
              <aside className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-ui-border bg-ui-surface">
                  <div className="aspect-square bg-ui-muted">
                    <img
                      src={image.previewUrl}
                      alt={image.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-ui-border bg-ui-surface p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <IdCard size={18} className="text-brand-primary" />
                    <h3 className="font-semibold text-ui-text">Name</h3>
                  </div>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  />
                </div>

                <div className="rounded-2xl border border-ui-border bg-ui-surface p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarDays size={18} className="text-brand-primary" />
                    <h3 className="font-semibold text-ui-text">Date</h3>
                  </div>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  />
                </div>
              </aside>

              <section className="space-y-6">
                <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Tag size={18} className="text-brand-primary" />
                    <h3 className="text-lg font-semibold text-ui-text">
                      Active Tags
                    </h3>
                  </div>

                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-sm text-brand-primary"
                        >
                          <span>{tag.name}</span>
                          <X size={14} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ui-muted">No tags added yet.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-ui-text mb-1">
                    Tag Categories
                  </h3>
                  <p className="text-sm text-ui-muted mb-5">
                    Search and add tags to this image.
                  </p>

                  {isLoading ? (
                    <p className="text-sm text-ui-muted">
                      Loading categories...
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {categories.map((category) => (
                        <TagCategoryField
                          key={category.id}
                          label={category.name}
                          placeholder={`Search ${category.name.toLowerCase()}`}
                          tags={tagsByCategory[category.name] ?? []}
                          onTagSelect={handleTagSelect}
                          onRemove={handleRemoveTag}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-ui-border bg-ui-surface/95 px-4 py-4 md:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ui-muted">
                {selectedTags.length} tag{selectedTags.length === 1 ? "" : "s"}{" "}
                applied
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  text="Cancel"
                  rounded="sm"
                  className="bg-brand-danger text-white"
                  onClick={onClose}
                />
                <Button
                  type="button"
                  text="Save Changes"
                  rounded="sm"
                  className="bg-brand-primary text-white"
                  onClick={handleSave}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
