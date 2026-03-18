import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ZoomImage({ detailsTo, src, alt = "", children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-all duration-200 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`flex flex-col items-center transition-all duration-200 ${
            open ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />

          {detailsTo && (
            <Link
              to={detailsTo}
              className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
