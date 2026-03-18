import ZoomImage from "./ZoomImage";

export default function PhotoCard({ photo }) {
  return (
    <article className="mb-5 break-inside-avoid overflow-hidden bg-black/5">
      <div className="relative">
        <ZoomImage
          src={photo.src}
          alt={photo.alt}
          detailsTo={`/image/${photo.src.match(/(\d+)(?=\.\w+$)/)?.[1]}`}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            className="block h-auto w-full object-cover"
            loading="lazy"
          />
        </ZoomImage>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-2 pt-6">
          <div className="flex flex-wrap gap-2">
            {photo.tags.map((tag) => (
              <span
                key={`${photo.id}-${tag}`}
                className="inline-flex items-center rounded-sm bg-white/85 px-2 py-1 text-xs text-black"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
