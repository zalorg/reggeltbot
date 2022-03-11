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
    ],
  },
  server: {
    host: '0' // default: localhost
  },
  buildModules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/algolia',
  ],
  plugins: [
    "~/plugins/flowbite.client.ts",
  ],
  algolia: {
    apiKey: 'd9cf85ea6e12d8cdbe9bd63e408e323f',
    applicationId: 'JX64960NFR',
    lite: true,
    /*
    instantSearch: {
      theme: 'satellite'
    },
    */
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
