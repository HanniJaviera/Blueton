<template>
  <section class="card" aria-labelledby="calc-titulo">
    <h2 id="calc-titulo">Cómo se calculó la tasa semanal</h2>
    <p class="sub">Trazabilidad del cálculo: de las horas contratadas a las atenciones por semana.</p>

    <dl class="params">
      <div><dt>Clave Distribucion_NAC</dt><dd>{{ p.clave_distribucion }}</dd></div>
      <div><dt>Tramo de horas</dt><dd>{{ p.tramo }}</dd></div>
      <div><dt>% NAS</dt><dd>{{ pct(p.pct_nas, 0) }}</dd></div>
      <div><dt>% Directo / Indirecto</dt><dd>{{ pct(p.pct_directo, 0) }} / {{ pct(p.pct_indirecto, 0) }}</dd></div>
      <div><dt>Min. estándar dir / ind</dt><dd>{{ p.min_directa }} / {{ p.min_indirecta }}</dd></div>
      <div><dt>H NAS / H asignaciones</dt><dd>{{ n(p.h_nas, 2) }} / {{ n(p.h_asignaciones, 2) }}</dd></div>
      <div><dt>Factor grupal</dt><dd>{{ p.pct_grupal ? `${pct(p.pct_grupal, 0)} · ${p.n_pacientes} pacientes` : 'No aplica' }}</dd></div>
      <div><dt>Colación en contrato</dt><dd>{{ n(colacion, 1) }} h/sem</dd></div>
    </dl>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th scope="col">Concepto</th>
            <th scope="col" class="num">P1 ene–abr</th>
            <th scope="col" class="num">P2 may–dic</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in filas" :key="f.label">
            <th scope="row">{{ f.label }}</th>
            <td v-for="(t, i) in periodos" :key="i" class="num" :class="{ fuerte: f.fuerte }">
              {{ t ? f.valor(t) : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="nota">
      Base = horas del periodo − colación de contrato. % NAS + asig. = (H NAS + H asignaciones) ÷ base.
      Atenciones/sem = TRUNCAR(base × % final × 60 ÷ minutos estándar).
    </p>
  </section>
</template>

<script setup lang="ts">
import type { DetalleProfesional, TasaPeriodo } from '~/composables/useDetalleProfesional'

const props = defineProps<{ detalle: DetalleProfesional }>()
const p = computed(() => props.detalle.parametros)
const colacion = computed(() => props.detalle.profesional.colacion_contrato_h ?? 0)
const periodos = computed(() => [props.detalle.tasas.p1, props.detalle.tasas.p2])

const n = (x: number, d = 1) => x.toLocaleString('es-CL', { maximumFractionDigits: d })
const pct = (x: number, d = 1) =>
  x.toLocaleString('es-CL', { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d })

const filas: { label: string; valor: (t: TasaPeriodo) => string | number; fuerte?: boolean }[] = [
  { label: 'Horas del periodo', valor: (t) => n(t.h) },
  { label: 'Base (sin colación)', valor: (t) => n(t.base) },
  { label: '% NAS + asignaciones', valor: (t) => pct(t.at) },
  { label: '% Directo final', valor: (t) => pct(t.au) },
  { label: '% Indirecto final', valor: (t) => pct(t.av) },
  { label: 'H/sem para atención', valor: (t) => n(t.ax, 2) },
  { label: 'Atenciones directas/sem', valor: (t) => t.ba },
  { label: 'Atenciones indirectas/sem', valor: (t) => t.bb },
  { label: 'Directa + grupal/sem', valor: (t) => t.bf },
  { label: 'Total/sem', valor: (t) => t.bh, fuerte: true },
]
</script>

<style scoped>
h2 {
  margin: 0;
  font-size: 1.1rem;
}
.sub {
  margin: 0.15rem 0 1rem;
  color: var(--texto-secundario);
  font-size: 0.85rem;
}
.params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.6rem 1rem;
  margin: 0 0 1rem;
}
.params dt {
  font-size: 0.75rem;
  color: var(--texto-secundario);
}
.params dd {
  margin: 0;
  font-weight: 600;
}
table {
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
}
table thead th {
  position: static;
  padding: 0.5rem 0.6rem;
}
table tbody th,
table tbody td {
  padding: 0.45rem 0.6rem;
  border-bottom: 1px solid var(--borde);
}
tbody th {
  text-align: left;
  font-weight: 400;
}
.num {
  text-align: right;
}
.fuerte {
  font-weight: 700;
}
.nota {
  margin: 0.6rem 0 0;
  font-size: 0.78rem;
  color: var(--texto-secundario);
}
</style>
