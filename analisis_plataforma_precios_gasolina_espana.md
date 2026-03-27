# Análisis maestro del proyecto: plataforma de inteligencia de precios de gasolina en España

## 1. Resumen ejecutivo

Este proyecto consiste en construir una plataforma digital especializada en el seguimiento, análisis y difusión de la evolución de los precios de los combustibles en España, usando la API de Precioil como fuente principal de ingestión. La solución tendrá dos grandes pilares:

1. **Web analítica pública** con visualización avanzada, histórico, comparativas territoriales, medias, tendencias, rankings y herramientas de exploración.
2. **Sistema multicanal de notificaciones** para distribuir información relevante por Telegram, X, WhatsApp y email.

La plataforma no debe limitarse a “mostrar precios”, sino convertirse en un **producto de inteligencia energética orientado al consumidor, al periodista, al analista, al creador de contenido y al usuario que quiere ahorrar**.

---

## 2. Objetivo del producto

### Objetivo principal
Convertir datos de precios de combustible en información útil, accionable y atractiva para consulta y difusión.

### Objetivos secundarios
- Mostrar la evolución histórica de precios por combustible, estación, provincia, comunidad y España.
- Detectar y comunicar cambios relevantes.
- Facilitar comparativas territoriales y temporales.
- Construir un sistema de alertas y publicaciones automáticas con lógica editorial.
- Diferenciarse con análisis, contexto y visualizaciones que la competencia no suele ofrecer.

### Objetivo de negocio
Crear un activo digital escalable con potencial para:
- monetización por publicidad o afiliación,
- suscripciones premium,
- licencias B2B para medios, dashboards o integraciones,
- generación automática de contenido para canales propios.

---

## 3. Visión de producto

### Visión
Ser la referencia en España para consultar, analizar y recibir información inteligente sobre precios de combustibles.

### Posicionamiento
No competir solo como “buscador de gasolineras baratas”, sino como una **plataforma de analítica, contexto y vigilancia del mercado minorista de combustibles**.

### Propuesta de valor
- Datos actualizados y normalizados.
- Histórico sólido y explotable.
- Visualización clara y profesional.
- Notificaciones automáticas con valor real.
- Capacidad de análisis territorial y temporal.
- Contenido diferencial y no repetitivo.

---

## 4. Usuarios objetivo

### Usuario particular ahorrador
Quiere saber dónde repostar más barato, cómo evoluciona el precio y si conviene esperar.

### Usuario intensivo / conductor frecuente
Quiere seguir tendencias en su zona, recibir alertas y optimizar gasto.

### Periodistas / creadores de contenido
Necesitan gráficos, rankings, variaciones semanales y narrativas de mercado.

### Analistas / profesionales
Buscan series históricas, anomalías, dispersiones, diferencias regionales y rankings.

### Canal editorial propio
La propia plataforma actuará como emisor automático de insights y resúmenes.

---

## 5. Alcance funcional

### 5.1 Web pública
La web debe incluir como mínimo:

#### Página principal
- precio medio nacional hoy por combustible,
- variación respecto a ayer, hace 7 días, 30 días y 1 año,
- gráficos principales,
- mapa o ranking territorial,
- resumen editorial automático,
- bloques destacados: mayores subidas, mayores bajadas, comunidades más caras/baratas.

#### Páginas por combustible
- Gasolina 95,
- Gasolina 98,
- Diésel,
- otros combustibles si la API lo permite.

#### Páginas por comunidad autónoma
- precio medio actual,
- histórico,
- comparación con media nacional,
- ranking interno por provincias,
- estaciones más baratas y más caras,
- evolución interdiaria e intersemanal.

#### Páginas por provincia
- mismos KPIs en escala provincial,
- comparativa con comunidad y España,
- listado y rankings.

#### Páginas por estación
- ficha completa,
- localización,
- marca,
- horarios si existen,
- combustibles disponibles,
- histórico por combustible,
- cambios recientes,
- comparación con entorno.

#### Comparadores
- comunidad vs comunidad,
- provincia vs provincia,
- estación vs media territorial,
- combustible vs combustible.

#### Página de tendencias
- series temporales,
- aceleración o desaceleración de cambios,
- dispersión del mercado,
- estabilidad por zonas,
- volatilidad reciente.

