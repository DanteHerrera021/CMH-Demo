import { useLoaderData } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import ZoomImage from "../components/assets/ZoomImage";
import { FingerprintPattern, File } from "lucide-react";
import Button from "../components/ui/Button";

const images = import.meta.glob("../assets/imgs/temp/*.jpg", { eager: true });

export default function Image() {
  const { id, src } = useLoaderData();

  return (
    <PageContainer>
      <div className="mt-8 flex flex-col md:flex-row gap-10">
        <div className="md:flex-1 transition">
          <ZoomImage src={src} alt={`Image ${id}`}>
            <img src={src} alt={`Image ${id}`} />
            <div className="text-sm text-white bg-gray-600 p-2">
              <p>Click to enlarge image</p>
            </div>
          </ZoomImage>
        </div>
        <div className="md:flex-1">
          <h2 className="text-2xl font-semibold">Image Details</h2>
          <div className="flex flex-row gap-4 mt-2">
            <div className="rounded bg-brand-primary py-1 px-3 flex items-center gap-2">
              <FingerprintPattern size={16} className="text-white" />
              <p className="text-white text-sm">{id}</p>
            </div>
            <div className="rounded bg-brand-primary py-1 px-3 flex items-center gap-2">
              <File size={16} className="text-white" />
              <p className="text-white text-sm">img{id}.jpg</p>
            </div>
          </div>

          <div className="mt-4">
            <form className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-ui-muted"
                >
                  Date
                </label>
                <div className="mt-1">
                  <input
                    id="date"
                    type="date"
                    name="date"
                    autoComplete="off"
                    className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="show-name"
                  className="block text-sm font-medium text-ui-muted"
                >
                  Show Name
                </label>
                <div className="mt-1">
                  <input
                    id="show-name"
                    type="text"
                    name="show-name"
                    autoComplete="off"
                    className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="company-name"
                  className="block text-sm font-medium text-ui-muted"
                >
                  Company Name
                </label>
                <div className="mt-1">
                  <input
                    id="company-name"
                    type="text"
                    name="company-name"
                    autoComplete="off"
                    className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="additional-tags"
                  className="block text-sm font-medium text-ui-muted"
                >
                  Additional Tags
                </label>
                <div className="mt-1">
                  <input
                    id="additional-tags"
                    type="text"
                    name="additional-tags"
                    autoComplete="off"
                    className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div className="mt-3">
                <Button
                  text="Save Details"
                  rounded="sm"
                  onClick={() => alert("Details saved!")}
                  className="w-full bg-brand-primary text-white"
                >
                  Save Details
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export async function imageLoader({ params }) {
  const { id } = params;
  const imagePath = `../assets/imgs/temp/img${id}.jpg`;
  const imageModule = images[imagePath];

  if (!imageModule) {
    throw new Response("Image Not Found", { status: 404 });
  }

  return {
    id,
    src: imageModule.default
  };
}
