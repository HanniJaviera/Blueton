# Bluetón — Planificación Asistencial (Botathon 2026)

Dashboard en Nuxt 3 para el desafío Teletón «Cada hora cuenta» (Duoc UC × SS&C Blue Prism). Equipo 6.

## Cómo funciona

```
BUK (Excel) → Blue Prism → planificacion.json + bitacora.json → Azure Blob → Dashboard (Vercel)
                                                                    ↑               │
                                                        parametros.json ←── pantalla Parámetros
```

1. **Blue Prism** lee el BUK, valida (Work Queue), detecta cambios y sube `planificacion.json` y
   `bitacora.json` al Blob (contenedor privado `planificacion`, PUT con SAS de escritura).
2. **El dashboard** descarga esos archivos una vez (`composables/useDatosBlob.ts`) y **recalcula** cada
   profesional con las reglas vigentes (`utils/motor.ts`): tramo, tasas P1/P2, semanas hábiles, plan y meta.
3. **Parámetros** permite cambiar las reglas sin tocar código; se guardan en `parametros.json` del Blob
   y todo el dashboard se recalcula.

No hay API ni base de datos: el navegador filtra y suma (~6.000 filas en menos de 1 ms por filtro).

## Qué muestra

- Vista **nacional**, por **instituto** y por **profesional**, con filtros (instituto, área, cargo, tipo de atención, mes).
- **Meta de Gestión Asistencial** (suma de `meta_atenciones`) y **% FOJA** (Σ `horas_directa` / Σ `horas_contratadas`).
- **Gráficos** con semáforo y explicación «En simple».
- **Ficha del profesional**: plan y meta mes a mes, semanas hábiles y cómo se calculó la tasa semanal.
- **Bitácora**: cambios del BUK y cambios de parámetros (quién, qué, cuándo, por qué).
- **Mi planificación** (trabajador): su meta del mes en lectura fácil.
- Accesible: contraste, roles/aria-label, resumen en lectura fácil.

## Accesos

| Ruta | Quién | Qué muestra |
| --- | --- | --- |
| `/` | Todos | Inicio de sesión (Google / Microsoft) y elección de **Administrador** o **Trabajador** |
| `/graficos` | Administrador | KPIs en gráficos |
| `/nacional` | Administrador | Vista nacional con filtros, KPIs y bitácora |
| `/instituto/:id` | Administrador | Profesionales de un instituto |
| `/profesional/:id` | Administrador | Ficha mes a mes y trazabilidad del cálculo |
| `/parametros` | Administrador | Editor de reglas con vista previa del impacto |
| `/mi-planificacion/:id` | Trabajador | Su meta explicada en simple |

**Inicio de sesión** (`composables/useSesion.ts`): OpenID Connect con Google o Microsoft, sin librerías.
Hoy acepta cuentas personales. Para restringir a cuentas corporativas basta con variables de entorno:
`NUXT_PUBLIC_MS_TENANT` = tenant de Entra ID de Teletón y `NUXT_PUBLIC_DOMINIOS_PERMITIDOS` = `teleton.cl`.
El token se lee en el navegador sin validar la firma y el rol se elige en una tarjeta: sirve para la
demo, **no** es seguridad real (ver *Alcance futuro*).

## Cómo correrlo

```bash
npm install
cp .env.example .env   # y llena los valores (los tiene Samuel; el .env no va al repo)
npm run dev            # http://localhost:3000
```

Cada vez que cambies el `.env`, reinicia `npm run dev`.

| Variable | Qué es |
|---|---|
| `NUXT_PUBLIC_BLOB_URL` | URL del contenedor (lo que va antes del `?` en la SAS de lectura) |
| `NUXT_PUBLIC_BLOB_SAS` | SAS de **lectura** (lo que va después del `?`) |
| `NUXT_PUBLIC_GOOGLE_CLIENT_ID` | ID de cliente OAuth de Google |
| `NUXT_PUBLIC_MS_CLIENT_ID` | Application (client) ID de Microsoft |
| `NUXT_PUBLIC_MS_TENANT` | `common` = cuentas personales y de empresa |
| `NUXT_PUBLIC_DOMINIOS_PERMITIDOS` | Vacío = cualquier correo |
| `NUXT_BLOB_SAS_ESCRITURA` | **Secreta, solo servidor.** SAS con Create + Write (sin `?`) para guardar parámetros |
| `NUXT_PARAMETROS_CLAVE` | **Secreta.** Clave que pide Parámetros para guardar (vacía = no pide) |

- Las `NUXT_PUBLIC_*` quedan en el JavaScript del sitio: por eso la SAS pública es **solo de lectura**.
- Sin `NUXT_PUBLIC_BLOB_URL` usa los datos de prueba de `mocks/` (servidos por `server/api/*`).
- Sin client IDs no pide inicio de sesión (modo demo).
- Si Blue Prism aún no subió `planificacion.json` (404), las vistas salen vacías sin error y Parámetros sigue funcionando.

