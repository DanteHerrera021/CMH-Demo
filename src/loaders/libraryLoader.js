import { getAllMedia } from "../firebase/mediaApi";

export async function libraryLoader() {
    const images = await getAllMedia();

    if (!images) {
        throw new Response("No media found", { status: 404 });
    }

    return images;
}