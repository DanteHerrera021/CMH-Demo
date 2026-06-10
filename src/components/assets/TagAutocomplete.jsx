import { useEffect, useMemo, useRef, useState } from "react";
import { getTagsByCategory } from "../../firebase/tagsApi";
import { toastError } from "../../utils/toastHandler";

export default function TagAutocomplete({
  category,
  placeholder,
  onTagSelect
}) {
  const [inputValue, setInputValue] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const blurTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const suggestedTags = useMemo(() => {
    const query = inputValue.trim().toLowerCase();

    if (query.length < 2) return [];

    return allTags
      .filter((tag) => tag.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [allTags, inputValue]);

  async function handleOnFocus() {
    setIsFocused(true);

    if (allTags.length === 0) {
      try {
        setIsLoading(true);
        const tags = await getTagsByCategory(category);
        setAllTags(tags);
      } catch (err) {
        console.error("Error fetching all tags:", err);
        toastError("Failed to load tags. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 120);
  }

  function handleSelect(tag) {
    onTagSelect(tag);
    setInputValue("");
    setIsFocused(false);
  }

  const showSuggestions = isFocused && suggestedTags.length > 0;
  const showEmptyState =
    isFocused && !isLoading && inputValue.trim().length >= 2 && allTags.length > 0;

  return (
    <div className="relative">
      <input
        id={`dropdown-${category}`}
        name={`dropdown-${category}`}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onFocus={handleOnFocus}
        onBlur={handleBlur}
        className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      />

      {showSuggestions && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-ui-border bg-ui-surface shadow-lg">
          {suggestedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(tag)}
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-brand-primary/10 focus:bg-brand-primary/10 focus:outline-none"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {showEmptyState && suggestedTags.length === 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-sm text-ui-muted shadow-lg">
          No matching tags.
        </div>
      )}
    </div>
  );
}
