<template>
  <section class="bitacora" aria-labelledby="bitacora-titulo">
    <h2 id="bitacora-titulo">Bitácora de cambios</h2>
    <p class="subtitulo">Quién, qué, cuándo y por qué.</p>

    <ol class="lista">
      <li v-for="evento in eventos" :key="evento.id" class="item">
        <div class="item-cabecera">
          <span class="tipo">{{ etiquetaTipo(evento.tipo) }}</span>
          <time :datetime="evento.fecha">{{ formatearFecha(evento.fecha) }}</time>
        </div>
        <p class="item-detalle">
          <strong>{{ evento.campo }}</strong>:
          <span v-if="evento.valor_anterior !== null">{{ evento.valor_anterior }} → </span>
          {{ evento.valor_nuevo }}
          <span class="vigencia">(vigente desde {{ evento.vigencia_desde }})</span>
        </p>
        <p class="item-pie">{{ evento.quien }} — {{ evento.por_que }}</p>
      </li>
      <li v-if="!eventos.length" class="vacio">Sin cambios registrados.</li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { EventoBitacora } from '~/stores/planificacion'

defineProps<{ eventos: EventoBitacora[] }>()

const etiquetas: Record<string, string> = {
  cambio_jornada: 'Cambio de jornada',
  cambio_asignacion: 'Asignación especial',
  cambio_cargo: 'Cambio de cargo',
  alta: 'Alta',
  baja: 'Baja',
  cambio_vigencia: 'Cambio de vigencia',
  licencia: 'Licencia',
}
function etiquetaTipo(tipo: string) {
  return etiquetas[tipo] || tipo
}
function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<style scoped>
.bitacora {
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 1.25rem;
}
h2 {
  margin: 0;
  font-size: 1.1rem;
}
.subtitulo {
  margin: 0.15rem 0 1rem;
  color: var(--texto-secundario);
  font-size: 0.85rem;
}
.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.item {
  border-left: 3px solid var(--acento-fuerte);
  padding-left: 0.75rem;
}
.item-cabecera {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--texto-secundario);
}
.tipo {
  font-weight: 700;
  color: var(--acento-fuerte);
}
.item-detalle {
  margin: 0.2rem 0;
  font-size: 0.9rem;
}
.vigencia {
  color: var(--texto-secundario);
  font-size: 0.8rem;
}
.item-pie {
  margin: 0;
  font-size: 0.8rem;
  color: var(--texto-secundario);
}
.vacio {
  color: var(--texto-secundario);
  font-size: 0.85rem;
}
</style>
