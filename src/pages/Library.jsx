import { useEffect, useMemo, useRef, useState } from "react";
import { Funnel } from "lucide-react";
import FilterSidebar from "../components/assets/FilterSidebar";
import PhotoCard from "../components/assets/LibraryPhotoCard";
import { libraryLoader } from "../loaders/libraryLoader";
import { toastError } from "../utils/toastHandler";

function useIsVisible(ref) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting)
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return isIntersecting;
}

function useColumnCount() {
  const [columnCount, setColumnCount] = useState(getColumnCount());

  useEffect(() => {
    function handleResize() {
      setColumnCount(getColumnCount());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columnCount;
}

function getColumnCount() {
  const width = window.innerWidth;

  if (width >= 1536) return 4; // 2xl
  if (width >= 1280) return 3; // xl
  if (width >= 640) return 2; // sm
  return 1;
}

function distributeImages(images, columnCount) {
  const columns = Array.from({ length: columnCount }, () => ({
    items: [],
    height: 0
  }));

  for (const image of images) {
    const aspectRatio =
      image.width && image.height ? image.height / image.width : 1;

    // Estimated visual height score.
    // The + 140 helps account for card chrome like title/buttons/padding.
    const estimatedHeight = aspectRatio * 300 + 140;

    let shortestColumnIndex = 0;

    for (let i = 1; i < columns.length; i++) {
      if (columns[i].height < columns[shortestColumnIndex].height) {
        shortestColumnIndex = i;
      }
    }

    columns[shortestColumnIndex].items.push(image);
    columns[shortestColumnIndex].height += estimatedHeight;
  }

  return columns.map((column) => column.items);
}

export default function Library() {
  const PAGE_SIZE = 20;

  const [selectedTags, setSelectedTags] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);

  const intersectingDiv = useRef();
  const isVisible = useIsVisible(intersectingDiv);

  const didInitialLoad = useRef(false);

  const columnCount = useColumnCount();

  const masonryColumns = useMemo(() => {
    return distributeImages(images, columnCount);
  }, [images, columnCount]);

  function handleAddTag(tag) {
    setSelectedTags((prev) => {
      if (prev.some((t) => t.id === tag.id)) return prev;
      return [...prev, tag];
    });
  }

  function handleRemoveTag(tagId) {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  }

  useEffect(() => {
    async function resetAndReload() {
      setImages([]);
      setNextCursor(null);
      setHasMore(true);

      await loadMore(selectedTags, true);
    }

    resetAndReload();
  }, [selectedTags, startDate, endDate]);

  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    loadMore();
  }, []);

  useEffect(() => {
    if (images.length > 0 && isVisible && !loading && hasMore) {
      loadMore(selectedTags);
    }
  }, [images.length, isVisible, loading, hasMore]);

  async function loadMore(tags = [], reset = false) {
    if (loading || (!hasMore && !reset)) return;

    const tagIds = tags.map((tag) => {
      if (typeof tag === "object" && tag.id) return tag.id;
      return tag;
    });

    setLoading(true);

    try {
      const response = await libraryLoader(
        reset ? null : nextCursor,
        PAGE_SIZE,
        tagIds,
        startDate,
        endDate
      );

      setImages((prev) => {
        if (reset) return response.images;

        const existingIds = new Set(prev.map((img) => img.id));
        const newUnique = response.images.filter(
          (img) => !existingIds.has(img.id)
        );

        return [...prev, ...newUnique];
      });

      setNextCursor(response.nextCursor);
      setHasMore(response.images.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
      toastError("Failed to load more images. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewStartDate(value) {
    setStartDate(value);
  }

  function handleNewEndDate(value) {
    setEndDate(value);
  }

  function handleClearAll() {
    setSelectedTags([]);
    setStartDate("");
    setEndDate("");
  }

  function handleResetTags() {
    setSelectedTags([]);
  }

  return (
    <div className="min-h-screen">
      <div className="md:grid md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="rounded-md p-2 hover:bg-black/5"
            aria-label="Open filters"
          >
            <Funnel className="h-5 w-5" />
          </button>

          <h1 className="text-4xl font-bold mb-1">Photos</h1>

          <div className="w-9" />
        </header>

        <aside className="hidden min-h-screen md:block md:shadow-lg">
          <FilterSidebar
            selectedTags={selectedTags}
            onTagSelect={handleAddTag}
            onTagRemove={handleRemoveTag}
            onResetTags={handleResetTags}
            onStartDateChange={handleNewStartDate}
            onEndDateChange={handleNewEndDate}
            startDate={startDate}
            endDate={endDate}
            onClearAll={handleClearAll}
          />
        </aside>

        {filtersOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] border-r border-black/10 bg-[#f3f3f3] md:hidden">
              <FilterSidebar
                selectedTags={selectedTags}
                onTagSelect={handleAddTag}
                onTagRemove={handleRemoveTag}
                onResetTags={handleResetTags}
                onStartDateChange={handleNewStartDate}
                onEndDateChange={handleNewEndDate}
                startDate={startDate}
                endDate={endDate}
                onClearAll={handleClearAll}
              />
            </aside>
          </>
        )}

        <main className="min-w-0 p-4 md:p-6">
          <div className="mb-4 hidden items-center justify-between md:flex">
            <h1 className="text-4xl font-bold mb-1">Photos</h1>
          </div>

          <div className="flex gap-5 items-start">
            {masonryColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-1 flex-col gap-5">
                {column.map((image) => (
                  <PhotoCard key={image.id} image={image} />
                ))}
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="rounded-lg border border-dashed border-black/20 p-10 text-center text-black/60">
              No photos found. Try adjusting or{" "}
              <button
                onClick={() => handleClearAll()}
                className="underline hover:text-black/80"
              >
                clearing all filters
              </button>
            </div>
          )}

          {hasMore && (
            <div ref={intersectingDiv} className="w-full flex justify-center" />
          )}

          {!hasMore && (
            <div className="w-full flex justify-center">
              <p className="inline text-sm text-black/60 py-6">
                No more images to load.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
