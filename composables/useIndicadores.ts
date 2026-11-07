// Llama a GET /indicadores: la Meta de Gestión Asistencial y el %
// FOJA, a nivel nacional/por instituto o para un profesional puntual.
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

export function useIndicadores() {
  const config = useRuntimeConfig()

  async function obtenerNacional() {
    return $fetch<IndicadorNacional>(`${config.public.apiBase}/indicadores`)
  }

  async function obtenerPorProfesional(idProfesional: string) {
    return $fetch<IndicadorProfesional | null>(`${config.public.apiBase}/indicadores`, {
      params: { id_profesional: idProfesional },
    })
  }

  return { obtenerNacional, obtenerPorProfesional }
}
