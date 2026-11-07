// Guarda parametros.json en el Azure Blob (lo usa la pantalla Parámetros).
// La SAS de ESCRITURA vive solo aquí (NUXT_BLOB_SAS_ESCRITURA, sin PUBLIC):
// nunca llega al navegador. Deja también una copia con fecha en historico/.
// El historial se toma del blob actual (no del cliente) para que no se pierda.
//
// ponytail: protege con una clave compartida (NUXT_PARAMETROS_CLAVE). El "quien"
// viene del login del navegador sin verificar; validar el id_token de Google /
// Microsoft aquí es el paso siguiente (alcance futuro).
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  const blobUrl = cfg.public.blobUrl
  if (!blobUrl || !cfg.blobSasEscritura) {
    throw createError({ statusCode: 503, statusMessage: 'Falta configurar NUXT_BLOB_SAS_ESCRITURA en el servidor.' })
  }

  const { parametros, cambios, quien, por_que, clave } = await readBody(event)
  if (cfg.parametrosClave && clave !== cfg.parametrosClave) {
    throw createError({ statusCode: 401, statusMessage: 'Clave de administrador incorrecta.' })
  }
  if (!parametros || !Array.isArray(parametros.distribucion) || !parametros.jornada_meta) {
    throw createError({ statusCode: 400, statusMessage: 'Parámetros con formato inválido.' })
  }
  if (!String(por_que || '').trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Indica por qué haces el cambio.' })
  }

  // Historial vigente desde el blob (si aún no existe parametros.json, parte vacío).
  let historial: any[] = []
  const actual = await fetch(`${blobUrl}/parametros.json?${cfg.public.blobSas}`, { cache: 'no-store' })
  if (actual.ok) historial = (await actual.json()).historial ?? []

  const fecha = new Date().toISOString()
  const nuevo = {
    ...parametros,
    version: Number(parametros.version || 0) + 1,
    actualizado_en: fecha,
    actualizado_por: String(quien || 'desconocido'),
    historial: [...historial, { fecha, quien: String(quien || 'desconocido'), por_que: String(por_que), cambios: cambios ?? [] }],
  }
  const cuerpo = JSON.stringify(nuevo)

  async function subir(nombre: string) {
    const r = await fetch(`${blobUrl}/${nombre}?${cfg.blobSasEscritura}`, {
      method: 'PUT',
      headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': 'application/json' },
      body: cuerpo,
    })
    if (!r.ok) throw createError({ statusCode: 502, statusMessage: `El Blob rechazó ${nombre} (HTTP ${r.status}).` })
  }
  await subir('parametros.json')
  await subir(`historico/parametros_${fecha.slice(0, 16).replace(/[:T]/g, '-')}.json`)

  return { ok: true, version: nuevo.version, actualizado_en: fecha }
})
