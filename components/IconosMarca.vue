<template>
  <!-- Íconos de Teletón (solo el dibujo) y Bluetón, en círculos blancos para que se vean sobre el rojo -->
  <div class="iconos" :style="{ '--tam': `${tam}px` }">
    <span class="chip"><img src="/logo-teleton-cruz.png" alt="Teletón" /></span>
    <span class="chip"><img src="/icono-blueton.png" alt="Bluetón" /></span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ tam?: number }>(), { tam: 38 })
</script>

<style scoped>
.iconos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.chip {
  width: var(--tam);
  height: var(--tam);
  border-radius: 50%;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(11, 14, 38, 0.25);
  flex-shrink: 0;
}
.chip img {
  width: 78%;
  height: 78%;
  object-fit: contain;
}
</style>
