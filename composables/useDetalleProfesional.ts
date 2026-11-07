// Detalle mes a mes de un profesional (planificación, meta y cómo se
// calculó la tasa semanal), armado en el navegador desde sus filas de
// planificacion.json (blob). Los campos opcionales del contrato
// (plan_*, tramo, pct_*, ba/bb/bf/bh...) llenan la ficha si vienen.

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

const num = (v: unknown) => Number(v) || 0
const sumaDe = (fs: any[], k: string) => fs.reduce((a, f) => a + num(f[k]), 0)

/** Tasa de un periodo desde sus filas (Blue Prism repite ba/bb/bf/bh en cada mes del periodo). */
function tasaPeriodo(porMes: any[][]): TasaPeriodo | null {
  if (!porMes.length) return null
  const prom = (k: string) => porMes.reduce((a, fs) => a + sumaDe(fs, k), 0) / porMes.length
  const p = porMes[0]
  const h = prom('horas_contratadas')
  const ax = prom('horas_directa') + prom('horas_indirecta')
  return {
    h,
    base: h, // ponytail: el JSON no trae colación de contrato; base = horas
    // at/au/av los entrega el motor (utils/motor.ts); si no, se aproximan.
    at: p[0].at ?? (h ? (h - ax) / h : 0),
    au: p[0].au ?? num(p[0].pct_directo),
    av: p[0].av ?? num(p[0].pct_indirecto),
    ax,
    ba: sumaDe(p, 'ba'),
    bb: sumaDe(p, 'bb'),
    bf: sumaDe(p, 'bf'),
    bh: sumaDe(p, 'bh'),
  }
}

/** Arma la ficha mes a mes desde las filas de planificacion.json de UN profesional. */
export function armarDetalle(filas: any[]): DetalleProfesional {
  const porMes = new Map<number, any[]>()
  for (const f of filas) {
    const m = Number(String(f.mes).slice(5, 7))
    porMes.set(m, [...(porMes.get(m) || []), f])
  }
  const mesesOrd = [...porMes.keys()].sort((a, b) => a - b)
  const f0 = filas[0]
  const primero = (k: string) => filas.find((f) => f[k] != null)?.[k]
  const mesTxt = (m: number) => `${String(f0.mes).slice(0, 4)}-${String(m).padStart(2, '0')}`

  return {
    profesional: {
      persona_id: f0.id_profesional,
      nombre: f0.nombre ?? null,
      cargo: f0.cargo,
      area: f0.area,
      instituto: [...new Set(filas.map((f) => f.instituto))].join(' / '),
      ndias: num(primero('ndias')), // opcional: Blue Prism puede agregarlo
      vigencia_desde: mesTxt(mesesOrd[0]),
      vigencia_hasta: mesTxt(mesesOrd[mesesOrd.length - 1]),
    },
    parametros: {
      clave_distribucion: `${f0.cargo} + ${f0.area}`,
      tramo: primero('tramo') ?? '—',
      pct_nas: num(primero('pct_nas')),
      pct_directo: num(primero('pct_directo')),
      pct_indirecto: num(primero('pct_indirecto')),
      min_directa: num(primero('min_directa')),
      min_indirecta: num(primero('min_indirecta')),
      h_nas: num(primero('h_nas') ?? primero('horas_nas')),
      h_asignaciones: num(primero('h_asignaciones')),
      pct_grupal: num(primero('pct_grupal')),
      n_pacientes: primero('n_pacientes') ?? null,
      pct_meta: 0.9,
    },
    tasas: {
      p1: tasaPeriodo(mesesOrd.filter((m) => m <= 4).map((m) => porMes.get(m)!)),
      p2: tasaPeriodo(mesesOrd.filter((m) => m >= 5).map((m) => porMes.get(m)!)),
    },
    meses: mesesOrd.map((m) => {
      const fs = porMes.get(m)!
      // Multi-instituto: las atenciones se suman; semanas son del calendario (no se suman).
      const meta = fs.reduce((a, f) => a + num(f.meta_total ?? f.meta_atenciones), 0)
      return {
        mes: m,
        horas: sumaDe(fs, 'horas_contratadas'),
        semanas: num(fs[0].semanas),
        sem_habiles: num(fs[0].sem_habiles),
        // ponytail: plan_* y meta_dir son opcionales (prioridad 1); sin ellos se muestra 0 / la meta.
        plan_dir: sumaDe(fs, 'plan_dir'),
        plan_total: sumaDe(fs, 'plan_total'),
        meta_dir: fs.reduce((a, f) => a + num(f.meta_dir ?? f.meta_atenciones), 0),
        meta_total: meta,
      }
    }),
  }
}

export function useDetalleProfesional() {
  const { cargarDatos } = useDatosBlob()
  const detalle = ref<DetalleProfesional | null>(null)
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargar(personaId: string) {
    cargando.value = true
    error.value = null
    try {
      const { filas } = await cargarDatos()
      const propias = filas.filter((f) => f.id_profesional === String(personaId))
      detalle.value = propias.length ? armarDetalle(propias) : null
      if (!detalle.value) error.value = 'No hay detalle mensual para este profesional.'
    } catch (e: any) {
      detalle.value = null
      error.value = e?.message || 'No se pudo cargar el detalle mensual.'
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
