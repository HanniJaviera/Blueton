// Descarga UNA vez planificacion.json, bitacora.json y parametros.json del
// Azure Blob y los deja en memoria. Cada fila de Blue Prism se recalcula con
// los parámetros vigentes (utils/motor.ts); los composables filtran y suman
// en el navegador. Sin NUXT_PUBLIC_BLOB_URL usa los mocks de server/api.
import type { FilaPlanificacion, EventoBitacora } from '~/stores/planificacion'
import parametrosBase from '~/data/parametros.base.json'

export interface DatosBlob {
  sin_datos: boolean // true si Blue Prism aún no subió planificacion.json
  generado_en: string | null
  lote_id: string | null
  filas: FilaPlanificacion[]
  bitacora: EventoBitacora[]
  parametros: any
}

// ponytail: caché de módulo para toda la sesión; datos nuevos = recargar o invalidar().
let cache: Promise<DatosBlob> | null = null

/** Aplica el motor a todas las filas, agrupadas por profesional + instituto. */
export function recalcular(filas: any[], parametros: any): any[] {
  const grupos = new Map<string, any[]>()
  for (const f of filas) {
    const k = `${f.id_profesional}|${f.instituto}`
    grupos.set(k, [...(grupos.get(k) || []), f])
  }
  const salida: any[] = []
  for (const fs of grupos.values()) {
    const r = calcularProfesional(parametros, fs)
    if (!r) { salida.push(...fs); continue } // faltan insumos: se muestran los valores de Blue Prism
    const porMes = new Map(r.meses.map((m) => [m.mes, m]))
    for (const f of fs) {
      const m = porMes.get(Number(String(f.mes).slice(5, 7)))!
      const t = (m.mes <= 4 ? r.tasas.p1 : r.tasas.p2)!
      salida.push({
        ...f,
        meta_bp: f.meta_atenciones, // lo que calculó Blue Prism, para comparar
        horas_directa: m.horas_directa, horas_indirecta: m.horas_indirecta, horas_nas: m.horas_nas,
        semanas: m.semanas, sem_habiles: m.sem_habiles,
        plan_dir: m.plan_dir, plan_total: m.plan_total, meta_dir: m.meta_dir, meta_total: m.meta_total,
        meta_atenciones: m.meta_total,
        tramo: r.tramo, pct_nas: r.reparto.nas, pct_directo: r.reparto.dir, pct_indirecto: r.reparto.ind,
        min_directa: r.min_dir, min_indirecta: r.min_ind, h_nas: r.h_nas, h_asignaciones: r.h_asignaciones,
        pct_grupal: r.pct_grupal, n_pacientes: r.n_pacientes,
        at: t.at, au: t.au, av: t.av, ba: t.ba, bb: t.bb, bf: t.bf, bh: t.bh,
        ajustes: r.ajustes, recalculado: true,
      })
    }
  }
  return salida
}

export function useDatosBlob() {
  const { blobUrl, blobSas, apiBase } = useRuntimeConfig().public

  async function leer(nombre: 'planificacion' | 'bitacora'): Promise<any> {
    const url = blobUrl ? `${blobUrl}/${nombre}.json?${blobSas}` : `${apiBase}/${nombre}`
    const r = await fetch(url, { cache: 'no-store' })
    // 404 = Blue Prism aún no publica ese archivo: se muestra vacío, no es un error.
    if (r.status === 404) return nombre === 'planificacion' ? { filas: [], sin_datos: true } : []
    if (!r.ok) throw new Error(`No se pudo leer ${nombre}.json (HTTP ${r.status})`)
    return r.json()
  }

  /** parametros.json del blob (lo guarda la pantalla Parámetros); si aún no existe, la carga inicial del Excel. */
  async function leerParametros(): Promise<any> {
    if (!blobUrl) return structuredClone(parametrosBase)
    const r = await fetch(`${blobUrl}/parametros.json?${blobSas}`, { cache: 'no-store' })
    if (r.status === 404) return structuredClone(parametrosBase)
    if (!r.ok) throw new Error(`No se pudo leer parametros.json (HTTP ${r.status})`)
    return r.json()
  }

  function cargarDatos(): Promise<DatosBlob> {
    cache ||= Promise.all([leer('planificacion'), leer('bitacora'), leerParametros()])
      .then(([p, b, parametros]) => {
        const filas = (Array.isArray(p) ? p : p?.filas ?? []).map((f: any) => ({
          ...f,
          id_profesional: String(f.id_profesional),
          mes: String(f.mes),
          atenciones_sic: f.atenciones_sic ?? null,
        }))
        // Los cambios de parámetros entran a la bitácora junto con los del BUK.
        const cambiosParametros = (parametros.historial ?? []).flatMap((h: any, i: number) =>
          (h.cambios ?? []).map((c: any, j: number) => ({
            id: `P${i}-${j}`, fecha: h.fecha, id_profesional: c.id_profesional ?? '—',
            tipo: 'cambio_parametro', campo: `${c.modulo}: ${c.campo}`,
            valor_anterior: c.antes, valor_nuevo: c.despues, vigencia_desde: h.fecha?.slice(0, 10),
            quien: h.quien, por_que: h.por_que,
          }))
        )
        return {
          sin_datos: !!p?.sin_datos,
          generado_en: p?.generado_en ?? null,
          lote_id: p?.lote_id ?? null,
          filas: recalcular(filas, parametros),
          bitacora: [...(Array.isArray(b) ? b : []), ...cambiosParametros]
            .map((e: any) => ({ ...e, id_profesional: String(e.id_profesional) }))
            .sort((x: any, y: any) => (x.fecha < y.fecha ? 1 : -1)),
          parametros,
        }
      })
      .catch((e) => {
        cache = null // que el próximo intento vuelva a descargar
        throw e
      })
    return cache
  }

  /** Tras guardar parámetros: la próxima carga vuelve a descargar y recalcular. */
  function invalidar() {
    cache = null
  }

  return { cargarDatos, invalidar }
}
