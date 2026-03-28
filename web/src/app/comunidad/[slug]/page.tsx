export default function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-muted-foreground">
        Página de comunidad autónoma (placeholder)
      </p>
    </div>
  );
}
