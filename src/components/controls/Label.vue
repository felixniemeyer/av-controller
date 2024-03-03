<script setup lang=ts>
import { computed } from 'vue'

// for color manipulation
import { shade } from 'polished'
import { Label } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'

// vue
const props = defineProps({
  label: {
    type: Object as () => Label,
    required: true,
  },
})

const sliderStyle = computed(() => {
  const spec = props.label.spec
  return {
    width: `${spec.width}%`,
    height: `${spec.height}%`,
    top: `${spec.y}%`,
    left: `${spec.x}%`,
  }
})

const backgroundStyle = computed(() => {
  const spec = props.label.spec
  return {
    backgroundColor: color.value,
    boxShadow: `0 0 3rem -2rem ${spec.color}`,
    borderColor: spec.color,
  }
})

const labelClass = {
  top: 'label-top',
  center: 'centered-label',
  bottom: 'label-bottom',
}

</script>

<template>
  <div class="control" :style=sliderStyle >
    <div :class="labelClass[props.label.spec.labelPosition]">
      {{ props.label.spec.name}}
    </div>
    <MappingsIndicator :mappings="props.label.mappings"/>
  </div>
</template>

<style scoped>
@import './control-styles.css';
</style>
