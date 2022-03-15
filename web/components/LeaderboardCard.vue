<template>
      <a
    href="#"
    class="
      w-[30rem]
      border-2 border-b-4 
      border-gray-200
      dark:border-gray-800
      rounded-xl
      hover:bg-gray-50
    "
  >
    <!-- Badge -->
    <p
      class="
        bg-sky-500
        w-fit
        px-4
        py-1
        text-sm
        font-bold
        text-white
        rounded-tl-lg rounded-br-xl
      "
      v-if="featured"
    >
      FEATURED
    </p>
    <p
      class="
        bg-amber-500
        w-fit
        px-4
        py-1
        text-sm
        font-bold
        text-white
        rounded-tl-lg rounded-br-xl
      "
      v-if="rank === 1"
    >
      1ST PLACE
    </p>
    <p
      class="
        bg-gray-500
        w-fit
        px-4
        py-1
        text-sm
        font-bold
        text-white
        rounded-tl-lg rounded-br-xl
      "
      v-if="rank === 2"
    >
      2ND PLACE
    </p>
    <p
      class="
        bg-yellow-600
        w-fit
        px-4
        py-1
        text-sm
        font-bold
        text-white
        rounded-tl-lg rounded-br-xl
      "
      v-if="rank === 3"
    >
      3RD PLACE
    </p>

    <div class="grid grid-cols-6 p-5 gap-y-2">
      <!-- Profile Picture -->
      <div v-if="userAvatar">
        <img
          :src="userAvatar"
          class="max-w-16 max-h-16 rounded-full"
        /> <!--https://picsum.photos/seed/2/200/200-->
      </div>

      <!-- Description -->
      <div class="col-span-5 md:col-span-4 ml-4">
        <!--<p class="text-sky-500 font-bold text-xs">20+ SPOTS LEFT</p>-->
        <p v-if="userName" class="text-gray-400 text-xl">{{ userName }}</p>
        <p v-if="score" class="text-sky-500 font-bold text-s">Reggeltcount: {{ score }}</p>
        <!--
        <p class="text-gray-400">Beginner speakers</p>
        <p class="text-gray-600 font-bold">
          [Intermediate/Advanced] Tea Time Conversation
        </p>
        -->
      </div>

    </div>
  </a>
</template>

<script>
export default {
    props: [
        'userId',
        'userName',
        'userAvatar',
        'score',
        'featured',
        'rank',
    ]
}
</script>