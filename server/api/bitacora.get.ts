// Imita el endpoint de bitácora (quién/qué/cuándo/por qué).
// Filtra por profesional si se pide desde la ficha individual.
import data from '~/mocks/bitacora.json'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  let rows = data as any[]
  if (query.id_profesional) {
    rows = rows.filter((r) => r.id_profesional === query.id_profesional)
  }
  return rows.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
})
