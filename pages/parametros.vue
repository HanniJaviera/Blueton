<template>
  <div>
    <h1>Parámetros</h1>
    <p class="intro">
      Reglas de la planificación, editables sin tocar código. Al guardar, el dashboard recalcula
      metas y atenciones de todos los profesionales y el cambio queda en la bitácora (quién, qué y por qué).
    </p>

    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-else-if="!params">Cargando…</p>

    <template v-else>
      <p class="origen">
        Versión {{ params.version }} ·
        {{ params.actualizado_en ? `actualizada el ${fechaHora(params.actualizado_en)} por ${params.actualizado_por}` : params.actualizado_por }}
      </p>

      <p v-if="sinDatos" class="aviso" role="status">
        Blue Prism aún no publica la planificación: puedes editar y guardar parámetros, y el impacto
        en la meta aparecerá cuando lleguen los datos.
      </p>

      <!-- Impacto en vivo: recalcula con lo que estás editando, antes de guardar -->
      <section v-else class="impacto" aria-live="polite">
        <div>
          <span class="et">Meta anual nacional (atenciones)</span>
          <strong>{{ f0(impacto.despues) }}</strong>
          <span v-if="impacto.despues !== impacto.antes" :class="impacto.despues > impacto.antes ? 'sube' : 'baja'">
            {{ impacto.despues > impacto.antes ? '▲' : '▼' }} {{ f0(Math.abs(impacto.despues - impacto.antes)) }}
            ({{ pctTxt((impacto.despues - impacto.antes) / (impacto.antes || 1)) }}) vs. guardado
          </span>
          <span v-else class="igual">sin cambios</span>
        </div>
        <div>
          <span class="et">Cambios sin guardar</span>
          <strong>{{ cambios.length }}</strong>
        </div>
      </section>

      <nav class="tabs" role="tablist" aria-label="Módulos de parámetros">
        <button
          v-for="(nombre, k, i) in PESTANAS" :key="k" type="button" role="tab"
          :aria-selected="modulo === k" :class="{ activa: modulo === k }" @click="modulo = k"
        >{{ i + 1 }}. {{ nombre }}</button>
      </nav>

      <!-- 1 y 2. Distribución por cargo y tramo + minutos estándar -->
      <section v-if="modulo === 'distribucion'" class="bloque">
        <h2>Distribución por cargo y tramo · Minutos estándar</h2>
        <div class="fila-campos">
          <label>Tramo alto desde <input type="number" step="1" v-model.number="params.tramos.alto_desde" /> h</label>
          <label>Tramo medio desde <input type="number" step="1" v-model.number="params.tramos.medio_desde" /> h</label>
          <label class="buscar">Buscar cargo <input type="search" v-model="buscarCargo" placeholder="Ej. KINESIOLOGO" /></label>
        </div>
        <p class="nota">
          El tramo se elige con el promedio anual de horas (X). Variante por área: una fila "CARGO ÁREA"
          (ej. "TERAPEUTA OCUPACIONAL ULAB") tiene prioridad sobre "CARGO".
        </p>
        <div class="scroll">
          <table class="denso">
            <thead>
              <tr>
                <th rowspan="2">Cargo</th><th rowspan="2">Área</th>
                <th colspan="2">Minutos</th>
                <th colspan="3">≥ {{ params.tramos.alto_desde }} h</th>
                <th colspan="3">{{ params.tramos.medio_desde }}–{{ params.tramos.alto_desde }} h</th>
                <th colspan="3">&lt; {{ params.tramos.medio_desde }} h</th>
              </tr>
              <tr>
                <th>Dir</th><th>Ind</th>
                <template v-for="t in 3" :key="t"><th>% Dir</th><th>% Ind</th><th>% NAS</th></template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in distribucionFiltrada" :key="d.cargo">
                <th scope="row">{{ d.cargo }}</th>
                <td>{{ d.esp }}</td>
                <td><input type="number" step="5" v-model.number="d.min_dir" :aria-label="`Minutos directa ${d.cargo}`" /></td>
                <td><input type="number" step="5" v-model.number="d.min_ind" :aria-label="`Minutos indirecta ${d.cargo}`" /></td>
                <template v-for="t in TRAMOS" :key="t">
                  <td v-for="k in ['dir', 'ind', 'nas']" :key="k" :class="{ alerta: k === 'nas' && sumaMal(d[t]) }">
                    <input type="number" step="1" min="0" max="100" :value="pct(d[t][k])" @input="setPct(d[t], k, $event)" :aria-label="`${k} ${t} ${d.cargo}`" />
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="nota">Cada tramo debe sumar 100% (o quedar en 0% si no aplica a ese cargo). En rojo: no suma 100%.</p>
      </section>

      <!-- 3. Asignaciones especiales -->
      <section v-if="modulo === 'asignaciones'" class="bloque">
        <h2>Asignaciones especiales</h2>
        <label>Máximo de asignaciones por profesional <input type="number" min="0" v-model.number="params.asignaciones.max_por_profesional" /></label>
        <table>
          <thead><tr><th>Nombre</th><th>Horas semanales</th><th>Requiere autorización DMN</th><th>Activa</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(a, i) in params.asignaciones.catalogo" :key="i">
              <td><input class="txt" v-model="a.nombre" :aria-label="`Nombre asignación ${i + 1}`" /></td>
              <td><input type="number" step="0.25" min="0" v-model.number="a.horas" :aria-label="`Horas de ${a.nombre}`" /></td>
              <td><input type="checkbox" v-model="a.requiere_autorizacion" :aria-label="`${a.nombre} requiere autorización`" /></td>
              <td><input type="checkbox" v-model="a.activa" :aria-label="`${a.nombre} activa`" /></td>
              <td><button type="button" class="quitar" @click="params.asignaciones.catalogo.splice(i, 1)" :aria-label="`Quitar ${a.nombre}`">✕</button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="secundario" @click="params.asignaciones.catalogo.push({ nombre: 'Nueva asignación', horas: 1, detalle: '', requiere_autorizacion: false, activa: true })">+ Agregar asignación</button>
        <p class="nota">Una asignación inactiva deja de descontar horas a quienes la tengan (si Blue Prism envía la lista por persona).</p>
      </section>

      <!-- 4. Atención grupal -->
      <section v-if="modulo === 'grupal'" class="bloque">
        <h2>Atención grupal por área</h2>
        <table>
          <thead><tr><th>Área</th><th>% grupal</th><th>Pacientes por grupo (Santiago y Concepción)</th><th>Pacientes por grupo (otros institutos)</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(g, i) in params.grupal" :key="i">
              <td><input class="txt corto" v-model="g.area" :aria-label="`Área ${i + 1}`" /></td>
              <td><input type="number" step="1" :value="pct(g.pct)" @input="setPct(g, 'pct', $event)" :aria-label="`% grupal ${g.area}`" /></td>
              <td><input type="number" step="0.5" v-model.number="g.pacientes_san_con" :aria-label="`Pacientes San-Con ${g.area}`" /></td>
              <td><input type="number" step="0.5" v-model.number="g.pacientes_otros" :aria-label="`Pacientes otros ${g.area}`" /></td>
              <td><button type="button" class="quitar" @click="params.grupal.splice(i, 1)" :aria-label="`Quitar ${g.area}`">✕</button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="secundario" @click="params.grupal.push({ area: '', pct: 0, pacientes_san_con: 0, pacientes_otros: 0 })">+ Agregar área</button>
        <p class="nota">Atención directa + grupal = directa × (1 − % grupal) + directa × % grupal × pacientes.</p>
      </section>

      <!-- 5. Feriados y días -->
      <section v-if="modulo === 'calendario'" class="bloque">
        <h2>Feriados y días ({{ params.calendario.anio }})</h2>
        <h3>Semanas hábiles por mes (resultado)</h3>
        <div class="semanas">
          <div v-for="(s, i) in semanasMes" :key="i"><span>{{ MESES[i] }}</span><strong>{{ s.toLocaleString('es-CL') }}</strong></div>
        </div>
        <p class="nota">= (días lunes a viernes − feriados) ÷ 5, a 1 decimal. A cada profesional se le descuentan además sus licencias, vacaciones y permisos.</p>

        <h3>Feriados</h3>
        <table>
          <thead><tr><th>Fecha</th><th>Nombre</th><th>Tipo</th><th>Región (instituto)</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(f, i) in feriadosOrdenados" :key="f.fecha + i">
              <td><input type="date" v-model="f.fecha" :aria-label="`Fecha feriado ${i + 1}`" /></td>
              <td><input class="txt" v-model="f.nombre" :aria-label="`Nombre feriado ${f.fecha}`" /></td>
              <td>
                <select v-model="f.tipo" :aria-label="`Tipo feriado ${f.fecha}`">
                  <option value="nacional">Nacional</option>
                  <option value="regional">Regional</option>
                  <option value="colectivo">Colectivo (vacaciones)</option>
                </select>
              </td>
              <td><input class="txt corto" v-model="f.region" placeholder="Ej. Ari" :disabled="f.tipo !== 'regional'" :aria-label="`Región feriado ${f.fecha}`" /></td>
              <td><button type="button" class="quitar" @click="quitarFeriado(f)" :aria-label="`Quitar feriado ${f.fecha}`">✕</button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="secundario" @click="params.calendario.feriados.push({ fecha: `${params.calendario.anio}-01-01`, nombre: 'Nuevo feriado', tipo: 'nacional', region: null })">+ Agregar feriado</button>

        <h3>Vacaciones y días especiales (días por año)</h3>
        <div class="fila-campos">
          <label>Vacaciones legales <input type="number" v-model.number="params.calendario.vacaciones.legales" /></label>
          <label>Adicionales staff <input type="number" v-model.number="params.calendario.vacaciones.adicionales_staff" /></label>
          <label>Adicionales zona extrema <input type="number" v-model.number="params.calendario.vacaciones.adicionales_zona_extrema" /></label>
          <label>Administrativos y ½ jornada <input type="number" step="0.5" v-model.number="params.calendario.dias_especiales.administrativos" /></label>
          <label>Día de cumpleaños <input type="number" step="0.5" v-model.number="params.calendario.dias_especiales.cumpleanos" /></label>
          <label>Otros <input type="number" step="0.5" v-model.number="params.calendario.dias_especiales.otros" /></label>
        </div>
        <p class="nota">Los días anuales se prorratean entre julio y diciembre. Mayo y julio redondean hacia arriba a 1 decimal (regla de la planilla).</p>
      </section>

      <!-- 6. Jornada legal y meta -->
      <section v-if="modulo === 'jornada_meta'" class="bloque">
        <h2>Jornada legal y meta</h2>
        <div class="fila-campos">
          <label>% de meta de gestión <input type="number" step="1" :value="pct(params.jornada_meta.pct_meta)" @input="setPct(params.jornada_meta, 'pct_meta', $event)" /> %</label>
          <label>Pausa saludable (≥ 40 h) <input type="number" step="1" :value="pct(params.jornada_meta.pausa_saludable.pct_desde_40)" @input="setPct(params.jornada_meta.pausa_saludable, 'pct_desde_40', $event)" /> %</label>
          <label>Pausa saludable (&lt; 40 h) <input type="number" step="1" :value="pct(params.jornada_meta.pausa_saludable.pct_bajo_40)" @input="setPct(params.jornada_meta.pausa_saludable, 'pct_bajo_40', $event)" /> %</label>
        </div>
        <h3>Jornada legal</h3>
        <table>
          <thead><tr><th>Desde (mes)</th><th>Horas semanales</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(j, i) in params.jornada_meta.jornada_legal" :key="i">
              <td><input type="month" v-model="j.desde" :aria-label="`Jornada desde ${i + 1}`" /></td>
              <td><input type="number" v-model.number="j.horas" :aria-label="`Horas jornada ${j.desde}`" /></td>
              <td><button type="button" class="quitar" @click="params.jornada_meta.jornada_legal.splice(i, 1)" aria-label="Quitar tramo de jornada">✕</button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="secundario" @click="params.jornada_meta.jornada_legal.push({ desde: `${params.calendario.anio}-01`, horas: 42 })">+ Agregar cambio de jornada</button>
        <p class="nota">Meta mensual = TRUNCAR(atenciones planificadas × % meta). La meta anual es la suma de las mensuales.</p>
      </section>

      <!-- 7. Ajuste por profesional -->
      <section v-if="modulo === 'ajustes'" class="bloque">
        <h2>Ajuste por profesional (excepciones)</h2>
        <p class="nota">Reemplaza la regla general solo para una persona. Cada ajuste guarda quién lo hizo y por qué.</p>
        <table>
          <thead><tr><th>ID</th><th>Qué cambia</th><th>Valor</th><th>Por qué</th><th>Quién / fecha</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(a, i) in params.ajustes" :key="i">
              <td>{{ a.id_profesional }}</td>
              <td>{{ CAMPOS_AJUSTE[a.campo] || a.campo }}</td>
              <td>
                <template v-if="a.campo === 'distribucion'">
                  <input type="number" :value="pct(a.valor.dir)" @input="setPct(a.valor, 'dir', $event)" aria-label="% directo" />
                  <input type="number" :value="pct(a.valor.ind)" @input="setPct(a.valor, 'ind', $event)" aria-label="% indirecto" />
                  <input type="number" :value="pct(a.valor.nas)" @input="setPct(a.valor, 'nas', $event)" aria-label="% NAS" />
                </template>
                <input v-else type="number" step="0.25" v-model.number="a.valor" :aria-label="`Valor ajuste ${a.id_profesional}`" />
              </td>
              <td><input class="txt" v-model="a.por_que" :aria-label="`Motivo ajuste ${a.id_profesional}`" /></td>
              <td class="quien">{{ a.quien }}<br />{{ a.fecha }}</td>
              <td><button type="button" class="quitar" @click="params.ajustes.splice(i, 1)" :aria-label="`Quitar ajuste ${a.id_profesional}`">✕</button></td>
            </tr>
          </tbody>
        </table>

        <fieldset class="nuevo">
          <legend>Nuevo ajuste</legend>
          <label>ID profesional <input class="txt corto" v-model.trim="nuevo.id_profesional" inputmode="numeric" placeholder="71580" /></label>
          <label>Qué cambia
            <select v-model="nuevo.campo">
              <option v-for="(t, k) in CAMPOS_AJUSTE" :key="k" :value="k">{{ t }}</option>
            </select>
          </label>
          <template v-if="nuevo.campo === 'distribucion'">
            <label>% Dir <input type="number" v-model.number="nuevo.dir" /></label>
            <label>% Ind <input type="number" v-model.number="nuevo.ind" /></label>
            <label>% NAS <input type="number" v-model.number="nuevo.nas" /></label>
          </template>
          <label v-else>Valor <input type="number" step="0.25" v-model.number="nuevo.valor" /></label>
          <label class="ancho">Por qué <input class="txt" v-model="nuevo.por_que" placeholder="Ej. Acuerdo con jefatura por proyecto de investigación" /></label>
          <button type="button" class="secundario" :disabled="!nuevo.id_profesional || !nuevo.por_que.trim()" @click="agregarAjuste">+ Agregar</button>
        </fieldset>
      </section>

      <!-- Guardar -->
      <section class="guardar" aria-labelledby="guardar-titulo">
        <h2 id="guardar-titulo">Guardar cambios</h2>
        <details v-if="cambios.length">
          <summary>Ver los {{ cambios.length }} cambios</summary>
          <ul class="lista-cambios">
            <li v-for="(c, i) in cambios.slice(0, 50)" :key="i">
              <strong>{{ c.modulo }}</strong> · {{ c.campo }}: {{ fmt(c.antes) }} → {{ fmt(c.despues) }}
            </li>
            <li v-if="cambios.length > 50">… y {{ cambios.length - 50 }} más</li>
          </ul>
        </details>
        <div v-if="erroresSuma.length" class="bloqueo" role="alert">
          <strong>No se puede guardar: {{ erroresSuma.length === 1 ? 'un tramo no suma' : `${erroresSuma.length} tramos no suman` }} 100%.</strong>
          <ul>
            <li v-for="e in erroresSuma.slice(0, 5)" :key="e">{{ e }}</li>
            <li v-if="erroresSuma.length > 5">… y {{ erroresSuma.length - 5 }} más</li>
          </ul>
        </div>
        <label class="ancho" for="motivo">¿Por qué haces este cambio? (queda en la bitácora)</label>
        <textarea id="motivo" v-model="motivo" rows="2" placeholder="Ej. Ajuste de minutos estándar acordado con Dirección Médica Nacional"></textarea>
        <div class="acciones">
          <label>Clave de administrador <input type="password" v-model="clave" autocomplete="current-password" /></label>
          <button type="button" @click="guardarCambios" :disabled="guardando || !cambios.length || !motivo.trim() || erroresSuma.length > 0">
            {{ guardando ? 'Guardando…' : 'Guardar y recalcular' }}
          </button>
          <button type="button" class="secundario" @click="descartar" :disabled="!cambios.length || guardando">Descartar</button>
          <span v-if="mensaje" role="status" :class="mensajeOk ? 'mensaje' : 'error'">{{ mensaje }}</span>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { diferencias } from '~/composables/useParametros'

