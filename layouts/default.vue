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

      <div class="derecha">
        <BuscadorProfesional />
        <nav aria-label="Navegación principal">
          <NuxtLink to="/" class="inicio">Inicio</NuxtLink>
          <NuxtLink to="/nacional">Nacional</NuxtLink>
          <NuxtLink to="/graficos">Gráficos</NuxtLink>
          <NuxtLink to="/mi-planificacion">Mi planificación</NuxtLink>
          <NuxtLink to="/parametros">Parámetros</NuxtLink>
        </nav>
      </div>
    </header>

    <main id="contenido" class="contenido">
      <slot />
    </main>
  </div>
</template>

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
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}
</style>