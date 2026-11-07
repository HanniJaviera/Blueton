// Imita GET /parametros (editor de reglas: % por cargo/tramo, minutos
// estándar, asignaciones especiales, calendario, % grupal, % de meta).
import data from '~/mocks/parametros.json'

export default defineEventHandler(() => data)
