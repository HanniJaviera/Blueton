<template>
  <div class="mi-plan">
    <p v-if="cargando">Cargando tu planificación…</p>
    <p v-else-if="!detalle" class="aviso" role="status">
      {{ error || 'No encontramos tu planificación.' }}
      <button type="button" class="no-soy" @click="salir">Volver al inicio</button>
    </p>

    <template v-else>
      <div class="barra">
        <!-- "Leer en voz alta" y "Letra grande" están en las opciones de lectura comunes (layout) -->
        <h1 id="saludo" data-leer>
          Hola, {{ quien }}<span class="id"> (ID {{ detalle.profesional.persona_id }})</span>
        </h1>
      </div>

      <!-- Selector de mes -->
      <nav class="meses-nav" aria-label="Elegir mes">
        <button type="button" class="btn flecha" :disabled="mesSel <= 1" aria-label="Mes anterior" @click="mesSel--">◀</button>
        <label for="sel-mes" class="sr-only">Mes</label>
        <select id="sel-mes" v-model.number="mesSel">
          <option v-for="m in detalle.meses" :key="m.mes" :value="m.mes">
            {{ cap(MESES_LARGO[m.mes - 1]) }}{{ m.mes === mesActual ? ' (este mes)' : '' }}
          </option>
        </select>
        <button type="button" class="btn flecha" :disabled="mesSel >= 12" aria-label="Mes siguiente" @click="mesSel++">▶</button>
      </nav>

      <div data-leer :class="['texto', { grande }]">
        <!-- Mensaje principal -->
        <section class="principal" aria-labelledby="t-principal">
          <h2 id="t-principal" class="sr-only">Tu meta del mes</h2>
          <p v-if="mes && mes.sem_habiles > 0" class="frase-grande">
            {{ etiquetaMes }} tienes planificadas <strong>{{ f0(mes.plan_dir) }} atenciones</strong>
            y tu meta es <strong class="meta">{{ f0(mes.meta_dir) }}</strong>.
          </p>
          <p v-else-if="mes" class="frase-grande">
            {{ etiquetaMes }} no tienes atenciones planificadas{{ motivoCero ? `, porque ${motivoCero}` : '' }}.
            Tu meta es <strong class="meta">0</strong>.
          </p>
          <p v-if="mes && mes.mes > ultimoMes" class="nota-estimado">
            Este mes es una estimación: usamos tus horas de {{ MESES_LARGO[ultimoMes - 1] }}, el último mes informado por Recursos Humanos.
          </p>
        </section>

        <!-- ¿Por qué? -->
        <section v-if="mes && tasa && mes.sem_habiles > 0" class="porque" aria-labelledby="t-porque">
          <h2 id="t-porque">¿Por qué?</h2>
          <p>Trabajas <strong>{{ f0(tasa.h) }} horas</strong> a la semana.</p>
          <p>
            Unas <strong>{{ horasNoAtencion }}</strong> de esas horas son para pausas, reuniones y otras tareas
            que no son atención<template v-if="asignaciones.length">, incluidas tus tareas de
            <template v-for="(a, i) in asignaciones" :key="a">{{ i ? (i === asignaciones.length - 1 ? ' y ' : ', ') : '' }}“{{ a }}”</template></template>.
          </p>
          <p>
            Con las <strong>{{ horasAtencion }} horas</strong> que quedan puedes hacer unas
            <strong>{{ tasa.bf }} atenciones por semana</strong>.
          </p>
          <p v-if="mes.sem_habiles > 0">
            {{ etiquetaMes }} trabajas <strong>{{ semanasTexto(mes.sem_habiles) }}</strong>{{
              textoDescuentos ? `, descontando ${textoDescuentos}` : '' }}.
          </p>

          <div v-if="mes.sem_habiles > 0" class="cuenta" role="group" aria-label="Cuenta de tu meta">
            <span class="paso"><b>{{ tasa.bf }}</b> atenciones por semana</span>
            <span class="op" aria-hidden="true">×</span>
            <span class="paso"><b>{{ f2(mes.sem_habiles) }}</b> semanas</span>
            <span class="op" aria-hidden="true">=</span>
            <span class="paso"><b>{{ f0(mes.plan_dir) }}</b> planificadas</span>
            <span class="op" aria-hidden="true">→</span>
            <span class="paso destacado"><b>{{ pctMeta }}%</b> = meta de <b>{{ f0(mes.meta_dir) }}</b></span>
          </div>
          <p class="nota" v-if="mes.sem_habiles > 0">
            La meta es el {{ pctMeta }}% de lo planificado, para dejar espacio a imprevistos.
          </p>
        </section>

        <!-- Avisos -->
        <section v-if="avisos.length" class="avisos" aria-labelledby="t-avisos">
          <h2 id="t-avisos">Para que lo tengas en cuenta</h2>
          <ul>
            <li v-for="a in avisos" :key="a.texto" :class="a.clase">
              <span class="icono" aria-hidden="true">{{ a.icono }}</span>
              <span>{{ a.texto }}</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Año completo -->
      <section class="anio" aria-labelledby="t-anio">
        <h2 id="t-anio">Tu año, mes a mes</h2>
        <p class="nota">Toca un mes para ver su explicación.</p>
        <ol class="tiras">
          <li v-for="m in detalle.meses" :key="m.mes">
            <button
              type="button"
              :class="['tira', { sel: m.mes === mesSel, cero: m.sem_habiles === 0, estimado: m.mes > ultimoMes }]"
              :aria-pressed="m.mes === mesSel"
              :aria-label="`${MESES_LARGO[m.mes - 1]}: meta ${m.meta_dir} atenciones${m.sem_habiles === 0 ? ', sin atenciones' : ''}${m.mes > ultimoMes ? ', estimado' : ''}`"
              @click="mesSel = m.mes"
            >
              <span class="t-mes">{{ MESES_CORTO[m.mes - 1] }}</span>
              <span class="t-meta">{{ m.sem_habiles === 0 ? (iconoCero(m) || '—') : f0(m.meta_dir) }}</span>
              <span class="t-sub">{{ m.sem_habiles === 0 ? 'sin atenciones' : 'meta' }}</span>
            </button>
          </li>
        </ol>
        <p class="total">
          En todo el año tu meta es de <strong>{{ f0(totales?.meta_dir || 0) }} atenciones</strong>
          (de {{ f0(totales?.plan_dir || 0) }} planificadas).
        </p>
      </section>

      <p class="pie">
        ¿Algo no calza con lo que sabes de tu contrato, vacaciones o licencias? Avísale a tu jefatura para revisarlo.
        <NuxtLink v-if="rol === 'admin'" :to="`/profesional/${encodeURIComponent(idProfesional)}`">Ver el detalle técnico</NuxtLink>
        <button v-else type="button" class="no-soy" @click="salir">¿No eres tú? Salir</button>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { MESES_CORTO, MESES_LARGO, tasaDelMes, type MesDetalle } from '~/composables/useDetalleProfesional'

