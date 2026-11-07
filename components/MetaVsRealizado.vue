<template>
  <div>
    <ul class="grupos">
      <li v-for="g in grupos" :key="g.label" class="grupo">
        <div class="cab">
          <span class="nombre">{{ g.label }}</span>
          <span class="pct" :style="{ color: color(g.realizado / (g.meta || 1)) }">
            {{ Math.round((g.realizado / (g.meta || 1)) * 100) }}% de la meta
          </span>
        </div>
        <div class="par" role="img" :aria-label="`${g.label}: meta ${g.meta}, realizado ${g.realizado}`">
          <div class="fila">
            <span class="tag">Meta</span>
            <span class="pista"><span class="b meta" :style="{ width: w(g.meta) }"></span></span>
            <span class="num">{{ f(g.meta) }}</span>
          </div>
          <div class="fila">
            <span class="tag">Realizado</span>
            <span class="pista">
              <span class="b" :style="{ width: w(g.realizado), background: color(g.realizado / (g.meta || 1)) }"></span>
            </span>
            <span class="num">{{ f(g.realizado) }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Meta vs. realizado (SIC) por grupo, con color de semáforo según % de cumplimiento.
const props = defineProps<{ grupos: { label: string; meta: number; realizado: number }[]; ok?: number; alerta?: number }>()
const tope = computed(() => Math.max(1, ...props.grupos.flatMap((g) => [g.meta, g.realizado])))
const w = (v: number) => `${(v / tope.value) * 100}%`
const f = (n: number) => Math.round(n).toLocaleString('es-CL')
function color(c: number) {
  if (c >= (props.ok ?? 0.9)) return 'var(--ok)'
  if (c >= (props.alerta ?? 0.8)) return 'var(--alerta)'
  return 'var(--critico)'
}
</script>

<style scoped>
.grupos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16.25rem, 1fr));
  gap: 1rem 1.5rem;
}
.cab {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.3rem;
}
.nombre {
  font-weight: 700;
}
.pct {
  font-size: 0.85rem;
  font-weight: 700;
}
.fila {
  display: grid;
  grid-template-columns: 4.6rem 1fr 3rem;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  margin-top: 0.25rem;
}
.tag {
  color: var(--texto-secundario);
}
.pista {
  position: relative;
  height: 16px;
  background: var(--fondo);
  border-radius: 5px;
}
.b {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 5px;
}
.b.meta {
  background: #cbd5e1;
}
.num {
  text-align: right;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
</style>
