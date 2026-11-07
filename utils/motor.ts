// Motor de la Planificación Asistencial, portado de docs/logica.md (Javiera).
// Recalcula tasas, atenciones y metas de UN profesional en UN instituto a partir
// de sus filas mensuales de planificacion.json y de los parámetros editables.
// Validado contra Dotacion_Asistencial: ver scripts/validar_motor (fuera del repo).

export type Tramo = 'alto' | 'medio' | 'bajo'
export interface Reparto { dir: number; ind: number; nas: number }

const EPS = 1e-9
const trunc = (x: number) => Math.floor(x + EPS) // TRUNCAR con epsilon: 36 × 4,2 = 151,2000001
const redondear1 = (x: number) => Math.round(x * 10 + EPS) / 10
const redondearArriba1 = (x: number) => Math.ceil(x * 10 - EPS) / 10
const num = (v: unknown) => Number(v) || 0

/** Semanas del mes = REDONDEAR((días hábiles − feriados hábiles) / 5; 1). Feriado colectivo no cuenta: va como vacaciones de cada persona. */
export function semanasDelMes(p: any, mes: number, instituto = ''): number {
  const anio = p.calendario?.anio ?? 2026
  const feriados = new Set(
    (p.calendario?.feriados ?? [])
      .filter((f: any) => f.tipo !== 'colectivo' && (!f.region || esInstituto(instituto, f.region)))
      .map((f: any) => f.fecha)
  )
  let habiles = 0
  const dias = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
  for (let d = 1; d <= dias; d++) {
    const fecha = new Date(Date.UTC(anio, mes - 1, d))
    const dow = fecha.getUTCDay()
    if (dow !== 0 && dow !== 6 && !feriados.has(fecha.toISOString().slice(0, 10))) habiles++
  }
  return redondear1(habiles / 5)
}

function esInstituto(instituto: string, codigo: string) {
  return instituto.toLowerCase().startsWith(codigo.toLowerCase().slice(0, 3))
}

export function tramoDe(p: any, x: number): Tramo {
  if (x >= num(p.tramos?.alto_desde ?? 40)) return 'alto'
  if (x >= num(p.tramos?.medio_desde ?? 22)) return 'medio'
  return 'bajo'
}

/** Busca "CARGO ÁREA" y, si no existe, "CARGO" en la matriz Distribucion_NAC. */
export function buscarDistribucion(p: any, cargo: string, area: string) {
  const c = (cargo || '').trim().toUpperCase()
  const lista: any[] = p.distribucion ?? []
  return lista.find((d) => d.cargo.toUpperCase() === `${c} ${(area || '').toUpperCase()}`)
    ?? lista.find((d) => d.cargo.toUpperCase() === c)
    ?? null
}

export interface ResultadoMes {
  mes: number
  semanas: number
  sem_habiles: number
  horas_directa: number
  horas_indirecta: number
  horas_nas: number
  plan_dir: number
  plan_total: number
  meta_dir: number
  meta_total: number
}

export interface ResultadoProfesional {
  x: number
  tramo: Tramo
  reparto: Reparto
  min_dir: number
  min_ind: number
  h_nas: number
  h_asignaciones: number
  pct_grupal: number
  n_pacientes: number | null
  tasas: Record<'p1' | 'p2', { h: number; base: number; at: number; au: number; av: number; ax: number; ba: number; bb: number; bf: number; bh: number } | null>
  meses: ResultadoMes[]
  ajustes: string[] // campos sobrescritos por persona (módulo 7)
}

/**
 * filas: las de un mismo id_profesional + instituto (una por mes con vigencia).
 * Campos usados: mes, horas_contratadas, sem_habiles, semanas?, cargo, area|cod_esp,
 * instituto, colacion_contrato_h?, h_asignaciones? | asignaciones?[{nombre, horas}].
 * Devuelve null si faltan semanas hábiles (entonces se usan los valores de Blue Prism).
 */
