import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    where,
    updateDoc,
    getCountFromServer,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { db } from "./config";
import { mapMediaDoc } from "../maps/MapMediaDoc";
import { getTagsByIds } from "./tagsApi";

function convertToTimestamp(dateStr, isEnd = false) {
    if (!dateStr) return null;

    const date = new Date(dateStr);

    if (isEnd) {
        date.setHours(23, 59, 59, 999);
    }

    return Timestamp.fromDate(date);
}

export async function getMediaById(id) {
    const snap = await getDoc(doc(db, "media", id));
    if (!snap.exists()) return null;
    return mapMediaDoc(snap);
}

export async function getMediaPage(lastDoc = null, pageSize = 20, tags = [], startDate = null, endDate = null) {

    const constraints = [
        orderBy("createdAt", "desc"),
        limit(pageSize),
    ];

    // Tag filter
    if (tags.length > 0) {
        constraints.push(where("tagIds", "array-contains-any", tags));
    }

    // Convert dates INSIDE the API
    const start = convertToTimestamp(startDate, false);
    const end = convertToTimestamp(endDate, true);

    if (start && end && start > end) {
        throw new Error("Start date cannot be after end date");
    }

    if (start) {
        constraints.push(where("createdAt", ">=", start));
    }

    if (end) {
        constraints.push(where("createdAt", "<=", end));
    }

    // Pagination LAST
    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, "media"), ...constraints);

    const snap = await getDocs(q);

    const images = await hydrateMediaTagNames(snap.docs.map(mapMediaDoc));

    return {
        images,
        nextCursor: snap.docs.length
            ? snap.docs[snap.docs.length - 1]
            : null,
    };
}

export async function updateMedia(id, updates) {
    const ref = doc(db, "media", id);
    await updateDoc(ref, {
        ...updates,
        updatedAt: serverTimestamp()
    });
}

async function hydrateMediaTagNames(images) {
    const missingTagNameImages = images.filter(
        (image) => image.tagIds.length > 0 && image.tagNames.length === 0
    );

    if (missingTagNameImages.length === 0) return images;

    const tagIds = [
        ...new Set(missingTagNameImages.flatMap((image) => image.tagIds))
    ];

    const tags = await getTagsByIds(tagIds);
    const tagsById = new Map(tags.map((tag) => [tag.id, tag]));

    return images.map((image) => {
        if (image.tagNames.length > 0) return image;

        return {
            ...image,
            tagNames: image.tagIds
                .map((tagId) => tagsById.get(tagId)?.name)
                .filter(Boolean)
        };
    });
}

export async function updateMediaTags(id, tags) {
    const ref = doc(db, "media", id);

    await updateDoc(ref, {
        tagIds: tags.map((tag) => tag.id),
        tagNames: tags.map((tag) => tag.name).filter(Boolean)
    });
}

export async function getMediaCount() {
    const coll = collection(db, "media");
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
}
