<template>
  <div class="graficos">
    <div class="cabecera">
      <div>
        <h1>Gráficos</h1>
        <p class="sub">Cómo vamos, de un vistazo. Cada gráfico trae una explicación en simple.</p>
      </div>
      <div class="filtros" role="search" aria-label="Filtros de gráficos">
        <label>
          <span>Mes</span>
          <select v-model="mes">
            <option v-for="m in mesesDisponibles" :key="m" :value="m">{{ nombreMes(m) }}</option>
          </select>
        </label>
        <label>
          <span>Instituto</span>
          <select v-model="instituto">
            <option value="">Todos</option>
            <option v-for="i in institutos" :key="i" :value="i">{{ i }}</option>
          </select>
        </label>
      </div>
    </div>

    <p class="semaforo" aria-label="Cómo leer los colores">
      <span><i class="dot ok"></i>Verde: va bien</span>
      <span><i class="dot alerta"></i>Amarillo: hay que mirarlo</span>
      <span><i class="dot critico"></i>Rojo: bajo lo esperado</span>
    </p>

    <p v-if="cargando" role="status">Cargando gráficos…</p>
    <p v-else-if="error" class="aviso" role="status">{{ error }}</p>

    <template v-else>
      <!-- 1. KPIs principales -->
      <section class="kpis" aria-label="Indicadores principales">
        <GaugeKpi
          titulo="Cumplimiento de la meta (SIC)"
          :valor="cumplimiento" :texto="pct(cumplimiento)" :ok="0.9" :alerta="0.8" :max="1.2" :marca="1"
        >
          {{ fmt(totRealizado) }} atenciones realizadas de {{ fmt(totMeta) }} planificadas
        </GaugeKpi>
        <GaugeKpi
          titulo="% FOJA"
          :valor="foja" :texto="pct(foja)" :ok="0.6" :alerta="0.45" :marca="0.6"
        >
          De cada 10 horas contratadas, {{ Math.round(foja * 10) }} son para atender pacientes directamente (meta: 6)
        </GaugeKpi>
        <div class="tile">
          <span class="t-titulo">Meta de Gestión Asistencial</span>
          <span class="t-num">{{ fmt(metaGestion) }}</span>
          <span class="t-det">atenciones: el 90% de lo planificado, para dejar margen a imprevistos</span>
        </div>
        <div class="tile" :class="{ rojo: bajoMeta.length > 0 }">
          <span class="t-titulo">Profesionales bajo la meta</span>
          <span class="t-num">{{ bajoMeta.length }} <small>de {{ profesionales.length }}</small></span>
          <span class="t-det">hicieron menos del 90% de lo planificado este mes</span>
        </div>
      </section>

      <!-- 2. Meta vs realizado por instituto -->
      <section class="card" aria-labelledby="g-inst">
        <h2 id="g-inst">¿Cada instituto llega a su meta?</h2>
        <MetaVsRealizado :grupos="porInstituto" />
        <p class="simple"><b>En simple:</b> {{ fraseInstitutos }}</p>
      </section>

      <div class="dos">
        <!-- 3. Cumplimiento por profesional -->
        <section class="card" aria-labelledby="g-prof">
          <h2 id="g-prof">Cumplimiento por profesional</h2>
          <BarrasHorizontales
            :items="porProfesional" :max="1.2"
            :linea="{ valor: 1, etiqueta: 'Línea punteada = 100% de lo planificado' }"
          />
          <p class="simple"><b>En simple:</b> {{ fraseProfesionales }}</p>
        </section>

        <!-- 4. FOJA por instituto -->
        <section class="card" aria-labelledby="g-foja">
          <h2 id="g-foja">% FOJA por instituto</h2>
          <BarrasHorizontales
            :items="fojaInstitutos" :max="1"
            :linea="{ valor: 0.6, etiqueta: 'Línea punteada = meta de 60%' }"
          />
          <p class="simple"><b>En simple:</b> {{ fraseFoja }}</p>
        </section>
      </div>

      <div class="dos">
        <!-- 5. Uso de las horas -->
        <section class="card" aria-labelledby="g-horas">
          <h2 id="g-horas">¿En qué se usan las horas contratadas?</h2>
          <BarraApilada :partes="partesHoras" />
          <p class="simple"><b>En simple:</b> {{ fraseHoras }}</p>
        </section>

        <!-- 6. Cambios de la bitácora -->
        <section class="card" aria-labelledby="g-bit">
          <h2 id="g-bit">Cambios registrados por el bot</h2>
          <BarrasHorizontales v-if="cambiosPorTipo.length" :items="cambiosPorTipo" />
          <p v-else class="vacio">Sin cambios registrados.</p>
          <p class="simple"><b>En simple:</b> {{ fraseCambios }}</p>
        </section>
      </div>

      <p class="pie-nota">
        Datos de {{ nombreMes(mes) }}{{ instituto ? ` · ${instituto}` : ' · todos los institutos' }}.
        Para el detalle en tablas, ve a la <NuxtLink to="/nacional">vista Nacional</NuxtLink>.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { FilaPlanificacion, EventoBitacora } from '~/stores/planificacion'
