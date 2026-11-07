<template>
  <div class="kpi" role="group" :aria-label="`Meta de Gestión Asistencial: ${metaFormateada} atenciones`">
    <span class="kpi-label">Meta de Gestión Asistencial</span>
    <span class="kpi-valor">{{ metaFormateada }}</span>
    <span class="kpi-detalle">90% de la proyección anual de atenciones</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ metaGestion: number }>()
const metaFormateada = computed(() => Math.round(props.metaGestion).toLocaleString('es-CL'))
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
  color: var(--texto);
}
.kpi-detalle {
  font-size: 0.75rem;
  color: var(--texto-secundario);
}
</style>
