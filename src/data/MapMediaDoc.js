export function mapMediaDoc(docSnap) {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    title: data.title ?? "",
    filename: data.filename ?? "",
    description: data.description ?? "",
    url: data.url ?? "",
    width: data.width ?? null,
    height: data.height ?? null,
    tagIds: data.tagIds ?? [],
    tagNames: data.tagNames ?? [],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}