import type { IndicadorNacional } from '~/composables/useIndicadores'

const config = useRuntimeConfig()
const filas = ref<FilaPlanificacion[]>([])
const bitacora = ref<EventoBitacora[]>([])
const indicadores = ref<IndicadorNacional | null>(null)
const cargando = ref(true)
const error = ref<string | null>(null)
const mes = ref('')
const instituto = ref('')

onMounted(async () => {
  try {
    const [f, b, i] = await Promise.all([
      $fetch<FilaPlanificacion[]>(`${config.public.apiBase}/planificacion`),
      $fetch<EventoBitacora[]>(`${config.public.apiBase}/bitacora`).catch(() => []),
      $fetch<IndicadorNacional>(`${config.public.apiBase}/indicadores`).catch(() => null),
    ])
    filas.value = Array.isArray(f) ? f : []
    bitacora.value = Array.isArray(b) ? b : []
    indicadores.value = i
    mes.value = mesesDisponibles.value[mesesDisponibles.value.length - 1] || ''
  } catch (e: any) {
    error.value = e?.message || 'No se pudieron cargar los datos.'
  } finally {
    cargando.value = false
  }
})

/* ---------- utilidades ---------- */
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const nombreMes = (ym: string) => (ym ? `${MESES[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}` : '')
const fmt = (n: number) => Math.round(n).toLocaleString('es-CL')
const pct = (x: number) => `${Math.round(x * 100)}%`
const colorCumpl = (c: number) => (c >= 0.9 ? 'var(--ok)' : c >= 0.8 ? 'var(--alerta)' : 'var(--critico)')
const colorFoja = (c: number) => (c >= 0.6 ? 'var(--ok)' : c >= 0.45 ? 'var(--alerta)' : 'var(--critico)')

/* ---------- datos filtrados ---------- */
const mesesDisponibles = computed(() => [...new Set(filas.value.map((f) => f.mes))].sort())
const institutos = computed(() => [...new Set(filas.value.map((f) => f.instituto))].sort())
const filasMes = computed(() =>
  filas.value.filter((f) => f.mes === mes.value && (!instituto.value || f.instituto === instituto.value))
)

const totMeta = computed(() => filasMes.value.reduce((a, f) => a + f.meta_atenciones, 0))
const totRealizado = computed(() => filasMes.value.reduce((a, f) => a + f.atenciones_sic, 0))
const cumplimiento = computed(() => (totMeta.value ? totRealizado.value / totMeta.value : 0))

const foja = computed(() => {
  const ind = indicadores.value
  if (ind && instituto.value) return ind.instituciones.find((i) => i.instituto === instituto.value)?.foja ?? 0
  if (ind) return ind.foja_promedio
  const h = filasMes.value.reduce((a, f) => a + f.horas_contratadas, 0)
  return h ? filasMes.value.reduce((a, f) => a + f.horas_directa, 0) / h : 0
})
const metaGestion = computed(() => {
  const ind = indicadores.value
  if (ind && instituto.value) return ind.instituciones.find((i) => i.instituto === instituto.value)?.meta_gestion ?? 0
  return ind?.meta_gestion_total ?? totMeta.value * 0.9
})