const PESTANAS = {
  distribucion: 'Distribución y minutos',
  asignaciones: 'Asignaciones',
  grupal: 'Atención grupal',
  calendario: 'Feriados y días',
  jornada_meta: 'Jornada y meta',
  ajustes: 'Ajuste por profesional',
} as const
const CAMPOS_AJUSTE: Record<string, string> = {
  distribucion: '% directo / indirecto / NAS',
  min_dir: 'Minutos atención directa',
  min_ind: 'Minutos atención indirecta',
  h_asignaciones: 'Horas de asignaciones',
  ba: 'Atenciones directas por semana (fijo)',
}
const TRAMOS = ['alto', 'medio', 'bajo'] as const
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const { obtener, guardar } = useParametros()
const { cargarDatos } = useDatosBlob()
const { usuario } = useSesion()

const params = ref<any>(null)
const original = ref<any>(null)
const filasBase = shallowRef<any[]>([])
const modulo = ref<keyof typeof PESTANAS>('distribucion')
const buscarCargo = ref('')
const motivo = ref('')
const clave = ref('')
const guardando = ref(false)
const mensaje = ref('')
const mensajeOk = ref(true)
const error = ref<string | null>(null)
const sinDatos = ref(false)
const nuevo = reactive({ id_profesional: '', campo: 'min_dir', valor: 60, dir: 0, ind: 0, nas: 0, por_que: '' })

