<script setup lang=ts>
import { Mapping } from '@/mappings'

const props = defineProps({
  mappings: {
    type: Array as () => Mapping[],
    required: true,
  },
})

</script>

<template>
  <div v-for="_, i in props.mappings" :key="i" :style="{left: (0.5 * i) + 'rem'}" class="mapping"/>
</template>

<style scoped>
.mapping {
  position: absolute;
  top: 0;
  border: 0.2rem solid #fff8;
  background-color: #3bf;
  border-radius: 0.5rem;
  width: 1rem;
  height: 1rem;
}
</style>
