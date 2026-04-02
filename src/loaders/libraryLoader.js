import { getMediaPage } from "../firebase/mediaApi";

export async function libraryLoader(lastDoc = null, pageSize = 20, tags = []) {
    const response = await getMediaPage(lastDoc, pageSize, tags);
    return response;
}