async function cargar() {
  try {
    const datos = await cargarDatos()
    filasBase.value = datos.filas
    sinDatos.value = datos.sin_datos
    params.value = await obtener()
    original.value = structuredClone(toRaw(params.value))
  } catch (e: any) {
    error.value = e?.message || 'No se pudieron cargar los parámetros.'
  }
}
onMounted(cargar)

const cambios = computed(() => (params.value ? diferencias(original.value, params.value) : []))

// Recalcula la meta anual con los parámetros editados (≈ ms para miles de filas).
const sumaMeta = (filas: any[]) => filas.reduce((a, f) => a + (Number(f.meta_atenciones) || 0), 0)
const impacto = computed(() => {
  const antes = sumaMeta(filasBase.value)
  if (!params.value || !cambios.value.length) return { antes, despues: antes }
  return { antes, despues: sumaMeta(recalcular(filasBase.value, params.value)) }
})

const distribucionFiltrada = computed(() => {
  const q = buscarCargo.value.trim().toUpperCase()
  return (params.value?.distribucion ?? []).filter((d: any) => !q || d.cargo.includes(q) || d.esp.toUpperCase() === q)
})
const feriadosOrdenados = computed(() => [...(params.value?.calendario.feriados ?? [])].sort((a, b) => (a.fecha < b.fecha ? -1 : 1)))
const semanasMes = computed(() => (params.value ? MESES.map((_, i) => semanasDelMes(params.value, i + 1)) : []))

