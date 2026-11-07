<template>
  <div>
    <div class="barra" role="img" :aria-label="descripcion">
      <span
        v-for="p in partes" :key="p.label" class="seg"
        :style="{ width: `${(p.valor / total) * 100}%`, background: p.color }"
      >
        <span v-if="p.valor / total >= 0.08">{{ Math.round((p.valor / total) * 100) }}%</span>
      </span>
    </div>
    <ul class="leyenda">
      <li v-for="p in partes" :key="p.label">
        <span class="sw" :style="{ background: p.color }" aria-hidden="true"></span>
        <b>{{ p.label }}</b>: {{ Math.round(p.valor).toLocaleString('es-CL') }} h ({{ Math.round((p.valor / total) * 100) }}%)
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Barra 100% apilada (por ejemplo, en qué se usan las horas).
const props = defineProps<{ partes: { label: string; valor: number; color: string }[] }>()
const total = computed(() => Math.max(1, props.partes.reduce((a, p) => a + p.valor, 0)))
const descripcion = computed(() =>
  props.partes.map((p) => `${p.label} ${Math.round((p.valor / total.value) * 100)}%`).join(', ')
)
</script>

<style scoped>
.barra {
  display: flex;
  height: 38px;
  border-radius: 10px;
  overflow: hidden;
}
.seg {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
}
.leyenda {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
}
.sw {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 0.4rem;
  vertical-align: -1px;
}
</style>
