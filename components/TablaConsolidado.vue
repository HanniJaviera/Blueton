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
          <td class="principal">
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
          <td data-label="Cargo">{{ fila.cargo }}</td>
          <td data-label="Horas contratadas">{{ horas(fila.horas_contratadas) }} h</td>
          <td data-label="Horas directa">{{ horas(fila.horas_directa) }} h</td>
          <td data-label="Meta atenciones">{{ fila.meta_atenciones }}</td>
          <td data-label="Atenciones SIC">{{ fila.atenciones_sic ?? '—' }}</td>
          <td data-label="Desviación">
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
/* Teléfono: cada fila pasa a ser una tarjeta con sus datos rotulados (sin scroll lateral) */
@media (max-width: 600px) {
  .tabla-wrap {
    overflow-x: visible;
    background: transparent;
    border: none;
  }
  table {
    min-width: 0;
  }
  thead {
    display: none;
  }
  tbody tr {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem 1rem;
    background: var(--fondo-card);
    border: 1px solid var(--borde);
    border-radius: 10px;
    padding: 0.85rem 1rem;
    margin-bottom: 0.6rem;
  }
  td {
    padding: 0;
    border: none;
    display: flex;
    flex-direction: column;
    font-size: 0.95rem;
  }
  td::before {
    content: attr(data-label);
    font-size: 0.75rem;
    color: var(--texto-secundario);
  }
  td.principal {
    grid-column: 1 / -1;
    font-size: 1.05rem;
  }
  td.vacio {
    grid-column: 1 / -1;
  }
}
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
