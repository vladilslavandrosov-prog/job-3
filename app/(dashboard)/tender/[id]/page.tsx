export default async function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Тендер #{id}</h1>
      <p className="text-[var(--text-muted)] text-sm">Фаза 3</p>
    </div>
  );
}
