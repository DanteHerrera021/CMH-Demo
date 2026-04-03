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
    getCountFromServer
} from "firebase/firestore";
import { db } from "./config";
import { mapMediaDoc } from "../maps/MapMediaDoc";

export async function getMediaById(id) {
    const snap = await getDoc(doc(db, "media", id));
    if (!snap.exists()) return null;
    return mapMediaDoc(snap);
}

export async function getMediaPage(lastDoc = null, pageSize = 20, tags = []) {
    let q = query(
        collection(db, "media"),
        orderBy("createdAt", "desc"),
        ...(tags.length > 0 ? [where("tagIds", "array-contains-any", tags)] : []),
        limit(pageSize)
    );

    if (lastDoc) {
        q = query(
            collection(db, "media"),
            orderBy("createdAt", "desc"),
            startAfter(lastDoc),
            limit(pageSize)
        );
    }

    const snap = await getDocs(q);

    return {
        images: snap.docs.map(mapMediaDoc),
        nextCursor: snap.docs.length ? snap.docs[snap.docs.length - 1] : null
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