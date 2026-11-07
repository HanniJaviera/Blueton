// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],

  // Mientras no haya backend real (Samuel/FastAPI), apiBase apunta a
  // los endpoints mock servidos por este mismo proyecto (server/api/*).
  // Cuando la API real esté lista en la VM, basta con cambiar esta
  // variable de entorno (NUXT_PUBLIC_API_BASE) — sin tocar componentes.
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      // Blob de Azure: URL del contenedor y SAS de lectura (sin el "?").
      // Se llenan desde .env (NUXT_PUBLIC_BLOB_URL / NUXT_PUBLIC_BLOB_SAS).
      // Uso: `${blobUrl}/planificacion.json?${blobSas}`
      blobUrl: '',
      blobSas: '',
      // Inicio de sesión (ver composables/useSesion.ts). Sin client IDs = modo demo sin login.
      googleClientId: '',
      msClientId: '',
      msTenant: 'common',
      dominiosPermitidos: '',
    },
  },

  app: {
    head: {
      title: 'Planificación Asistencial · Teletón',
      meta: [
        { name: 'description', content: 'Dashboard de planificación asistencial — Botathon 2026' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
})
