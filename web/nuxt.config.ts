import { defineNuxtConfig } from "nuxt3";

export default defineNuxtConfig({
  meta: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=yes' },
      { name: 'twitter:creator', content: '@zal1000original' },
      { name: 'twitter:site', content: 'https://reggeltbot.com/' },
      { name: 'theme-color', content: '#fec95c' },
      { name: 'og:type', content: 'website' },
      { name: 'og:site_name', content: 'Reggeltbot' },
      { name: 'og:title', content: 'Reggeltbot' },
      { name: 'og:image', content: '/icons/reggeltbot-icon.png' },
      { name: 'og:description', content: 'Reggeltbot is a useless bot unless you want to waste your time sending "reggelt" in discord multiple times a day' },
    ],
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('ais')
    }
  },
  vite: {
    optimizeDeps: {
      exclude: [
        'date-fns'
      ],
    }
  },
  buildModules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/algolia',
  ],
  build: {
    transpile: ['vue-instantsearch', 'instantsearch.js/es'],
  },
  plugins: [
    "~/plugins/flowbite.client.ts",
  ],
  algolia: {
    apiKey: 'd9cf85ea6e12d8cdbe9bd63e408e323f',
    applicationId: 'JX64960NFR',
    lite: true,
    instantSearch: false,

    /*
    crawler: {
      apiKey: '<YOUR_API_KEY>',
      indexName: '<YOUR_INDEX_NAME>',
      meta: ['title', 'description'],
      include: () => true
    }
    */
  },
});
