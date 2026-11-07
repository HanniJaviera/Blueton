// Estado global de filtros: todas las vistas (nacional, instituto,
// profesional) leen y escriben aquí. Vive en un solo lugar para que
// cambiar un filtro en la barra se refleje en toda la pantalla activa.
import { defineStore } from 'pinia'

export type Periodo = '2026-01' | '2026-02' | '2026-03' | '2026-04' | '2026-05' | '2026-06' |
  '2026-07' | '2026-08' | '2026-09' | '2026-10' | '2026-11' | '2026-12'

interface FiltrosState {
  instituto: string | null
  area: string | null
  cargo: string | null
  tipoAtencion: 'directa' | 'indirecta' | 'nas' | null
  mes: Periodo
}

export const useFiltrosStore = defineStore('filtros', {
  state: (): FiltrosState => ({
    instituto: null,
    area: null,
    cargo: null,
    tipoAtencion: null,
    mes: '2026-05',
  }),

  getters: {
    // Período legal: la jornada baja de 44 a 42 horas desde mayo 2026.
    periodoLegal: (state) => (state.mes < '2026-05' ? '44h (ene-abr)' : '42h (may-dic)'),

    // Query lista para pasarle a los composables / endpoints.
    queryParams: (state) => {
      const q: Record<string, string> = { mes: state.mes }
      if (state.instituto) q.instituto = state.instituto
      if (state.area) q.area = state.area
      if (state.cargo) q.cargo = state.cargo
      return q
    },
  },

  actions: {
    setInstituto(v: string | null) {
      this.instituto = v
    },
    setArea(v: string | null) {
      this.area = v
    },
    setCargo(v: string | null) {
      this.cargo = v
    },
    setTipoAtencion(v: FiltrosState['tipoAtencion']) {
      this.tipoAtencion = v
    },
    setMes(v: Periodo) {
      this.mes = v
    },
    limpiar() {
      this.instituto = null
      this.area = null
      this.cargo = null
      this.tipoAtencion = null
    },
  },
})
