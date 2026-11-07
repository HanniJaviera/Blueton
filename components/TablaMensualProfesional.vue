<template>
  <section class="card" aria-labelledby="tm-titulo">
    <h2 id="tm-titulo">Planificación mes a mes</h2>
    <div class="table-responsive">
      <table>
        <caption class="sr-only">Planificación mensual: horas, semanas hábiles, atenciones planificadas y meta de gestión</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col" class="num">Horas/sem</th>
            <th scope="col" class="num">Semanas del mes</th>
            <th scope="col" class="num">Semanas hábiles</th>
            <th scope="col">Descuentos</th>
            <th scope="col" class="num">Tasa directa/sem</th>
            <th scope="col" class="num">Plan directa</th>
            <th scope="col" class="num">Meta directa</th>
            <th scope="col" class="num">Tasa total/sem</th>
            <th scope="col" class="num">Plan dir+ind</th>
            <th scope="col" class="num">Meta dir+ind</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in detalle.meses" :key="m.mes"
            :class="{ proyectado: m.mes > ultimoMes, cero: m.sem_habiles === 0 }"
          >
            <th scope="row">
              {{ MESES_CORTO[m.mes - 1] }}<span v-if="m.mes > ultimoMes" class="sr-only"> (proyectado)</span>
            </th>
            <td class="num">{{ f1(m.horas) }}</td>
            <td class="num">{{ f1(m.semanas) }}</td>
            <td class="num">{{ f3(m.sem_habiles) }}</td>
            <td class="desc">{{ m.descuento_detalle || '—' }}</td>
            <td class="num">{{ tasaDelMes(detalle, m.mes)?.bf ?? '—' }}</td>
            <td class="num">{{ f0(m.plan_dir) }}</td>
            <td class="num">{{ f0(m.meta_dir) }}</td>
            <td class="num">{{ tasaDelMes(detalle, m.mes)?.bh ?? '—' }}</td>
            <td class="num">{{ f0(m.plan_total) }}</td>
            <td class="num">{{ f0(m.meta_total) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="totales">
          <tr>
            <th scope="row">Total</th>
            <td></td>
            <td class="num">{{ f1(totales.semanas) }}</td>
            <td class="num">{{ f3(totales.sem_habiles) }}</td>
            <td></td>
            <td></td>
            <td class="num">{{ f0(totales.plan_dir) }}</td>
            <td class="num">{{ f0(totales.meta_dir) }}</td>
            <td></td>
            <td class="num">{{ f0(totales.plan_total) }}</td>
            <td class="num">{{ f0(totales.meta_total) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p class="nota">
      Semanas hábiles = semanas del mes − licencias, vacaciones, permisos y días especiales.
      Plan = TRUNCAR(tasa semanal × semanas hábiles). Meta = TRUNCAR(plan × {{ Math.round(detalle.parametros.pct_meta * 100) }}%).
      <template v-if="ultimoMes < 12">
        Las filas en cursiva ({{ MESES_CORTO[ultimoMes] }}–Dic) se proyectan con las horas de
        {{ MESES_LARGO[ultimoMes - 1] }}, el último mes informado por BUK.
      </template>
    </p>
  </section>
</template>

<script setup lang="ts">
import {
  MESES_CORTO, MESES_LARGO, tasaDelMes, type DetalleProfesional,
} from '~/composables/useDetalleProfesional'

const props = defineProps<{
  detalle: DetalleProfesional
  totales: { plan_dir: number; plan_total: number; meta_dir: number; meta_total: number; semanas: number; sem_habiles: number } | null
}>()
const ultimoMes = computed(() => props.detalle.ultimo_mes_buk ?? 12)

const f0 = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 0 })
const f1 = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 1 })
const f3 = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 3 })
</script>

<style scoped>
h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}
table {
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
table thead th {
  position: static;
  padding: 0.5rem 0.55rem;
  font-size: 0.75rem;
  vertical-align: bottom;
}
table tbody td,
table tbody th,
tfoot td,
tfoot th {
  padding: 0.45rem 0.55rem;
  border-bottom: 1px solid var(--borde);
  white-space: nowrap;
}
tbody th,
tfoot th {
  text-align: left;
  font-weight: 600;
}
.num {
  text-align: right;
}
.desc {
  white-space: normal !important;
  min-width: 11rem;
  font-size: 0.78rem;
  color: var(--texto-secundario) !important;
}
tr.proyectado td,
tr.proyectado th {
  font-style: italic;
  color: var(--texto-secundario);
}
tr.cero td {
  color: var(--texto-secundario);
}
tfoot td,
tfoot th {
  font-weight: 700;
  border-top: 2px solid var(--texto);
  border-bottom: none;
}
.nota {
  margin: 0.6rem 0 0;
  font-size: 0.78rem;
  color: var(--texto-secundario);
}
</style>
