// Rol elegido en la pantalla de inicio y, para el trabajador, su propio ID.
// Se guarda en cookies para que lo lea también el middleware (servidor y navegador).
// OJO: esto separa las vistas en la demo, pero NO es seguridad real: cuando
// exista la API real, el backend debe validar quién es cada usuario (login/SSO).
export type Rol = 'admin' | 'trabajador'

export function useRol() {
  const opciones = { sameSite: 'lax' as const, maxAge: 60 * 60 * 12 } // 12 horas
  const rol = useCookie<Rol | null>('rol', { ...opciones, default: () => null })
  // El ID va SIEMPRE como texto: por defecto Nuxt convierte "71580" en número al leer la
  // cookie, y el middleware veía "71580" !== 71580 → redirección infinita con IDs del BUK.
  const miId = useCookie<string | null>('mi_id', {
    ...opciones,
    default: () => null,
    decode: (v) => decodeURIComponent(v),
    encode: (v) => encodeURIComponent(String(v)),
  })

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
