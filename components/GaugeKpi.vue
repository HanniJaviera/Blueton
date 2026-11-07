<template>
  <div class="gauge" role="group" :aria-label="`${titulo}: ${texto}. ${estado.etiqueta}`">
    <span class="titulo">{{ titulo }}</span>
    <svg viewBox="0 0 200 116" aria-hidden="true" class="svg">
      <path :d="arco(1)" class="fondo" />
      <path v-if="fraccion > 0" :d="arco(fraccion)" :style="{ stroke: estado.color }" class="valor" />
      <!-- marca de la meta -->
      <line v-if="marca != null" v-bind="lineaMarca" class="marca" />
    </svg>
    <span class="numero" :style="{ color: estado.color }">{{ texto }}</span>
    <span class="estado" :class="estado.clase">{{ estado.icono }} {{ estado.etiqueta }}</span>
    <span class="detalle"><slot /></span>
  </div>
</template>

<script setup lang="ts">
// Medidor semicircular con semáforo. valor y umbrales en fracción (0.6 = 60%).
const props = withDefaults(
  defineProps<{
    titulo: string
    valor: number
    texto: string
    ok: number            // desde aquí es verde
    alerta: number        // desde aquí es amarillo; bajo esto, rojo
    max?: number          // tope del medidor (1 = 100%)
    marca?: number | null // línea de referencia (meta)
  }>(),
  { max: 1, marca: null }
)

const fraccion = computed(() => Math.max(0, Math.min(1, props.valor / props.max)))

function punto(f: number, r = 80) {
  const ang = Math.PI * (1 - f)
  return [100 + r * Math.cos(ang), 100 - r * Math.sin(ang)]
}
function arco(f: number) {
  const [x0, y0] = punto(0)
  const [x1, y1] = punto(f)
  return `M ${x0} ${y0} A 80 80 0 0 1 ${x1} ${y1}`
}
const lineaMarca = computed(() => {
  const f = Math.max(0, Math.min(1, (props.marca ?? 0) / props.max))
  const [x1, y1] = punto(f, 66)
  const [x2, y2] = punto(f, 94)
  return { x1, y1, x2, y2 }
})

const estado = computed(() => {
  if (props.valor >= props.ok) return { color: 'var(--ok)', clase: 'ok', icono: '●', etiqueta: 'Bien' }
  if (props.valor >= props.alerta) return { color: 'var(--alerta)', clase: 'alerta', icono: '▲', etiqueta: 'Atención' }
  return { color: 'var(--critico)', clase: 'critico', icono: '▼', etiqueta: 'Bajo lo esperado' }
})
</script>

<style scoped>
.gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.1rem 1rem;
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 12px;
}
.titulo {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--texto-secundario);
  align-self: stretch;
}
.svg {
  width: 100%;
  max-width: 190px;
  margin-top: 0.4rem;
}
.fondo,
.valor {
  fill: none;
  stroke-width: 18;
  stroke-linecap: round;
}
.fondo {
  stroke: var(--borde);
}
.marca {
  stroke: var(--texto);
  stroke-width: 3;
}
.numero {
  font-size: 2rem;
  font-weight: 800;
  margin-top: -2.4rem;
  line-height: 1.1;
}
.estado {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
}
.estado.ok { background: var(--ok-suave); color: var(--ok); }
.estado.alerta { background: var(--alerta-suave); color: #92400e; }
.estado.critico { background: var(--critico-suave); color: var(--critico-texto); }
.detalle {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--texto-secundario);
}
</style>
