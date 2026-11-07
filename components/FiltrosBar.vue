<template>
  <div class="filtros-bar" role="search" aria-label="Filtros de planificación">
    <div class="filtro">
      <label for="f-instituto">Instituto</label>
      <select id="f-instituto" v-model="instituto" @change="filtros.setInstituto(instituto || null)">
        <option value="">Todos</option>
        <option v-for="i in institutos" :key="i" :value="i">{{ i }}</option>
      </select>
    </div>

    <div class="filtro">
      <label for="f-area">Área</label>
      <select id="f-area" v-model="area" @change="filtros.setArea(area || null)">
        <option value="">Todas</option>
        <option v-for="a in areas" :key="a" :value="a">{{ a }}</option>
      </select>
    </div>

    <div class="filtro">
      <label for="f-cargo">Cargo</label>
      <select id="f-cargo" v-model="cargo" @change="filtros.setCargo(cargo || null)">
        <option value="">Todos</option>
        <option v-for="c in cargos" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div class="filtro">
      <label for="f-tipo">Tipo de atención</label>
      <select id="f-tipo" v-model="tipo" @change="filtros.setTipoAtencion((tipo || null) as any)">
        <option value="">Todas</option>
        <option value="directa">Directa</option>
        <option value="indirecta">Indirecta</option>
        <option value="nas">No asistencial</option>
      </select>
    </div>

    <SelectorPeriodo />

    <button type="button" class="btn-limpiar" @click="limpiar">Limpiar filtros</button>
  </div>
</template>

<script setup lang="ts">
import { useFiltrosStore } from '~/stores/filtros'

// Listas de opciones: en producción vendrían de /planificacion (valores
// únicos) o de un endpoint de catálogo; aquí se dejan fijas para el MVP.
const institutos = ['Santiago', 'Concepción', 'Arica', 'Ñuble', 'Aysén']
const areas = ['Kinesiología', 'Terapia Ocupacional', 'Psicología', 'Educación', 'Fonoaudiología', 'Asistente Social', 'Arte', 'Deporte']
const cargos = ['Kinesiólogo', 'Terapeuta Ocupacional', 'Psicólogo', 'Educador', 'Fonoaudiólogo', 'Asistente Social']

const filtros = useFiltrosStore()
const instituto = ref(filtros.instituto || '')
const area = ref(filtros.area || '')
const cargo = ref(filtros.cargo || '')
const tipo = ref(filtros.tipoAtencion || '')

function limpiar() {
  instituto.value = ''
  area.value = ''
  cargo.value = ''
  tipo.value = ''
  filtros.limpiar()
}
</script>

<style scoped>
.filtros-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 1rem;
  padding: 1rem;
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 10px;
}
.filtro {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 10rem;
}
.filtro label {
  font-size: 0.85rem;
  font-weight: 600;
}
.filtro select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--borde);
  border-radius: 6px;
  background: var(--fondo);
  color: var(--texto);
}
.btn-limpiar {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--borde);
  background: transparent;
  color: var(--texto);
  cursor: pointer;
  font-weight: 600;
}
.btn-limpiar:hover {
  background: var(--acento-suave);
}
/* Teléfono: filtros en dos columnas de ancho completo; el mes y "Limpiar" ocupan la fila entera */
@media (max-width: 600px) {
  .filtros-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    padding: 0.85rem;
  }
  .filtro {
    min-width: 0;
  }
  .filtro select {
    width: 100%;
    font: inherit;
    font-size: 0.95rem;
  }
  .filtros-bar > :not(.filtro) {
    grid-column: 1 / -1;
  }
}
</style>
