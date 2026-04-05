import { getMediaPage } from "../firebase/mediaApi";

export async function libraryLoader(lastDoc = null, pageSize = 20, tags = [], startDate = null, endDate = null) {
    const response = await getMediaPage(lastDoc, pageSize, tags, startDate, endDate);
    return response;
}