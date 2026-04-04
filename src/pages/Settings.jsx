import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import TagCategoryField from "../components/assets/TagCategoryField";
import {
  Settings as SettingsIcon,
  Tag,
  FolderTree,
  Save,
  MonitorSmartphone,
  CalendarDays,
  X
} from "lucide-react";
import { getAllCategories, getTagById } from "../firebase/tagsApi";
import { toastError, toastSuccess } from "../utils/toastHandler";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "uploadDefaults";

const DEFAULT_SETTINGS = {
  dateOverride: "",
  defaultTagIds: []
};

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user.email.substring(0, user.email.indexOf("@")) === "admin") {
        setIsAdmin(true);
      }
    });

    return () => unsub();
  }, []);

  const [categories, setCategories] = useState([]);
  const [dateOverride, setDateOverride] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadSettingsPage() {
      try {
        setIsLoading(true);

        const savedRaw = localStorage.getItem(STORAGE_KEY);
        let savedSettings = DEFAULT_SETTINGS;

        if (savedRaw) {
          try {
            const parsed = JSON.parse(savedRaw);
            savedSettings = {
              dateOverride: parsed.dateOverride || "",
              defaultTagIds: Array.isArray(parsed.defaultTagIds)
                ? parsed.defaultTagIds
                : []
            };
          } catch (error) {
            console.error("Failed to parse saved upload defaults:", error);
          }
        }

        const categoryList = await getAllCategories();
        setCategories(categoryList);
        setDateOverride(savedSettings.dateOverride);

        const hydratedTags = await Promise.all(
          savedSettings.defaultTagIds.map((tagId) => getTagById(tagId))
        );

        const validTags = hydratedTags.filter(Boolean);
        const validTagIds = validTags.map((tag) => tag.id);

        setSelectedTags(validTags);

        // Clean up stale IDs if needed
        if (validTagIds.length !== savedSettings.defaultTagIds.length) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              dateOverride: savedSettings.dateOverride,
              defaultTagIds: validTagIds
            })
          );

          toastError(
            "One or more saved default tags no longer exist and were removed."
          );
        }
      } catch (error) {
        console.error("Failed to load settings page:", error);
        toastError("Failed to load settings.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettingsPage();
  }, []);

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
    const savedRaw = localStorage.getItem(STORAGE_KEY);

    if (!savedRaw) {
      setDateOverride("");
      setSelectedTags([]);
      return;
    }

    try {
      const parsed = JSON.parse(savedRaw);

      setDateOverride(parsed.dateOverride || "");

      Promise.all(
        (parsed.defaultTagIds || []).map((tagId) => getTagById(tagId))
      )
        .then((hydratedTags) => {
          setSelectedTags(hydratedTags.filter(Boolean));
        })
        .catch((error) => {
          console.error("Failed to reload saved tags:", error);
          toastError("Failed to revert settings.");
        });
    } catch (error) {
      console.error("Failed to parse saved settings:", error);
      toastError("Failed to revert settings.");
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);

      const defaultTagIds = selectedTags.map((tag) => tag.id);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          dateOverride,
          defaultTagIds
        })
      );

      toastSuccess("Settings saved on this device.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toastError("Failed to save settings.");
    } finally {
      setTimeout(setIsSaving(false), 500);
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mt-8 text-ui-text">Loading settings...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-12 mt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ui-text md:text-4xl">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ui-muted md:text-base">
              Configure default upload metadata and tags for this browser.
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
              type="button"
              text={isSaving ? "Saving..." : "Save Settings"}
              rounded="sm"
              className="bg-brand-primary text-white"
              disabled={isSaving}
              onClick={handleSave}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="order-2 xl:order-1 space-y-6">
            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <SettingsIcon size={18} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-ui-text">
                  Upload Defaults
                </h2>
              </div>

              <p className="mb-5 text-sm text-ui-muted">
                These defaults are applied when new upload drafts are created.
              </p>

              <div className="rounded-xl border border-ui-border bg-ui-background p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays size={18} className="text-brand-primary" />
                  <h3 className="text-base font-semibold text-ui-text">
                    Date Override
                  </h3>
                </div>

                <label
                  htmlFor="date-override"
                  className="mb-2 block text-sm font-medium text-ui-muted"
                >
                  Default date
                </label>

                <input
                  id="date-override"
                  type="date"
                  value={dateOverride}
                  onChange={(e) => setDateOverride(e.target.value)}
                  className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Tag size={18} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-ui-text">
                  Default Tags by Category
                </h2>
              </div>

              <p className="mb-5 text-sm text-ui-muted">
                Choose default tags for any category. These will be pre-applied
                to newly added uploads.
              </p>

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

            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Tag size={18} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-ui-text">
                  Active Default Tags
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
                  No default tags selected yet.
                </p>
              )}
            </div>
          </section>

          <aside className="order-1 xl:order-2 space-y-6 xl:sticky xl:top-6">
            {isAdmin && (
              <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <FolderTree size={18} className="text-brand-primary" />
                  <h2 className="text-lg font-semibold text-ui-text">
                    Admin Tools
                  </h2>
                </div>

                <p className="mb-4 text-sm text-ui-muted">
                  Manage categories and tags used throughout the media library.
                </p>

                <div className="space-y-3">
                  <Button
                    type="button"
                    text="Manage Categories"
                    rounded="sm"
                    className="w-full bg-brand-primary text-white"
                    onClick={() => {
                      navigate("/settings/categories");
                    }}
                  />
                  <Button
                    type="button"
                    text="Manage Tags"
                    rounded="sm"
                    className="w-full bg-brand-primary text-white"
                    onClick={() => {
                      navigate("/settings/tags");
                    }}
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MonitorSmartphone size={18} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-ui-text">
                  How defaults work
                </h2>
              </div>

              <div className="space-y-3 text-sm text-ui-muted">
                <p>These settings are saved only in this browser.</p>
                <p>
                  Defaults are applied automatically when new upload drafts are
                  created.
                </p>
                <p>
                  You can still change tags and date for each image before
                  upload.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Save size={18} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-ui-text">
                  Current summary
                </h2>
              </div>

              <div className="space-y-2 text-sm text-ui-muted">
                <p>
                  <span className="font-medium text-ui-text">
                    Date override:
                  </span>{" "}
                  {dateOverride || "None"}
                </p>
                <p>
                  <span className="font-medium text-ui-text">
                    Default tags:
                  </span>{" "}
                  {selectedTags.length}
                </p>
                <p>
                  <span className="font-medium text-ui-text">Categories:</span>{" "}
                  {categories.length}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
