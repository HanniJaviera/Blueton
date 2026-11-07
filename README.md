# Bluetón — Planificación Asistencial (Botathon 2026)

Bluetón: dashboard en Nuxt 3 para el desafío Teletón «Cada hora cuenta» (Duoc UC × SS&C Blue Prism). Responsable: Genara Alarcón.

## Qué hace

- Vista nacional, por instituto y por profesional, con filtros (instituto, área, cargo, tipo de
  atención, mes).
- Indicadores: **Meta de Gestión Asistencial** (90% de la proyección) y **% FOJA**.
- Comparación planificado vs. realizado (SIC) con alerta de desviación.
- Bitácora de cambios (quién, qué, cuándo, por qué).
- Editor de parámetros (% por cargo/tramo, minutos estándar, asignaciones especiales,
  calendario, % de meta) sin tocar código.
- Accesible: buen contraste, roles/aria-label, resumen en lectura fácil por profesional.

## Accesos y vistas

| Ruta | Quién | Qué muestra |
| --- | --- | --- |
| `/` | Todos | Pantalla de inicio: elegir **Administrador** o **Trabajador** |
| `/nacional` | Administrador | Vista nacional con filtros, KPIs y bitácora |
| `/graficos` | Administrador | KPIs en gráficos con semáforo y explicación «En simple» |
| `/instituto/:id` | Administrador | Profesionales de un instituto |
| `/profesional/:id` | Administrador | Ficha con planificación mes a mes y cálculo de la tasa |
| `/parametros` | Administrador | Editor de parámetros |
| `/mi-planificacion/:id` | Trabajador | Su meta del mes explicada en lenguaje simple |

El rol se guarda en una cookie (`middleware/rol.global.ts`): el trabajador solo puede ver su propia
planificación. Es una separación para la demo, **no** reemplaza un inicio de sesión real.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Por defecto usa datos **mock** servidos por este mismo proyecto (`server/api/*`, leyendo de
`mocks/*.json`) — no necesitas backend ni red hacia la VM para desarrollar.

## Datos reales (Azure Blob) e inicio de sesión

Blue Prism sube `planificacion.json` y `bitacora.json` al Blob; el dashboard los descarga una vez
(`composables/useDatosBlob.ts`) y filtra/suma en el navegador. Ya no hay API.

1. Copia `.env.example` a `.env` y llena las variables (los valores los tiene Samuel; **no van al repo**).
2. Reinicia `npm run dev`.

| Variable | Qué es |
|---|---|
| `NUXT_PUBLIC_BLOB_URL` | URL del contenedor (lo que va antes del `?` en la SAS de lectura) |
| `NUXT_PUBLIC_BLOB_SAS` | SAS de lectura (lo que va después del `?`) |
| `NUXT_PUBLIC_GOOGLE_CLIENT_ID` | ID de cliente OAuth de Google |
| `NUXT_PUBLIC_MS_CLIENT_ID` | Application (client) ID de Microsoft |
| `NUXT_PUBLIC_MS_TENANT` | `common` (cuentas personales y de empresa) |

| `NUXT_BLOB_SAS_ESCRITURA` | **Secreta, solo servidor.** SAS con Create + Write (sin `?`) para guardar `parametros.json` |
| `NUXT_PARAMETROS_CLAVE` | **Secreta.** Clave que pide la pantalla Parámetros para guardar |

Sin `BLOB_URL` usa los mocks; sin client IDs no pide login (modo demo).

### Parámetros y recálculo

La pantalla **Parámetros** edita las reglas (7 módulos) y las guarda en `parametros.json` del Blob
(vía `server/api/parametros.put.ts`, con historial de quién/qué/por qué). Si aún no existe, se usa
`data/parametros.base.json` (carga inicial desde la planilla). El dashboard recalcula cada fila con
`utils/motor.ts` (lógica de `logica.md`, validada al 99,5% contra la planilla: `scripts/validar_motor/`).

Para recalcular, cada fila de `planificacion.json` (una por profesional, instituto y mes) necesita:
`id_profesional`, `mes`, `instituto`, `cargo` (como en Distribucion_NAC), `cod_esp` (KI, AS, ULAB…),
`horas_contratadas`, `semanas`, `sem_habiles`, `h_asignaciones` y `colacion_contrato_h`.
Si falta `sem_habiles`, se muestran los valores que calculó Blue Prism sin recalcular.

## Publicar en Vercel

1. vercel.com → **Add New → Project** → importa `HanniJaviera/Blueton` (detecta Nuxt solo; no cambies build ni output).
2. Antes de *Deploy*, en **Environment Variables** agrega las 5 variables de la tabla de arriba.
3. **Deploy.** Cada push a `main` se vuelve a publicar solo.
4. Con la URL final (`https://<proyecto>.vercel.app/`), agrégala **con la `/` final** en:
   - Google Cloud → *Clientes* → orígenes de JavaScript (sin `/`) y URI de redireccionamiento (con `/`).
   - Azure → *App registrations* → Blueton → *Authentication* → Redirect URIs (plataforma Web).

Si cambias una variable en Vercel, haz *Redeploy* para que se aplique.

## Estructura

```
pages/            Vista Nacional, Instituto, Profesional, Parámetros
components/       FiltrosBar, KpiMeta, KpiFoja, TablaConsolidado, AlertaDesviacion,
                  BitacoraPanel, SelectorPeriodo, ResumenLecturaFacil
composables/      usePlanificacion, useIndicadores, useParametros
stores/           filtros (Pinia), planificacion (Pinia)
mocks/            planificacion.json, indicadores.json, bitacora.json, parametros.json
server/api/       endpoints mock (GET/PUT) que imitan la API real
```

## Contrato con el bot/API (referencia)

El bot de Blue Prism envía solo los cambios a `POST /cambios`, en este formato:

```json
{
  "lote_id": "BUK_2026-11-07_01",
  "cambios": [{
    "tipo": "cambio_jornada",
    "id_profesional": "P0123",
    "campo": "horas_semanales",
    "valor_anterior": 44,
    "valor_nuevo": 42,
    "vigencia_desde": "2026-05-01"
  }],
  "errores": [{ "fila": 57, "campo": "fecha_inicio", "detalle": "Fecha inválida" }]
}
```

El dashboard no llama a `/cambios` directamente — consume lo que el backend ya calculó vía
`/planificacion`, `/indicadores` y `/bitacora`.

## Detalle mensual por profesional (`/profesional/:id`)

La ficha del profesional muestra, además de meta, % FOJA, SIC, resumen simple y bitácora:

- Totales anuales (atenciones directas e indirectas planificadas, meta, semanas hábiles, horas en atención).
- **Gráfico de atenciones por mes** (plan vs. meta de gestión, directa o directa + indirecta). En SVG, sin dependencias.
- **Tabla mes a mes**: horas, semanas, semanas hábiles con el detalle de descuentos, tasa semanal, plan y meta.
- **Cómo se calculó la tasa semanal**: parámetros del cargo/tramo y tasas P1 (ene–abr) y P2 (may–dic).

Datos: `GET {apiBase}/planificacion?persona_id=ID` (composable `useDetalleProfesional`). Formato de
respuesta en `composables/useDetalleProfesional.ts` y lógica en `docs/logica.md`. En los mocks,
`P0123` muestra el caso 71580 de `docs/logica.md` (`mocks/detalle_profesional.json`). Si la API no tiene
detalle para un profesional, la ficha muestra un aviso y el resto sigue funcionando.