#### Página de alertas / insights
- mayores variaciones del día,
- estaciones con cambios llamativos,
- zonas con tensión de precios,
- patrones detectados.

#### Buscador avanzado
- por municipio,
- por código postal,
- por radio,
- por estación,
- por marca,
- por combustible.

### 5.2 Sistema de notificaciones
Debe soportar:
- Telegram (canales o bot)
- X
- WhatsApp
- Email

Tipos de envío:
- resumen diario,
- resumen semanal,
- alerta por subidas/bajadas significativas,
- ranking territorial,
- dato curioso / insight,
- publicaciones automáticas con gráfico,
- alertas personalizadas por zona o combustible.

---

## 6. Diferenciación e ideas novedosas

Para no ofrecer “más de lo mismo”, la plataforma debe incluir capas de inteligencia y narrativa:

### 6.1 Índices propios
Crear métricas derivadas:
- **Índice de tensión del precio**: mide velocidad e intensidad de subidas.
- **Índice de oportunidad de repostaje**: compara precio local vs media territorial e histórica.
- **Índice de dispersión**: diferencia entre estaciones baratas y caras en una zona.
- **Índice de estabilidad**: cuánto cambia una zona a lo largo del tiempo.
- **Radar de anomalías**: estaciones o zonas con cambios atípicos.

### 6.2 Insights automáticos
Ejemplos:
- “La Comunidad Valenciana encadena 4 días de subidas en gasolina 95.”
- “Madrid amplía la diferencia frente a la media nacional.”
- “La dispersión del diésel en Sevilla alcanza máximos de 30 días.”
- “Cataluña registra la caída semanal más intensa.”

### 6.3 Contenido editorial automatizado
Cada día el sistema puede generar:
- titulares automáticos,
- mini análisis por canal,
- resumen de apertura del día,
- ranking de variaciones,
- gráficos listos para publicación.

### 6.4 Experiencias premium
- watchlists por provincias o municipios,
- alertas personalizadas,
- comparador guardado,
- histórico ampliado,
- informes descargables,
- API propia en fase futura.

---

## 7. Requisitos no funcionales

- Alta disponibilidad para la web pública.
- Ingesta fiable y reintentos ante fallos de la API.
- Modelo de datos histórico consistente.
- Buen SEO técnico.
- Buen rendimiento en páginas con gráficos y tablas.
- Arquitectura modular para añadir canales y fuentes.
- Observabilidad completa.
- Seguridad y gestión de secretos.
- Trazabilidad de publicaciones y envíos.

---

## 8. Arquitectura de alto nivel

## 8.1 Visión general
Arquitectura recomendada basada en cuatro dominios:

1. **Ingesta de datos**
2. **Procesamiento y analítica**
3. **Exposición web y API interna**
4. **Distribución multicanal**

Flujo:
1. Precioil entrega datos.
2. El backend de ingesta los captura, valida y normaliza.
3. Se persiste snapshot actual + histórico de cambios.
4. Jobs analíticos calculan agregados, rankings, métricas e insights.
5. La web consume vistas optimizadas o API propia.
6. El motor de distribución decide qué publicar y por qué canal.

---

## 9. Arquitectura técnica recomendada

## 9.1 Stack recomendado

### Frontend web
- **Next.js**
- **TypeScript**
- **React Server Components + SSR/ISR**
- **Tailwind CSS**
- **shadcn/ui** o librería equivalente
- **ECharts o Apache ECharts** para gráficos complejos
- **Mapbox o Leaflet** para mapas

### Backend principal
- **NestJS** o **Fastify/Express con TypeScript**
- Arquitectura modular por dominios
- API REST interna y opcionalmente GraphQL para exploración compleja

### Procesamiento de jobs
- **Temporal**, **BullMQ** o sistema de colas robusto
- workers especializados por:
  - ingesta,
  - agregados,
  - detección de eventos,
  - generación de contenido,
  - notificaciones.

### Base de datos
- **PostgreSQL** como núcleo transaccional
- Preferible con **TimescaleDB** para series temporales si el volumen crece

### Caché
- **Redis**

### Almacenamiento de objetos
- **S3 compatible** para imágenes, gráficos exportados, assets y snapshots auxiliares

