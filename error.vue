<template>
  <!-- Página de error (dirección inexistente, falla al cargar): usa el layout normal,
       así también tiene las opciones de lectura (letra grande, contraste, voz). -->
  <NuxtLayout>
    <section class="error" aria-labelledby="error-titulo">
      <h1 id="error-titulo">{{ error?.statusCode === 404 ? 'No encontramos esta página' : 'Algo salió mal' }}</h1>
      <p>
        {{ error?.statusCode === 404
          ? 'La dirección no existe o cambió. Puedes volver al inicio y entrar de nuevo.'
          : 'Ocurrió un problema al cargar la página. Intenta de nuevo en unos segundos.' }}
      </p>
      <button type="button" @click="clearError({ redirect: '/' })">Volver al inicio</button>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError | null }>()
</script>

<style scoped>
.error {
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 2rem;
  max-width: 40rem;
  margin: 2rem auto;
}
h1 {
  margin-top: 0;
}
button {
  font: inherit;
  font-weight: 700;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: var(--marca-rojo);
  color: #ffffff;
  cursor: pointer;
}
</style>
