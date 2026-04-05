export function mapMediaDoc(docSnap) {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    title: data.title ?? "",
    filename: data.filename ?? "",
    description: data.description ?? "",
    url: data.url ?? "",
    s3key: data.s3Key ?? "",
    width: data.width ?? null,
    height: data.height ?? null,
    tagIds: data.tagIds ?? [],
    tagSlugs: data.tagSlugs ?? [],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}