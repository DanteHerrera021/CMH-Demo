import { useEffect, useState } from "react";

export default function ZoomImage({ src, alt = "", children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
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
        {/* wrapper defines the max viewing area */}
        <div
          className={`flex items-center justify-center w-[90vw] h-[90vh] transition-all duration-200 ${
            open ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </>
  );
}
