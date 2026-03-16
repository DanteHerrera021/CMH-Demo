{
  /* 
TODOs for real upload functionality:

1. File selection
- Handle input onChange
- Read selected files from e.target.files
- Convert FileList to array if needed
- Merge with existing uploaded images state

2. Drag and drop
- Add onDragEnter handler
- Add onDragOver handler
- Add onDragLeave handler
- Add onDrop handler
- Prevent default browser behavior in drag handlers
- Track isDragging state for dropzone styling
- Read dropped files from e.dataTransfer.files

3. Client-side validation
- Validate that each file is actually an image
- Check MIME type, not just file extension
- Allow iPhone formats like HEIC/HEIF to pass initial validation if desired
- Reject unsupported or suspicious files
- Enforce max file size
- Enforce max number of files
- Show user-friendly error messages for rejected files

4. Image preview
- Generate preview URLs with URL.createObjectURL(file)
- Render previews in uploaded image cards
- Revoke object URLs when removed/unmounted to avoid memory leaks

5. Remove / edit image actions
- Wire up remove button to delete image from local state
- Decide what edit button should do
- Possible future edit actions: crop, rotate, replace, retag

6. Upload preparation
- Decide whether uploads happen immediately or only on Confirm
- Prepare FormData or presigned S3 upload flow
- Track upload status per image: idle, uploading, success, error

7. Backend validation
- Re-validate everything on the server
- Check MIME type and file signature / magic bytes
- Do not trust frontend accept="image/*"
- Reject renamed non-image files

8. iPhone compatibility
- Handle HEIC / HEIF uploads
- Convert HEIC/HEIF to JPEG or WebP before display if needed
- Fix EXIF orientation so photos do not appear rotated

9. Image processing
- Resize large images before or after upload
- Compress images for web performance
- Generate thumbnails
- Optionally convert all uploads to one display format like JPEG or WebP

10. AWS S3 integration
- Use unique file names
- Set correct Content-Type metadata
- Decide S3 key structure, for example userId/uploadId/fileName
- Prefer presigned URLs for direct upload from frontend
- Handle failed uploads and retries

11. Database / persistence
- Save uploaded image URL(s)
- Save S3 key(s)
- Save tags / metadata if needed
- Keep display order if image ordering matters

12. Accessibility
- Make upload area keyboard accessible
- Add clear labels / instructions
- Add alt text strategy for uploaded images if needed
- Ensure buttons have accessible names

13. UX polish
- Show loading states
- Show upload progress
- Show empty state
- Show validation errors near the uploader
- Disable Confirm until requirements are met
- Add success / failure feedback after upload

14. Security
- Sanitize or disallow risky formats like SVG unless intentionally supported
- Enforce auth/permissions for uploads
- Restrict who can access uploaded files
- Consider virus/malware scanning depending on app requirements
*/
}

import { Upload, Pencil, X } from "lucide-react";
import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";

export default function ImageUploaderMock() {
  const mockImages = [1, 2, 3];

  return (
    <PageContainer>
      <div className="flex flex-col items-center py-6">
        <div className="mb-10 text-left w-full">
          <h1 className="text-4xl font-bold mb-1">Upload Your Images</h1>
          <p className="text-slate-500">
            Drag and drop your images here, or click to select from your device.
          </p>
        </div>
        <div className="w-full max-w-md">
          <label
            htmlFor="image-upload"
            className="px-4 py-10 flex flex-col items-center justify-center rounded-3xl bg-ui-surface cursor-pointer border-2 border-dashed border-transparent hover:border-brand-primary transition"
            onDragEnter={(e) => {
              e.preventDefault();
              // TODO: set isDragging = true
            }}
            onDragOver={(e) => {
              e.preventDefault();
              // TODO: keep drop enabled
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              // TODO: set isDragging = false when leaving dropzone
            }}
            onDrop={(e) => {
              e.preventDefault();
              // TODO: set isDragging = false
              // TODO: read files from e.dataTransfer.files
              // TODO: validate files
              // TODO: create preview URLs
              // TODO: store files in component state
            }}
          >
            <div className="w-16 h-16 rounded-full border border-black flex items-center justify-center mb-4">
              <Upload className="text-3xl" />
            </div>

            <p className="text-3xl font-medium text-black mb-2 text-center">
              Drag & drop your images
            </p>

            <p className="text-gray-700 mb-4">OR</p>

            <span className="bg-brand-primary text-white px-6 py-2 rounded-md text-sm shadow">
              Select image from your device
            </span>
          </label>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={() => {
              // TODO: read selected files from input
              // TODO: validate files
              // TODO: create preview URLs
              // TODO: store files in component state
            }}
          />
        </div>

        {/* Uploaded Images */}
        <div className="mt-10 w-full max-w-3xl">
          <h2 className="text-center text-xl font-medium mb-6">
            Uploaded Images
          </h2>

          <div className="flex justify-center gap-8 flex-wrap">
            {mockImages.map((img) => (
              <div
                key={img}
                className="relative w-40 h-40 bg-ui-muted border border-gray-400 overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  Image
                </div>

                <button
                  type="button"
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow"
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-brand-danger text-white flex items-center justify-center shadow"
                >
                  <X size={14} />
                </button>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pt-8 pb-2">
                  <div className="overflow-x-auto scrollbar-hide px-2">
                    <div className="flex w-max flex-nowrap gap-1 pr-1">
                      <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] shadow">
                        Tag1
                      </span>
                      <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] shadow">
                        Tag2
                      </span>
                      <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] shadow">
                        Tag3
                      </span>
                      <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] shadow">
                        Tag4
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm button */}
        <Button
          text="Confirm"
          className="mt-10 bg-brand-primary text-white px-16 py-3 shadow"
        ></Button>
      </div>
    </PageContainer>
  );
}
