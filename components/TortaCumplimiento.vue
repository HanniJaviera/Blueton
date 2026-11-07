<template>
  <div class="torta">
    <div class="fila">
      <svg viewBox="-110 -110 220 220" class="grafico" role="group" aria-label="Profesionales por rango de cumplimiento">
        <path
          v-for="s in sectores" :key="s.k" :d="s.d" :fill="s.color"
          class="sector" :class="{ activo: abierto === s.k, atenuado: abierto && abierto !== s.k }"
          :transform="abierto === s.k ? s.desplazar : ''"
          role="button" tabindex="0"
          :aria-pressed="abierto === s.k"
          :aria-label="`${s.label}: ${s.n} profesionales (${pct(s.f)}). Ver la lista`"
          @click="alternar(s.k)" @keydown.enter.prevent="alternar(s.k)" @keydown.space.prevent="alternar(s.k)"
        >
          <title>{{ s.label }}: {{ s.n }} ({{ pct(s.f) }})</title>
        </path>
        <text v-for="s in sectores.filter((x) => x.f >= 0.06)" :key="`t${s.k}`" :x="s.tx" :y="s.ty" class="pct-sector" aria-hidden="true">{{ pct(s.f) }}</text>
        <text y="-4" class="centro-num" aria-hidden="true">{{ total }}</text>
        <text y="16" class="centro-et" aria-hidden="true">profesionales</text>
      </svg>

      <ul class="leyenda">
        <li v-for="r in rangos" :key="r.k">
          <button type="button" :class="{ activo: abierto === r.k }" :aria-pressed="abierto === r.k" :disabled="!r.n" @click="alternar(r.k)">
            <i :style="{ background: r.color }" aria-hidden="true"></i>
            <span class="et">{{ r.label }}</span>
            <strong>{{ r.n }}</strong>
            <span class="pc">{{ pct(r.n / (total || 1)) }}</span>
          </button>
        </li>
      </ul>
    </div>

    <p class="pista">Toca una parte del gráfico para ver quiénes están en ese rango.</p>

    <section v-if="rangoAbierto" class="lista" :aria-label="`Profesionales con ${rangoAbierto.label}`">
      <header>
        <h3><i :style="{ background: rangoAbierto.color }" aria-hidden="true"></i>{{ rangoAbierto.label }} · {{ rangoAbierto.n }} profesionales</h3>
        <button type="button" class="cerrar" @click="abierto = null" aria-label="Cerrar lista">✕</button>
      </header>
      <div class="scroll">
        <table>
          <thead><tr><th>Profesional</th><th>Meta</th><th>Realizado</th><th>Cumplimiento</th></tr></thead>
          <tbody>
            <tr v-for="p in rangoAbierto.personas" :key="p.id">
              <td><NuxtLink :to="`/profesional/${encodeURIComponent(p.id)}`">{{ p.nombre }}</NuxtLink></td>
              <td>{{ f0(p.meta) }}</td>
              <td>{{ f0(p.real) }}</td>
              <td><strong :style="{ color: rangoAbierto.color }">{{ pct(p.c) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Torta de profesionales por rango de cumplimiento (realizado SIC ÷ meta).
// Al tocar una porción (o su leyenda) se despliega la lista de ese rango.
interface Persona { id: string; nombre: string; meta: number; real: number; c: number }
const props = defineProps<{ profesionales: Persona[] }>()

const RANGOS = [
  { k: 'sobre', label: '100% o más', desde: 1, color: 'var(--ok)' },
  { k: 'cerca', label: '90% a 99%', desde: 0.9, color: '#34d399' },
  { k: 'riesgo', label: '80% a 89%', desde: 0.8, color: 'var(--alerta)' },
  { k: 'bajo', label: 'Menos de 80%', desde: -Infinity, color: 'var(--critico)' },
]

const abierto = ref<string | null>(null)
const total = computed(() => props.profesionales.length)

const rangos = computed(() =>
  RANGOS.map((r, i) => {
    const hasta = i ? RANGOS[i - 1].desde : Infinity
    const personas = props.profesionales.filter((p) => p.c >= r.desde && p.c < hasta).sort((a, b) => a.c - b.c)
    return { ...r, personas, n: personas.length }
  })
)
const rangoAbierto = computed(() => rangos.value.find((r) => r.k === abierto.value && r.n) || null)

// Geometría de la dona: radio externo 100, interno 58, partiendo arriba (−90°).
const R = 100, r = 58
const punto = (rad: number, a: number) => `${(rad * Math.cos(a)).toFixed(2)} ${(rad * Math.sin(a)).toFixed(2)}`
const sectores = computed(() => {
  let a0 = -Math.PI / 2
  return rangos.value.filter((x) => x.n).map((x) => {
    const f = x.n / total.value
    const a1 = a0 + Math.min(f, 0.99999) * 2 * Math.PI // un solo rango = anillo casi completo
    const largo = a1 - a0 > Math.PI ? 1 : 0
    const medio = (a0 + a1) / 2
    const s = {
      ...x, f,
      d: `M ${punto(R, a0)} A ${R} ${R} 0 ${largo} 1 ${punto(R, a1)} L ${punto(r, a1)} A ${r} ${r} 0 ${largo} 0 ${punto(r, a0)} Z`,
      desplazar: `translate(${(8 * Math.cos(medio)).toFixed(2)} ${(8 * Math.sin(medio)).toFixed(2)})`,
      tx: ((R + r) / 2) * Math.cos(medio),
      ty: ((R + r) / 2) * Math.sin(medio) + 4,
    }
    a0 = a1
    return s
  })
})

function alternar(k: string) {
  abierto.value = abierto.value === k ? null : k
}
// Si cambia el filtro y el rango abierto queda vacío, se cierra.
watch(rangos, () => {
  if (abierto.value && !rangos.value.find((x) => x.k === abierto.value)?.n) abierto.value = null
})

const pct = (x: number) => `${Math.round(x * 100)}%`
const f0 = (n: number) => Math.round(n).toLocaleString('es-CL')
</script>

<style scoped>
.fila { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; }
.grafico { width: min(240px, 100%); height: auto; flex: 0 0 auto; overflow: visible; }
.sector { cursor: pointer; transition: transform 0.15s ease, opacity 0.15s ease; stroke: var(--fondo-card); stroke-width: 2; }
.sector:hover { opacity: 0.85; }
.sector:focus, .sector:focus-visible { outline: none; } /* el rectángulo global no sigue la forma */
.sector:focus-visible { stroke: var(--marca-dorado); stroke-width: 4; }
.sector.atenuado { opacity: 0.35; }
.pct-sector { fill: #fff; font-size: 13px; font-weight: 700; text-anchor: middle; pointer-events: none; }
.centro-num { font-size: 30px; font-weight: 800; text-anchor: middle; fill: var(--texto); }
.centro-et { font-size: 12px; text-anchor: middle; fill: var(--texto-secundario); }
.leyenda { list-style: none; margin: 0; padding: 0; flex: 1 1 14rem; display: grid; gap: 0.4rem; }
.leyenda button {
  width: 100%; display: grid; grid-template-columns: 14px 1fr auto 3rem; align-items: center; gap: 0.6rem;
  padding: 0.5rem 0.75rem; background: var(--fondo-card); color: var(--texto);
  border: 1px solid var(--borde); border-radius: 8px; font: inherit; cursor: pointer; text-align: left;
}
.leyenda button:hover:not(:disabled), .leyenda button.activo { border-color: var(--marca-navy); background: var(--acento-suave); }
.leyenda button:disabled { opacity: 0.5; cursor: default; }
.leyenda i, .lista h3 i { display: inline-block; width: 14px; height: 14px; border-radius: 3px; }
.leyenda .pc { color: var(--texto-secundario); text-align: right; font-size: 0.85rem; }
.pista { font-size: 0.8rem; color: var(--texto-secundario); margin: 0.75rem 0 0; }
.lista { margin-top: 1rem; border: 1px solid var(--borde); border-radius: 10px; overflow: hidden; }
.lista header { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.9rem; background: var(--acento-suave); }
.lista h3 { margin: 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; }
.cerrar { background: none; border: 0; font-size: 1rem; cursor: pointer; color: var(--texto-secundario); }
.scroll { max-height: 320px; overflow-y: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.45rem 0.9rem; border-bottom: 1px solid var(--borde); font-size: 0.85rem; }
thead th { position: sticky; top: 0; background: var(--fondo-card); }
@media (prefers-reduced-motion: reduce) { .sector { transition: none; } }
</style>