## Contrato con Blue Prism

**`planificacion.json`** = `{ "generado_en", "lote_id", "filas": [...] }`, una fila por profesional, instituto y mes.

| Campo | Obligatorio | Notas |
|---|---|---|
| `id_profesional`, `mes` | Sí | Texto. `mes` = `"2026-05"` |
| `nombre`, `instituto`, `area`, `cargo` | Sí | `cargo` escrito como en Distribucion_NAC |
| `horas_contratadas`, `horas_directa`, `horas_indirecta`, `horas_nas`, `meta_atenciones` | Sí | Horas semanales |
| `cod_esp` | Para recalcular | KI, AS, ULAB, UEDA… (busca % y factor grupal) |
| `semanas`, `sem_habiles` | Para recalcular | Semanas del mes y semanas hábiles reales de la persona |
| `h_asignaciones`, `colacion_contrato_h` | Para recalcular | Horas semanales |
| `plan_dir`, `plan_total`, `meta_dir`, `meta_total`, `tramo`, `ba`… | Opcional | Si se recalcula, los pone el motor |
| `atenciones_sic` | Opcional | `null` mientras no haya SIC |

Si a una fila le falta `sem_habiles`, se muestran los valores de Blue Prism sin recalcular.

**`bitacora.json`** = lista de eventos: `id`, `fecha`, `id_profesional`, `tipo` (alta, baja,
cambio_jornada, cambio_cargo, cambio_vigencia, reemplazo), `campo`, `valor_anterior`, `valor_nuevo`,
`vigencia_desde`, `quien`, `por_que`.

## Parámetros y recálculo

La pantalla **Parámetros** edita 7 módulos: distribución por cargo y tramo (con variantes por área y
límites de tramo), minutos estándar, asignaciones especiales, atención grupal, feriados y días,
jornada legal y meta, y ajustes por profesional (excepciones con quién y por qué).

- Mientras editas, una **vista previa** recalcula la meta nacional antes de guardar.
- Al guardar (`server/api/parametros.put.ts`) se escribe `parametros.json` en el Blob, una copia en
  `historico/` y una entrada en el historial, que aparece en la bitácora.
- Si `parametros.json` aún no existe, se usa `data/parametros.base.json` (carga inicial desde la planilla).

El motor (`utils/motor.ts`) sigue la lógica de cálculo documentada por Javiera (`logica.md`) y reproduce la planilla de Teletón en
un **99,5%** de las celdas (432 de 455 profesionales idénticos; las diferencias son los ajustes
manuales y datos viejos documentados). Para revalidarlo: `scripts/validar_motor/README.md`.

## Publicar en Vercel

1. vercel.com → **Add New → Project** → importa `HanniJaviera/Blueton`. Root Directory `./`; Nuxt se detecta solo.
2. En **Settings → Environment Variables** agrega las variables de la tabla (las dos secretas marcadas como *Sensitive*).
3. **Deploy.** Cada push a `main` se publica solo. Si cambias una variable, haz **Redeploy**.
4. Registra la URL de producción (`https://blueton-three.vercel.app`):
   - Google Cloud → *Clientes* → orígenes de JavaScript (sin `/`) y URI de redireccionamiento (con `/`).
   - Azure → *App registrations* → Blueton → *Authentication* → Redirect URIs, plataforma Web (con `/`).

## Estructura

```
pages/            graficos, nacional, instituto, profesional, parametros, mi-planificacion, index (login)
components/       KPIs, tablas, gráficos SVG, filtros, bitácora, lectura fácil
composables/      useDatosBlob (descarga y recalcula), usePlanificacion, useIndicadores,
                  useDetalleProfesional, useParametros, useSesion (login), useRol
utils/motor.ts    cálculo de la planificación (port de logica.md)
data/             parametros.base.json (reglas iniciales desde la planilla)
server/api/       parametros.put.ts (guarda en el Blob) + endpoints mock para desarrollo
mocks/            datos de prueba (solo sin Blob configurado)
scripts/          validar_motor: compara el motor contra la planilla
```

## Datos sensibles

- Los Excel del kit y cualquier archivo con datos del personal **no van al repo** (`*.xlsx` y
  `fixture.json` están en `.gitignore`). El repositorio es público.
- Las SAS y los secretos van en `.env` (local) o en las variables de Vercel, nunca en el código.

## Alcance futuro

- Inicio de sesión corporativo: tenant de Entra ID de Teletón y roles desde grupos o App Roles de Entra.
- Validar el token en el servidor (Azure Static Web Apps o una API) antes de guardar parámetros.
- Cruce correo ↔ `id_profesional` cuando el BUK traiga correos, para que el trabajador vea su ficha directo.
- Integración con SIC para el realizado real.
