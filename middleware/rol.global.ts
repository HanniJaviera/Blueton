// Controla qué páginas puede ver cada rol.
// - Sin sesión (si hay login configurado) o sin rol: solo la pantalla de inicio.
// - Trabajador: solo /mi-planificacion, y únicamente con su propio ID.
// - Administrador: todo.
export default defineNuxtRouteMiddleware((to) => {
  const { rol, miId } = useRol()

  if (to.path === '/') return

  // Con login configurado, sin sesión no se pasa de la portada.
  const { usuario, requiereLogin } = useSesion()
  if (requiereLogin.value && !usuario.value) return navigateTo('/')

  if (!rol.value) return navigateTo('/')

  if (rol.value === 'trabajador') {
    const esVistaTrabajador = to.path === '/mi-planificacion' || to.path.startsWith('/mi-planificacion/')
    if (!esVistaTrabajador) {
      return navigateTo(miId.value ? `/mi-planificacion/${encodeURIComponent(miId.value)}` : '/mi-planificacion')
    }
    const idRuta = to.params.id ? String(to.params.id) : null
    if (idRuta && miId.value && idRuta !== miId.value) {
      return navigateTo(`/mi-planificacion/${encodeURIComponent(miId.value)}`)
    }
    if (idRuta && !miId.value) miId.value = idRuta
  }
})
