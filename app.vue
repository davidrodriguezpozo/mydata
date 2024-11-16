<template>
  <div class="p-4">
    <h1 class="prose-xl text-5xl">Nuxt + DuckDB 👋</h1>
    <p v-if="processing">Processing... <span class="loading loading-bars loading-xs"></span></p>
    <div class="overflow-x-auto flex gap-3 mt-3">
      <UploadedFiles @select-file="selectFile" />
      <div class="flex-0 divider divider-horizontal" />
      <Editor @run-query="runQuery" :error="error" />
    </div>
    <div class="divider" />
    <ResultSet :results="fileResults">
      <h1>File preview</h1>
    </ResultSet>
    <div class="w-full mt-4 h-60">
      <p v-if="runningQuery">Running query... <span class="loading loading-bars loading-xs"></span></p>
      <div class="h-60">
        <ResultSet :results="results" v-if="results.length" show-details>
          <div class="tooltip-right tooltip mr-3 flex" data-tip="Refresh">
            <Icon name="ic:refresh" class="cursor-pointer" @click="clear" />
          </div>
          <h1>Results</h1>
        </ResultSet>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import useDuckDB from './composables/useDuckDB';
import { type QueryResult } from "./components/ResultSet.vue";

const db = useDuckDB();

const fileResults = ref({} as QueryResult);
const results = ref<QueryResult>({} as QueryResult);
const processing = ref(false);
const runningQuery = ref(false);
const error = ref();

async function selectFile(table: string) {
  processing.value = true;
  fileResults.value = {};
  fileResults.value.rows = [];
  fileResults.value.length = 0;
  const t0 = performance.now();
  const result = db.query(`SELECT * FROM '${table}' LIMIT 5`);
  for await (const row of result) {
    fileResults.value.rows.push(row);
    fileResults.value.headers = Object.keys(row);
    fileResults.value.length++;
  }
  fileResults.value.time = performance.now() - t0;
  processing.value = false;
}

async function runQuery(query: string) {
  runningQuery.value = true;
  try {
    const result = db.query(query);
    results.value = {};
    results.value.rows = [];
    results.value.length = 0;
    const t0 = performance.now();
    error.value = false;
    const rows = [];
    let headers = [] as string[];
    let length = 0;
    for await (const row of result) {
      rows.push(row);
      headers = Object.keys(row);
      length++;
    }
    results.value.time = performance.now() - t0;
    results.value.rows = rows;
    results.value.headers = headers;
    results.value.length = length;
  } catch (err) {
    error.value = err;
  } finally {
    runningQuery.value = false;
  }
}

function clear() {
  results.value = [];
  headers.value = [];
}

</script>
