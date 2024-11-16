<template>
  <div class="flex-1 card">
    <h1>
      <slot>
      </slot>
    </h1>
    <table class="mt-4 table table-pin-rows table-xs h-full w-full">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row">
          <td v-for="value in row" :key="value">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">

defineProps({
  rows: Array as PropType<String[][]>,
  headers: Array as PropType<String[]>
});
</script>
