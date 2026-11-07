<template>
  <div>
    <h1>Vista Nacional</h1>

    <FiltrosBar />

    <div class="kpis" v-if="indicadores">
      <KpiMeta :meta-gestion="indicadores.meta_gestion_total" />
      <KpiFoja :foja="indicadores.foja_promedio" />
    </div>

    <TablaConsolidado
      titulo="Consolidado por instituto"
      :filas="filas"
      agrupar-por="instituto"
    />

    <BitacoraPanel :eventos="bitacora" />
  </div>
</template>

<script setup lang="ts">
const { cargar, filas, bitacora } = usePlanificacion()

const { obtenerNacional } = useIndicadores()
const indicadores = ref<Awaited<ReturnType<typeof obtenerNacional>> | null>(null)

const filtros = useFiltrosStore()

async function recargar() {
  await cargar()
  indicadores.value = await obtenerNacional()
}

watch(() => [filtros.instituto, filtros.area, filtros.cargo, filtros.mes], recargar)
onMounted(recargar)
</script>
