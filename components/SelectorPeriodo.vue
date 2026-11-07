<template>
  <div class="selector-periodo" role="group" aria-label="Selector de período">
    <label for="mes-select">Mes</label>
    <select id="mes-select" v-model="mes" @change="filtros.setMes(mes)">
      <option v-for="m in meses" :key="m.valor" :value="m.valor">{{ m.etiqueta }}</option>
    </select>
    <span class="badge-periodo" :aria-label="`Jornada legal: ${filtros.periodoLegal}`">
      {{ filtros.periodoLegal }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useFiltrosStore } from '~/stores/filtros'

const filtros = useFiltrosStore()
const mes = ref(filtros.mes)

const meses = [
  { valor: '2026-01', etiqueta: 'Enero 2026' },
  { valor: '2026-02', etiqueta: 'Febrero 2026' },
  { valor: '2026-03', etiqueta: 'Marzo 2026' },
  { valor: '2026-04', etiqueta: 'Abril 2026' },
  { valor: '2026-05', etiqueta: 'Mayo 2026' },
  { valor: '2026-06', etiqueta: 'Junio 2026' },
  { valor: '2026-07', etiqueta: 'Julio 2026' },
  { valor: '2026-08', etiqueta: 'Agosto 2026' },
  { valor: '2026-09', etiqueta: 'Septiembre 2026' },
  { valor: '2026-10', etiqueta: 'Octubre 2026' },
  { valor: '2026-11', etiqueta: 'Noviembre 2026' },
  { valor: '2026-12', etiqueta: 'Diciembre 2026' },
]
</script>

<style scoped>
.selector-periodo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.selector-periodo label {
  font-weight: 600;
}
.selector-periodo select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--borde);
  border-radius: 6px;
  background: var(--fondo-card);
  color: var(--texto);
}
.badge-periodo {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--acento-suave);
  color: var(--acento-fuerte);
  font-weight: 600;
}
</style>
