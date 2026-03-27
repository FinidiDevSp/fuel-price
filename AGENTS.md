# AGENTS.md — Guía de contexto y diseño para agentes IA

> Este archivo proporciona contexto estructurado para que cualquier agente IA
> (Claude Code, Copilot, Cursor, etc.) entienda el proyecto, sus convenciones
> y pueda generar código consistente y de alta calidad.

---

## 1. Descripción del proyecto

**Fuel Price** es una plataforma de inteligencia de precios de combustibles en
España. Ingiere datos de la API de Precioil, los procesa, analiza y distribuye
a través de una web analítica pública y un sistema multicanal de notificaciones
(Telegram, X, WhatsApp, email).

### Objetivo principal

Convertir datos crudos de precios de combustible en información útil, accionable
y visualmente atractiva para consumidores, periodistas, analistas y creadores
de contenido.

### Repositorio

- **URL**: https://github.com/FinidiDevSp/fuel-price.git
- **Rama principal**: `main`
- **Lenguaje**: TypeScript (strict mode)

---

## 2. Stack tecnológico

| Capa               | Tecnología                          |
| ------------------- | ----------------------------------- |
| Backend             | NestJS + Fastify + TypeScript       |
| Base de datos       | PostgreSQL 17                       |
| ORM                 | TypeORM                             |
| Caché               | Redis 7                             |
| Jobs/Colas          | BullMQ (planificado)                |
| Frontend (futuro)   | Next.js + Tailwind + shadcn/ui      |
| Gráficos (futuro)   | Apache ECharts                      |
| Mapas (futuro)      | Leaflet / Mapbox                    |
| Contenedores        | Docker Compose                      |
| CI/CD               | GitHub Actions                      |

---

## 3. Arquitectura

### Patrón: Monolito modular

El proyecto sigue una arquitectura de **monolito modular** donde cada dominio
de negocio vive en su propio módulo NestJS independiente. No es microservicios
desde el día 1, pero está preparado para extraer módulos si escala.

### Módulos de dominio

```
src/
├── main.ts                      # Bootstrap de la aplicación
├── app.module.ts                # Módulo raíz
├── config/                      # Configuración tipada por dominio
│   ├── app.config.ts
│   ├── database.config.ts
│   └── redis.config.ts
├── common/                      # Utilidades compartidas
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
└── modules/
    ├── health/                  # Health checks
    ├── ingestion/               # Ingesta desde Precioil API
    ├── catalog/                 # Estaciones, marcas, combustibles, regiones
    ├── pricing-analytics/       # Agregados, rankings, métricas, anomalías
    ├── content-intelligence/    # Generación de insights y contenido editorial
    ├── notifications/           # Orquestador multicanal
    ├── public-api/              # API pública para frontend
    └── admin/                   # Backoffice interno
```

### Estructura interna de cada módulo

Cada módulo debe seguir esta estructura:

```
modules/<nombre>/
├── <nombre>.module.ts           # Definición del módulo NestJS
├── <nombre>.controller.ts       # Controlador REST (si aplica)
├── <nombre>.service.ts          # Lógica de negocio principal
├── dto/                         # Data Transfer Objects (validación)
├── entities/                    # Entidades TypeORM
├── interfaces/                  # Tipos e interfaces del dominio
├── <nombre>.controller.spec.ts  # Tests del controlador
├── <nombre>.service.spec.ts     # Tests del servicio
└── index.ts                     # Barrel exports
```

---

## 4. Convenciones de código

### Estilo general

- **Lenguaje del código**: inglés (nombres de variables, funciones, clases)
- **Lenguaje de commits**: castellano (conventional commits)
- **Lenguaje de comentarios**: castellano para comentarios de negocio, inglés
  para comentarios técnicos inline
- **Formatter**: Prettier (configurado en `.prettierrc`)
- **Linter**: ESLint flat config (`eslint.config.mjs`)
- **Indentación**: 2 espacios
- **Comillas**: simples (`'`)
- **Punto y coma**: sí
- **Trailing comma**: siempre
- **Max line width**: 80 caracteres

