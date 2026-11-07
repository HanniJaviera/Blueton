<template>
  <div class="inicio">
    <header class="barra-sup">
      <div class="marca">
        <img src="/Logo_DuocUC.svg.webp" alt="Duoc UC" class="logo logo-duoc" />
        <span class="divisor" aria-hidden="true"></span>
        <img src="/ssc-blueprism-logo-white.webp" alt="SS&C Blue Prism" class="logo" />
      </div>
      <div class="marca">
        <span class="chip-logo"><img src="/logo-teleton-cruz.png" alt="Teletón" /></span>
        <span class="chip-logo"><img src="/icono-blueton.png" alt="Bluetón" /></span>
      </div>
    </header>

    <!-- 3 columnas: logo Teletón | botones (centro exacto de la página) | logo Bluetón -->
    <div class="cuerpo">
      <aside class="lado-logo lado-izq">
        <img src="/logo-teleton.png" alt="Teletón" class="logo-teleton" />
      </aside>

      <main id="contenido" class="centro">
        <p class="sobre">Botathon 2026 · Teletón «Cada hora cuenta»</p>
        <h1>Planificación Asistencial</h1>
        <p class="bajada">¿Cómo quieres entrar?</p>

        <nav class="opciones" aria-label="Elegir tipo de acceso">
          <NuxtLink to="/nacional" class="opcion" @click="elegir('admin')">
            <span class="icono" aria-hidden="true">📊</span>
            <span class="titulo">Administrador</span>
            <span class="detalle">Vista nacional, institutos, profesionales, bitácora y parámetros</span>
          </NuxtLink>
          <NuxtLink to="/mi-planificacion" class="opcion" @click="elegir('trabajador')">
            <span class="icono" aria-hidden="true">🩺</span>
            <span class="titulo">Trabajador</span>
            <span class="detalle">Mi meta de atenciones del mes y de dónde sale, explicado en simple</span>
          </NuxtLink>
        </nav>
      </main>

      <aside class="lado-logo lado-der">
        <div class="tarjeta-logo">
          <img src="/logo-blueton.png" alt="Bluetón" class="logo-blueton" />
        </div>
      </aside>
    </div>

    <footer class="pie">Equipo 6 · Duoc UC × SS&amp;C Blue Prism</footer>
  </div>
</template>

<script setup lang="ts">
// Pantalla de inicio: sin el layout de administración (barra con buscador y menú).
definePageMeta({ layout: false })
const { elegir } = useRol()
useHead({ title: 'Bluetón · Planificación Asistencial' })
</script>

<style scoped>
.inicio {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #ffffff;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(255, 255, 255, 0.14), transparent 60%),
    linear-gradient(160deg, #e11d48 0%, #be123c 55%, #0b0e26 140%);
}
.barra-sup {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
}
.marca {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
/* íconos de la esquina derecha: círculo blanco para que el rojo no se pierda sobre el fondo */
.chip-logo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(11, 14, 38, 0.25);
}
.chip-logo img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}
.logo {
  height: 26px;
  width: auto;
}
.logo-duoc {
  height: 28px;
}
.divisor {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.45);
}
.cuerpo {
  flex: 1;
  display: grid;
  /* columnas laterales iguales: la central queda en el centro exacto */
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
}
.lado-logo {
  display: flex;
  justify-content: center;
  align-items: center;
}
.logo-teleton {
  width: min(260px, 100%);
  height: auto;
}
.tarjeta-logo {
  background: #ffffff;
  border-radius: 24px;
  padding: 1.75rem;
  box-shadow: 0 12px 30px rgba(11, 14, 38, 0.28);
  width: min(320px, 100%);
}
.logo-blueton {
  display: block;
  width: 100%;
  height: auto;
}
.centro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.sobre {
  margin: 0;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  opacity: 0.9;
}
h1 {
  margin: 0.4rem 0 0.25rem;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
}
.bajada {
  margin: 0 0 2.25rem;
  font-size: 1.2rem;
  opacity: 0.95;
}
.opciones {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
}
.opcion {
  width: 280px;
  min-height: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.75rem 1.5rem;
  background: #ffffff;
  color: var(--texto);
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(11, 14, 38, 0.28);
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.opcion:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(11, 14, 38, 0.35);
  text-decoration: none;
}
.opcion:focus-visible {
  outline: 4px solid var(--marca-dorado);
  outline-offset: 4px;
}
.icono {
  font-size: 2.6rem;
}
.titulo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--marca-navy);
}
.detalle {
  font-size: 0.92rem;
  color: var(--texto-secundario);
  line-height: 1.4;
}
.pie {
  text-align: center;
  padding: 1rem;
  font-size: 0.8rem;
  opacity: 0.8;
}
/* Pantallas medianas y celular: logo arriba, botones debajo */
@media (max-width: 1100px) {
  /* pantallas angostas: los dos logos arriba, lado a lado, y los botones debajo */
  .cuerpo {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem 1rem;
  }
  .lado-izq {
    order: 1;
    justify-content: flex-end;
  }
  .lado-der {
    order: 2;
    justify-content: flex-start;
  }
  .centro {
    order: 3;
    grid-column: 1 / -1;
  }
  .logo-teleton {
    width: 120px;
  }
  .tarjeta-logo {
    width: 140px;
    padding: 0.8rem;
    border-radius: 16px;
  }
}
@media (max-width: 480px) {
  .barra-sup {
    padding: 1rem;
    gap: 0.5rem;
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
  .chip-logo {
    width: 34px;
    height: 34px;
  }
  .chip-logo img {
    width: 26px;
    height: 26px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .opcion { transition: none; }
  .opcion:hover { transform: none; }
}
</style>
