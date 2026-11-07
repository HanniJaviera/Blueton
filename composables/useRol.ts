// Rol elegido en la pantalla de inicio y, para el trabajador, su propio ID.
// Se guarda en cookies para que lo lea también el middleware (servidor y navegador).
// OJO: esto separa las vistas en la demo, pero NO es seguridad real: cuando
// exista la API real, el backend debe validar quién es cada usuario (login/SSO).
export type Rol = 'admin' | 'trabajador'

export function useRol() {
  const opciones = { sameSite: 'lax' as const, maxAge: 60 * 60 * 12 } // 12 horas
  const rol = useCookie<Rol | null>('rol', { ...opciones, default: () => null })
  const miId = useCookie<string | null>('mi_id', { ...opciones, default: () => null })

  function elegir(r: Rol) {
    rol.value = r
    if (r === 'admin') miId.value = null
  }
  function salir() {
    rol.value = null
    miId.value = null
    useSesion().cerrar()
    return navigateTo('/')
  }
  return { rol, miId, elegir, salir }
}
