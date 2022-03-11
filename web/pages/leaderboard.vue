<template>
  <div>
    <client-only placeholder="Loading...">
        <p>p</p>
      <ais-instant-search :index-name="indexName" :search-client="algolia">
        <ais-search-box />
        <ais-hits />
        <p>p2</p>
      </ais-instant-search>
    </client-only>
    <div class="p-4 text-center">
      <p class="text-black dark:text-white">leaderboard works!</p>
      <search-bar></search-bar>
    </div>
  </div>
</template>

<script setup>
const indexName = "test_index";
const algolia = useAlgolia();
</script>