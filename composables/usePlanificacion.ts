// Llama a GET /planificacion (mock local o API real de Samuel, según
// runtimeConfig.public.apiBase) y además trae la bitácora asociada.
import { usePlanificacionStore } from '~/stores/planificacion'
import { useFiltrosStore } from '~/stores/filtros'

export function usePlanificacion() {
  const config = useRuntimeConfig()
  const store = usePlanificacionStore()
  const filtros = useFiltrosStore()

  async function cargar(idProfesional?: string) {
    store.cargando = true
    store.error = null
    try {
      const params = idProfesional
        ? { ...filtros.queryParams, id_profesional: idProfesional }
        : filtros.queryParams

      const filas = await $fetch<typeof store.filas>(`${config.public.apiBase}/planificacion`, {
        params,
      })
      store.setFilas(filas)

      const bitacora = await $fetch<typeof store.bitacora>(`${config.public.apiBase}/bitacora`, {
        params: idProfesional ? { id_profesional: idProfesional } : {},
      })
      store.setBitacora(bitacora)
    } catch (e: any) {
      store.error = e?.message || 'No se pudo cargar la planificación'
    } finally {
      store.cargando = false
    }
  }

  return { cargar, ...toRefs(store) }
}
