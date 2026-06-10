export function mapTagDoc(docSnap) {
    const data = docSnap.data();

    return {
        id: docSnap.id,
        name: data.name ?? "",
        slug: data.slug ?? data.slugName ?? "",
        category: data.category ?? "",
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
    };
}
