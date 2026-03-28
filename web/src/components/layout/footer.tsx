import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { SITE_NAME, ROUTES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Marca */}
          <div>
            <p className="font-bold text-lg">{SITE_NAME}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Inteligencia de precios de combustibles en España.
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <p className="font-semibold text-sm mb-2">Navegación</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href={ROUTES.home} className="hover:underline">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href={ROUTES.fuel('G95E5')} className="hover:underline">
                  Gasolina 95
                </Link>
              </li>
              <li>
                <Link href={ROUTES.fuel('GOA')} className="hover:underline">
                  Diésel
                </Link>
              </li>
            </ul>
          </div>

          {/* Atribución */}
          <div>
            <p className="font-semibold text-sm mb-2">Fuente de datos</p>
            <p className="text-sm text-muted-foreground">
              Datos proporcionados por el{' '}
              <a
                href="https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Ministerio para la Transición Ecológica
              </a>{' '}
              (MITECO).
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE_NAME}. Los datos se actualizan
          cada 30 minutos desde la fuente oficial.
        </p>
      </div>
    </footer>
  );
}
