<template>
  <div class="flex-1 card w-full">
    <div class="flex items-center">
      <slot>
      </slot>
      <span v-if="showDetails" class="ml-4 text-secondary text-xs">Fetched {{ formatNumber(results?.length || 0) }} rows
        in {{ formatTime }} seconds</span>
      <Icon :name="show ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="cursor-pointer ml-2"
        @click="show = !show" />
    </div>
    <div class="overflow-x-auto max-h-72 mt-4">
      <table class="table table-pin-rows table-xs h-full w-full overflow-y-auto" v-if="show && results.length">
        <thead>
          <tr>
            <th>Row</th>
            <th v-for="header in results?.headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in results?.rows?.slice(MAX_ROWS * index, MAX_ROWS * (index + 1) - 1)" :key="row">
            <td class="text-primary font-bold text-xs text-left">{{ idx + 1 }}</td>
            <td v-for="value in row" :key="value">{{ value }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!results.length" class="flex w-full h-full items-center justify-center card card-body card-compact bg-neutral">
        <slot name="empty">
          <p>No results to display.</p>
        </slot>
      </div>
      <div v-if="results.length > MAX_ROWS" class="flex items-center justify-center w-full">
        <div class="join" v-if="results.length">
          <template v-if="!displayIndex.includes(0)">
            <button class="join-item btn btn-sm" @click="index = 0">1</button>
            <button class="join-item btn btn-sm btn-disabled">...</button>
          </template>
          <button v-for="i in displayIndex" :key="i" class="join-item btn btn-sm" :class="{ 'btn-active': i === index }"
            @click="index = i">{{ i + 1 }}</button>
          <template v-if="!displayIndex.includes(lastPage)">
            <button class="join-item btn btn-sm btn-disabled">...</button>
            <button class="join-item btn btn-sm" @click="index = lastPage">{{ lastPage + 1 }}</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

interface QueryResult {
  rows: string[][];
  headers: string[];
  length: number;
  time: number;
}

const props = defineProps({
  results: {
    type: Object as PropType<QueryResult>,
    required: true
  },
  showDetails: { type: Boolean, default: false }
});

const MAX_ROWS = 100;
const NEIGHBOURS = 3;
const index = ref(0);
const slots = computed(() => Math.ceil(props.results?.length / MAX_ROWS));
const lastPage = computed(() => slots.value - 1);

const displayIndex = computed(() => {
  const slots = Math.ceil(props.results?.length / MAX_ROWS);
  const start = Math.max(0, index.value - NEIGHBOURS);
  const end = Math.min(slots, index.value + NEIGHBOURS);
  return Array.from({ length: end - start }, (_, i) => i + start);
});

const show = ref(true);
const formatTime = computed(() => props.results?.time ? Math.round(props.results.time + Number.EPSILON) / 1000 : 0);
const formatNumber = (value: number) => value.toLocaleString();
</script>
