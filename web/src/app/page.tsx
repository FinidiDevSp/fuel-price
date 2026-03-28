export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Precios de Combustibles en España
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Consulta el precio medio de gasolina y diésel hoy. Evolución diaria,
          rankings por comunidad autónoma y las estaciones más baratas cerca de
          ti.
        </p>
      </section>

      {/* Placeholder para los KPIs, gráficos y mapa */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {['Gasolina 95', 'Gasolina 98', 'Diésel', 'Diésel Premium'].map(
          (fuel) => (
            <div
              key={fuel}
              className="rounded-lg border bg-card p-6 text-card-foreground"
            >
              <p className="text-sm text-muted-foreground">{fuel}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">--</p>
              <p className="mt-1 text-sm text-muted-foreground">EUR/L</p>
            </div>
          ),
        )}
      </section>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        Datos del Ministerio para la Transición Ecológica (MITECO). Actualizados
        cada 30 minutos.
      </p>
    </div>
  );
}
