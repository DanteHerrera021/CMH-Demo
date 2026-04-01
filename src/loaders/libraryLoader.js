import { getMediaPage } from "../firebase/mediaApi";

export async function libraryLoader(lastDoc = null, pageSize = 20) {
    const response = await getMediaPage(lastDoc, pageSize);
    return response;
}