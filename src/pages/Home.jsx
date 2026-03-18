import React from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import Card from "../components/assets/Card";
import { Image, Tag, Calendar } from "lucide-react";
import ZoomImage from "../components/assets/ZoomImage";

const images = import.meta.glob("../assets/imgs/temp/*.jpg", { eager: true });

export default function Home() {
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
            value="500"
            title="Total Images"
          ></Card>
        </div>
        <div className="flex-1">
          <Card icon={<Tag size={48} />} value="15" title="Total Tags"></Card>
        </div>
        <div className="flex-1">
          <Card
            icon={<Calendar size={48} />}
            value="3/2/2026"
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
            {Object.entries(images)
              .slice(0, 10)
              .map(([path, img]) => {
                const match = path.match(/img(\d+)\.jpg$/);
                const id = match ? match[1] : null;

                return (
                  <ZoomImage
                    src={img.default}
                    alt={`Gallery image ${id}`}
                    detailsTo={`/image/${id}`}
                    key={path}
                  >
                    <div className="rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer">
                      <img
                        src={img.default}
                        className="w-full h-full object-cover aspect-square"
                        alt={`Gallery image ${id}`}
                      />
                    </div>
                  </ZoomImage>
                );
              })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
