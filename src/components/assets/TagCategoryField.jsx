import Button from "../ui/Button";

export default function TagCategoryField({
  label,
  placeholder,
  value,
  tags,
  onChange,
  onAdd,
  onRemove,
  onKeyDown
}) {
  return (
    <div className="rounded-xl border border-ui-border p-4">
      <label className="block text-sm font-medium text-ui-text mb-2">
        {label}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          placeholder={placeholder}
          className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        />

        <Button
          type="button"
          text="Assign"
          rounded="sm"
          onClick={onAdd}
          className="sm:w-auto bg-brand-primary text-white whitespace-nowrap"
        >
          Assign
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={`${label}-${tag}`}
              type="button"
              onClick={() => onRemove(tag)}
              className="inline-flex items-center gap-2 rounded-full border border-ui-border bg-ui-background px-3 py-1.5 text-sm text-ui-text transition hover:border-brand-primary hover:text-brand-primary"
            >
              <span>{tag}</span>
              <X size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