const pct = (x: number) => Math.round((Number(x) || 0) * 1000) / 10
function setPct(obj: any, k: string, ev: Event) {
  obj[k] = Number((ev.target as HTMLInputElement).value) / 100
}
// Un tramo debe sumar 100%, o estar todo en 0 (= tramo no definido para ese cargo, como en la planilla).
const sumaTramo = (t: any) => (Number(t?.dir) || 0) + (Number(t?.ind) || 0) + (Number(t?.nas) || 0)
const sumaMal = (t: any, permitirVacio = true) => {
  const s = sumaTramo(t)
  return !(Math.abs(s - 1) <= 0.001 || (permitirVacio && s === 0))
}
const erroresSuma = computed(() => {
  if (!params.value) return []
  const nombre: Record<string, string> = {
    alto: `≥ ${params.value.tramos.alto_desde} h`,
    medio: `${params.value.tramos.medio_desde}–${params.value.tramos.alto_desde} h`,
    bajo: `< ${params.value.tramos.medio_desde} h`,
  }
  const errores: string[] = []
  for (const d of params.value.distribucion) {
    for (const t of TRAMOS) if (sumaMal(d[t])) errores.push(`${d.cargo}, tramo ${nombre[t]}: suma ${pct(sumaTramo(d[t]))}%`)
  }
  for (const a of params.value.ajustes) {
    if (a.campo === 'distribucion' && sumaMal(a.valor, false)) errores.push(`Ajuste de ${a.id_profesional}: suma ${pct(sumaTramo(a.valor))}%`)
  }
  return errores
})
function quitarFeriado(f: any) {
  const lista = params.value.calendario.feriados
  lista.splice(lista.indexOf(f), 1)
}
function agregarAjuste() {
  params.value.ajustes.push({
    id_profesional: nuevo.id_profesional,
    campo: nuevo.campo,
    valor: nuevo.campo === 'distribucion' ? { dir: nuevo.dir / 100, ind: nuevo.ind / 100, nas: nuevo.nas / 100 } : nuevo.valor,
    por_que: nuevo.por_que.trim(),
    quien: usuario.value?.correo || 'Administrador',
    fecha: new Date().toISOString().slice(0, 10),
  })
  nuevo.id_profesional = ''
  nuevo.por_que = ''
}
function descartar() {
  params.value = structuredClone(toRaw(original.value))
  mensaje.value = ''
}

