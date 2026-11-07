<template>
  <div class="kpi" role="group" :aria-label="`Porcentaje FOJA: ${fojaFormateada}`">
    <span class="kpi-label">% FOJA</span>
    <span class="kpi-valor" :class="colorClase">{{ fojaFormateada }}</span>
    <span class="kpi-detalle">Horas disponibles para atención directa ÷ horas contratadas</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ foja: number }>()
const fojaFormateada = computed(() => `${Math.round(props.foja * 100)}%`)
const colorClase = computed(() => {
  if (props.foja >= 0.6) return 'kpi-ok'
  if (props.foja >= 0.45) return 'kpi-alerta'
  return 'kpi-critico'
})
</script>

<style scoped>
.kpi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.25rem;
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 10px;
}
.kpi-label {
  font-size: 0.85rem;
  color: var(--texto-secundario);
  font-weight: 600;
}
.kpi-valor {
  font-size: 2rem;
  font-weight: 700;
}
.kpi-ok { color: var(--ok); }
.kpi-alerta { color: var(--alerta); }
.kpi-critico { color: var(--critico); }
.kpi-detalle {
  font-size: 0.75rem;
  color: var(--texto-secundario);
}
</style>
