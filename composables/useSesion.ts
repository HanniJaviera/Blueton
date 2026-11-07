// Inicio de sesión con Google o Microsoft (OpenID Connect, sin librerías).
// El navegador va al proveedor, vuelve a "/" con #id_token=... y de ahí
// sacamos nombre, correo y dominio.
//
// Escala a cuenta corporativa SOLO con variables de entorno:
//  - NUXT_PUBLIC_MS_TENANT: "common" (personales + empresas) → "organizations"
//    (solo cuentas de empresa) → "<tenant-id de Teletón>" (solo Entra ID de Teletón).
//  - NUXT_PUBLIC_DOMINIOS_PERMITIDOS: "" (cualquiera) → "teleton.cl".
//  - Google: con un único dominio se envía hd=<dominio> (Google Workspace).
//
// OJO: el token se lee en el navegador SIN validar la firma. Separa vistas en
// la demo, pero no es seguridad real: en producción la firma se valida en un
// backend (o con la auth integrada de Azure Static Web Apps).

export type Proveedor = 'google' | 'microsoft'

export interface Usuario {
  nombre: string
  correo: string
  dominio: string
  proveedor: Proveedor
  tenant?: string // tid de Microsoft: identifica la organización en Entra ID
  exp: number // segundos epoch
}

const AUTORIZAR: Record<Proveedor, (tenant: string) => string> = {
  google: () => 'https://accounts.google.com/o/oauth2/v2/auth',
  microsoft: (t) => `https://login.microsoftonline.com/${t}/oauth2/v2.0/authorize`,
}

function leerJwt(token: string): any {
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    [...atob(b64)].map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  )
  return JSON.parse(json)
}

function guardarTemporal(k: string, v: string | null) {
  try {
    v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v)
  } catch { /* modo privado: el retorno fallará con un mensaje claro */ }
}
function leerTemporal(k: string) {
  try { return sessionStorage.getItem(k) } catch { return null }
}

export function useSesion() {
  const cfg = useRuntimeConfig().public
  const usuario = useCookie<Usuario | null>('usuario', { sameSite: 'lax', maxAge: 60 * 60 * 8, default: () => null })

  const dominios = computed(() =>
    String(cfg.dominiosPermitidos || '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
  )
  const clientId = (p: Proveedor) => String(p === 'google' ? cfg.googleClientId : cfg.msClientId || '')
  const disponible = (p: Proveedor) => !!clientId(p)
  // ponytail: sin ningún client ID configurado no se exige login (modo demo).
  const requiereLogin = computed(() => disponible('google') || disponible('microsoft'))

  function entrar(p: Proveedor) {
    const nonce = crypto.randomUUID()
    const state = `${p}.${crypto.randomUUID()}`
    guardarTemporal('oidc_nonce', nonce)
    guardarTemporal('oidc_state', state)
    const q = new URLSearchParams({
      client_id: clientId(p),
      redirect_uri: `${location.origin}/`,
      response_type: 'id_token',
      response_mode: 'fragment',
      scope: 'openid email profile',
      nonce,
      state,
      prompt: 'select_account',
    })
    if (p === 'google' && dominios.value.length === 1) q.set('hd', dominios.value[0])
    location.assign(`${AUTORIZAR[p](String(cfg.msTenant || 'common'))}?${q}`)
  }

  /** Llamar en onMounted de "/": procesa #id_token=... si venimos del proveedor. */
  function procesarRetorno(): string | null {
    if (!location.hash.includes('id_token=') && !location.hash.includes('error=')) return null
    const h = new URLSearchParams(location.hash.slice(1))
    history.replaceState(null, '', location.pathname) // sacar el token de la barra
    const stateEsperado = leerTemporal('oidc_state')
    const nonceEsperado = leerTemporal('oidc_nonce')
    guardarTemporal('oidc_state', null)
    guardarTemporal('oidc_nonce', null)

    if (h.get('error')) return h.get('error_description') || h.get('error')
    if (!stateEsperado || h.get('state') !== stateEsperado) return 'La respuesta de inicio de sesión no coincide. Intenta de nuevo.'

    const proveedor = stateEsperado.split('.')[0] as Proveedor
    const c = leerJwt(h.get('id_token') || '')
    if (c.nonce !== nonceEsperado || c.aud !== clientId(proveedor)) return 'Token no válido para esta aplicación.'
    if (c.exp * 1000 < Date.now()) return 'La sesión expiró. Intenta de nuevo.'

    const correo = String(c.email || c.preferred_username || '').toLowerCase()
    const dominio = correo.split('@')[1] || ''
    if (dominios.value.length && !dominios.value.includes(dominio)) {
      return `El dominio @${dominio} no tiene acceso. Usa tu cuenta de ${dominios.value.map((d) => '@' + d).join(' o ')}.`
    }
    usuario.value = { nombre: c.name || correo, correo, dominio, proveedor, tenant: c.tid, exp: c.exp }
    return null
  }

  function cerrar() {
    usuario.value = null
  }

  return { usuario, dominios, disponible, requiereLogin, entrar, procesarRetorno, cerrar }
}
