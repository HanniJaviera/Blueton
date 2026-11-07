<template>
  <div v-if="fila || detalle">
    <NuxtLink v-if="instituto" :to="`/instituto/${encodeURIComponent(instituto)}`" class="volver">
      ← {{ instituto }}
    </NuxtLink>
    <h1>{{ fila?.nombre || detalle?.profesional.nombre || cargoBonito }}</h1>
    <p class="ficha">
      <template v-if="fila">
        {{ fila.cargo }} · {{ fila.area }} · {{ fila.instituto }} · {{ fila.horas_contratadas }} h contratadas
      </template>
      <template v-else-if="detalle">
        {{ cargoBonito }} · Área {{ detalle.profesional.area }} · {{ detalle.profesional.instituto }}
      </template>
      <template v-if="detalle">
        · {{ detalle.profesional.ndias }} días/semana · vigencia {{ ym(detalle.profesional.vigencia_desde) }} –
        {{ ym(detalle.profesional.vigencia_hasta) }}
      </template>
    </p>

    <NuxtLink :to="`/mi-planificacion/${encodeURIComponent(idProfesional)}`" class="vista-trabajador">
      Ver como lo ve el trabajador →
    </NuxtLink>

    <div class="kpis" v-if="indicador">
      <KpiMeta :meta-gestion="indicador.meta_gestion" />
      <KpiFoja :foja="indicador.foja" />
    </div>

    <!-- Totales anuales del detalle mensual -->
    <section v-if="detalle && totales" class="kpis-anuales" aria-label="Totales anuales planificados">
      <div class="kpi-mini">
        <span class="kpi-label">Atenciones directas planificadas (año)</span>
        <span class="valor">{{ f0(totales.plan_dir) }}</span>
        <span class="det">Meta: {{ f0(totales.meta_dir) }}</span>
      </div>
      <div class="kpi-mini">
        <span class="kpi-label">Directas + indirectas (año)</span>
        <span class="valor">{{ f0(totales.plan_total) }}</span>
        <span class="det">Meta: {{ f0(totales.meta_total) }}</span>
      </div>
      <div class="kpi-mini">
        <span class="kpi-label">Semanas hábiles</span>
        <span class="valor">{{ f1(totales.sem_habiles) }}</span>
        <span class="det">de {{ f1(totales.semanas) }} semanas del año</span>
      </div>
      <div class="kpi-mini">
        <span class="kpi-label">Horas en atención (año)</span>
        <span class="valor">{{ f0(totales.horas_atencion) }}</span>
        <span class="det">horas disponibles para atender</span>
      </div>
    </section>

    <section v-if="fila" class="horas" aria-labelledby="horas-titulo">
      <h2 id="horas-titulo">Distribución de horas</h2>
      <dl>
        <div><dt>Directa</dt><dd>{{ fila.horas_directa }} h</dd></div>
        <div><dt>Indirecta</dt><dd>{{ fila.horas_indirecta }} h</dd></div>
        <div><dt>No asistencial (NAS)</dt><dd>{{ fila.horas_nas }} h</dd></div>
      </dl>
    </section>

    <section v-if="fila" class="comparacion" aria-labelledby="comp-titulo">
      <h2 id="comp-titulo">Planificado vs. realizado (SIC)</h2>
      <p>
        Meta: <strong>{{ fila.meta_atenciones }}</strong> atenciones ·
        Realizado SIC: <strong>{{ fila.atenciones_sic }}</strong>
        <AlertaDesviacion :meta-atenciones="fila.meta_atenciones" :atenciones-sic="fila.atenciones_sic" />
      </p>
    </section>

    <!-- Detalle mensual (planificación mes a mes y trazabilidad del cálculo) -->
    <template v-if="detalle">
      <GraficoAtencionesMes
        :meses="detalle.meses"
        :ultimo-mes="detalle.ultimo_mes_buk"
        :pct-meta="detalle.parametros.pct_meta"
      />
      <TablaMensualProfesional :detalle="detalle" :totales="totales" />
      <CalculoTasaSemanal :detalle="detalle" />
    </template>
    <p v-else-if="errorDetalle" class="aviso" role="status">{{ errorDetalle }}</p>

    <ResumenLecturaFacil v-if="fila" :fila="fila" />

    <BitacoraPanel :eventos="bitacora" />
  </div>
  <p v-else-if="!cargando && !cargandoDetalle">No se encontró el profesional {{ idProfesional }}.</p>
  <p v-else>Cargando...</p>
</template>

<script setup lang="ts">
import { MESES_LARGO } from '~/composables/useDetalleProfesional'

const route = useRoute()
const idProfesional = computed(() => route.params.id as string)

const { cargar, filas, bitacora, cargando } = usePlanificacion()
const fila = computed(() => filas.value.find((f) => f.id_profesional === idProfesional.value) || null)

const { obtenerPorProfesional } = useIndicadores()
const indicador = ref<Awaited<ReturnType<typeof obtenerPorProfesional>> | null>(null)

const {
  detalle, totales, error: errorDetalle, cargando: cargandoDetalle, cargar: cargarDetalle,
} = useDetalleProfesional()

const instituto = computed(() => fila.value?.instituto || detalle.value?.profesional.instituto || '')
const cargoBonito = computed(() => {
  const c = detalle.value?.profesional.cargo || ''
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
})

const f0 = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 0 })
const f1 = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 1 })
function ym(s?: string) {
  if (!s) return '—'
  const [y, m] = s.split('-')
  return `${MESES_LARGO[Number(m) - 1]} ${y}`
}

async function recargar() {
  await Promise.all([
    cargar(idProfesional.value),
    cargarDetalle(idProfesional.value),
    obtenerPorProfesional(idProfesional.value)
      .then((r) => (indicador.value = r))
      .catch(() => (indicador.value = null)),
  ])
}

watch(idProfesional, recargar)
onMounted(recargar)
</script>

<style scoped>
.volver {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.ficha {
  color: var(--texto-secundario);
  margin-top: -0.5rem;
}
.vista-trabajador {
  display: inline-block;
  margin: 0 0 1rem;
  font-weight: 600;
  color: var(--marca-rojo);
}
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13.75rem, 1fr));
  gap: 1rem;
}
.kpis-anuales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.kpi-mini {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 1rem 1.25rem;
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 10px;
}
.kpi-mini .valor {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--marca-navy-suave);
  font-variant-numeric: tabular-nums;
}
.kpi-mini .det {
  font-size: 0.78rem;
  color: var(--texto-secundario);
}
.horas,
.comparacion {
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 1.25rem;
  margin-top: 1rem;
}
/* separación de los paneles existentes (sus raíces heredan el scope de esta página) */
.lectura-facil,
.bitacora {
  margin-top: 1rem;
}
.aviso {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--alerta-suave);
  color: #92400e;
  font-size: 0.9rem;
}
dl {
  display: flex;
  gap: 2rem;
  margin: 0;
}
dl > div {
  display: flex;
  flex-direction: column;
}
dt {
  font-size: 0.8rem;
  color: var(--texto-secundario);
}
dd {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}
</style>
