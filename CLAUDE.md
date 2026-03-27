# CLAUDE.md — Instrucciones para Claude Code

## Proyecto

Plataforma de inteligencia de precios de combustibles en España.
Backend NestJS (Fastify) + TypeScript strict + PostgreSQL + Redis.

## Convenciones críticas

- **Commits**: conventional commits en castellano con ámbito. Ejemplo: `feat(ingestion): añadir cliente de Precioil API`
- **Código**: TypeScript strict, sin `any`, path aliases (`@modules/`, `@common/`)
- **Tests**: Jest, describir en castellano, archivos `*.spec.ts` junto al código
- **Archivos**: kebab-case, estructura modular en `src/modules/<dominio>/`

## Estructura

Ver `AGENTS.md` para la arquitectura completa y todas las convenciones.

## Comandos

- `npm run start:debug` — desarrollo con debug
- `npm run docker:up` — levantar PostgreSQL + Redis
- `npm test` — tests unitarios
- `npm run lint` — lint + fix
- `npm run typecheck` — verificar tipos

## Reglas

- No crear archivos fuera de la estructura de módulos sin justificación
- Siempre añadir decoradores Swagger a los endpoints
- Usar DTOs con class-validator para inputs
- Mantener el `.env.example` actualizado al añadir variables