### Analítica / observabilidad
- logs estructurados,
- métricas,
- trazas,
- alertas.

### Infraestructura
- Docker
- despliegue en Vercel + Railway / Fly / Render / AWS, o
- despliegue completo en AWS/GCP con Terraform en fases más maduras.

---

## 10. Diseño lógico por servicios

### Servicio 1: Ingestion Service
Responsabilidades:
- consumir la API de Precioil,
- paginar si aplica,
- controlar rate limits,
- validar respuesta,
- normalizar campos,
- detectar inserts/updates,
- guardar snapshots e históricos.

### Servicio 2: Catalog Service
Gestiona entidades maestras:
- estaciones,
- marcas,
- combustibles,
- provincias,
- comunidades,
- municipios.

### Servicio 3: Pricing Analytics Service
Calcula:
- medias por nivel territorial,
- variaciones,
- rankings,
- volatilidad,
- dispersiones,
- anomalías,
- tendencias.

### Servicio 4: Content Intelligence Service
Genera:
- textos automáticos,
- resúmenes diarios,
- insights redactados,
- titulares,
- copies por canal.

### Servicio 5: Notification Orchestrator
Decide:
- qué evento merece emisión,
- en qué canal,
- con qué plantilla,
- a qué audiencia,
- con qué política anti-spam.

### Servicio 6: Public API / Web API
Sirve a frontend:
- KPIs,
- series,
- rankings,
- mapas,
- fichas de estación,
- insights.

### Servicio 7: Admin / Backoffice
Permite:
- monitorizar jobs,
- revisar envíos,
- forzar reintentos,
- editar plantillas,
- activar/desactivar reglas,
- ver calidad de datos.

---

## 11. Estrategia de datos

## 11.1 Principios de modelado
Hay que separar claramente:
- **dato maestro** de estación,
- **estado actual** de precios,
- **histórico** de observaciones,
- **eventos** de cambio,
- **agregados** ya calculados,
- **contenido emitido**.

Esto evita mezclar consulta operativa con analítica histórica.

---

## 12. Modelo de base de datos propuesto

## 12.1 Tablas maestras

### regions
- id
- type (country, community, province, municipality)
- name
- code
- parent_id
- slug
- centroid_lat
- centroid_lng
- metadata_json

### brands
- id
- name
- normalized_name
- slug

### fuel_types
- id
- external_fuel_type_id
- code
- name
- short_name
- unit
- is_active

### stations
- id
- external_station_id
- name
- slug
- brand_id
- region_community_id
- region_province_id
- region_municipality_id
- address
- postal_code
- lat
- lng
- opening_hours
- services_json
- is_active
- first_seen_at
- last_seen_at
- metadata_json

## 12.2 Tablas de estado actual

### station_current_prices
- id
- station_id
- fuel_type_id
- price
- currency
- observed_at
- source_updated_at
- previous_price
- delta_abs
- delta_pct
- updated_by_ingestion_run_id

Esta tabla sirve para lecturas rápidas del estado actual.

## 12.3 Histórico crudo

### station_price_observations
- id
- station_id
- fuel_type_id
- price
- currency
- observed_at
- source_updated_at
- ingestion_run_id
- raw_payload_hash
- raw_payload_json

Cada observación relevante queda registrada para trazabilidad.

## 12.4 Eventos de cambio

### price_change_events
- id
- station_id
- fuel_type_id
- previous_price
- new_price
- delta_abs
- delta_pct
- detected_at
- effective_at
- change_direction
- severity_score
- anomaly_score
- region_community_id
- region_province_id
- region_municipality_id

Muy útil para alertas y contenido.

## 12.5 Agregados diarios

### daily_region_fuel_stats
- id
- stat_date
- region_id
- fuel_type_id
- avg_price
- min_price
- max_price
- median_price
- p10_price
- p25_price
- p75_price
- p90_price
- stddev_price
- station_count
- change_vs_prev_day_abs
- change_vs_prev_day_pct
- change_vs_7d_abs
- change_vs_30d_abs
- created_at

### daily_station_fuel_stats
Opcional si quieres snapshots de estación por día para acelerar consultas.

## 12.6 Rankings y snapshots editoriales

