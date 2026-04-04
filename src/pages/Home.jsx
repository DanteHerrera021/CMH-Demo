import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import Card from "../components/assets/Card";
import { Image, Tag, Calendar } from "lucide-react";
import ZoomImage from "../components/assets/ZoomImage";
import { libraryLoader } from "../loaders/libraryLoader";
import { useMediaQuery } from "react-responsive";
import { toastError } from "../utils/toastHandler";
import { getMediaCount } from "../firebase/mediaApi";
import { getTagsCount } from "../firebase/tagsApi";

export default function Home() {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const PAGE_SIZE = isMobile ? 5 : 10;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const didInitialLoad = useRef(false);

  const [totalImages, setTotalImages] = useState(0);
  const [tagAmount, setTagAmount] = useState(0);
  const [lastUpload, setLastUpload] = useState(null);

  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;

    async function init() {
      const fetchedImages = await loadImages();
      await getStats(fetchedImages[0]);
    }
    init();
  }, []);

  function convertTimestamp(ts) {
    if (!ts) return null;
    return new Date(ts.seconds * 1000);
  }

  async function loadImages() {
    setLoading(true);

    try {
      const response = await libraryLoader(null, PAGE_SIZE, []);

      setImages((prev) => {
        const existingIds = new Set(prev.map((img) => img.id));
        const newUnique = response.images.filter(
          (img) => !existingIds.has(img.id)
        );

        return [...prev, ...newUnique];
      });

      return response.images;
    } catch (e) {
      console.error(e);
      toastError("Failed to load images. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function getStats(fetchedImage) {
    try {
      const [imageCount, tagCount] = await Promise.all([
        getMediaCount(),
        getTagsCount()
      ]);

      setTotalImages(imageCount);
      setTagAmount(tagCount);
      setLastUpload(
        convertTimestamp(fetchedImage.createdAt).toLocaleDateString()
      );
    } catch (e) {
      console.error(e);
      toastError("Failed to load stats. Please try again.");
    }
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row justify-between items-left py-6">
        <div>
          <h1 className="text-4xl font-bold mb-1">Captivate Media Hub</h1>
          <p className="text-slate-500">Centralized media for every project.</p>
        </div>

        <div className="w-full md:w-auto">
          <Link to="/upload">
            <Button
              text="Upload Media"
              rounded="sm"
              className="bg-brand-primary text-white w-full"
            />
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row w-full justify-between gap-4 my-6">
        <div className="flex-1">
          <Card
            icon={<Image size={48} />}
            value={totalImages}
            title="Total Images"
          ></Card>
        </div>
        <div className="flex-1">
          <Card
            icon={<Tag size={48} />}
            value={tagAmount}
            title="Total Tags"
          ></Card>
        </div>
        <div className="flex-1">
          <Card
            icon={<Calendar size={48} />}
            value={lastUpload || "N/A"}
            title="Last Upload"
          ></Card>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center py-6">
          <h2 className="text-2xl font-semibold">Recent Uploads</h2>
          <Link to="/library" className="text-brand-primary underline">
            View Full Library {">"}
          </Link>
        </div>

        <div className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {images.map((image) => (
              <ZoomImage
                src={image.url}
                alt={`Gallery image ${image.id}`}
                detailsTo={`/image/${image.id}`}
                key={image.id}
              >
                <div className="rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <img
                    src={image.url}
                    className="w-full h-full object-cover aspect-square"
                    alt={`Gallery image ${image.id}`}
                  />
                </div>
              </ZoomImage>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
