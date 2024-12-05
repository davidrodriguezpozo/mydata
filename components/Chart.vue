<template>
  <VChart
    autoresize
    :option="option"
  />
</template>
<script setup lang="ts">
import type { Option } from 'nuxt-echarts/runtime/types';
import type { QueryResult } from './ResultSet.vue';


const props = defineProps({
  results: {
    type: Object as PropType<QueryResult>,
    required: true
  },
  showDetails: { type: Boolean, default: false }
});

const source = computed( () => {
  return [...props.results.headers, ...props.results.rows];
});

const option = computed<Option>( () => {
  return {
    animation: true,
    tooltip: {
      className: 'echarts-tooltip',
    },
    toolbox: {
      show: false,
      feature: {
        dataZoom: {},
        saveAsImage: {},
      },
    },
    dataset: {
      source: source.value,
    },
    xAxis: { type: 'category' },
    yAxis: {},
    itemStyle: { borderRadius: 3 },
    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: [{ type: 'pie', dimensions: props.results.headers }]
  } as Option;
});
</script>
<style>
</style>
