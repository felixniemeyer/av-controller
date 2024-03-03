<script setup lang=ts>
import { computed } from 'vue'

// for color manipulation
import { shade } from 'polished'
import { Pad } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'

// vue
const props = defineProps({
  pad: {
    type: Object as () => Pad,
    required: true,
  },
})

const posize = computed(() => {
  const spec = props.pad.spec
  return {
    width: `${spec.width}%`,
    height: `${spec.height}%`,
    top: `${spec.y}%`,
    left: `${spec.x}%`,
  }
})

const color = computed(() => {
  const spec = props.pad.spec
  if (props.pad.pressed) {
    return shade(0.35, spec.color)
  } else {
    return spec.color
  }
})

const basisStyle = computed(() => {
  const spec = props.pad.spec
  return {
    backgroundColor: color.value,
    boxShadow: `0 0 2rem -0.5rem ${spec.color}`,
    borderColor: spec.color,
  }
})

function touchstart(e: TouchEvent) {
  props.pad.press(1)
  e.preventDefault()
}

function touchend() {
  props.pad.release()
}

</script>

<template>
  <div class="control" :style=posize >
    <div
      class="basis"
      :style=basisStyle
      @touchstart="touchstart"
      @touchend="touchend"
      >
    </div>
    <div class="centered-label" >
      {{ props.pad.spec.name }}
    </div>
    <MappingsIndicator :mappings="props.pad.mappings"/>
  </div>
</template>

<style scoped>
@import './control-styles.css';

</style>
