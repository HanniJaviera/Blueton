<template>
  <div class="barras">
    <ul class="lista">
      <li v-for="it in items" :key="it.label" class="fila">
        <span class="label" :title="it.label">{{ it.label }}</span>
        <span class="pista" role="img" :aria-label="`${it.label}: ${it.texto ?? it.valor}`">
          <span class="relleno" :style="{ width: pct(it.valor), background: it.color || 'var(--marca-navy-suave)' }"></span>
          <span v-if="linea" class="linea" :style="{ left: pct(linea.valor) }"></span>
        </span>
        <span class="texto">{{ it.texto ?? it.valor }}</span>
      </li>
    </ul>
    <p v-if="linea" class="leyenda-linea"><span class="ej-linea" aria-hidden="true"></span>{{ linea.etiqueta }}</p>
  </div>
</template>

<script setup lang="ts">
// Barras horizontales simples (HTML), con línea de referencia opcional.
const props = defineProps<{
  items: { label: string; valor: number; texto?: string; color?: string }[]
  max?: number
  linea?: { valor: number; etiqueta: string } | null
}>()
const tope = computed(() => props.max ?? Math.max(1, ...props.items.map((i) => i.valor), props.linea?.valor ?? 0))
const pct = (v: number) => `${Math.max(0, Math.min(100, (v / tope.value) * 100))}%`
</script>

<style scoped>
.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.fila {
  display: grid;
  grid-template-columns: minmax(90px, 32%) 1fr 4.2rem;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
}
.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pista {
  position: relative;
  height: 18px;
  background: var(--fondo);
  border-radius: 6px;
}
.relleno {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 6px;
}
.linea {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 0;
  border-left: 2px dashed var(--texto);
}
.texto {
  text-align: right;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.leyenda-linea {
  margin: 0.6rem 0 0;
  font-size: 0.78rem;
  color: var(--texto-secundario);
}
.ej-linea {
  display: inline-block;
  width: 14px;
  height: 0;
  border-top: 2px dashed var(--texto);
  margin-right: 0.4rem;
  vertical-align: middle;
}
</style>
