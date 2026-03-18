import { useMemo, useState } from "react";
import { Funnel } from "lucide-react";
import FilterSidebar from "../components/assets/FilterSidebar";
import PhotoCard from "../components/assets/LibraryPhotoCard";

const imageModules = import.meta.glob("../assets/imgs/temp/*.jpg", {
  eager: true
});

const photos = Object.values(imageModules).map((mod, index) => ({
  id: index + 1,
  src: mod.default,
  alt: `Placeholder photo ${index + 1}`,
  tags: ["Tag1", "Tag2", "Tag3"],
  show: "Show Name",
  company: "Company Name"
}));

export default function Library() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const photoItems = useMemo(() => photos, []);

  return (
    <div className="min-h-screen">
      <div className="md:grid md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
        {/* Mobile header */}
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

        {/* Desktop sidebar */}
        <aside className="hidden min-h-screen md:block md:shadow-lg">
          <FilterSidebar />
        </aside>

        {/* Mobile drawer */}
        {filtersOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] border-r border-black/10 bg-[#f3f3f3] md:hidden">
              <FilterSidebar mobile onClose={() => setFiltersOpen(false)} />
            </aside>
          </>
        )}

        {/* Main */}
        <main className="min-w-0 p-4 md:p-6">
          <div className="mb-4 hidden items-center justify-between md:flex">
            <h1 className="text-4xl font-bold mb-1">Photos</h1>
          </div>

          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            {photoItems.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>

          {photoItems.length === 0 && (
            <div className="rounded-lg border border-dashed border-black/20 p-10 text-center text-black/60">
              No photos found.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