definePageMeta({ layout: 'trabajador' })
const route = useRoute()
const { rol, salir } = useRol()
const idProfesional = computed(() => route.params.id as string)

const { detalle, totales, cargando, error, cargar } = useDetalleProfesional()
const bitacora = ref<any[]>([])

const mesActual = new Date().getMonth() + 1
const mesSel = ref(mesActual)
const { letraGrande: grande } = useAccesibilidad() // el mismo botón "Letra grande" de todo el sitio

const { cargarDatos } = useDatosBlob()
async function recargar() {
  await cargar(idProfesional.value)
  try {
    // La misma bitácora que el resto del sitio (Blob: bitacora.json + cambios de parámetros).
    bitacora.value = (await cargarDatos()).bitacora.filter((b) => b.id_profesional === idProfesional.value)
  } catch {
    bitacora.value = []
  }
}
watch(idProfesional, recargar)
onMounted(recargar)

/* ---------- formato ---------- */
const f0 = (n: number) => Math.round(n).toLocaleString('es-CL')
const f2 = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 2 })
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
function semanasTexto(s: number) {
  const r = Math.round(s * 2) / 2
  const ent = Math.floor(r)
  if (r === 0) return 'menos de media semana'
  if (r === 0.5) return 'media semana'
  const base = `${ent} semana${ent === 1 ? '' : 's'}`
  return r % 1 ? `${base} y media` : `${Math.abs(r - s) > 0.05 ? 'unas ' : ''}${base}`
}
function lista(items: string[]) {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}
function mesDe(v: string | undefined) {
  const m = /^\d{4}-(\d{2})/.exec(v || '')
  return m ? Number(m[1]) : null
}

/* ---------- datos del mes ---------- */
const mes = computed<MesDetalle | null>(() => detalle.value?.meses.find((m) => m.mes === mesSel.value) || null)
const tasa = computed(() => (detalle.value && mes.value ? tasaDelMes(detalle.value, mes.value.mes) : null))
const ultimoMes = computed(() => detalle.value?.ultimo_mes_buk ?? 12)
const pctMeta = computed(() => Math.round((detalle.value?.parametros.pct_meta ?? 0.9) * 100))
const etiquetaMes = computed(() =>
  mesSel.value === mesActual ? `Este mes (${MESES_LARGO[mesSel.value - 1]})` : `En ${MESES_LARGO[mesSel.value - 1]}`
)

