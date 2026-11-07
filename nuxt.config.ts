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
