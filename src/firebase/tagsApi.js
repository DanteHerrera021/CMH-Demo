import { collection, doc, endAt, getDoc, getDocs, limit, orderBy, query, startAt, where } from "firebase/firestore";
import { mapCategoryDoc } from "../maps/MapCategoryDoc";
import { mapTagDoc } from "../maps/MapTagDoc";
import { db } from "./config";

export async function autocompleteTags(category = null, text, returnLimit = 8) {
    if (!text) return [];

    const inputToSlug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

    let constraints = [
        orderBy("slugName"),
        startAt(inputToSlug),
        endAt(inputToSlug + "\uf8ff"),
        limit(returnLimit)
    ];

    if (category) {
        constraints.unshift(where("category", "==", category));
    }

    let q = query(collection(db, "tags"), ...constraints);

    const snap = await getDocs(q);

    return snap.docs.map(mapTagDoc);
}

export async function getTagById(id) {
    const snap = await getDoc(doc(db, "tags", id));
    if (!snap.exists()) return null;
    return mapTagDoc(snap);
}

export async function getTagsByCategory(category) {
    const q = query(
        collection(db, "tags"),
        where("category", "==", category),
        orderBy("name")
    );

    const snap = await getDocs(q);
    return snap.docs.map(mapTagDoc);
}

export async function getAllCategories() {
    const q = query(collection(db, "categories"), orderBy("name"));
    const snap = await getDocs(q);

    return snap.docs.map(mapCategoryDoc);
}