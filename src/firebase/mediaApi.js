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
    Timestamp
} from "firebase/firestore";
import { db } from "./config";
import { mapMediaDoc } from "../maps/MapMediaDoc";

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

    return {
        images: snap.docs.map(mapMediaDoc),
        nextCursor: snap.docs.length
            ? snap.docs[snap.docs.length - 1]
            : null,
    };
}

export async function updateMedia(id, updates) {
    const ref = doc(db, "media", id);
    await updateDoc(ref, updates);
}

export async function updateMediaTags(id, tags) {
    const ref = doc(db, "media", id);

    await updateDoc(ref, {
        tagIds: tags.map((tag) => tag.id),
        tagSlugs: tags.map((tag) => tag.slugName ?? tag.slug).filter(Boolean)
    });
}

export async function getMediaCount() {
    const coll = collection(db, "media");
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
}