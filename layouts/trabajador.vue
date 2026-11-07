<template>
  <div class="layout">
    <a href="#contenido" class="skip-link">Saltar al contenido</a>
    <header class="header">
      <div class="marca">
        <img src="/Logo_DuocUC.svg.webp" alt="Duoc UC" class="logo logo-duoc" />
        <span class="divisor-logo"></span>
        <img src="/ssc-blueprism-logo-white.webp" alt="SS&C Blue Prism" class="logo" />
        <div class="app-title-badge">Mi planificación · <span class="teleton-text">Teletón</span></div>
      </div>

      <div class="acciones">
        <NuxtLink v-if="rol === 'admin'" to="/graficos" class="volver-admin">← Volver al administrador</NuxtLink>
        <button type="button" class="salir" @click="salir">Salir</button>
        <IconosMarca />
      </div>
    </header>

    <main id="contenido" class="contenido">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Layout de la vista del trabajador: sin buscador ni menú de administración.
const { rol, salir } = useRol()
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.skip-link {
  position: absolute;
  left: -999px;
  top: 0;
  background: #0b0e26;
  color: #fff;
  padding: 0.5rem 1rem;
  z-index: 2000;
}
.skip-link:focus {
  left: 0;
}
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: #e11d48;
  color: #ffffff;
  border-bottom: 3.5px solid #ffffff;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
}
.marca {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.logo {
  height: 24px;
  width: auto;
}
.logo-duoc {
  height: 26px;
}
.divisor-logo {
  width: 1px;
  height: 18px;
  background-color: rgba(255, 255, 255, 0.4);
}
.app-title-badge {
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 0.25rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 500;
  white-space: nowrap;
}
.teleton-text {
  font-weight: 700;
}
.acciones {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.volver-admin {
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
}
.salir {
  font: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.salir:hover {
  background: rgba(255, 255, 255, 0.15);
}
.contenido {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}
/* Celular: la barra se acomoda en varias líneas y no se sale de la pantalla */
@media (max-width: 760px) {
  .header {
    padding: 0.75rem 1rem;
  }
  .app-title-badge {
    display: none;
  }
}
</style>
