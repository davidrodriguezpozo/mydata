<template>
  <div class="flex-1 card">
    <span v-if="loading" class="loading loading-ring loading-xs ml-3"></span>
    <div class="card-header flex items-center justify-between">
      <h3>Uploaded Files</h3>
      <input type="file" class="mb-4 file-input file-input-sm  w-full max-w-xs mt-4 file-input-primary"
        @change="uploadFile" />
    </div>
    <table class="table table-striped table-compact table-hover">
      <thead>
        <tr>
          <th>File Name</th>
          <th>Table name</th>
        </tr>
      </thead>
      <tbody>
        <tr class="cursor-pointer" v-for="up in uploads" :key="up.name" @click="emit('select-file', up.table)">
          <td>{{ up.name }}</td>
          <td>{{ up.table }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="!uploads.length" class="flex w-full h-full items-center justify-center">
      <p>No files uploaded yet.</p>
    </div>
  </div>
</template>
<script setup lang="ts">

interface Upload {
  name: string;
  table: string;
}
const emit = defineEmits(['select-file']);
const db = useDuckDB();
const loading = ref(false);
const uploads = ref<Upload[]>([]);

async function uploadFile(event: Event) {
  const file = event.target?.files[0];
  if (!file) return;
  loading.value = true;
  const table = await db.uploadFile(file);
  uploads.value.push({table: table, name: file.name});
  loading.value = false;
}
</script>
