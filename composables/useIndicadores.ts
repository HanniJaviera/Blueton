// Meta de Gestión Asistencial y % FOJA calculados en el navegador desde
// planificacion.json: FOJA = Σ horas_directa / Σ horas_contratadas,
// meta = Σ meta_atenciones de las filas filtradas.
import type { FilaPlanificacion } from '~/stores/planificacion'
import { useFiltrosStore } from '~/stores/filtros'

export interface IndicadorNacional {
  mes: string
  meta_gestion_total: number
  foja_promedio: number
  instituciones: { instituto: string; meta_gestion: number; foja: number }[]
}

export interface IndicadorProfesional {
  mes: string
  meta_gestion: number
  foja: number
}

function sumar(filas: FilaPlanificacion[]) {
  let meta = 0, dir = 0, cont = 0
  for (const f of filas) {
    meta += Number(f.meta_atenciones) || 0
    dir += Number(f.horas_directa) || 0
    cont += Number(f.horas_contratadas) || 0
  }
  return { meta, foja: cont ? dir / cont : 0 }
}

/** Indicadores de un conjunto de filas (ya filtradas por mes, etc.). */
export function calcularIndicadores(filas: FilaPlanificacion[], mes = ''): IndicadorNacional {
  const grupos = new Map<string, FilaPlanificacion[]>()
  for (const f of filas) grupos.set(f.instituto, [...(grupos.get(f.instituto) || []), f])
  const total = sumar(filas)
  return {
    mes,
    meta_gestion_total: total.meta,
    foja_promedio: total.foja,
    instituciones: [...grupos].map(([instituto, fs]) => {
      const s = sumar(fs)
      return { instituto, meta_gestion: s.meta, foja: s.foja }
    }),
  }
}

export function useIndicadores() {
  const filtros = useFiltrosStore()
  const { cargarDatos } = useDatosBlob()

  async function obtenerNacional() {
    const { filas } = await cargarDatos()
    const q = filtros.queryParams as Record<string, string>
    const fs = filas.filter(
      (f) =>
        f.mes === q.mes &&
        (!q.instituto || f.instituto === q.instituto) &&
        (!q.area || f.area === q.area) &&
        (!q.cargo || f.cargo === q.cargo)
    )
    return calcularIndicadores(fs, q.mes)
  }

  async function obtenerPorProfesional(idProfesional: string): Promise<IndicadorProfesional | null> {
    const { filas } = await cargarDatos()
    // Multi-instituto: se suman todas sus filas del mes.
    const fs = filas.filter((f) => f.id_profesional === idProfesional && f.mes === filtros.mes)
    if (!fs.length) return null
    const s = sumar(fs)
    return { mes: filtros.mes, meta_gestion: s.meta, foja: s.foja }
  }

  return { obtenerNacional, obtenerPorProfesional }
}