const quien = computed(() => {
  const p = detalle.value!.profesional
  if (p.nombre) return p.nombre
  const c = p.cargo.toLowerCase().replace(/olog([oa])\b/g, 'ólog$1').replace(/ogico\b/g, 'ógico')
  return `${c} de ${p.instituto}`
})

// Horas: lo que no es atención = horas − horas disponibles para atender (redondeado para que sumen).
const horasAtencion = computed(() => (tasa.value ? Math.round(tasa.value.ax) : 0))
const horasNoAtencion = computed(() => (tasa.value ? Math.round(tasa.value.h) - horasAtencion.value : 0))
const asignaciones = computed(() =>
  (detalle.value?.parametros.asignaciones || [])
    .filter((a) => a.horas > 0 && !/^asignaci[oó]n\s*\d/i.test(a.nombre))
    .map((a) => a.nombre)
)

/* ---------- descuentos en palabras ---------- */
function frase(d: { tipo: string; dias: number; nombre?: string }) {
  const dias = Math.round(d.dias)
  const nd = dias >= 1 ? ` (${dias} día${dias === 1 ? '' : 's'})` : ''
  switch (d.tipo) {
    case 'permiso': return `tu permiso${nd}`
    case 'vacaciones': return 'tus vacaciones'
    case 'licencia': return 'tu licencia médica'
    case 'cumpleanos': return 'tu día de cumpleaños'
    case 'vispera': return `la víspera de ${d.nombre || 'feriado'}`
    case 'feriado_zona': return 'el feriado de zona extrema'
    case 'dias_anuales': return 'una parte de tus días administrativos del año (se reparten entre julio y diciembre)'
    default: return d.nombre || d.tipo
  }
}
const textoDescuentos = computed(() => {
  const m = mes.value
  if (!m) return ''
  if (m.descuentos?.length) return lista(m.descuentos.map(frase))
  return m.descuento_detalle ? m.descuento_detalle.toLowerCase() : ''
})
function motivo(m: MesDetalle) {
  const tipos = (m.descuentos || []).map((d) => d.tipo)
  if (tipos.includes('vacaciones')) return 'tienes vacaciones'
  if (tipos.includes('licencia')) return 'tienes licencia médica'
  if (m.descuentos?.length) return `descontamos ${lista(m.descuentos.map(frase))}`
  if (/vacaci/i.test(m.descuento_detalle || '')) return 'tienes vacaciones'
  if (/licencia/i.test(m.descuento_detalle || '')) return 'tienes licencia médica'
  return ''
}
const motivoCero = computed(() => (mes.value ? motivo(mes.value) : ''))
function iconoCero(m: MesDetalle) {
  const t = motivo(m)
  return t.includes('vacaciones') ? '🏖️' : t.includes('licencia') ? '🩺' : ''
}

/* ---------- avisos ---------- */
const promedioMeta = (meses: MesDetalle[]) => {
  const v = meses.filter((m) => m.sem_habiles > 0).map((m) => m.meta_dir)
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length / 5) * 5 : null
}
const avisos = computed(() => {
  const d = detalle.value
  if (!d) return []
  const out: { icono: string; texto: string; clase: string }[] = []

  for (const m of d.meses) {
    if (m.semanas > 0 && m.sem_habiles === 0 && m.mes !== mesSel.value) {
      const mot = motivo(m)
      out.push({
        icono: '📅',
        clase: 'info',
        texto: `En ${MESES_LARGO[m.mes - 1]} ${mot ? `${mot}, así que ` : ''}tu meta es 0.`,
      })
    }
  }

  for (const b of bitacora.value) {
    const desde = mesDe(b.vigencia_desde)
    const desdeTxt = desde ? `desde ${MESES_LARGO[desde - 1]}` : ''
    if (b.tipo === 'cambio_jornada' && desde) {
      const antes = promedioMeta(d.meses.filter((m) => m.mes < desde))
      const despues = promedioMeta(d.meses.filter((m) => m.mes >= desde))
      const sube = Number(b.valor_nuevo) > Number(b.valor_anterior)
      let t = `Cambio registrado: ${desdeTxt} tu jornada ${sube ? 'sube' : 'baja'} de ${b.valor_anterior} a ${b.valor_nuevo} horas.`
      if (antes && despues && antes !== despues) {
        t += ` Tu meta mensual ${despues < antes ? 'baja' : 'sube'} de ~${antes} a ~${despues}.`
      }
      out.push({ icono: '🔔', clase: 'cambio', texto: t })
    } else if (b.tipo) {
      const que = String(b.campo || '').replace(/_/g, ' ')
      out.push({
        icono: '🔔',
        clase: 'cambio',
        texto: `Cambio registrado ${desdeTxt}: ${que} ${b.valor_anterior != null ? `de ${b.valor_anterior} ` : ''}a ${b.valor_nuevo}.`,
      })
    }
  }
  return out
})

