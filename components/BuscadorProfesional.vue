<template>
  <form class="buscador" role="search" aria-label="Buscar profesional" @submit.prevent="ir">
    <label for="buscar-prof" class="sr-only">Buscar profesional por nombre o ID</label>
    <input
      id="buscar-prof"
      v-model.trim="texto"
      type="search"
      list="lista-profesionales"
      placeholder="Buscar profesional (nombre o ID)"
      autocomplete="off"
      @focus="cargarLista"
    />
    <datalist id="lista-profesionales">
      <option v-for="p in profesionales" :key="p.id" :value="p.id">{{ p.nombre }} · {{ p.instituto }}</option>
    </datalist>
    <button type="submit">Buscar</button>
    <span v-if="mensaje" class="mensaje" role="status">{{ mensaje }}</span>
  </form>
</template>

<script setup lang="ts">
// Busca por ID (PersonaId) o por parte del nombre y abre /profesional/:id.
// La lista de sugerencias se pide aparte a /planificacion para no pisar
// los datos (store) de la página que se está viendo.
interface Opcion { id: string; nombre: string; instituto: string }

const config = useRuntimeConfig()
const router = useRouter()
const texto = ref('')
const mensaje = ref('')
const profesionales = ref<Opcion[]>([])
let cargada = false

async function cargarLista() {
  if (cargada) return
  cargada = true
  try {
    const filas = await $fetch<any[]>(`${config.public.apiBase}/planificacion`)
    const mapa = new Map<string, Opcion>()
    for (const f of filas || []) {
      const id = String(f.id_profesional ?? f.persona_id ?? '')
      if (id && !mapa.has(id)) mapa.set(id, { id, nombre: f.nombre ?? id, instituto: f.instituto ?? '' })
    }
    profesionales.value = [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
  } catch {
    cargada = false // reintenta en el próximo foco
  }
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

async function ir() {
  mensaje.value = ''
  const q = texto.value
  if (!q) return
  await cargarLista()
  const nq = normalizar(q)
  const porId = profesionales.value.find((p) => normalizar(p.id) === nq)
  const porNombre = profesionales.value.filter((p) => normalizar(p.nombre).includes(nq))
  let destino: string | null = null
  if (porId) destino = porId.id
  else if (porNombre.length === 1) destino = porNombre[0].id
  else if (porNombre.length > 1) {
    mensaje.value = `${porNombre.length} coincidencias: elige una de la lista`
    return
  } else if (/^\w+$/.test(q)) destino = q // ID que no está en la lista: se intenta igual
  if (!destino) {
    mensaje.value = 'Sin resultados'
    return
  }
  texto.value = ''
  router.push(`/profesional/${encodeURIComponent(destino)}`)
}
</script>

<style scoped>
.buscador {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  position: relative;
}
input {
  font: inherit;
  font-size: 0.88rem;
  width: 16rem;
  max-width: 45vw;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: #ffffff;
  color: var(--texto);
}
button {
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #ffffff;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
}
button:hover {
  background: rgba(255, 255, 255, 0.15);
}
.mensaje {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.35rem;
  background: var(--marca-navy);
  color: #fff;
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  white-space: nowrap;
}
</style>
