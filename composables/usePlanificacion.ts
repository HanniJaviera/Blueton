// Filtra en el navegador las filas de planificacion.json (blob) según la
// barra de filtros, y trae la bitácora asociada.
import { usePlanificacionStore } from '~/stores/planificacion'
import { useFiltrosStore } from '~/stores/filtros'

export function usePlanificacion() {
  const store = usePlanificacionStore()
  const filtros = useFiltrosStore()
  const { cargarDatos } = useDatosBlob()

  async function cargar(idProfesional?: string) {
    store.cargando = true
    store.error = null
    try {
      const datos = await cargarDatos()
      const q = filtros.queryParams as Record<string, string>
      store.setFilas(
        datos.filas.filter(
          (f) =>
            (!idProfesional || f.id_profesional === idProfesional) &&
            (!q.mes || f.mes === q.mes) &&
            (!q.instituto || f.instituto === q.instituto) &&
            (!q.area || f.area === q.area) &&
            (!q.cargo || f.cargo === q.cargo)
        )
      )
      store.setBitacora(
        idProfesional ? datos.bitacora.filter((b) => b.id_profesional === idProfesional) : datos.bitacora
      )
    } catch (e: any) {
      store.error = e?.message || 'No se pudo cargar la planificación'
    } finally {
      store.cargando = false
    }
  }

  return { cargar, ...toRefs(store) }
}