// Si cambia el mes mientras se lee, se corta la lectura (la retoma el botón común).
watch(mesSel, () => {
  if (import.meta.client && 'speechSynthesis' in window) window.speechSynthesis.cancel()
})

useHead({ title: 'Mi planificación · Teletón' })
</script>

<style scoped>
.mi-plan {
  max-width: 820px;
  margin: 0 auto;
  width: 100%;
}
.barra {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}
h1 {
  font-size: 1.7rem;
  margin: 0;
}
h1::first-letter {
  text-transform: uppercase;
}
h1 .id {
  font-weight: 400;
  font-size: 1rem;
  color: var(--texto-secundario);
}
.btn {
  font: inherit;
  font-size: 0.9rem;
  padding: 0.45rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--borde);
  background: var(--fondo-card);
  color: var(--texto);
  cursor: pointer;
}
.btn[aria-pressed='true'] {
  background: var(--marca-navy);
  color: #fff;
  border-color: var(--marca-navy);
}
.btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.meses-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
}
.meses-nav select {
  font: inherit;
  font-size: 1rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--borde);
  background: var(--fondo-card);
  min-width: 12rem;
}
.texto {
  font-size: 1.1rem;
  line-height: 1.6;
}
.texto.grande {
  font-size: 1.35rem;
}
section {
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-top: 1rem;
}
section h2 {
  margin: 0 0 0.5rem;
  font-size: 1.15em;
}
.principal {
  border-left: 6px solid var(--marca-rojo);
}
.frase-grande {
  font-size: 1.3em;
  margin: 0;
}
.frase-grande strong {
  color: var(--marca-navy-suave);
}
.frase-grande .meta {
  color: var(--marca-rojo);
  font-size: 1.15em;
}
.nota-estimado {
  margin: 0.5rem 0 0;
  font-size: 0.85em;
  color: var(--texto-secundario);
}
.porque p {
  margin: 0.35rem 0;
}
.cuenta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.85rem;
  background: var(--acento-suave);
  border-radius: 10px;
  font-size: 0.9em;
}
.paso {
  background: var(--fondo-card);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 0.3rem 0.65rem;
}
.paso.destacado {
  border-color: var(--marca-rojo);
  color: var(--critico-texto);
}
.op {
  font-weight: 700;
  color: var(--texto-secundario);
}
.nota {
  font-size: 0.8em;
  color: var(--texto-secundario);
  margin: 0.4rem 0 0;
}
.avisos ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.avisos li {
  display: flex;
  gap: 0.6rem;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
}
.avisos li.info {
  background: var(--acento-suave);
}
.avisos li.cambio {
  background: var(--alerta-suave);
}
.icono {
  font-size: 1.2em;
}
.anio h2 {
  font-size: 1.15rem;
  margin: 0;
}
.tiras li {
  display: flex;
}
.tiras {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 0.5rem;
}
.tira {
  width: 100%;
  height: 100%;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.6rem 0.25rem;
  border-radius: 10px;
  border: 1px solid var(--borde);
  background: var(--fondo-card);
  font: inherit;
  color: var(--texto);
  cursor: pointer;
}
.tira:hover {
  border-color: var(--marca-navy-suave);
}
.tira.sel {
  border: 2px solid var(--marca-rojo);
  background: var(--critico-suave);
}
.tira.cero {
  background: var(--fondo);
}
.tira.estimado .t-meta {
  font-style: italic;
}
.t-mes {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--texto-secundario);
}
.t-meta {
  font-size: 1.25rem;
  font-weight: 700;
}
.t-sub {
  font-size: 0.7rem;
  color: var(--texto-secundario);
}
.total {
  margin: 0.9rem 0 0;
}
.pie {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--texto-secundario);
}
.no-soy {
  font: inherit;
  font-size: 0.9rem;
  background: none;
  border: 0;
  padding: 0;
  color: var(--marca-navy-suave);
  text-decoration: underline;
  cursor: pointer;
}
.aviso {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--alerta-suave);
}
</style>
