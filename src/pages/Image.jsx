import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import ZoomImage from "../components/assets/ZoomImage";
import {
  FingerprintPattern,
  File,
  Tag,
  CalendarDays,
  X,
  IdCard,
  SquareActivity
} from "lucide-react";
import Button from "../components/ui/Button";
import TagCategoryField from "../components/assets/TagCategoryField";
import { getAllCategories, getTagById } from "../firebase/tagsApi";
import { updateMediaTags } from "../firebase/mediaApi";
import { toastError, toastSuccess } from "../utils/toastHandler";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

export default function Image() {
  const navigate = useNavigate();
  const image = useLoaderData();

  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function loadPageData() {
      try {
        setIsLoading(true);

        const [categoryList, hydratedTags] = await Promise.all([
          getAllCategories(),
          Promise.all((image.tagIds || []).map((tagId) => getTagById(tagId)))
        ]);

        setCategories(categoryList);
        setSelectedTags(hydratedTags.filter(Boolean));
        setDate(formatDateForInput(image.createdAt));
        setName(image.title);
      } catch (error) {
        console.error("Failed to load image page data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
  }, [image]);

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

  function handleRevert() {
    async function resetTags() {
      try {
        setIsLoading(true);

        const hydratedTags = await Promise.all(
          (image.tagIds || []).map((tagId) => getTagById(tagId))
        );

        setSelectedTags(hydratedTags.filter(Boolean));
        setDate(formatDateForInput(image.createdAt));
        setName(image.title);
      } catch (error) {
        console.error("Failed to revert image details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    resetTags();
  }

  async function handleSave(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      await updateMediaTags(image.id, selectedTags);
      toastSuccess("Image details saved successfully!");
    } catch (error) {
      console.error("Failed to save image details:", error);
      toastError("Failed to save details.");
    } finally {
      setIsSaving(false);
    }
  }

  async function downloadImage() {
    try {
      setIsDownloading(true);

      const res = await fetch(import.meta.env.VITE_PRESIGN_DOWNLOAD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: image.s3key,
          filename: image.filename || "image.jpg"
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create download URL");
      }

      const { downloadUrl } = await res.json();

      window.location.assign(downloadUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download image.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      const deleteMedia = httpsCallable(functions, "deleteMedia");

      await deleteMedia({
        mediaId: image.id // 🔥 must match Firestore doc ID
      });

      toastSuccess("Image deleted successfully.");

      navigate("/library");
    } catch (error) {
      console.error(error);
      toastError("Failed to delete image.");
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mt-8 text-ui-text">Loading image details...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-12 mt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ui-text md:text-4xl">
              Image Details
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ui-muted md:text-base">
              Review the image, apply tags, and update metadata.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <MetaPill
              icon={<FingerprintPattern size={16} className="text-white" />}
              text={image.id}
            />
            <MetaPill
              icon={<File size={16} className="text-white" />}
              text={image.filename}
            />
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="space-y-4 xl:sticky xl:top-6">
              <div className="overflow-hidden rounded-2xl border border-ui-border bg-ui-surface shadow-sm">
                <ZoomImage src={image.url} alt={image.filename}>
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="h-auto w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 border-t border-ui-border bg-black/60 px-4 py-3 text-sm text-white">
                    <span>Click to enlarge image</span>
                    <span className="opacity-80">Preview</span>
                  </div>
                </ZoomImage>
              </div>

              <div className="rounded-2xl border border-ui-border bg-ui-surface p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <SquareActivity size={18} className="text-brand-primary" />
                  <h2 className="text-lg font-semibold text-ui-text">
                    Image Actions
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    text={isDownloading ? "Downloading..." : "Download"}
                    rounded="sm"
                    className="bg-brand-primary text-white"
                    disabled={isDownloading}
                    onClick={(e) => {
                      e.preventDefault();
                      downloadImage();
                    }}
                  />
                  <Button
                    text={"Delete"}
                    rounded="sm"
                    className="bg-brand-danger text-white"
                    disabled={isDownloading}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                  />
                </div>
                {isDownloading && (
                  <p className="mt-3 text-sm text-ui-muted">
                    Preparing download...
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-ui-border bg-ui-surface p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays size={18} className="text-brand-primary" />
                  <h2 className="text-lg font-semibold text-ui-text">Date</h2>
                </div>

                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium text-ui-muted"
                >
                  Image date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                />
              </div>

              <div className="rounded-2xl border border-ui-border bg-ui-surface p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <IdCard size={18} className="text-brand-primary" />
                  <h2 className="text-lg font-semibold text-ui-text">Name</h2>
                </div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-ui-muted"
                >
                  Image Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                />
              </div>
            </aside>

            <section className="space-y-6">
              <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Tag size={18} className="text-brand-primary" />
                  <h2 className="text-lg font-semibold text-ui-text">
                    Active Tags
                  </h2>
                </div>

                {selectedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-sm text-brand-primary transition hover:bg-brand-primary/15"
                      >
                        <span>{tag.name}</span>
                        <X size={14} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ui-muted">
                    No tags added yet. Start by adding tags below.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-ui-text">
                    Tag Categories
                  </h2>
                  <p className="mt-1 text-sm text-ui-muted">
                    Search for tags by category and add them to this image.
                  </p>
                </div>

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
              </div>

              <div className="sticky bottom-4 z-10">
                <div className="rounded-2xl border border-ui-border bg-ui-surface/95 px-4 py-4 shadow-lg backdrop-blur">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-ui-text">
                        Ready to save?
                      </p>
                      <p className="text-sm text-ui-muted">
                        {selectedTags.length} tag
                        {selectedTags.length === 1 ? "" : "s"} applied
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        text="Revert Changes"
                        rounded="sm"
                        className="bg-brand-danger text-white"
                        onClick={handleRevert}
                      />

                      <Button
                        type="submit"
                        text={isSaving ? "Saving..." : "Save Details"}
                        rounded="sm"
                        className="bg-brand-primary text-white"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}

function MetaPill({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded bg-brand-primary px-3 py-1.5">
      {icon}
      <p className="text-sm text-white">{text}</p>
    </div>
  );
}

function formatDateForInput(value) {
  if (!value) return "";

  const date =
    typeof value?.toDate === "function" ? value.toDate() : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
