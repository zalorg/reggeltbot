import { defineNuxtConfig } from "nuxt3";

export default defineNuxtConfig({
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
