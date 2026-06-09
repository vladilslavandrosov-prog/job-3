export default async function AdminTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Клиент #{id}</h1>
      <p className="text-[var(--text-muted)]">Фаза 6</p>
    </div>
  );
}
