<template>
  <section class="card grafico" aria-labelledby="graf-titulo">
    <div class="cabecera">
      <h2 id="graf-titulo">Atenciones por mes <small>plan vs. meta de gestión</small></h2>
      <div class="seg" role="group" aria-label="Tipo de atención">
        <button type="button" :aria-pressed="tipo === 'dir'" @click="tipo = 'dir'">Directa</button>
        <button type="button" :aria-pressed="tipo === 'total'" @click="tipo = 'total'">Directa + indirecta</button>
      </div>
    </div>

    <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="descripcion" class="svg">
      <title>{{ descripcion }}</title>
      <!-- grilla y eje Y -->
      <g v-for="t in ticks" :key="t">
        <line :x1="M.l" :x2="W - M.r" :y1="y(t)" :y2="y(t)" class="grilla" />
        <text :x="M.l - 8" :y="y(t) + 4" class="eje" text-anchor="end">{{ fmt(t) }}</text>
      </g>
      <!-- barras: plan -->
      <g v-for="(m, i) in meses" :key="m.mes">
        <rect
          :x="x(i) - barW / 2" :y="y(valPlan(m))" :width="barW" :height="Math.max(0, y(0) - y(valPlan(m)))"
          rx="3" class="barra" :class="{ proyectado: m.mes > ultimoMes }"
        >
          <title>{{ MESES_LARGO[m.mes - 1] }}: plan {{ fmt(valPlan(m)) }}, meta {{ fmt(valMeta(m)) }}{{ m.mes > ultimoMes ? ' (proyectado)' : '' }}</title>
        </rect>
        <text :x="x(i)" :y="H - M.b + 18" class="eje" text-anchor="middle">{{ MESES_CORTO[m.mes - 1] }}</text>
      </g>
      <!-- línea: meta -->
      <polyline :points="puntosMeta" class="linea-meta" />
      <circle v-for="(m, i) in meses" :key="'c' + m.mes" :cx="x(i)" :cy="y(valMeta(m))" r="4" class="punto-meta" />
    </svg>

    <ul class="leyenda" aria-hidden="true">
      <li><span class="sw sw-plan"></span>Plan</li>
      <li><span class="sw sw-proy"></span>Plan proyectado</li>
      <li><span class="sw sw-meta"></span>Meta de gestión ({{ Math.round(pctMeta * 100) }}%)</li>
    </ul>
    <p class="nota">Los mismos datos están en la tabla mensual.</p>
  </section>
</template>

<script setup lang="ts">
import { MESES_CORTO, MESES_LARGO, type MesDetalle } from '~/composables/useDetalleProfesional'

const props = defineProps<{ meses: MesDetalle[]; ultimoMes?: number; pctMeta?: number }>()
const tipo = ref<'dir' | 'total'>('dir')
const ultimoMes = computed(() => props.ultimoMes ?? 12)
const pctMeta = computed(() => props.pctMeta ?? 0.9)

const W = 720, H = 300
const M = { l: 48, r: 12, t: 12, b: 32 }
const valPlan = (m: MesDetalle) => (tipo.value === 'dir' ? m.plan_dir : m.plan_total)
const valMeta = (m: MesDetalle) => (tipo.value === 'dir' ? m.meta_dir : m.meta_total)

function pasoBonito(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1)))
  const n = raw / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}
const maxY = computed(() => {
  const max = Math.max(1, ...props.meses.map((m) => Math.max(valPlan(m), valMeta(m))))
  const paso = pasoBonito(max / 5)
  return Math.ceil(max / paso) * paso
})
const ticks = computed(() => {
  const paso = pasoBonito(maxY.value / 5)
  const out: number[] = []
  for (let v = 0; v <= maxY.value + 1e-9; v += paso) out.push(v)
  return out
})
const ancho = computed(() => (W - M.l - M.r) / Math.max(1, props.meses.length))
const barW = computed(() => ancho.value * 0.62)
const x = (i: number) => M.l + ancho.value * (i + 0.5)
const y = (v: number) => M.t + (H - M.t - M.b) * (1 - v / maxY.value)
const puntosMeta = computed(() => props.meses.map((m, i) => `${x(i)},${y(valMeta(m))}`).join(' '))

const fmt = (n: number) => n.toLocaleString('es-CL')
const descripcion = computed(
  () =>
    `Atenciones ${tipo.value === 'dir' ? 'directas' : 'directas más indirectas'} por mes. ` +
    props.meses.map((m) => `${MESES_LARGO[m.mes - 1]}: plan ${valPlan(m)}, meta ${valMeta(m)}`).join('; ')
)
</script>

<style scoped>
.cabecera {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}
h2 {
  margin: 0;
  font-size: 1.1rem;
}
h2 small {
  font-weight: 400;
  color: var(--texto-secundario);
  font-size: 0.85rem;
  margin-left: 0.3rem;
}
.seg {
  display: inline-flex;
  border: 1px solid var(--borde);
  border-radius: 8px;
  overflow: hidden;
}
.seg button {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  border: 0;
  background: var(--fondo-card);
  color: var(--texto);
  cursor: pointer;
}
.seg button[aria-pressed='true'] {
  background: var(--marca-navy);
  color: #fff;
}
.svg {
  width: 100%;
  height: auto;
  margin-top: 0.75rem;
  display: block;
}
.grilla {
  stroke: var(--borde);
}
.eje {
  font-size: 11px;
  fill: var(--texto-secundario);
}
.barra {
  fill: var(--marca-navy-suave);
}
.barra.proyectado {
  fill: #8f93b8;
}
.linea-meta {
  fill: none;
  stroke: var(--alerta);
  stroke-width: 3;
}
.punto-meta {
  fill: var(--alerta);
}
.leyenda {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0;
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
}
.sw {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 0.35rem;
  vertical-align: -1px;
}
.sw-plan { background: var(--marca-navy-suave); }
.sw-proy { background: #8f93b8; }
.sw-meta { background: var(--alerta); border-radius: 50%; }
.nota {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  color: var(--texto-secundario);
}
</style>
