<template>
  <div class="flex-1 flex flex-col">
    <h1>SQL Editor (Press <span class="kbd kbd-sm">Shift</span> + <span class="kbd kbd-sm">Enter</span> to run the
      query)</h1>

    <div v-if="error" role="alert" class="alert alert-error my-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>
    <div class="w-full mt-4 flex-1 mockup-code bg-black text-white font-semibold">
      <textarea placeholder="SELECT * FROM read_csv('myfile.csv')" class="w-full resize-none h-full p-2 px-4 bg-transparent border-none focus:ring-0 focus:border-none focus:outline-none textarea" rows="5" v-model="query"
        @keydown.enter.shift.exact.prevent="execute" 
        @keydown.tab.prevent="addTab"
        @keydown.up.prevent="goBack"
        @keydown.down.prevent="goForward"
      />
    </div>
  </div>
</template>
<script setup lang="ts">

const query = ref('');
const emit = defineEmits(['run-query']);

function addTab(event: KeyboardEvent) {
  const { selectionStart, selectionEnd } = event.target as HTMLTextAreaElement;
  query.value = query.value.substring(0, selectionStart) + '  ' + query.value.substring(selectionEnd);
}

const history = ref<string[]>([]);
const index = ref(-1);

const goBack = () => {
  if (history.value.length > 0 && index.value > 0) {
    index.value--;
    console.log("History: ", history.value);
    console.log("Index: ", index.value);
    query.value = history.value[index.value];
  }
};

const goForward = () => {
  if (history.value.length > 0 && index.value < history.value.length - 1) {
    index.value++;
    console.log("History: ", history.value);
    console.log("Index: ", index.value);
    query.value = history.value[index.value];
  }
};

const execute = () => {
  emit('run-query', query.value);
  history.value.push(query.value);
  index.value++;
};

defineProps(['error']);
</script>
<style scoped>
</style>
