// Descarga UNA vez planificacion.json y bitacora.json (los sube Blue Prism
// al Azure Blob) y los deja en memoria; los composables filtran y suman
// en el navegador. Sin NUXT_PUBLIC_BLOB_URL usa los mocks de server/api.
import type { FilaPlanificacion, EventoBitacora } from '~/stores/planificacion'

export interface DatosBlob {
  generado_en: string | null
  lote_id: string | null
  filas: FilaPlanificacion[]
  bitacora: EventoBitacora[]
}

// ponytail: caché de módulo para toda la sesión; datos nuevos = recargar la página.
let cache: Promise<DatosBlob> | null = null

export function useDatosBlob() {
  const { blobUrl, blobSas, apiBase } = useRuntimeConfig().public

  async function leer(nombre: 'planificacion' | 'bitacora'): Promise<any> {
    const url = blobUrl ? `${blobUrl}/${nombre}.json?${blobSas}` : `${apiBase}/${nombre}`
    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) throw new Error(`No se pudo leer ${nombre}.json (HTTP ${r.status})`)
    return r.json()
  }

  function cargarDatos(): Promise<DatosBlob> {
    cache ||= Promise.all([leer('planificacion'), leer('bitacora')])
      .then(([p, b]) => ({
        generado_en: p?.generado_en ?? null,
        lote_id: p?.lote_id ?? null,
        // El blob trae {generado_en, lote_id, filas}; el mock trae la lista directa.
        filas: (Array.isArray(p) ? p : p?.filas ?? []).map((f: any) => ({
          ...f,
          id_profesional: String(f.id_profesional),
          mes: String(f.mes),
          atenciones_sic: f.atenciones_sic ?? null,
        })),
        bitacora: (Array.isArray(b) ? b : [])
          .map((e: any) => ({ ...e, id_profesional: String(e.id_profesional) }))
          .sort((x: any, y: any) => (x.fecha < y.fecha ? 1 : -1)),
      }))
      .catch((e) => {
        cache = null // que el próximo intento vuelva a descargar
        throw e
      })
    return cache
  }

  return { cargarDatos }
}
