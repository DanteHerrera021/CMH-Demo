import ZoomImage from "./ZoomImage";

export default function PhotoCard({ image }) {
  return (
    <article className="mb-5 break-inside-avoid overflow-hidden bg-black/5">
      <div className="relative">
        <ZoomImage
          src={image.url}
          alt={image.title}
          detailsTo={`/photos/${image.id}`}
        >
          <img
            src={image.url}
            alt={image.title}
            className="block h-auto w-full object-cover"
            loading="lazy"
          />
        </ZoomImage>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-2 pt-6">
          <div className="flex flex-wrap gap-2">
            {image.tagSlugs &&
              image.tagSlugs.length > 0 &&
              image.tagSlugs.map((tag) => (
                <span
                  key={`${image.id}-${tag}`}
                  className="inline-flex items-center rounded-sm bg-white/85 px-2 py-1 text-xs text-black"
                >
                  {tag.split("-").join(" ").charAt(0).toUpperCase() +
                    tag.slice(1).split("-").join(" ")}
                </span>
              ))}
          </div>
        </div>
      </div>
    </article>
  );
}
