<script setup lang=ts>
import { computed } from 'vue'

import { type ControlsDict } from '@/controls'
import ControlComponent from './Control.vue'

// vue
const props = defineProps({
  controls: {
    type: Object as () => ControlsDict, 
    required: true,
  }
})

</script>

<template>
  <ControlComponent :control="control" v-for="control, i in props.controls" :key="i" />
</template>

<style scoped>
</style>
