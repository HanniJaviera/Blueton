<template>
  <div>
    <h1>Parámetros</h1>
    <p class="intro">
      Reglas editables sin tocar código: porcentajes por cargo y tramo, minutos estándar,
      asignaciones especiales y calendario.
    </p>

    <p v-if="!params">Cargando...</p>

    <template v-else>
      <section class="bloque" aria-labelledby="dist-titulo">
        <h2 id="dist-titulo">Distribución por cargo y tramo</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Cargo</th>
              <th scope="col">Tramo</th>
              <th scope="col">% directo</th>
              <th scope="col">% indirecto</th>
              <th scope="col">% NAS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, i) in params.distribucion_por_cargo_tramo" :key="i">
              <td>{{ d.cargo }}</td>
              <td>{{ d.tramo }}</td>
              <td><input type="number" step="0.01" v-model.number="d.pct_directo" :aria-label="`% directo ${d.cargo} ${d.tramo}`" /></td>
              <td><input type="number" step="0.01" v-model.number="d.pct_indirecto" :aria-label="`% indirecto ${d.cargo} ${d.tramo}`" /></td>
              <td><input type="number" step="0.01" v-model.number="d.pct_nas" :aria-label="`% NAS ${d.cargo} ${d.tramo}`" /></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="bloque" aria-labelledby="asig-titulo">
        <h2 id="asig-titulo">Asignaciones especiales</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Horas semanales</th>
              <th scope="col">Requiere autorización</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in params.asignaciones_especiales" :key="i">
              <td>{{ a.nombre }}</td>
              <td><input type="number" step="0.25" v-model.number="a.horas_semanales" :aria-label="`Horas de ${a.nombre}`" /></td>
              <td>
                <input type="checkbox" v-model="a.requiere_autorizacion" :aria-label="`${a.nombre} requiere autorización`" />
              </td>
            </tr>
          </tbody>
        </table>
        <p class="nota">Máximo {{ params.max_asignaciones_sobre_30h }} asignaciones para profesionales con más de 30 h semanales.</p>
      </section>

      <section class="bloque" aria-labelledby="meta-titulo">
        <h2 id="meta-titulo">Meta de gestión</h2>
        <label for="pct-meta">% mínimo de cumplimiento</label>
        <input id="pct-meta" type="number" step="0.01" v-model.number="params.pct_meta" />
      </section>

      <div class="acciones">
        <button type="button" @click="guardarCambios" :disabled="guardando">
          {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
        </button>
        <span v-if="mensaje" role="status" class="mensaje">{{ mensaje }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { obtener, guardar } = useParametros()
const params = ref<any>(null)
const guardando = ref(false)
const mensaje = ref('')

onMounted(async () => {
  params.value = await obtener()
})

async function guardarCambios() {
  guardando.value = true
  mensaje.value = ''
  try {
    await guardar(params.value)
    mensaje.value = 'Cambios guardados.'
  } catch {
    mensaje.value = 'No se pudo guardar. Intenta de nuevo.'
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.intro {
  color: var(--texto-secundario);
  max-width: 60ch;
}
.bloque {
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}
h2 {
  margin-top: 0;
  font-size: 1.1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--borde);
  font-size: 0.9rem;
}
input[type='number'] {
  width: 5.5rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--borde);
  border-radius: 4px;
}
.nota {
  font-size: 0.8rem;
  color: var(--texto-secundario);
}
.acciones {
  display: flex;
  align-items: center;
  gap: 1rem;
}
button {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  background: var(--marca-rojo);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.mensaje {
  color: var(--ok);
  font-weight: 600;
}
</style>