export function calcularProfesional(p: any, filas: any[]): ResultadoProfesional | null {
  const porMes = new Map<number, any>()
  for (const f of filas) porMes.set(Number(String(f.mes).slice(5, 7)), f)
  const meses = [...porMes.keys()].sort((a, b) => a - b)
  if (!meses.length || meses.some((m) => porMes.get(m).sem_habiles == null)) return null

  const f0 = porMes.get(meses[0])
  const id = String(f0.id_profesional)
  const area = String(f0.cod_esp ?? f0.area ?? '')
  const instituto = String(f0.instituto ?? '')
  const h = (m: number) => num(porMes.get(m)?.horas_contratadas)
  const promedio = (ms: number[]) => (ms.length ? ms.reduce((a, m) => a + h(m), 0) / ms.length : 0)

  // Ajustes por persona (módulo 7): el último registrado por campo manda.
  const aj: Record<string, any> = {}
  for (const a of p.ajustes ?? []) if (String(a.id_profesional) === id) aj[a.campo] = a.valor

  // Paso 1-2: X anual, tramo y reparto.
  const x = trunc(promedio(meses))
  const tramo = tramoDe(p, x)
  const dist = buscarDistribucion(p, f0.cargo, area)
  const reparto: Reparto = aj.distribucion ?? dist?.[tramo] ?? { dir: 0, ind: 0, nas: 0 }
  const minDir = num(aj.min_dir ?? dist?.min_dir)
  const minInd = num(aj.min_ind ?? dist?.min_ind)

  // Paso 3: NAS (anual) y asignaciones.
  const hNas = reparto.nas * x
  const catalogo = new Map((p.asignaciones?.catalogo ?? []).map((a: any) => [a.nombre, a]))
  const asig = Array.isArray(f0.asignaciones)
    ? f0.asignaciones.reduce((s: number, a: any) => {
        const c: any = catalogo.get(a.nombre)
        return s + (c && c.activa === false ? 0 : num(c?.horas || a.horas))
      }, 0)
    : num(f0.h_asignaciones)
  const hAsig = aj.h_asignaciones != null ? num(aj.h_asignaciones) : asig
  const colacion = num(f0.colacion_contrato_h)

  // Factor grupal por área.
  const g = (p.grupal ?? []).find((x: any) => String(x.area).toUpperCase() === area.toUpperCase())
  const pctGrupal = num(g?.pct)
  const pacientes = g ? (/^(san|con)/i.test(instituto) ? num(g.pacientes_san_con) : num(g.pacientes_otros)) : null

  // Paso 4: tasa semanal por periodo (P1 ene-abr, P2 may-dic).
  const tasa = (ms: number[]) => {
    if (!ms.length) return null
    const hp = promedio(ms)
    const base = hp - colacion
    if (base <= 0) return { h: hp, base, at: 0, au: 0, av: 0, ax: 0, ba: 0, bb: 0, bf: 0, bh: 0 }
    const at = (hNas + hAsig) / base
    const suma = reparto.dir + reparto.ind
    const au = suma ? (reparto.dir * (1 - at)) / suma : 0
    const av = suma ? (reparto.ind * (1 - at)) / suma : 0
    const ba = aj.ba != null ? num(aj.ba) : minDir ? trunc((base * au * 60) / minDir) : 0
    const bb = minInd ? trunc((base * av * 60) / minInd) : 0
    const bf = ba * (1 - pctGrupal) + ba * pctGrupal * (pacientes ?? 0)
    return { h: hp, base, at, au, av, ax: base * (au + av), ba, bb, bf, bh: bf + bb }
  }
  const tasas = { p1: tasa(meses.filter((m) => m <= 4)), p2: tasa(meses.filter((m) => m >= 5)) }

  // Pasos 5-6: semanas hábiles y planificación mensual.
  const pctMeta = num(p.jornada_meta?.pct_meta ?? 0.9)
  const arriba = new Set<number>(p.calendario?.redondeo_arriba_meses ?? [5, 7])
  const resultado: ResultadoMes[] = meses.map((m) => {
    const fila = porMes.get(m)
    const t = (m <= 4 ? tasas.p1 : tasas.p2)!
    const semanas = semanasDelMes(p, m, instituto)
    // Si el calendario no cambió, se usan las semanas hábiles de Blue Prism tal cual;
    // si cambió, se conserva el descuento personal (licencias, vacaciones, etc.).
    let sh = num(fila.sem_habiles)
    if (fila.semanas != null && Math.abs(num(fila.semanas) - semanas) > EPS && num(fila.semanas) > 0) {
      const crudo = semanas - (num(fila.semanas) - sh)
      sh = Math.max(0, arriba.has(m) ? redondearArriba1(crudo) : crudo)
    }
    const planDir = trunc(t.bf * sh)
    const planTotal = trunc(t.bh * sh)
    const hDir = t.base > 0 ? t.base * t.au : 0
    const hInd = t.base > 0 ? t.base * t.av : 0
    return {
      mes: m, semanas, sem_habiles: sh,
      horas_directa: hDir, horas_indirecta: hInd, horas_nas: Math.max(0, h(m) - hDir - hInd),
      plan_dir: planDir, plan_total: planTotal,
      meta_dir: trunc(planDir * pctMeta), meta_total: trunc(planTotal * pctMeta),
    }
  })

  return {
    x, tramo, reparto, min_dir: minDir, min_ind: minInd, h_nas: hNas, h_asignaciones: hAsig,
    pct_grupal: pctGrupal, n_pacientes: pacientes, tasas, meses: resultado, ajustes: Object.keys(aj),
  }
}