// Un profesional puede tener varias filas (multi-instituto): se suman.
const profesionales = computed(() => {
  const m = new Map<string, { nombre: string; meta: number; real: number }>()
  for (const f of filasMes.value) {
    const p = m.get(f.id_profesional) || { nombre: f.nombre, meta: 0, real: 0 }
    p.meta += f.meta_atenciones
    p.real += f.atenciones_sic
    m.set(f.id_profesional, p)
  }
  return [...m.values()].map((p) => ({ ...p, c: p.meta ? p.real / p.meta : 0 }))
})
const bajoMeta = computed(() => profesionales.value.filter((p) => p.c < 0.9))

const porInstituto = computed(() => {
  const m = new Map<string, { label: string; meta: number; realizado: number }>()
  for (const f of filasMes.value) {
    const g = m.get(f.instituto) || { label: f.instituto, meta: 0, realizado: 0 }
    g.meta += f.meta_atenciones
    g.realizado += f.atenciones_sic
    m.set(f.instituto, g)
  }
  return [...m.values()].sort((a, b) => a.realizado / a.meta - b.realizado / b.meta)
})

const porProfesional = computed(() =>
  [...profesionales.value]
    .sort((a, b) => a.c - b.c)
    .map((p) => ({ label: p.nombre, valor: p.c, texto: pct(p.c), color: colorCumpl(p.c) }))
)

const fojaInstitutos = computed(() =>
  (indicadores.value?.instituciones || [])
    .filter((i) => !instituto.value || i.instituto === instituto.value)
    .sort((a, b) => a.foja - b.foja)
    .map((i) => ({ label: i.instituto, valor: i.foja, texto: pct(i.foja), color: colorFoja(i.foja) }))
)

const partesHoras = computed(() => {
  const s = (k: 'horas_directa' | 'horas_indirecta' | 'horas_nas') => filasMes.value.reduce((a, f) => a + f[k], 0)
  return [
    { label: 'Atención directa', valor: s('horas_directa'), color: 'var(--marca-navy-suave)' },
    { label: 'Atención indirecta', valor: s('horas_indirecta'), color: '#6366f1' },
    { label: 'No asistencial (pausas, reuniones, gestión)', valor: s('horas_nas'), color: '#94a3b8' },
  ]
})

const ETIQUETAS: Record<string, string> = {
  cambio_jornada: 'Cambio de jornada',
  cambio_asignacion: 'Asignación especial',
  cambio_cargo: 'Cambio de cargo',
  alta: 'Alta',
  baja: 'Baja',
  cambio_vigencia: 'Cambio de vigencia',
  licencia: 'Licencia',
}
const cambiosPorTipo = computed(() => {
  const ids = new Set(filasMes.value.map((f) => f.id_profesional))
  const c = new Map<string, number>()
  for (const b of bitacora.value) {
    if (instituto.value && !ids.has(b.id_profesional)) continue
    c.set(b.tipo, (c.get(b.tipo) || 0) + 1)
  }
  return [...c.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => ({ label: ETIQUETAS[t] || t, valor: n, texto: String(n), color: 'var(--marca-navy-suave)' }))
})

