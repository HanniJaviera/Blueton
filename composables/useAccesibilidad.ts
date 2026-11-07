// Preferencias de lectura: letra grande y alto contraste. Se guardan en cookies
// (las lee también el servidor, así la página no parpadea al recargar) y se
// aplican como clases en <html> desde app.vue. Estilos en assets/css/main.css.
export function useAccesibilidad() {
  const opciones = { sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 365 }
  const letraGrande = useCookie<boolean>('letra_grande', { ...opciones, default: () => false })
  const altoContraste = useCookie<boolean>('alto_contraste', { ...opciones, default: () => false })
  return { letraGrande, altoContraste }
}
