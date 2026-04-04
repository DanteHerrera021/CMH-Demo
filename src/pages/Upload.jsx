{
  /* 
TODOs for real upload functionality:

4. Image preview
- Revoke object URLs when unmounted to avoid memory leaks

5. Remove / edit image actions
- Add redirect to edit page for editing metadata and tags

7. Backend validation
- Re-validate everything on the server

8. iPhone compatibility
- Fix EXIF orientation so photos do not appear rotated

14. Security
- Enforce auth/permissions for uploads
- Restrict who can access uploaded files
*/
}

import { Upload, Pencil, X } from "lucide-react";
import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import { useState } from "react";
import heic2any from "heic2any";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess } from "../utils/toastHandler";
import PendingImageEditor from "../components/assets/PendingImageEditor";

// -------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------

function addFiles(fileList) {
  const fileArray = [...fileList];

  let imgList = [];

  fileArray.forEach((file) => {
    if (imageValidate(file).valid === false) {
      toastError(`Error uploading ${file.name}: ${imageValidate(file).error}`);
    } else {
      imgList.push({
        localId: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "idle",
        error: "",
        title: file.name.replace(/\.[^/.]+$/, ""),
        date: "",
        selectedTags: []
      });
    }
  });
  return imgList;
}

function imageValidate(file) {
  // Basic client-side validation
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
  ];

  const fileName = file.name.toLowerCase();
  const hasHeicExtension =
    fileName.endsWith(".heic") || fileName.endsWith(".heif");

  const effectiveType = file.type || (hasHeicExtension ? "image/heic" : "");

  if (!effectiveType.startsWith("image/")) {
    return { valid: false, error: "File is not an image." };
  } else if (!ALLOWED_TYPES.includes(effectiveType)) {
    return { valid: false, error: "File type is not allowed." };
  } else {
    if (file.size > 20000000) {
      // 20MB limit
      return { valid: false, error: "File size exceeds 20MB limit." };
    }

    return { valid: true, file: file, error: null };
  }
}

async function prepareFileForUpload(file) {
  const fileName = file.name.toLowerCase();
  const hasHeicExtension =
    fileName.endsWith(".heic") || fileName.endsWith(".heif");

  const effectiveType = file.type || (hasHeicExtension ? "image/heic" : "");

  if (effectiveType !== "image/heic" && effectiveType !== "image/heif") {
    return file;
  }

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8
    });

    const finalBlob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    const convertedFile = new File(
      [finalBlob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      { type: "image/jpeg" }
    );

    return convertedFile;
  } catch (err) {
    console.error("HEIC conversion error:", err);
    throw new Error("Failed to convert HEIC image.");
  }
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to read image dimensions."));
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  });
}

// -------------------------------------------
// MAIN COMPONENT
// -------------------------------------------

