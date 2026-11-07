// Imita GET /planificacion del backend real (Samuel, FastAPI).
// Soporta los mismos filtros que usará el dashboard: instituto, area,
// cargo, mes, id_profesional. Cuando exista la API real, este archivo
// deja de usarse — solo cambia NUXT_PUBLIC_API_BASE en nuxt.config.ts.
//
// Con ?persona_id=ID devuelve el DETALLE mensual de un profesional
// (planificación mes a mes, meta y tasas P1/P2), igual que la API real.
// Lo usa composables/useDetalleProfesional.ts.
import data from '~/mocks/planificacion.json'
import detalles from '~/mocks/detalle_profesional.json'

// En los mocks, P0123 (kinesiólogo 44 → 42 h desde mayo) muestra el caso 71580.
const ALIAS: Record<string, string> = { P0123: '71580' }

export default defineEventHandler((event) => {
  const query = getQuery(event)

  if (query.persona_id) {
    const id = String(query.persona_id)
    const detalle = (detalles as Record<string, unknown>)[ALIAS[id] || id]
    if (!detalle || id.startsWith('_')) {
      throw createError({ statusCode: 404, statusMessage: `Sin detalle para ${id}` })
    }
    return detalle
  }

  let rows = data as any[]

  if (query.instituto) rows = rows.filter((r) => r.instituto === query.instituto)
  if (query.area) rows = rows.filter((r) => r.area === query.area)
  if (query.cargo) rows = rows.filter((r) => r.cargo === query.cargo)
  if (query.mes) rows = rows.filter((r) => r.mes === query.mes)
  if (query.id_profesional) rows = rows.filter((r) => r.id_profesional === query.id_profesional)

  return rows
})
