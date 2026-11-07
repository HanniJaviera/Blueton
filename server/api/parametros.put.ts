// Imita la edición de parámetros (PUT /parametros). En el mock solo
// devuelve lo recibido con un ok; la API real (Samuel) persistirá el
// cambio y registrará quién/cuándo/por qué en la bitácora.
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return { ok: true, actualizado: body }
})
