// Cache de los datos cargados desde /planificacion, /indicadores y
// /bitacora, para que las distintas vistas no vuelvan a pedirlos si
// ya están en memoria con el mismo filtro.
import { defineStore } from 'pinia'

export interface FilaPlanificacion {
  id_profesional: string
  nombre: string
  instituto: string
  area: string
  cargo: string
  mes: string
  horas_contratadas: number
  horas_directa: number
  horas_indirecta: number
  horas_nas: number
  meta_atenciones: number
  atenciones_sic: number
}

export interface EventoBitacora {
  id: string
  fecha: string
  id_profesional: string
  campo: string
  valor_anterior: unknown
  valor_nuevo: unknown
  vigencia_desde: string
  tipo: string
  quien: string
  por_que: string
}

interface PlanificacionState {
  filas: FilaPlanificacion[]
  bitacora: EventoBitacora[]
  cargando: boolean
  error: string | null
}

export const usePlanificacionStore = defineStore('planificacion', {
  state: (): PlanificacionState => ({
    filas: [],
    bitacora: [],
    cargando: false,
    error: null,
  }),

  getters: {
    // Desviación planificado vs SIC, para la alerta.
    desviaciones: (state) =>
      state.filas
        .map((f) => ({
          ...f,
          desviacion_pct: f.meta_atenciones
            ? (f.atenciones_sic - f.meta_atenciones) / f.meta_atenciones
            : 0,
        }))
        .filter((f) => Math.abs(f.desviacion_pct) > 0.1),

    porInstituto: (state) => {
      const grupos: Record<string, FilaPlanificacion[]> = {}
      for (const f of state.filas) {
        grupos[f.instituto] ||= []
        grupos[f.instituto].push(f)
      }
      return grupos
    },
  },

  actions: {
    setFilas(filas: FilaPlanificacion[]) {
      this.filas = filas
    },
    setBitacora(eventos: EventoBitacora[]) {
      this.bitacora = eventos
    },
  },
})
