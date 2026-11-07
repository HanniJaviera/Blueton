<template>
  <span
    v-if="desviacionPct !== 0"
    class="alerta"
    :class="esNegativa ? 'alerta-baja' : 'alerta-alta'"
    role="status"
    :aria-label="etiquetaAccesible"
  >
    {{ esNegativa ? '▼' : '▲' }} {{ Math.abs(Math.round(desviacionPct * 100)) }}%
    {{ esNegativa ? 'bajo lo planificado' : 'sobre lo planificado' }}
  </span>
</template>

<script setup lang="ts">
// Compara lo planificado (meta_atenciones) con lo realizado en SIC.
const props = defineProps<{ metaAtenciones: number; atencionesSic: number }>()

const desviacionPct = computed(() =>
  props.metaAtenciones ? (props.atencionesSic - props.metaAtenciones) / props.metaAtenciones : 0
)
const esNegativa = computed(() => desviacionPct.value < 0)
const etiquetaAccesible = computed(
  () =>
    `Desviación de ${Math.round(Math.abs(desviacionPct.value) * 100)}% ${
      esNegativa.value ? 'por debajo' : 'por encima'
    } de lo planificado según SIC`
)
</script>

<style scoped>
.alerta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}
.alerta-baja {
  background: var(--critico-suave);
  color: var(--critico);
}
.alerta-alta {
  background: var(--ok-suave);
  color: var(--ok);
}
</style>
