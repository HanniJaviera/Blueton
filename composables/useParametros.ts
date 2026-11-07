// Lee y edita las reglas parametrizables (% por cargo/tramo, minutos
// estándar, asignaciones especiales, calendario, % grupal, % de meta)
// sin tocar código — requisito obligatorio del desafío.
export function useParametros() {
  const config = useRuntimeConfig()

  async function obtener() {
    return $fetch<any>(`${config.public.apiBase}/parametros`)
  }

  async function guardar(parametros: any) {
    return $fetch<{ ok: boolean }>(`${config.public.apiBase}/parametros`, {
      method: 'PUT',
      body: parametros,
    })
  }

  return { obtener, guardar }
}
