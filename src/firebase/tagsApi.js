import { collection, doc, endAt, getCountFromServer, getDoc, getDocs, limit, orderBy, query, startAt, where } from "firebase/firestore";
import { mapCategoryDoc } from "../maps/MapCategoryDoc";
import { mapTagDoc } from "../maps/MapTagDoc";
import { db } from "./config";

// --------------------------------------
// -----------HELPER FUNCTIONS-----------
// --------------------------------------

function normalizeString(value) {
    return String(value || "").trim();
}

function toLowerNormalized(value) {
    return normalizeString(value).toLowerCase();
}

function slugify(value) {
    return normalizeString(value)
        .toLowerCase()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// ------------------------------------
// -----------READ FUNCTIONS-----------
// ------------------------------------

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

export async function getAllTags() {
    const q = query(collection(db, "tags"), orderBy("name"));
    const snap = await getDocs(q);
    return snap.docs.map(mapTagDoc);
}

export async function getTagById(id) {
    const snap = await getDoc(doc(db, "tags", id));
    if (!snap.exists()) return null;
    return mapTagDoc(snap);
}

export async function getTagsByIds(ids) {
    if (!ids || ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];
    const chunks = [];

    // Only works for up to 10 IDs due to Firestore limitations
    for (let i = 0; i < uniqueIds.length; i += 10) {
        chunks.push(uniqueIds.slice(i, i + 10));
    }

    const snapshots = await Promise.all(
        chunks.map((chunk) => {
            const q = query(collection(db, "tags"), where("__name__", "in", chunk));
            return getDocs(q);
        })
    );

    return snapshots.flatMap((snapshot) =>
        snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
    );
}

export async function getTagsByCategory(category) {
    const q = query(
        collection(db, "tags"),
        where("category", "==", category),
        orderBy("slugName")
    );

    const snap = await getDocs(q);
    return snap.docs.map(mapTagDoc);
}

export async function getAllCategories() {
    const q = query(collection(db, "categories"), orderBy("name"));
    const snap = await getDocs(q);

    return snap.docs.map(mapCategoryDoc);
}

export async function getTagsCount() {
    const coll = collection(db, "tags");
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
}

// -------------------------------------
// -----------WRITE FUNCTIONS-----------
// -------------------------------------

export async function createTag({ name, categoryId = null, categoryName = null }) {
    const cleanedName = normalizeString(name);
    const nameLower = toLowerNormalized(cleanedName);
    const slug = slugify(cleanedName);

    if (!cleanedName) {
        throw new Error("Tag name is required.");
    }

    let resolvedCategory = null;

    if (categoryId) {
        const categorySnap = await getDoc(doc(db, "categories", categoryId));

        if (!categorySnap.exists()) {
            throw new Error("Selected category was not found.");
        }

        resolvedCategory = {
            id: categorySnap.id,
            ...categorySnap.data()
        };
    } else if (categoryName) {
        const categorySnapshot = await getDocs(
            query(
                collection(db, "categories"),
                where("nameLower", "==", toLowerNormalized(categoryName)),
                limit(1)
            )
        );

        if (categorySnapshot.empty) {
            throw new Error("Selected category was not found.");
        }

        resolvedCategory = {
            id: categorySnapshot.docs[0].id,
            ...categorySnapshot.docs[0].data()
        };
    }

    if (!resolvedCategory) {
        throw new Error("A valid category is required.");
    }

    const existingSnapshot = await getDocs(
        query(
            collection(db, "tags"),
            where("category", "==", resolvedCategory.name),
            where("nameLower", "==", nameLower),
            limit(1)
        )
    );

    if (!existingSnapshot.empty) {
        throw new Error("A tag with that name already exists in this category.");
    }

    const docRef = await addDoc(collection(db, "tags"), {
        name: cleanedName,
        nameLower,
        slug,
        category: resolvedCategory.name,
        categoryId: resolvedCategory.id,
        categoryLower: toLowerNormalized(resolvedCategory.name),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return {
        id: docRef.id,
        name: cleanedName,
        nameLower,
        slug,
        category: resolvedCategory.name,
        categoryId: resolvedCategory.id,
        categoryLower: toLowerNormalized(resolvedCategory.name)
    };
}

export async function updateTag(
    tagId,
    { name, categoryId = null, categoryName = null }
) {
    if (!tagId) {
        throw new Error("Tag ID is required.");
    }

    const cleanedName = normalizeString(name);

    if (!cleanedName) {
        throw new Error("Tag name is required.");
    }

    const tagRef = doc(db, "tags", tagId);
    const tagSnap = await getDoc(tagRef);

    if (!tagSnap.exists()) {
        throw new Error("Tag not found.");
    }

    const existingTag = {
        id: tagSnap.id,
        ...tagSnap.data()
    };

    let resolvedCategory = null;

    if (categoryId) {
        const categorySnap = await getDoc(doc(db, "categories", categoryId));

        if (!categorySnap.exists()) {
            throw new Error("Selected category was not found.");
        }

        resolvedCategory = {
            id: categorySnap.id,
            ...categorySnap.data()
        };
    } else if (categoryName) {
        const categorySnapshot = await getDocs(
            query(
                collection(db, "categories"),
                where("nameLower", "==", toLowerNormalized(categoryName)),
                limit(1)
            )
        );

        if (categorySnapshot.empty) {
            throw new Error("Selected category was not found.");
        }

        resolvedCategory = {
            id: categorySnapshot.docs[0].id,
            ...categorySnapshot.docs[0].data()
        };
    } else {
        resolvedCategory = {
            id: existingTag.categoryId || null,
            name: existingTag.category || ""
        };
    }

    const nameLower = toLowerNormalized(cleanedName);
    const slug = slugify(cleanedName);
    const resolvedCategoryName = normalizeString(resolvedCategory.name);
    const resolvedCategoryLower = toLowerNormalized(resolvedCategoryName);

    if (!resolvedCategoryName) {
        throw new Error("A valid category is required.");
    }

    const duplicateSnapshot = await getDocs(
        query(
            collection(db, "tags"),
            where("category", "==", resolvedCategoryName),
            where("nameLower", "==", nameLower),
            limit(10)
        )
    );

    const duplicate = duplicateSnapshot.docs.find((docSnap) => docSnap.id !== tagId);

    if (duplicate) {
        throw new Error("A tag with that name already exists in this category.");
    }

    await updateDoc(tagRef, {
        name: cleanedName,
        nameLower,
        slug,
        category: resolvedCategoryName,
        categoryId: resolvedCategory.id || null,
        categoryLower: resolvedCategoryLower,
        updatedAt: serverTimestamp()
    });

    return {
        ...existingTag,
        id: tagId,
        name: cleanedName,
        nameLower,
        slug,
        category: resolvedCategoryName,
        categoryId: resolvedCategory.id || null,
        categoryLower: resolvedCategoryLower
    };
}

export async function deleteTag(tagId) {
    if (!tagId) {
        throw new Error("Tag ID is required.");
    }

    await deleteDoc(doc(db, "tags", tagId));
    return { deletedTagId: tagId };
}

export async function createCategory(name) {
    const cleanedName = normalizeString(name);
    const nameLower = toLowerNormalized(cleanedName);
    const slug = slugify(cleanedName);

    if (!cleanedName) {
        throw new Error("Category name is required.");
    }

    const existingSnapshot = await getDocs(
        query(
            collection(db, "categories"),
            where("nameLower", "==", nameLower),
            limit(1)
        )
    );

    if (!existingSnapshot.empty) {
        throw new Error("A category with that name already exists.");
    }

    const docRef = await addDoc(collection(db, "categories"), {
        name: cleanedName,
        nameLower,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return {
        id: docRef.id,
        name: cleanedName,
        nameLower,
        slug
    };
}

export async function renameCategory(categoryId, nextName) {
    const cleanedNextName = normalizeString(nextName);
    const nextNameLower = toLowerNormalized(cleanedNextName);
    const nextSlug = slugify(cleanedNextName);

    if (!categoryId) {
        throw new Error("Category ID is required.");
    }

    if (!cleanedNextName) {
        throw new Error("New category name is required.");
    }

    const categoryRef = doc(db, "categories", categoryId);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
        throw new Error("Category not found.");
    }

    const currentCategory = {
        id: categorySnap.id,
        ...categorySnap.data()
    };

    if (toLowerNormalized(currentCategory.name) === nextNameLower) {
        return {
            ...currentCategory,
            name: cleanedNextName,
            nameLower: nextNameLower,
            slug: nextSlug
        };
    }

    const duplicateSnapshot = await getDocs(
        query(
            collection(db, "categories"),
            where("nameLower", "==", nextNameLower),
            limit(1)
        )
    );

    const duplicateDoc = duplicateSnapshot.docs[0];
    if (duplicateDoc && duplicateDoc.id !== categoryId) {
        throw new Error("A category with that name already exists.");
    }

    const batch = writeBatch(db);

    batch.update(categoryRef, {
        name: cleanedNextName,
        nameLower: nextNameLower,
        slug: nextSlug,
        updatedAt: serverTimestamp()
    });

    const relatedTagsSnapshot = await getDocs(
        query(collection(db, "tags"), where("category", "==", currentCategory.name))
    );

    relatedTagsSnapshot.docs.forEach((tagDoc) => {
        batch.update(tagDoc.ref, {
            category: cleanedNextName,
            categoryLower: nextNameLower,
            updatedAt: serverTimestamp()
        });
    });

    await batch.commit();

    return {
        ...currentCategory,
        name: cleanedNextName,
        nameLower: nextNameLower,
        slug: nextSlug
    };
}

export async function deleteCategory(categoryId, options = {}) {
    const { deleteRelatedTags = false } = options;

    if (!categoryId) {
        throw new Error("Category ID is required.");
    }

    const categoryRef = doc(db, "categories", categoryId);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
        throw new Error("Category not found.");
    }

    const category = {
        id: categorySnap.id,
        ...categorySnap.data()
    };

    const relatedTagsSnapshot = await getDocs(
        query(collection(db, "tags"), where("category", "==", category.name))
    );

    if (!deleteRelatedTags && !relatedTagsSnapshot.empty) {
        throw new Error(
            "This category still has tags. Delete or move those tags first."
        );
    }

    const batch = writeBatch(db);

    relatedTagsSnapshot.docs.forEach((tagDoc) => {
        batch.delete(tagDoc.ref);
    });

    batch.delete(categoryRef);

    await batch.commit();

    return {
        deletedCategoryId: categoryId,
        deletedTagCount: relatedTagsSnapshot.size
    };
}
