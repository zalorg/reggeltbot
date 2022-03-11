// types.d.ts
import '@nuxtjs/algolia'

declare module '@nuxtjs/algolia' {
  interface AlgoliaIndices {
    someIndex: {
      foo: string;
      bar: number;
    }
  }
}