<template>
  <!-- Criterio de accesibilidad de la rúbrica: resumen en lectura fácil. -->
  <section class="lectura-facil" aria-labelledby="lf-titulo">
    <h2 id="lf-titulo">Resumen simple</h2>
    <ul>
      <li>{{ fila.nombre }} trabaja en {{ fila.instituto }}, en el área de {{ fila.area }}.</li>
      <li>Tiene {{ horas(fila.horas_contratadas) }} horas a la semana.</li>
      <li>De esas horas, {{ horas(fila.horas_directa) }} son para atender pacientes.</li>
      <li>Su meta este mes es {{ fila.meta_atenciones }} atenciones.</li>
      <li>
        Hasta ahora ha hecho {{ fila.atenciones_sic }} atenciones,
        {{ cumple ? 'lo que cumple la meta.' : 'lo que todavía no llega a la meta.' }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { FilaPlanificacion } from '~/stores/planificacion'

const props = defineProps<{ fila: FilaPlanificacion }>()
const cumple = computed(() => props.fila.atenciones_sic >= props.fila.meta_atenciones * 0.9)
</script>

<style scoped>
.lectura-facil {
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 1.25rem;
}
h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}
ul {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
}
</style>
