// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", '@nuxt/icon'],
  ssr: false,
  css: ['./assets/css/main.css'],
  vite: {
    esbuild: {
      supported: {
        'top-level-await': true,
      }
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
})
