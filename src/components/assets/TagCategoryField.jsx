import { X } from "lucide-react";
import TagAutocomplete from "./TagAutocomplete";

export default function TagCategoryField({
  label,
  placeholder,
  tags = [],
  onTagSelect,
  onRemove
}) {
  return (
    <div className="rounded-xl border border-ui-border p-4">
      <label className="mb-2 block text-sm font-medium text-ui-text">
        {label}
      </label>

      <TagAutocomplete
        category={label}
        placeholder={placeholder}
        onTagSelect={onTagSelect}
      />

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => onRemove(tag)}
              className="inline-flex items-center gap-2 rounded-full border border-ui-border bg-ui-background px-3 py-1.5 text-sm text-ui-text transition hover:border-brand-primary hover:text-brand-primary"
            >
              <span>{tag.name}</span>
              <X size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