async function guardarCambios() {
  guardando.value = true
  mensaje.value = ''
  try {
    const r = await guardar(toRaw(params.value), { original: original.value, por_que: motivo.value.trim(), clave: clave.value })
    mensajeOk.value = true
    mensaje.value = `Guardado (versión ${r.version}, ${r.cambios} cambios). El dashboard ya usa los nuevos parámetros.`
    motivo.value = ''
    await cargar() // vuelve a descargar del blob y recalcula
  } catch (e: any) {
    mensajeOk.value = false
    mensaje.value = e?.message || 'No se pudo guardar.'
  } finally {
    guardando.value = false
  }
}

const f0 = (n: number) => Math.round(n).toLocaleString('es-CL')
const pctTxt = (x: number) => `${(x * 100).toLocaleString('es-CL', { maximumFractionDigits: 1 })}%`
const fmt = (v: unknown) => (v == null ? '—' : typeof v === 'number' && v > 0 && v < 1 ? pctTxt(v) : String(v))
const fechaHora = (s: string) => new Date(s).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
</script>

<style scoped>
.intro { color: var(--texto-secundario); max-width: 70ch; }
.origen { font-size: 0.85rem; color: var(--texto-secundario); margin: 0 0 1rem; }
.error { color: var(--critico); font-weight: 600; }
.bloqueo {
  background: var(--critico-suave); color: var(--critico-texto); border-radius: 8px;
  padding: 0.75rem 1rem; margin-bottom: 0.75rem; max-width: 70ch;
}
.bloqueo ul { margin: 0.4rem 0 0; padding-left: 1.2rem; font-size: 0.9rem; }
.aviso {
  background: var(--fondo-card); border: 1px solid var(--borde); border-left: 4px solid var(--alerta);
  border-radius: 10px; padding: 0.75rem 1.25rem; margin-bottom: 1rem; max-width: 70ch;
}
.impacto {
  display: flex; flex-wrap: wrap; gap: 2rem; align-items: baseline;
  background: var(--fondo-card); border: 1px solid var(--borde); border-left: 4px solid var(--marca-rojo);
  border-radius: 10px; padding: 0.9rem 1.25rem; margin-bottom: 1rem;
  position: sticky; top: 0; z-index: 2;
}
.impacto .et { display: block; font-size: 0.8rem; color: var(--texto-secundario); }
.impacto strong { font-size: 1.5rem; margin-right: 0.5rem; }
.sube { color: var(--ok); font-weight: 600; }
.baja { color: var(--critico); font-weight: 600; }
.igual { color: var(--texto-secundario); }
.tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
.tabs button {
  background: var(--fondo-card); color: var(--texto); border: 1px solid var(--borde);
  font-weight: 600; padding: 0.5rem 0.9rem;
}
.tabs button.activa { background: var(--marca-rojo); color: #fff; border-color: var(--marca-rojo); }
.bloque, .guardar {
  background: var(--fondo-card); border: 1px solid var(--borde); border-radius: 10px;
  padding: 1.25rem; margin-bottom: 1.5rem;
}
h2 { margin-top: 0; font-size: 1.1rem; }
h3 { font-size: 0.95rem; margin: 1.25rem 0 0.5rem; }
.scroll { overflow-x: auto; max-height: 60vh; overflow-y: auto; }
table { width: 100%; border-collapse: collapse; margin-bottom: 0.75rem; }
th, td { text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--borde); font-size: 0.85rem; }
thead th { position: sticky; top: 0; background: var(--fondo-card); }
.denso input[type='number'] { width: 3.8rem; }
td.alerta input { border-color: var(--critico); background: #fff1f2; }
input[type='number'], input.txt, input[type='date'], input[type='month'], input[type='search'], select, textarea {
  padding: 0.3rem 0.5rem; border: 1px solid var(--borde); border-radius: 4px; font: inherit;
}
input[type='number'] { width: 5.5rem; }
input.txt { width: 100%; min-width: 12rem; }
input.txt.corto { min-width: 5rem; width: 6rem; }
textarea { width: 100%; max-width: 60ch; display: block; margin: 0.3rem 0 0.75rem; }
.fila-campos { display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; margin-bottom: 0.5rem; }
.fila-campos label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }
.semanas { display: grid; grid-template-columns: repeat(12, minmax(3rem, 1fr)); gap: 0.4rem; }
.semanas div { text-align: center; border: 1px solid var(--borde); border-radius: 6px; padding: 0.3rem; }
.semanas span { display: block; font-size: 0.75rem; color: var(--texto-secundario); }
.nota { font-size: 0.8rem; color: var(--texto-secundario); }
.quien { font-size: 0.75rem; color: var(--texto-secundario); }
.nuevo { border: 1px dashed var(--borde); border-radius: 8px; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
.nuevo label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; }
.nuevo .ancho { flex: 1 1 20rem; }
.lista-cambios { font-size: 0.85rem; max-height: 12rem; overflow-y: auto; }
.acciones { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
.acciones label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }
button {
  padding: 0.6rem 1.2rem; border-radius: 6px; border: none;
  background: var(--marca-rojo); color: #fff; font-weight: 700; cursor: pointer;
}
button.secundario { background: transparent; color: var(--marca-navy); border: 1px solid var(--borde); }
button.quitar { background: transparent; color: var(--texto-secundario); padding: 0.2rem 0.5rem; }
button:disabled { opacity: 0.55; cursor: not-allowed; }
.mensaje { color: var(--ok); font-weight: 600; }
@media (max-width: 700px) {
  .semanas { grid-template-columns: repeat(6, 1fr); }
}
</style>
