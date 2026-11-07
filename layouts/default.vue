<template>
  <div class="layout">
    <a href="#contenido" class="skip-link">Saltar al contenido</a>
    <header class="header">
      <div class="marca">
        <!-- Logos desde public/ -->
        <img src="/Logo_DuocUC.svg.webp" alt="Duoc UC" class="logo logo-duoc" />
        <span class="divisor-logo"></span>
        <img src="/ssc-blueprism-logo-white.webp" alt="SS&C Blue Prism" class="logo logo-blueprism" />

        <!-- Badge del título estilizado -->
        <div class="app-title-badge">
          Planificación Asistencial · <span class="teleton-text">Teletón</span>
        </div>
      </div>

      <!-- Solo en pantallas angostas: abre el menú desplegable -->
      <button
        type="button" class="menu-boton" aria-controls="menu-principal"
        :aria-expanded="menuAbierto" @click="menuAbierto = !menuAbierto"
      >
        <span aria-hidden="true">{{ menuAbierto ? '✕' : '☰' }}</span> Menú
      </button>

      <div class="derecha">
        <BuscadorProfesional />
        <nav id="menu-principal" aria-label="Navegación principal" :class="{ abierto: menuAbierto }">
          <NuxtLink to="/" class="inicio">Inicio</NuxtLink>
          <NuxtLink to="/graficos">Gráficos</NuxtLink>
          <NuxtLink to="/nacional">Nacional</NuxtLink>
          <NuxtLink to="/mi-planificacion">Mi planificación</NuxtLink>
          <NuxtLink to="/parametros">Parámetros</NuxtLink>
        </nav>
        <IconosMarca class="iconos-header" />
      </div>
    </header>

    <main id="contenido" class="contenido">
      <OpcionesLectura />
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Menú desplegable del teléfono: se cierra al cambiar de página o con Escape.
const menuAbierto = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (menuAbierto.value = false))
function alPresionar(e: KeyboardEvent) {
  if (e.key === 'Escape') menuAbierto.value = false
}
onMounted(() => window.addEventListener('keydown', alPresionar))
onBeforeUnmount(() => window.removeEventListener('keydown', alPresionar))
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

/* Header Fijo en Rojo Teletón con línea de acento Blanca */
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: #e11d48; /* Fondo Rojo Teletón */
  color: #ffffff;
  border-bottom: 3.5px solid #ffffff; /* Línea inferior Blanca */
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
}

.derecha {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.marca {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo {
  height: 24px;
  width: auto;
  display: block;
  object-fit: contain;
}

.logo-duoc {
  height: 26px;
}

/* Divisor sutil entre logos */
.divisor-logo {
  display: inline-block;
  width: 1px;
  height: 18px;
  background-color: rgba(255, 255, 255, 0.4);
  margin: 0 2px;
}

/* Badge con pill claro para contrastar sobre el fondo rojo */
.app-title-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 0.25rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: #ffffff;
  margin-left: 0.5rem;
  white-space: nowrap;
}

.teleton-text {
  color: #ffffff;
  font-weight: 700;
  margin-left: 4px;
}

/* Enlaces del menú en Blanco (con subrayado en active/hover) */
nav a {
  color: #ffffff;
  margin-left: 1.25rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  opacity: 0.9;
  transition: opacity 0.2s ease, text-decoration 0.2s ease;
}

nav a:hover,
nav a.router-link-active {
  opacity: 1;
  text-decoration: underline;
  text-underline-offset: 4px;
  font-weight: 700;
}

.contenido {
  flex: 1;
  width: 100%;
  max-width: 68.75rem; /* = 1100 px a letra normal; crece con la letra para no comprimir */
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}
.menu-boton {
  display: none;
}

/* Pantallas angostas (tablet y teléfono): logos + botón "Menú" arriba, buscador abajo,
   y los enlaces en un panel desplegable en vez de en línea. */
@media (max-width: 900px) {
  .header {
    flex-wrap: wrap;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
  }
  .app-title-badge {
    display: none;
  }
  .menu-boton {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font: inherit;
    font-weight: 700;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    padding: 0.45rem 0.9rem;
    cursor: pointer;
  }
  .menu-boton:focus-visible {
    outline: 3px solid var(--marca-dorado);
    outline-offset: 2px;
  }
  .derecha {
    width: 100%;
    flex-wrap: nowrap;
    justify-content: space-between;
  }
  .derecha > :first-child {
    flex: 1;
    min-width: 0;
  }
  nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--marca-navy);
    border-bottom: 3.5px solid #ffffff;
    box-shadow: 0 12px 24px rgba(11, 14, 38, 0.35);
    padding: 0.25rem 0;
  }
  nav.abierto {
    display: flex;
  }
  nav a {
    margin-left: 0;
    font-size: 1.05rem;
    padding: 0.85rem 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }
  nav a.router-link-active {
    background: rgba(255, 255, 255, 0.12);
    text-decoration: none;
    box-shadow: inset 4px 0 0 var(--marca-dorado);
  }
  .contenido {
    padding: 1rem;
  }
}

/* Teléfono: barra más baja y que no quede fija (deja más pantalla para el contenido);
   logos más chicos para que "Menú" quepa en la misma fila, y sin íconos de marca
   para que el buscador tenga espacio. */
@media (max-width: 600px) {
  .header {
    position: relative;
    padding: 0.6rem 0.85rem;
  }
  .marca {
    gap: 0.5rem;
  }
  .logo {
    height: 18px;
  }
  .logo-duoc {
    height: 20px;
  }
  .menu-boton {
    padding: 0.35rem 0.75rem;
  }
  /* íconos de marca (IconosMarca, último elemento de la barra) */
  .derecha > :deep(:last-child) {
    display: none;
  }
}
</style>