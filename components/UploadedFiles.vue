<template>
  <div class="flex-1 card">
    <div class="card-header flex items-center">
      <h3>Uploaded Files</h3>
      <div class="ml-auto" />
      <span v-show="loading" class="loading loading-ring ml-auto mr-3"></span>
      <input type="file" class="mb-4 file-input file-input-sm  w-full max-w-xs mt-4 file-input-primary" 
        @change="uploadFile" />
    </div>
    <table class="table table-striped table-compact table-hover">
      <thead>
        <tr>
          <th>File Name</th>
          <th>Extension
            <div class="tooltip-right tooltip tooltip-primary" data-tip="Use SELECT * FROM read_csv('filename') or SELECT * FROM read_parquet('filename') to SELECT from files">
              <Icon name="ic:info" />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="cursor-pointer" v-for="up in uploads" :key="up.name" @click="emit('select-file', up.name)">
          <td>{{ up.name }}</td>
          <td>{{ up.extension }}</td>
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
  extension: string;
}
const emit = defineEmits(['select-file']);
const db = useDuckDB();
const loading = ref(false);
const uploads = ref<Upload[]>([]);

async function uploadFile(event: Event) {
  const file = event.target?.files[0];
  if (!file) return;
  loading.value = true;
  await db.uploadFile(file);
  const ext = file.name.split('.').pop();
  uploads.value.push({extension: ext, name: file.name});
  loading.value = false;
}
</script>
