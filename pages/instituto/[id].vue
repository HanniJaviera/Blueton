<template>
  <div>
    <NuxtLink to="/nacional" class="volver">← Vista Nacional</NuxtLink>
    <h1>Instituto {{ instituto }}</h1>

    <FiltrosBar />

    <div class="kpis" v-if="indicador">
      <KpiMeta :meta-gestion="indicador.meta_gestion" />
      <KpiFoja :foja="indicador.foja" />
    </div>

    <TablaConsolidado
      :titulo="`Profesionales de ${instituto}`"
      :filas="filasInstituto"
      agrupar-por="profesional"
    />

    <BitacoraPanel :eventos="bitacoraInstituto" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const instituto = computed(() => decodeURIComponent(route.params.id as string))

const { cargar, filas, bitacora } = usePlanificacion()
const filtros = useFiltrosStore()

const { obtenerNacional } = useIndicadores()
const nacional = ref<Awaited<ReturnType<typeof obtenerNacional>> | null>(null)

const filasInstituto = computed(() => filas.value.filter((f) => f.instituto === instituto.value))
const bitacoraInstituto = computed(() =>
  bitacora.value.filter((b) => filasInstituto.value.some((f) => f.id_profesional === b.id_profesional))
)
const indicador = computed(() =>
  nacional.value?.instituciones.find((i) => i.instituto === instituto.value) || null
)

async function recargar() {
  filtros.setInstituto(instituto.value)
  await cargar()
  nacional.value = await obtenerNacional()
}

watch(() => [filtros.area, filtros.cargo, filtros.mes, instituto.value], recargar)
onMounted(recargar)
</script>

<style scoped>
.volver {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
</style>
