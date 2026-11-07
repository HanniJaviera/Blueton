<template>
  <div class="tabla-wrap">
    <table>
      <caption class="sr-only">{{ titulo }}</caption>
      <thead>
        <tr>
          <th v-if="agruparPor === 'instituto'" scope="col">Instituto</th>
          <th v-else scope="col">Profesional</th>
          <th scope="col">Cargo</th>
          <th scope="col">Horas contratadas</th>
          <th scope="col">Horas directa</th>
          <th scope="col">Meta atenciones</th>
          <th scope="col">Atenciones SIC</th>
          <th scope="col">Desviación</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fila in filas" :key="fila.id_profesional + fila.mes">
          <td>
            <NuxtLink
              v-if="agruparPor === 'instituto'"
              :to="`/instituto/${encodeURIComponent(fila.instituto)}`"
            >
              {{ fila.instituto }}
            </NuxtLink>
            <NuxtLink v-else :to="`/profesional/${fila.id_profesional}`">
              {{ fila.nombre }}
            </NuxtLink>
          </td>
          <td>{{ fila.cargo }}</td>
          <td>{{ fila.horas_contratadas }} h</td>
          <td>{{ fila.horas_directa }} h</td>
          <td>{{ fila.meta_atenciones }}</td>
          <td>{{ fila.atenciones_sic }}</td>
          <td>
            <AlertaDesviacion :meta-atenciones="fila.meta_atenciones" :atenciones-sic="fila.atenciones_sic" />
          </td>
        </tr>
        <tr v-if="!filas.length">
          <td colspan="7" class="vacio">Sin datos para los filtros seleccionados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { FilaPlanificacion } from '~/stores/planificacion'

defineProps<{
  filas: FilaPlanificacion[]
  titulo: string
  agruparPor?: 'instituto' | 'profesional'
}>()
</script>

<style scoped>
.tabla-wrap {
  overflow-x: auto;
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}
th, td {
  text-align: left;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--borde);
  font-size: 0.9rem;
}
th {
  font-weight: 700;
  color: var(--texto-secundario);
  background: var(--fondo);
}
tbody tr:hover {
  background: var(--acento-suave);
}
a {
  color: var(--acento-fuerte);
  font-weight: 600;
}
.vacio {
  text-align: center;
  color: var(--texto-secundario);
  padding: 1.5rem;
}
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