### Nomenclatura

| Elemento           | Convención           | Ejemplo                       |
| ------------------- | -------------------- | ----------------------------- |
| Archivos            | kebab-case           | `price-change-event.entity.ts`|
| Clases              | PascalCase           | `PriceChangeEvent`            |
| Interfaces          | PascalCase (sin "I") | `StationPrice`                |
| Variables/funciones | camelCase            | `calculateAvgPrice`           |
| Constantes          | UPPER_SNAKE_CASE     | `MAX_RETRY_ATTEMPTS`          |
| Tablas BD           | snake_case (plural)  | `price_change_events`         |
| Columnas BD         | snake_case           | `avg_price`                   |
| Endpoints API       | kebab-case           | `/api/top-movers`             |
| Módulos NestJS      | PascalCase + Module  | `IngestionModule`             |

### TypeScript

- **strict mode** activado en `tsconfig.json`
- Evitar `any` — usar `unknown` si el tipo no se conoce
- Preferir interfaces sobre types para objetos de dominio
- Usar enums para conjuntos cerrados de valores
- Los DTOs usan `class-validator` para validación runtime
- Las entidades usan decoradores de TypeORM

### Imports

Usar path aliases para evitar imports relativos profundos:

```typescript
import { Something } from '@modules/catalog/entities/something.entity';
import { formatPrice } from '@common/utils/format';
```

Aliases disponibles:
- `@app/*` → `src/*`
- `@modules/*` → `src/modules/*`
- `@common/*` → `src/common/*`
- `@config/*` → `src/config/*`

---

## 5. Convenciones de Git

### Commits

Se usa **Conventional Commits** en castellano:

```
<tipo>(<ámbito>): <descripción corta>

<cuerpo opcional con explicación detallada>

<notas al pie opcionales>
```

#### Tipos permitidos

| Tipo       | Uso                                                |
| ---------- | -------------------------------------------------- |
| `feat`     | Nueva funcionalidad                                |
| `fix`      | Corrección de errores                              |
| `docs`     | Cambios en documentación                           |
| `style`    | Formato, sin cambios de lógica                     |
| `refactor` | Refactorización sin cambio funcional               |
| `perf`     | Mejoras de rendimiento                             |
| `test`     | Añadir o corregir tests                            |
| `build`    | Sistema de build, dependencias                     |
| `ci`       | Configuración de CI/CD                             |
| `chore`    | Tareas de mantenimiento                            |

#### Ámbitos comunes

`ingestion`, `catalog`, `analytics`, `notifications`, `api`, `admin`,
`config`, `db`, `docker`, `ci`, `deps`

#### Ejemplo

```
feat(ingestion): añadir servicio de ingesta desde Precioil API

- Implementa cliente HTTP con reintentos y rate limiting
- Añade validación y normalización de datos crudos
- Registra cada ejecución en la tabla ingestion_runs

Refs: #12
```

### Ramas

- `main` — código estable, desplegable
- `feat/<nombre>` — nuevas funcionalidades
- `fix/<nombre>` — correcciones
- `refactor/<nombre>` — refactorizaciones

---

## 6. Base de datos

### Modelo de datos

El modelo separa claramente:

1. **Datos maestros**: `regions`, `brands`, `fuel_types`, `stations`
2. **Estado actual**: `station_current_prices`
3. **Histórico**: `station_price_observations`
4. **Eventos**: `price_change_events`
5. **Agregados**: `daily_region_fuel_stats`, `daily_rankings`
6. **Contenido**: `insight_snapshots`, `content_templates`
7. **Operación**: `ingestion_runs`, `outbound_messages`, `subscriptions`

### Principios

- Nunca mezclar consulta operativa con analítica histórica
- Los agregados se materializan en tablas propias
- El histórico crudo se conserva para trazabilidad
- Los eventos de cambio alimentan alertas y contenido

