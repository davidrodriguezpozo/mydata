<template>
  <div class="p-4 h-dvh flex flex-col">
    <h1 class="prose-xl text-5xl">DuckDB 👋</h1>
    <p v-if="processing">Processing... <span class="loading loading-bars loading-xs"></span></p>
    <div class="overflow-x-auto flex gap-3 mt-3 expand h-0 min-h-0" :class="{ 'min-h-48 max-h-52': showFileSection }">
      <UploadedFiles @select-file="selectFile" />
      <div class="flex-0 divider divider-horizontal" />
      <ResultSet :results="fileResults" class="!h-48">
        <h1>File preview</h1>
        <template #empty>
          <p>No file selected.</p>
        </template>
      </ResultSet>
    </div>
    <div class="w-full flex items-center justify-center mt-2">
      <Icon :name="showFileSection ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="cursor-pointer"
        @click="showFileSection = !showFileSection" />
    </div>
    <div class="divider mt-1" />
    <Editor class="h-auto flex-1" @run-query="run" :error="error" />
    <div class="z-50 border-t pt-3 rounded-t-xl px-2 mt-4 !border-neutral-700 bg-base-100 expand h-60 flex flex-col"
      :class="{ 'absolute h-dvh left-0 bottom-0 w-full': expanded, '-mx-4 flex-0 h-60': !expanded }" ref="resultsRef">
      <div class="flex items-center justify-center cursor-pointer" @click="expandResults">
        <Icon :name="expanded ? 'mdi:chevron-down' : 'mdi:chevron-up'" />
        <div class="join absolute right-5 mt-2">
          <div class="btn join-item btn-sm" @click.stop="showCharts = false" >
            <Icon class="join-item" name="mdi:table"  />
          </div>
          <div class="btn join-item btn-sm" @click.stop="showCharts = true" >
            <Icon class="join-item" name="mdi:chart-line"  />
          </div>
        </div>
      </div>
      <p v-if="runningQuery">Running query... <span class="loading loading-bars loading-xs"></span></p>
      <div class="h-[93%]">
        <ResultSet :results="results" v-if="showQueryResults && !showCharts" show-details>
          <div class="tooltip-right tooltip mr-3 flex" data-tip="Clear">
            <Icon name="ic:refresh" class="cursor-pointer" @click="clear" />
          </div>
          <h1>Results</h1>
        </ResultSet>
        <Chart v-else-if="showCharts && results.rows?.length" :results="results" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import useDuckDB from './composables/useDuckDB';
import { type QueryResult } from "./components/ResultSet.vue";
import Chart from './components/Chart.vue';

const db = useDuckDB();

const fileResults = ref({} as QueryResult);
const results = ref<QueryResult>({} as QueryResult);
const processing = ref(false);
const runningQuery = ref(false);
const resultsRef = ref();
const error = ref();
const expanded = ref(false);
const showFileSection = ref(true);
const showQueryResults = ref(true);
const showCharts = ref(true);

useHead({ title: 'DuckDB Editor 👋 ' });

async function selectFile(filename: string) {
  processing.value = true;
  fileResults.value = {};
  fileResults.value.rows = [];
  const ext = filename.split('.').pop()?.toLowerCase();
  const method = ext === 'csv' ? 'read_csv' : 'read_parquet';
  const query = `SELECT * FROM ${method}('${filename}') LIMIT 5`;
  const t0 = performance.now();
  const result = db.queryGenerator(query);
  for await (const row of result) {
    fileResults.value.rows.push(row);
    fileResults.value.headers = Object.keys(row);
  }
  fileResults.value.time = performance.now() - t0;
  processing.value = false;
}

function parseRow(row: Array<string|bigint|number>) {
  return row.map(r => {
    if (typeof r === 'bigint') return parseInt(r);
    return r;
  });
}

async function run(query: string) {
  try {
    runningQuery.value = true;
    results.value = {};
    error.value = false;
    const t0 = performance.now();
    const result = await db.query(query);
    results.value.time = performance.now() - t0;
    results.value.headers = Object.keys(result[0])
    results.value.rows = result.map(r => parseRow(Object.values(r)))
  } catch (err) {
    error.value = err;
  } finally {
    runningQuery.value = false;
  }
}

async function runQuery(query: string) {
  runningQuery.value = true;
  try {
    const result = db.queryGenerator(query);
    results.value = {};
    results.value.rows = [];
    const t0 = performance.now();
    error.value = false;
    const rows = [];
    let headers = [] as string[];
    for await (const row of result) {
      rows.push(row);
    }
    results.value.time = performance.now() - t0;
    results.value.rows = rows;
    results.value.headers = headers;
  } catch (err) {
    error.value = err;
  } finally {
    runningQuery.value = false;
  }
}

function expandResults() {
  expanded.value = !expanded.value;
}

function clear() {
  results.value = {};
}

</script>
<style scoped>
.expand {
  transition: all 0.5s;
}
</style>
