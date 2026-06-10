import ZoomImage from "./ZoomImage";

export default function PhotoCard({ image }) {
  const sortedTagNames = [...(image.tagNames || [])].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  return (
    <article className="break-inside-avoid overflow-hidden bg-black/5">
      <div className="relative overflow-hidden">
        <ZoomImage
          src={image.url}
          alt={image.title}
          detailsTo={`/image/${image.id}`}
        >
          <img
            src={image.url}
            alt={image.title}
            className="block h-auto w-full object-cover"
            loading="lazy"
          />
        </ZoomImage>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-2 pt-6">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex w-max flex-nowrap gap-2 pr-2">
              {sortedTagNames.length > 0 &&
              sortedTagNames.map((tag) => (
                <span
                  key={`${image.id}-${tag}`}
                    className="inline-flex shrink-0 items-center rounded-sm bg-white/85 px-2 py-1 text-xs text-black"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
