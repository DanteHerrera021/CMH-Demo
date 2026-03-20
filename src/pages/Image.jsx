import { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import ZoomImage from "../components/assets/ZoomImage";
import { FingerprintPattern, File, Tag, CalendarDays, X } from "lucide-react";
import Button from "../components/ui/Button";
import TagCategoryField from "../components/assets/TagCategoryField";

const images = import.meta.glob("../assets/imgs/temp/*.jpg", { eager: true });

const TAG_CATEGORIES = [
  {
    key: "showName",
    label: "Show Name",
    placeholder: "Search show names"
  },
  {
    key: "companyName",
    label: "Company Name",
    placeholder: "Search companies"
  },
  {
    key: "location",
    label: "Location",
    placeholder: "Search locations"
  },
  {
    key: "industry",
    label: "Industry",
    placeholder: "Search industries"
  },
  {
    key: "displaySize",
    label: "Display Size",
    placeholder: "Search display sizes"
  },
  {
    key: "boothType",
    label: "Booth Type",
    placeholder: "Search booth types"
  },
  {
    key: "additionalTags",
    label: "Additional Tags",
    placeholder: "Search additional tags"
  }
];

export default function Image() {
  const { id, src } = useLoaderData();

  const [date, setDate] = useState("");
  const [tagValues, setTagValues] = useState({
    showName: [],
    companyName: [],
    location: [],
    industry: [],
    displaySize: [],
    boothType: [],
    additionalTags: []
  });

  const [drafts, setDrafts] = useState({
    showName: "",
    companyName: "",
    location: "",
    industry: "",
    displaySize: "",
    boothType: "",
    additionalTags: ""
  });

  const activeTags = useMemo(() => {
    return Object.entries(tagValues).flatMap(([category, tags]) =>
      tags.map((tag) => ({
        id: `${category}-${tag}`,
        category,
        label: tag
      }))
    );
  }, [tagValues]);

  function updateDraft(categoryKey, value) {
    setDrafts((prev) => ({
      ...prev,
      [categoryKey]: value
    }));
  }

  function addTag(categoryKey) {
    const rawValue = drafts[categoryKey];
    const trimmedValue = rawValue.trim();

    if (!trimmedValue) return;

    setTagValues((prev) => {
      const existing = prev[categoryKey];
      const alreadyExists = existing.some(
        (tag) => tag.toLowerCase() === trimmedValue.toLowerCase()
      );

      if (alreadyExists) return prev;

      return {
        ...prev,
        [categoryKey]: [...existing, trimmedValue]
      };
    });

    setDrafts((prev) => ({
      ...prev,
      [categoryKey]: ""
    }));
  }

  function removeTag(categoryKey, tagToRemove) {
    setTagValues((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter((tag) => tag !== tagToRemove)
    }));
  }

  function handleKeyDown(event, categoryKey) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(categoryKey);
    }
  }

  function handleSave(event) {
    event.preventDefault();

    const payload = {
      imageId: id,
      filename: `img${id}.jpg`,
      date,
      tags: tagValues
    };

    console.log("Saving image details:", payload);
    alert("Details saved!");
  }

  return (
    <PageContainer>
      <div className="mt-8 mb-12">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-ui-text">
              Image Details
            </h1>
            <p className="mt-2 text-sm md:text-base text-ui-muted max-w-2xl">
              Review the image, apply tags, and update metadata.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <MetaPill
              icon={<FingerprintPattern size={16} className="text-white" />}
              text={id}
            />
            <MetaPill
              icon={<File size={16} className="text-white" />}
              text={`img${id}.jpg`}
            />
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-8 items-start">
            <aside className="xl:sticky xl:top-6 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-ui-border bg-ui-surface shadow-sm">
                <ZoomImage src={src} alt={`Image ${id}`}>
                  <img
                    src={src}
                    alt={`Image ${id}`}
                    className="w-full h-auto object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 border-t border-ui-border bg-black/60 px-4 py-3 text-sm text-white">
                    <span>Click to enlarge image</span>
                    <span className="opacity-80">Preview</span>
                  </div>
                </ZoomImage>
              </div>

              <div className="rounded-2xl border border-ui-border bg-ui-surface p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays size={18} className="text-brand-primary" />
                  <h2 className="text-lg font-semibold text-ui-text">Date</h2>
                </div>

                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-ui-muted mb-2"
                >
                  Image date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                />
              </div>
            </aside>

            <section className="space-y-6">
              <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={18} className="text-brand-primary" />
                  <h2 className="text-lg font-semibold text-ui-text">
                    Active Tags
                  </h2>
                </div>

                {activeTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => removeTag(tag.category, tag.label)}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-sm text-brand-primary transition hover:bg-brand-primary/15"
                      >
                        <span>{tag.label}</span>
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

              <div className="rounded-2xl border border-ui-border bg-ui-surface p-5 md:p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-ui-text">
                    Tag Categories
                  </h2>
                  <p className="mt-1 text-sm text-ui-muted">
                    Each section adds tags to this image. Press Enter or click
                    Add Tag.
                  </p>
                </div>

                <div className="space-y-5">
                  {TAG_CATEGORIES.map((category) => (
                    <TagCategoryField
                      key={category.key}
                      label={category.label}
                      placeholder={category.placeholder}
                      value={drafts[category.key]}
                      tags={tagValues[category.key]}
                      onChange={(value) => updateDraft(category.key, value)}
                      onAdd={() => addTag(category.key)}
                      onRemove={(tag) => removeTag(category.key, tag)}
                      onKeyDown={(event) => handleKeyDown(event, category.key)}
                    />
                  ))}
                </div>
              </div>

              <div className="sticky bottom-4 z-10">
                <div className="rounded-2xl border border-ui-border bg-ui-surface/95 backdrop-blur px-4 py-4 shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-ui-text">
                        Ready to save?
                      </p>
                      <p className="text-sm text-ui-muted">
                        {activeTags.length} tag
                        {activeTags.length === 1 ? "" : "s"} applied
                        {date ? " • date selected" : ""}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        text="Revert Changes"
                        rounded="sm"
                        className="bg-brand-danger text-white"
                      />

                      <Button
                        type="submit"
                        text="Save Details"
                        rounded="sm"
                        className="bg-brand-primary text-white"
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
    <div className="rounded bg-brand-primary py-1.5 px-3 flex items-center gap-2">
      {icon}
      <p className="text-white text-sm">{text}</p>
    </div>
  );
}

export async function imageLoader({ params }) {
  const { id } = params;
  const imagePath = `../assets/imgs/temp/img${id}.jpg`;
  const imageModule = images[imagePath];

  if (!imageModule) {
    throw new Response("Image Not Found", { status: 404 });
  }

  return {
    id,
    src: imageModule.default
  };
}
