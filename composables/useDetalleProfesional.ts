// Detalle mes a mes de un profesional (planificación, meta y cómo se
// calculó la tasa semanal). Llama a GET /planificacion?persona_id=ID,
// el mismo endpoint que ya responde la API FastAPI de Samuel con el
// detalle del profesional (ver docs/logica.md). Con los mocks locales
// lo sirve server/api/planificacion.get.ts desde mocks/detalle_profesional.json.

export interface TasaPeriodo {
  h: number      // horas semanales promedio del periodo
  base: number   // horas − colación de contrato
  at: number     // % NAS + asignaciones
  au: number     // % directo final
  av: number     // % indirecto final
  ax: number     // h/semana disponibles para atención
  ba: number     // atenciones directas por semana
  bb: number     // atenciones indirectas por semana
  bf: number     // directa + grupal por semana
  bh: number     // total por semana
}

export interface MesDetalle {
  mes: number            // 1..12
  horas: number
  semanas: number
  sem_habiles: number
  descuento_detalle?: string
  // Opcional, para la vista del trabajador: descuentos del mes en días.
  // tipo: permiso | vacaciones | licencia | cumpleanos | vispera | dias_anuales | feriado_zona
  descuentos?: { tipo: string; dias: number; nombre?: string }[]
  plan_dir: number
  plan_total: number
  meta_dir: number
  meta_total: number
}

export interface DetalleProfesional {
  profesional: {
    persona_id: string | number
    nombre?: string | null
    cargo: string
    area: string
    instituto: string
    ndias: number
    colacion_contrato_h?: number
    vigencia_desde: string // "2026-01"
    vigencia_hasta: string // "2026-12"
  }
  parametros: {
    clave_distribucion: string
    tramo: string
    pct_nas: number
    pct_directo: number
    pct_indirecto: number
    min_directa: number
    min_indirecta: number
    h_nas: number
    h_asignaciones: number
    pct_grupal: number
    n_pacientes: number | null
    pct_meta: number
    // Opcional, para la vista del trabajador: nombre y horas de cada asignación especial.
    asignaciones?: { nombre: string; horas: number }[]
  }
  tasas: { p1: TasaPeriodo | null; p2: TasaPeriodo | null }
  ultimo_mes_buk?: number
  meses: MesDetalle[]
}

export const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
export const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** Tasa que aplica a un mes: P1 = enero–abril, P2 = mayo–diciembre. */
export function tasaDelMes(d: DetalleProfesional, mes: number) {
  return mes <= 4 ? d.tasas.p1 : d.tasas.p2
}

export function useDetalleProfesional() {
  const config = useRuntimeConfig()
  const detalle = ref<DetalleProfesional | null>(null)
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargar(personaId: string) {
    cargando.value = true
    error.value = null
    try {
      const r = await $fetch<DetalleProfesional | unknown[]>(`${config.public.apiBase}/planificacion`, {
        params: { persona_id: personaId },
      })
      // Si el backend devolvió la lista de filas (otro formato), no hay detalle.
      detalle.value = r && !Array.isArray(r) && Array.isArray((r as DetalleProfesional).meses)
        ? (r as DetalleProfesional)
        : null
      if (!detalle.value) error.value = 'La API no devolvió el detalle mensual de este profesional.'
    } catch (e: any) {
      detalle.value = null
      error.value = e?.statusCode === 404
        ? 'No hay detalle mensual para este profesional.'
        : e?.message || 'No se pudo cargar el detalle mensual.'
    } finally {
      cargando.value = false
    }
  }

  const totales = computed(() => {
    const d = detalle.value
    if (!d) return null
    const s = (k: keyof MesDetalle) => d.meses.reduce((a, m) => a + (Number(m[k]) || 0), 0)
    const horasAtencion = d.meses.reduce((a, m) => a + (tasaDelMes(d, m.mes)?.ax ?? 0) * m.sem_habiles, 0)
    return {
      plan_dir: s('plan_dir'),
      plan_total: s('plan_total'),
      meta_dir: s('meta_dir'),
      meta_total: s('meta_total'),
      semanas: s('semanas'),
      sem_habiles: s('sem_habiles'),
      horas_atencion: horasAtencion,
    }
  })

  return { detalle, cargando, error, cargar, totales }
}
