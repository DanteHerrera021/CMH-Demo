import { useLoaderData } from "react-router-dom";

const images = import.meta.glob("../assets/imgs/temp/*.jpg", { eager: true });

export default function Image() {
  const { id, src } = useLoaderData();

  return (
    <div>
      <h1 className="text-2xl font-bold">Image {id}</h1>
      <img src={src} alt={`Image ${id}`} />
    </div>
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
