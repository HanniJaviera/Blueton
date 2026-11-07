// Controla qué páginas puede ver cada rol.
// - Sin rol: solo la pantalla de inicio (elige Administrador o Trabajador).
// - Trabajador: solo /mi-planificacion, y únicamente con su propio ID.
// - Administrador: todo.
export default defineNuxtRouteMiddleware((to) => {
  const { rol, miId } = useRol()

  if (to.path === '/') return

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