/* ---------- frases en simple ---------- */
const fraseInstitutos = computed(() => {
  const g = porInstituto.value
  if (!g.length) return 'No hay datos para este filtro.'
  const peor = g[0]
  const cp = peor.realizado / peor.meta
  const enMeta = g.filter((x) => x.realizado / x.meta >= 0.9).length
  if (g.length === 1) return `${peor.label} hizo el ${pct(cp)} de lo planificado.`
  return `${enMeta} de ${g.length} institutos están sobre el 90% de su meta. ${peor.label} es el que está más lejos: hizo el ${pct(cp)} de lo planificado.`
})
const fraseProfesionales = computed(() => {
  const b = bajoMeta.value
  if (!profesionales.value.length) return 'No hay datos para este filtro.'
  if (!b.length) return 'Todos los profesionales están sobre el 90% de lo planificado.'
  const peor = [...b].sort((x, y) => x.c - y.c)[0]
  return `${b.length} profesional${b.length > 1 ? 'es están' : ' está'} bajo el 90%. El caso más bajo es ${peor.nombre}, con ${pct(peor.c)}: conviene revisar si tuvo licencias, vacaciones u otra causa.`
})
const fraseFoja = computed(() => {
  const f = fojaInstitutos.value
  if (!f.length) return 'No hay datos de FOJA para este filtro.'
  const bajo = f.filter((x) => x.valor < 0.6)
  return bajo.length
    ? `${bajo.map((x) => x.label).join(', ')} ${bajo.length > 1 ? 'están' : 'está'} bajo la meta de 60%: una parte mayor de sus horas se va en tareas que no son atención directa.`
    : 'Todos los institutos dedican al menos el 60% de sus horas a atención directa.'
})
const fraseHoras = computed(() => {
  const total = partesHoras.value.reduce((a, p) => a + p.valor, 0)
  if (!total) return 'No hay datos para este filtro.'
  const d = partesHoras.value[0].valor / total
  return `De cada 10 horas contratadas, unas ${Math.round(d * 10)} se usan en atención directa a pacientes.`
})
const fraseCambios = computed(() => {
  const n = cambiosPorTipo.value.reduce((a, c) => a + c.valor, 0)
  if (!n) return 'El bot no ha registrado cambios.'
  const top = cambiosPorTipo.value[0]
  return `El bot detectó ${n} cambio${n > 1 ? 's' : ''} en los contratos (BUK). El más común: ${top.label.toLowerCase()}. Cada uno recalcula la planificación desde la fecha en que rige.`
})

useHead({ title: 'Gráficos · Planificación Asistencial' })
</script>

<style scoped>
.cabecera {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}
h1 {
  margin: 0;
}
.sub {
  margin: 0.2rem 0 0;
  color: var(--texto-secundario);
}
.filtros {
  display: flex;
  gap: 0.75rem;
}
.filtros label {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  color: var(--texto-secundario);
  gap: 0.2rem;
}
.filtros select {
  font: inherit;
  font-size: 0.95rem;
  color: var(--texto);
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--borde);
  border-radius: 8px;
  background: var(--fondo-card);
  min-width: 10rem;
}
.semaforo {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: var(--texto-secundario);
  margin: 1rem 0 0;
}
.dot {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  margin-right: 0.35rem;
  vertical-align: -1px;
}
.dot.ok { background: var(--ok); }
.dot.alerta { background: var(--alerta); }
.dot.critico { background: var(--critico); }
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  padding: 1.1rem 1rem;
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 12px;
}
.tile.rojo {
  border-color: var(--critico);
  background: var(--critico-suave);
}
.t-titulo {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--texto-secundario);
}
.t-num {
  font-size: 2.6rem;
  font-weight: 800;
  color: var(--marca-navy-suave);
  line-height: 1.1;
}
.tile.rojo .t-num {
  color: var(--critico-texto);
}
.t-num small {
  font-size: 1rem;
  font-weight: 600;
  color: var(--texto-secundario);
}
.t-det {
  font-size: 0.8rem;
  color: var(--texto-secundario);
}
.card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}
.dos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 0 1.5rem;
}
.simple {
  margin: 1rem 0 0;
  padding: 0.7rem 0.9rem;
  background: var(--acento-suave);
  border-radius: 8px;
  font-size: 0.92rem;
}
.vacio {
  color: var(--texto-secundario);
}
.aviso {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--alerta-suave);
}
.pie-nota {
  margin-top: 1.25rem;
  font-size: 0.85rem;
  color: var(--texto-secundario);
}
@media (max-width: 480px) {
  .dos {
    grid-template-columns: 1fr;
  }
}
</style>