export default function ImageUpload() {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [editingImageId, setEditingImageId] = useState(null);

  const editingImage =
    images.find((img) => img.localId === editingImageId) || null;

  const navigate = useNavigate();

  function removeFile(localId) {
    URL.revokeObjectURL(
      images.find((img) => img.localId === localId)?.previewUrl
    );
    setImages((prevImages) =>
      prevImages.filter((img) => img.localId !== localId)
    );
  }

  async function handleConfirmUpload() {
    console.info("UPLOADING IMAGES");

    setIsUploading(true);
    setIsError(false);

    for (const image of images) {
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.localId === image.localId
            ? { ...img, status: "uploading", error: "" }
            : img
        )
      );

      let preparedFile;
      try {
        preparedFile = await prepareFileForUpload(image.file);
      } catch (err) {
        toastError(`Error preparing ${image.file.name}: ${err.message}`);
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.localId === image.localId
              ? { ...img, status: "error", error: err.message }
              : img
          )
        );
        setIsError(true);
        return;
      }

      const response = await fetch(
        "https://presignupload-mhimmq7ewq-uc.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            filename: preparedFile.name,
            contentType: preparedFile.type
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toastError(`Upload failed for ${image.file.name}: ${errorData.error}`);
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.localId === image.localId
              ? { ...img, status: "error", error: errorData.error }
              : img
          )
        );
        setIsError(true);
        return;
      }

      const { uploadUrl, s3Key, publicUrl } = await response.json();

      try {
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": preparedFile.type
          },
          body: preparedFile
        });
      } catch (err) {
        toastError(`Upload failed for ${image.file.name}: ${err.message}`);
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.localId === image.localId
              ? { ...img, status: "error", error: err.message }
              : img
          )
        );
        setIsError(true);
      }

      // get width and height of the image for metadata

      const { width, height } = await getImageDimensions(preparedFile);

      // Save metadata to Firestore
      try {
        await addDoc(collection(db, "media"), {
          title: image.title || preparedFile.name.replace(/\.[^/.]+$/, ""),
          filename: preparedFile.name,
          contentType: preparedFile.type,
          s3Key: s3Key,
          url: publicUrl,
          width: width,
          height: height,
          tagIds: (image.selectedTags || []).map((tag) => tag.id),
          tagSlugs: (image.selectedTags || []).map((tag) => tag.slug),
          createdByRole: "admin", // Replace with actual user role if available
          createdAt: serverTimestamp(),
          updatedByRole: "admin", // Replace with actual user role if available
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        toastError(
          `Failed to save metadata for ${image.file.name}: ${err.message}`
        );
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.localId === image.localId
              ? { ...img, status: "error", error: err.message }
              : img
          )
        );
        setIsError(true);
      }

      setImages((prevImages) =>
        prevImages.map((img) =>
          img.localId === image.localId
            ? { ...img, status: "success", error: "" }
            : img
        )
      );
      console.info("IMAGE UPLOADED SUCCESSFULLY");

      removeFile(image.localId);
    }

    setIsUploading(false);

    console.info("ALL IMAGES PROCESSED");

    if (!isError) {
      toastSuccess("All images uploaded successfully!");
      setTimeout(() => {
        navigate("/library");
      }, 800);
    }
  }

  function updateDraftImage(localId, updates) {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.localId === localId ? { ...img, ...updates } : img
      )
    );
  }

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
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              setImages((prevImages) => [
                ...prevImages,
                ...addFiles(e.dataTransfer.files)
              ]);
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
            onChange={(e) => {
              setImages((prevImages) => [
                ...prevImages,
                ...addFiles(e.target.files)
              ]);
            }}
          />
        </div>

        {/* Selected Images */}
        <div className="mt-10 w-full">
          <h2 className="text-center text-xl font-medium mb-6">
            Selected Images
          </h2>

          {images.length === 0 ? (
            <p className="text-center text-gray-500">No images selected.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {images.map((img) => (
                <div
                  key={img.localId}
                  className="relative overflow-hidden rounded-2xl bg-ui-surface border border-ui-border shadow-sm"
                >
                  <div className="relative aspect-square bg-ui-muted">
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      className="absolute top-3 left-3 min-h-10 min-w-10 rounded-full bg-brand-primary text-white flex items-center justify-center shadow"
                      onClick={() => setEditingImageId(img.localId)}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      className="absolute top-3 right-3 min-h-10 min-w-10 rounded-full bg-brand-danger text-white flex items-center justify-center shadow"
                      onClick={() => removeFile(img.localId)}
                    >
                      <X size={24} />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-10 pb-3 px-3">
                      <p className="text-white text-sm font-medium truncate">
                        {img.title || img.file.name}
                      </p>

                      {img.selectedTags?.length > 0 && (
                        <div className="mt-2 overflow-x-auto scrollbar-hide">
                          <div className="flex w-max flex-nowrap gap-1 pr-1">
                            {img.selectedTags.map((tag) => (
                              <span
                                key={tag.id}
                                className="shrink-0 rounded-full bg-white/95 px-2 py-0.5 text-[10px] text-black shadow"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm button */}

        {images.length > 0 && (
          <Button
            text="Confirm"
            className="mt-10 bg-brand-primary text-white px-16 py-3 shadow hover:bg-brand-primary-dark transition disabled:cursor-not-allowed disabled:shadow-none"
            disabled={isUploading}
            onClick={handleConfirmUpload}
          ></Button>
        )}
      </div>
      <PendingImageEditor
        image={editingImage}
        isOpen={Boolean(editingImage)}
        onClose={() => setEditingImageId(null)}
        onSave={(updates) => {
          if (!editingImage) return;
          updateDraftImage(editingImage.localId, updates);
        }}
      />
    </PageContainer>
  );
}
