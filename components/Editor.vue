<template>
  <div class="flex-1 flex flex-col">
    <h1>SQL Editor (Press <span class="kbd kbd-sm">Shift</span> + <span class="kbd kbd-sm">Enter</span> to run the query)</h1>

    <div v-if="error" role="alert" class="alert alert-error my-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>
    <textarea class="w-full mt-4 resize-none font-semibold p-2 flex-1" rows="10" v-model="query"
      @keydown.enter.shift.exact.prevent="$emit('run-query', query)" />
  </div>
</template>
<script setup lang="ts">

const query = ref('');

defineEmits(['run-query']);
defineProps(['error']);
</script>
