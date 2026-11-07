// Imita GET /indicadores. Devuelve el bloque nacional completo, o el
// de un profesional puntual si llega ?id_profesional=.
import data from '~/mocks/indicadores.json'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  if (query.id_profesional) {
    const row = (data.por_profesional as Record<string, any>)[query.id_profesional as string]
    return row || null
  }
  return data.nacional
})
