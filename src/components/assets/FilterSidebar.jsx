import { CalendarDays, Search, X, RotateCcw, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllCategories, autocompleteTags } from "../../firebase/tagsApi";
import { toastError } from "../../utils/toastHandler";
import TagAutocomplete from "./TagAutocomplete";

function TagPill({ children, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-ui-border bg-ui-background px-3 py-1.5 text-sm text-ui-text transition hover:border-brand-danger hover:text-brand-danger"
    >
      <span className="truncate">{children}</span>
      <X className="h-4 w-4 shrink-0" />
    </button>
  );
}

function FilterField({ id, label, placeholder, onSelect }) {
  return (
    <section className="rounded-xl border border-ui-border p-4">
      <label htmlFor={id} className="block text-sm font-medium text-ui-text">
        {label}
      </label>
      <div className="mt-2">
        <TagAutocomplete
          category={label}
          id={id}
          placeholder={placeholder}
          onTagSelect={onSelect}
        />
      </div>
    </section>
  );
}

export default function FilterSidebar({
  mobile = false,
  onClose,
  selectedTags = [],
  onTagSelect,
  onTagRemove,
  onResetTags,
  onStartDateChange,
  onEndDateChange,
  startDate = "",
  endDate = "",
  onClearAll
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryDocs = await getAllCategories();
        setCategories(categoryDocs);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toastError("Failed to load tag categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex h-full flex-col bg-ui-surface">
      <div className="border-b border-ui-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-ui-text">Filters</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm text-ui-muted hover:text-brand-danger"
            >
              Clear All
            </button>

            {mobile && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 hover:bg-black/5"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* TODO: ADD GLOBAL SEARCH INPUT */}
        {/* <div className="mt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/60" />
            <input
              type="text"
              placeholder="Search images, filenames, or tags"
              className="block w-full rounded-md bg-ui-surface px-3 pl-11 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            />
          </div>
        </div> */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <section className="rounded-xl border border-ui-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ui-text">
              Active Filters
            </h3>

            <button
              type="button"
              onClick={onResetTags}
              className="inline-flex items-center gap-1 text-xs text-ui-muted hover:text-brand-danger"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <TagPill key={tag.id} onRemove={() => onTagRemove(tag.id)}>
                  {tag.name}
                </TagPill>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ui-muted">No filters applied yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-ui-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-primary" />
              <h3 className="text-sm font-semibold text-ui-text">Date Range</h3>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-ui-muted hover:text-brand-danger"
              onClick={() => {
                onStartDateChange("");
                onEndDateChange("");
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="from"
                className="block text-sm font-medium text-ui-muted"
              >
                From
              </label>
              <div className="mt-1">
                <input
                  id="from"
                  type="date"
                  name="from"
                  autoComplete="off"
                  value={startDate || ""}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="to"
                className="block text-sm font-medium text-ui-muted"
              >
                To
              </label>
              <div className="mt-1">
                <input
                  id="to"
                  type="date"
                  name="to"
                  autoComplete="off"
                  value={endDate || ""}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ui-text mb-3">
              Filter by Tags
            </h3>
            <div className="space-y-4">
              {categories.map((category) => (
                <FilterField
                  key={category.id}
                  id={`tag-${category.id}`}
                  label={category.name}
                  placeholder={`Search ${category.name}`}
                  onSelect={(tag) => onTagSelect(tag)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
