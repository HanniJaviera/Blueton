<template>
  <div class="entrada">
    <h1>Mi planificación</h1>
    <p>Mira tu meta de atenciones de cada mes y de dónde sale, explicado en simple.</p>
    <form @submit.prevent="ir">
      <label for="mi-id">Escribe tu ID de profesional</label>
      <div class="fila">
        <input id="mi-id" v-model.trim="id" inputmode="text" placeholder="Ej.: P0123" autocomplete="off" required />
        <button type="submit">Ver mi planificación</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'trabajador' })
const id = ref('')
const router = useRouter()
const { rol, miId } = useRol()
function ir() {
  if (!id.value) return
  if (rol.value === 'trabajador') miId.value = id.value // queda fijo: solo verá su propio ID
  router.push(`/mi-planificacion/${encodeURIComponent(id.value)}`)
}
useHead({ title: 'Mi planificación · Teletón' })
</script>

<style scoped>
.entrada {
  max-width: 560px;
  margin: 2rem auto;
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 1.75rem;
  font-size: 1.05rem;
}
h1 {
  margin-top: 0;
}
label {
  display: block;
  font-weight: 600;
  margin: 1rem 0 0.4rem;
}
.fila {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
input {
  flex: 1;
  min-width: 10rem;
  font: inherit;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--borde);
  border-radius: 8px;
}
button {
  font: inherit;
  font-weight: 600;
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 8px;
  background: var(--marca-rojo);
  color: #fff;
  cursor: pointer;
}
</style>