### daily_rankings
- id
- stat_date
- ranking_type
- scope_region_id
- fuel_type_id
- payload_json

### insight_snapshots
- id
- stat_date
- insight_type
- title
- summary
- payload_json
- score
- generated_at
- approved_at
- status

## 12.7 Operación y trazabilidad

### ingestion_runs
- id
- source_name
- started_at
- finished_at
- status
- records_received
- records_inserted
- records_updated
- records_ignored
- error_count
- notes

### outbound_messages
- id
- channel_type
- target_identifier
- template_key
- dedup_key
- status
- scheduled_at
- sent_at
- payload_json
- response_json
- related_insight_id
- related_event_id
- error_message

### subscriptions
- id
- user_id nullable
- channel_type
- target_identifier
- region_id nullable
- fuel_type_id nullable
- frequency
- alert_rules_json
- is_active
- created_at

### content_templates
- id
- channel_type
- template_key
- language
- subject
- body_template
- metadata_json
- is_active

---

## 13. Índices y rendimiento

Imprescindibles:
- índice por `(station_id, fuel_type_id, observed_at desc)`
- índice por `(region_id, fuel_type_id, stat_date desc)`
- índice geoespacial si haces búsquedas por radio
- índice por `external_station_id`
- índice por `detected_at desc`
- índice por `dedup_key` para evitar envíos duplicados

Particionado recomendable si el volumen crece:
- histórico por mes o por trimestre,
- eventos por mes,
- agregados por fecha.

---

## 14. Flujo de ingestión recomendado

1. Job programado cada X minutos.
2. Se consulta Precioil por los endpoints necesarios.
3. Se guarda el run en `ingestion_runs`.
4. Se normaliza la respuesta.
5. Se resuelven catálogos maestros.
6. Se compara contra `station_current_prices`.
7. Si hay cambio real:
   - actualizar current state,
   - insertar observación,
   - crear `price_change_events`.
8. Si no hay cambio:
   - según estrategia, guardar o no snapshot crudo.
9. Se disparan jobs de agregación incrementales.
10. Se recalculan rankings e insights derivados.

---

## 15. Estrategia de histórico

Hay tres opciones:

### Opción A: guardar todo
Ventaja: máxima trazabilidad.
Desventaja: más coste.

### Opción B: guardar solo cambios
Ventaja: muy eficiente.
Desventaja: peor resolución temporal.

### Opción C: híbrida (recomendada)
- guardar cambios siempre,
- guardar snapshot diario completo,
- guardar snapshot intradía solo para estaciones con cambios.

Esta opción da equilibrio entre coste y analítica.

---

## 16. Motor analítico

## 16.1 Métricas base
- media nacional por combustible,
- media por comunidad,
- media por provincia,
- mínimo y máximo,
- dispersión,
- desviación estándar,
- número de estaciones activas,
- variación diaria/semanal/mensual/anual,
- brecha frente a media nacional.

## 16.2 Métricas avanzadas
- momentum de precio,
- volatilidad rolling 7/30 días,
- consistencia de cambios,
- amplitud del mercado (cuántas estaciones suben/bajan),
- índice de convergencia/divergencia territorial,
- score de oportunidad de repostaje,
- score de anomalía.

## 16.3 Algoritmos propuestos

### Detección de anomalías
- z-score por región y combustible,
- IQR para detectar extremos,
- comparación con vecindario geográfico.

### Tendencias
- media móvil 7/30 días,
- pendiente lineal rolling,
- aceleración de la pendiente.

### Relevancia editorial
Score compuesto con:
- magnitud del cambio,
- amplitud territorial,
- persistencia,
- rareza estadística,
- interés histórico.

---

## 17. API interna para frontend

## 17.1 Endpoints sugeridos

### Home
- `/api/home/summary`
- `/api/home/top-movers`
- `/api/home/insights`

### Series
- `/api/series/national?fuel=...&range=...`
- `/api/series/region/{regionSlug}?fuel=...`
- `/api/series/station/{stationSlug}?fuel=...`

### Rankings
- `/api/rankings/communities`
- `/api/rankings/provinces`
- `/api/rankings/stations`

### Mapas
- `/api/maps/current-prices`
- `/api/maps/heatmap`

