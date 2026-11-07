// Reglas parametrizables (7 módulos). Se leen de parametros.json en el Blob
// (o de la carga inicial del Excel) y se guardan vía /api/parametros, que
// escribe en el Blob y registra quién, qué y por qué. El dashboard recalcula
// todo con ellas (utils/motor.ts).

export const MODULOS: Record<string, string> = {
  tramos: 'Límites de tramo',
  distribucion: 'Distribución y minutos por cargo',
  asignaciones: 'Asignaciones especiales',
  grupal: 'Atención grupal',
  calendario: 'Feriados y días',
  jornada_meta: 'Jornada legal y meta',
  ajustes: 'Ajuste por profesional',
}

// Clave estable de cada elemento de una lista, para comparar antes/después.
const claveDe = (x: any, i: number) =>
  x?.cargo ?? x?.nombre ?? x?.area ?? x?.fecha ?? (x?.id_profesional ? `${x.id_profesional} ${x.campo}` : i)

function aplanar(v: any, ruta: string, out: Record<string, unknown>) {
  if (Array.isArray(v)) v.forEach((x, i) => aplanar(x, `${ruta}[${claveDe(x, i)}]`, out))
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) aplanar(v[k], ruta ? `${ruta}.${k}` : k, out)
  else out[ruta] = v
}

/** Lista de cambios campo a campo entre dos versiones de los parámetros. */
export function diferencias(antes: any, despues: any) {
  const cambios: { modulo: string; campo: string; antes: unknown; despues: unknown; id_profesional?: string }[] = []
  for (const modulo of Object.keys(MODULOS)) {
    const a: Record<string, unknown> = {}
    const d: Record<string, unknown> = {}
    aplanar(antes?.[modulo], '', a)
    aplanar(despues?.[modulo], '', d)
    for (const campo of new Set([...Object.keys(a), ...Object.keys(d)])) {
      if (JSON.stringify(a[campo]) !== JSON.stringify(d[campo])) {
        const id = modulo === 'ajustes' ? campo.match(/^\[(\d+)/)?.[1] : undefined
        cambios.push({ modulo: MODULOS[modulo], campo: campo || modulo, antes: a[campo] ?? null, despues: d[campo] ?? null, ...(id ? { id_profesional: id } : {}) })
      }
    }
  }
  return cambios
}

export function useParametros() {
  const { cargarDatos, invalidar } = useDatosBlob()
  const { usuario } = useSesion()

  async function obtener() {
    return structuredClone((await cargarDatos()).parametros)
  }

  async function guardar(parametros: any, opciones: { original: any; por_que: string; clave: string }) {
    const cambios = diferencias(opciones.original, parametros)
    if (!cambios.length) throw new Error('No hay cambios que guardar.')
    try {
      const r = await $fetch<{ ok: boolean; version: number }>('/api/parametros', {
        method: 'PUT',
        body: {
          parametros, cambios, por_que: opciones.por_que, clave: opciones.clave,
          quien: usuario.value ? `${usuario.value.nombre} (${usuario.value.correo})` : 'Administrador (sin login)',
        },
      })
      invalidar() // la próxima vista vuelve a descargar y recalcula con lo nuevo
      return { ...r, cambios: cambios.length }
    } catch (e: any) {
      throw new Error(e?.data?.statusMessage || e?.statusMessage || e?.message || 'No se pudo guardar.')
    }
  }

  return { obtener, guardar }
}
