<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Letra grande y alto contraste se aplican a todo el sitio como clases en <html>.
const { letraGrande, altoContraste } = useAccesibilidad()
useHead({
  htmlAttrs: {
    lang: 'es',
    class: computed(() => [letraGrande.value && 'letra-grande', altoContraste.value && 'alto-contraste'].filter(Boolean).join(' ')),
  },
})
</script>