### Búsqueda
- `/api/search?q=...`
- `/api/stations/nearby?lat=...&lng=...&radius=...`

### Notificaciones / suscripciones
- `/api/subscriptions`
- `/api/subscriptions/confirm`

---

## 18. Diseño del frontend web

## 18.1 Principios UX
- priorizar lectura rápida del dato clave,
- visualizaciones limpias,
- navegación territorial sencilla,
- comparativas claras,
- diseño orientado a confianza y autoridad.

## 18.2 Secciones clave
- hero con precio medio nacional y variación,
- gráfico principal de evolución,
- mapa de España por comunidad,
- rankings de regiones,
- insights destacados,
- top subidas/bajadas,
- CTA a alertas.

## 18.3 Componentes clave
- tarjetas KPI,
- gráfico de línea histórico,
- heatmap territorial,
- ranking table,
- selector de combustible,
- selector temporal,
- comparador dual,
- módulo editorial autoexplicativo.

## 18.4 SEO
- páginas indexables por comunidad, provincia y estación,
- slugs limpios,
- metadatos dinámicos,
- schema markup,
- sitemap segmentado,
- contenido textual complementario generado con control.

---

## 19. Sistema multicanal de notificaciones

## 19.1 Filosofía
No enviar “datos sueltos”, sino piezas de información curadas y adaptadas al canal.

## 19.2 Canales

### Telegram
Ideal para:
- alertas inmediatas,
- resumen diario,
- gráficos,
- mensajes largos.

### X
Ideal para:
- titulares rápidos,
- ranking diario,
- hilo semanal,
- gráfico con insight.

### WhatsApp
Ideal para:
- resúmenes compactos,
- alertas premium,
- mensajes de alta apertura.

### Email
Ideal para:
- boletín diario/semanal,
- análisis más completo,
- resúmenes regionales.

---

## 20. Arquitectura del sistema de publicación

### Orquestador
Debe decidir:
- qué evento entra en cola,
- qué canal admite ese formato,
- si ya se envió algo similar,
- si hay fatiga de canal,
- si se acompaña de imagen o no.

### Pipeline
1. un insight o evento supera umbral,
2. se construye payload canónico,
3. se generan versiones por canal,
4. se aplica deduplicación,
5. se envía,
6. se registra resultado,
7. si falla, se reintenta según política.

---

## 21. Estrategia editorial por canal

### Telegram
- mensaje diario matinal,
- alertas relevantes en tiempo real,
- gráfico + comentario,
- formato más denso.

### X
- 1 a 3 posts diarios,
- tono más titular y punchy,
- imágenes muy visuales,
- hilos para resumen semanal.

### WhatsApp
- resumen ultra breve,
- foco en utilidad inmediata,
- segmentación premium.

### Email
- comparativas,
- insights largos,
- top regiones,
- CTA a la web.

---

## 22. Reglas de notificación recomendadas

### Regla 1
Enviar alerta si una comunidad registra una variación diaria superior a un umbral definido.

### Regla 2
Enviar ranking diario a hora fija.

### Regla 3
Emitir insight si una provincia entra en máximos o mínimos de 30 días.

### Regla 4
Enviar alerta de oportunidad si una zona cae significativamente por debajo de su media reciente.

### Regla 5
Bloquear mensajes redundantes si el insight es equivalente a otro emitido en la ventana de tiempo.

---

## 23. Plantillas de contenido

Debe existir un motor de plantillas con variables:
- `{fuel}`
- `{region}`
- `{avg_price}`
- `{delta_day}`
- `{delta_week}`
- `{cheapest_area}`
- `{most_expensive_area}`
- `{headline}`
- `{chart_url}`

Ejemplo:
“Hoy la gasolina 95 en España marca una media de {avg_price}, con una variación de {delta_day} frente a ayer. {region} lidera las subidas y {cheapest_area} se mantiene como la zona más barata.”

---

## 24. Backoffice necesario

Panel interno con:
- estado de ingestas,
- errores recientes,
- runs por fuente,
- vista de eventos generados,
- cola de notificaciones,
- estado de cada canal,
- previsualización de contenidos,
- métricas de publicaciones,
- interruptores de emergencia.

---

## 25. Seguridad

