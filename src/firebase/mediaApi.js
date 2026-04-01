import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./config";
import { mapMediaDoc } from "../data/MapMediaDoc";

export async function getMediaById(id) {
    const snap = await getDoc(doc(db, "media", id));
    if (!snap.exists()) return null;
    return mapMediaDoc(snap);
}

export async function getAllMedia() {
    const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(mapMediaDoc);
}