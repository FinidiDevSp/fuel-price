export default function FuelPage({
  params,
}: {
  params: Promise<{ fuelCode: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-muted-foreground">
        Página de combustible (placeholder)
      </p>
    </div>
  );
}