- secretos en vault o secret manager,
- roles diferenciados en admin,
- rate limiting en endpoints públicos,
- protección anti abuso en suscripciones,
- validación estricta de payloads,
- auditoría de acciones administrativas,
- cifrado de credenciales y tokens.

---

## 26. Observabilidad

- logs estructurados por servicio,
- métricas de latencia y errores,
- dashboards de salud,
- alarmas por caída de ingesta,
- alarmas por aumento de errores de envío,
- trazabilidad por `ingestion_run_id` y `outbound_message_id`.

KPIs operativos:
- tiempo medio de ingesta,
- porcentaje de runs fallidos,
- número de eventos relevantes detectados,
- tasa de envío exitoso por canal,
- latencia desde cambio detectado a publicación.

---

## 27. Calidad de datos

Controles imprescindibles:
- validación de precios imposibles,
- detección de duplicados,
- validación de geodatos,
- control de estaciones desaparecidas/reaparecidas,
- normalización de marcas,
- reconciliación de fuel types.

Sistema de flags:
- `suspect_price`
- `missing_fuel`
- `station_inactive`
- `geo_inconsistent`
- `outlier_detected`

---

## 28. Escalabilidad

Fase inicial:
- monolito modular + workers.

Fase media:
- separar ingesta, API pública y notificaciones.

Fase avanzada:
- microservicios por dominio,
- data warehouse,
- capa de ML para predicción y scoring.

---

## 29. Roadmap conceptual

### Fase 1: Núcleo de datos
- ingesta,
- normalización,
- histórico,
- agregados diarios,
- panel interno mínimo.

### Fase 2: Web analítica MVP
- home,
- páginas por combustible,
- páginas por comunidad/provincia,
- gráficos históricos,
- rankings.

### Fase 3: Notificaciones MVP
- Telegram,
- email,
- plantillas,
- reglas básicas.

### Fase 4: Distribución avanzada
- X,
- WhatsApp,
- gráficos autoexportables,
- insight engine.

### Fase 5: Diferenciación
- índices propios,
- premium,
- comparadores avanzados,
- predicción.

---

## 30. Riesgos principales

### Riesgo 1: dependencia de fuente externa
Mitigación:
- desacoplar ingesta,
- registrar payload bruto,
- tolerancia a fallos,
- diseño preparado para múltiples fuentes futuras.

### Riesgo 2: sobrecarga de complejidad prematura
Mitigación:
- MVP analítico sólido primero,
- multicanal progresivo.

### Riesgo 3: ruido en notificaciones
Mitigación:
- scoring editorial,
- deduplicación,
- umbrales,
- frecuencia controlada.

### Riesgo 4: consultas pesadas en histórico
Mitigación:
- agregados materializados,
- caché,
- particionado.

### Riesgo 5: producto poco diferencial
Mitigación:
- insights propios,
- narrativa editorial,
- índices originales,
- experiencia UX superior.

---

## 31. Decisiones recomendadas desde ya

1. Adoptar **PostgreSQL + TimescaleDB** si esperas crecimiento serio del histórico.
2. Construir **monolito modular** al principio, no microservicios desde el día 1.
3. Separar claramente **raw observations**, **current state**, **events** y **aggregates**.
4. Diseñar desde el inicio un **motor de notificaciones basado en eventos**, no hardcodeado por canal.
5. Priorizar **Telegram + email** como primeros canales, dejando X y WhatsApp para fase siguiente.
6. Diseñar la web para SEO territorial desde la primera versión.
7. Crear desde el principio un **backoffice técnico** aunque sea mínimo.
8. Pensar el producto como **data platform + media engine**, no solo como web de precios.

---

## 32. Recomendación final

La mejor base para este proyecto no es una simple web, sino una **plataforma analítica de datos energéticos con motor editorial multicanal**.

Si se construye bien, tendrás:
- una fuente propia de verdad histórica,
- una web diferenciada y escalable,
- una máquina de contenido automático,
- una base sólida para monetización y expansión.

La clave no estará en mostrar el precio de hoy, sino en convertir los cambios del mercado en información interpretable, visual y distribuible.

---

## 33. Siguiente paso ideal

Transformar este análisis maestro en:
1. épicas,
2. módulos,
3. tareas técnicas,
4. backlog priorizado,
5. plan de desarrollo por fases.