---

## 7. API Design

### Principios REST

- Usar verbos HTTP correctamente (GET, POST, PUT, PATCH, DELETE)
- Prefijo global: `/api`
- Versionado futuro: `/api/v2/...`
- Paginación con `?page=1&limit=20`
- Filtrado con query params: `?fuel=gasoline95&region=madrid`
- Respuestas consistentes con estructura:

```json
{
  "data": {},
  "meta": {
    "timestamp": "2026-03-27T10:00:00Z",
    "page": 1,
    "totalPages": 5
  }
}
```

### Documentación

- Swagger/OpenAPI disponible en `/docs`
- Todos los endpoints deben tener decoradores `@ApiOperation`, `@ApiResponse`

---

## 8. Testing

### Estrategia

- **Unit tests**: para servicios y lógica de negocio (Jest)
- **Integration tests**: para controladores con módulos reales
- **E2E tests**: para flujos completos de la API

### Convenciones

- Archivos de test junto al archivo que testean: `*.spec.ts`
- Tests e2e en carpeta `/test`: `*.e2e-spec.ts`
- Describir tests en castellano
- Naming: `describe('NombreClase')`, `it('debe hacer X cuando Y')`

---

## 9. Seguridad

- Secretos en variables de entorno, nunca en código
- `.env` incluido en `.gitignore`
- Validación estricta de payloads con `class-validator`
- Rate limiting en endpoints públicos
- Sanitización de inputs para evitar inyección SQL/XSS

---

## 10. Flujo de desarrollo

1. Crear rama desde `main`: `feat/<nombre>`
2. Desarrollar con TDD cuando sea posible
3. Ejecutar `npm run lint && npm run test && npm run typecheck`
4. Crear commit con conventional commits en castellano
5. Push y crear PR
6. Review y merge a `main`

### Comandos útiles

```bash
# Desarrollo
npm run start:dev          # Arrancar con hot-reload
npm run start:debug        # Arrancar con debug (para F5 en VS Code)

# Calidad
npm run lint               # Lint + auto-fix
npm run format             # Formatear con Prettier
npm run typecheck          # Verificar tipos sin compilar

# Tests
npm test                   # Tests unitarios
npm run test:cov           # Tests con cobertura
npm run test:e2e           # Tests end-to-end

# Infraestructura
npm run docker:up          # Levantar PostgreSQL + Redis
npm run docker:down        # Parar contenedores
npm run docker:logs        # Ver logs de contenedores

# Build
npm run build              # Compilar para producción
npm run start:prod         # Arrancar build de producción
```

---

## 11. Fuente de datos

### API Precioil

- Fuente principal de datos de precios de combustibles en España
- La ingesta se ejecuta periódicamente via `@nestjs/schedule`
- Cada ejecución se registra en `ingestion_runs` para trazabilidad
- Se implementan reintentos con backoff exponencial ante fallos
- Los datos crudos se conservan en `raw_payload_json` para auditoría

---

## 12. Reglas para agentes IA

### Al generar código

1. Seguir estrictamente las convenciones de este archivo
2. Usar TypeScript strict — no usar `any`
3. Añadir decoradores de Swagger a todos los endpoints
4. Usar DTOs con validación para toda entrada de datos
5. Escribir tests para la lógica de negocio
6. Usar los path aliases (`@modules/`, `@common/`, etc.)

### Al hacer commits

1. Usar conventional commits en castellano
2. Incluir ámbito del módulo afectado
3. Escribir cuerpo descriptivo para cambios no triviales

### Al crear archivos

1. Seguir la estructura de módulos definida en la sección 3
2. Crear barrel exports (`index.ts`) en cada módulo
3. Nombrar archivos en kebab-case

### Al modificar la base de datos

1. Crear migraciones, no modificar entidades y confiar en `synchronize`
2. Documentar cambios de esquema en el commit
3. Respetar la separación de responsabilidades del modelo de datos
