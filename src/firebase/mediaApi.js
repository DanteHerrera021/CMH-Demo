import { collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, startAt } from "firebase/firestore";
import { db } from "./config";
import { mapMediaDoc } from "../maps/MapMediaDoc";

export async function getMediaById(id) {
    const snap = await getDoc(doc(db, "media", id));
    if (!snap.exists()) return null;
    return mapMediaDoc(snap);
}

export async function getMediaPage(lastDoc = null, pageSize = 20) {
    let q = query(
        collection(db, "media"),
        orderBy("createdAt", "desc"),
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
        nextCursor: snap.docs.length ? snap.docs[snap.docs.length - 1] : null,
    }
}