import { getAllMedia } from "../firebase/mediaApi";

export async function imageLoader() {
    const image = await getAllMedia();

    if (!image) {
        throw new Response("No media found", { status: 404 });
    }

    return image;
}