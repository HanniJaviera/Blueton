<template>
  <div class="lectura" :class="{ 'sobre-color': sobreColor }" role="group" aria-label="Opciones de lectura" data-no-leer>
    <button type="button" :aria-pressed="letraGrande" @click="letraGrande = !letraGrande">
      <span aria-hidden="true">A+</span> Letra grande
    </button>
    <button type="button" :aria-pressed="altoContraste" @click="altoContraste = !altoContraste">
      <span aria-hidden="true">◐</span> Alto contraste
    </button>
    <button v-if="vozDisponible" type="button" :aria-pressed="leyendo" @click="alternarLectura">
      <span aria-hidden="true">{{ leyendo ? '⏹' : '🔊' }}</span> {{ leyendo ? 'Detener lectura' : 'Leer en voz alta' }}
    </button>
  </div>
</template>

<script setup lang="ts">
// Opciones de lectura de todas las páginas: letra grande, alto contraste y leer en voz alta.
// Lee los elementos marcados con [data-leer] (si la página los define) o, si no, todo
// el contenido principal (#contenido), sin menús, gráficos ni formularios.
withDefaults(defineProps<{ sobreColor?: boolean }>(), { sobreColor: false })

const { letraGrande, altoContraste } = useAccesibilidad()
const vozDisponible = ref(false)
const leyendo = ref(false)
const route = useRoute()

onMounted(() => {
  vozDisponible.value = 'speechSynthesis' in window
})

function textoParaLeer(): string {
  const marcados = [...document.querySelectorAll<HTMLElement>('[data-leer]')]
  const raices = marcados.length ? marcados : [document.getElementById('contenido') || document.body]
  return raices
    .map((raiz) => {
      const copia = raiz.cloneNode(true) as HTMLElement
      copia.querySelectorAll('[data-no-leer], form, select, svg, button, script, style, [aria-hidden="true"]').forEach((n) => n.remove())
      // Pausa al final de cada bloque, para que "Gráficos" y "Cómo vamos…" no se lean pegados.
      copia.querySelectorAll('h1, h2, h3, h4, p, li, dt, dd, td, th, label, legend, caption, summary, a > span').forEach((n) => n.append('. '))
      copia.querySelectorAll('span, strong, b').forEach((n) => n.append(' ')) // "va bien" + "Amarillo" no se pegan
      return copia.textContent || ''
    })
    .join('. ')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/(\s*[.:]\s*){2,}/g, '. ') // ". . ." o ":." → una sola pausa
    .replace(/([?!])\s*\./g, '$1')
    .trim()
}

function detener() {
  if (import.meta.client && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  leyendo.value = false
}

function alternarLectura() {
  if (leyendo.value) return detener()
  const texto = textoParaLeer()
  if (!texto) return
  // Chrome corta lecturas largas: se encola frase por frase (máx. ~220 caracteres).
  // Se corta solo en puntuación seguida de espacio: "55.682" no se parte.
  const frases = texto.split(/(?<=[.!?;:])\s+/).flatMap((f) => f.match(/.{1,220}(\s|$)/g) || [f]).filter((f) => f.trim())
  window.speechSynthesis.cancel()
  leyendo.value = true
  frases.forEach((f, i) => {
    const u = new SpeechSynthesisUtterance(f.trim())
    u.lang = 'es-CL'
    u.rate = 0.95
    if (i === frases.length - 1) u.onend = () => (leyendo.value = false)
    window.speechSynthesis.speak(u)
  })
}

// Al cambiar de página o salir, se corta la lectura.
watch(() => route.fullPath, detener)
onBeforeUnmount(detener)
</script>

<style scoped>
.lectura {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.lectura button {
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--borde);
  background: var(--fondo-card);
  color: var(--texto);
  cursor: pointer;
}
.lectura button[aria-pressed='true'] {
  background: var(--marca-navy);
  border-color: var(--marca-navy);
  color: #ffffff;
}
.lectura button:focus-visible {
  outline: 3px solid var(--marca-dorado);
  outline-offset: 2px;
}
/* Sobre fondos de color (pantalla de inicio): botones claros translúcidos */
.sobre-color button {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.6);
  color: #ffffff;
}
.sobre-color button[aria-pressed='true'] {
  background: #ffffff;
  border-color: #ffffff;
  color: var(--marca-navy);
}
</style>
