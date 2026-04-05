import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from "@headlessui/react";
import { autocompleteTags, getTagsByCategory } from "../../firebase/tagsApi";

export default function TagAutocomplete({
  category,
  placeholder,
  onTagSelect
}) {
  const [inputValue, setInputValue] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const [allTags, setAllTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);

  // ONLY FOR HEADLESSUI COMBOBOX
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (inputValue.length >= 2) {
      const timeout = setTimeout(() => {
        try {
          const tagList = allTags.filter((tag) =>
            tag.name.toLowerCase().includes(inputValue.toLowerCase())
          );

          setSuggestedTags(tagList);
        } catch (err) {
          console.error("Error fetching tags:", err);
        }
      }, 200);

      setDebounceTimeout(timeout);
    } else {
      setSuggestedTags([]);
    }

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [inputValue, allTags]);

  function handleInputChange(e) {
    setInputValue(e);
  }

  async function handleOnFocus() {
    if (allTags.length === 0) {
      try {
        setAllTags(await getTagsByCategory(category));
      } catch (err) {
        console.error("Error fetching all tags:", err);
        toastError("Failed to load tags. Please try again.");
      }
    }
  }

  return (
    <Combobox
      value={selectedTag}
      onChange={(tag) => {
        if (!tag) return;
        onTagSelect(tag);
        setSelectedTag(null);
        setInputValue("");
      }}
    >
      <div className="relative">
        <ComboboxInput
          id={`dropdown-${category}`}
          name={`dropdown-${category}`}
          autoComplete="off"
          placeholder={placeholder}
          displayValue={(tag) => tag?.name}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={handleOnFocus}
          className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        />

        <ComboboxOptions className="absolute left-0 top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-ui-border bg-ui-surface shadow-lg empty:invisible">
          {suggestedTags.map((tag) => (
            <ComboboxOption
              key={tag.id}
              value={tag}
              className="cursor-pointer px-3 py-2 text-sm data-[focus]:bg-brand-primary/10"
            >
              {tag.name}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
