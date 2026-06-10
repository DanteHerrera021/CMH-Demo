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
    date: data.date ?? "",
    tagIds: data.tagIds ?? [],
    tagNames: data.tagNames ?? [],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}
