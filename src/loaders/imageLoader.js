import { getMediaById } from "../firebase/mediaApi";

export async function imageLoader({ params }) {
    const image = await getMediaById(params.id);

    if (!image) {
        throw new Response("Image Not Found", { status: 404 });
    }

    return image;
}