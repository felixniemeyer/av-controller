<script setup lang=ts>
import { computed } from 'vue'

// for color manipulation
import { shade } from 'polished'
import { Switch } from '@/stores/controls'

import MappingsIndicator from './MappingsIndicator.vue'

// vue
const props = defineProps({
  switch: {
    type: Object as () => Switch,
    required: true,
  },
})

const sliderStyle = computed(() => {
  const spec = props.switch.spec
  return {
    width: `${spec.width}%`,
    height: `${spec.height}%`,
    top: `${spec.y}%`,
    left: `${spec.x}%`,
  }
})

const color = computed(() => {
  const spec = props.switch.spec
  if (props.switch.on) {
    return shade(0.5, spec.color)
  } else {
    return spec.color
  }
})

const backgroundStyle = computed(() => {
  const spec = props.switch.spec
  return {
    backgroundColor: color.value,
    boxShadow: `0 0 3rem -2rem ${spec.color}`,
    borderColor: spec.color,
  }
})

function touchstart(e: TouchEvent) {
  props.switch.touchDown()
  e.preventDefault()
}

</script>

<template>
  <div class="control" :style=sliderStyle >
    <div
      class="basis" 
      :style=backgroundStyle
      @touchstart="touchstart"
      >
    </div>
    <div class="centered-label" >
      {{ props.switch.spec.name }}
    </div>
    <MappingsIndicator :mappings="props.switch.mappings"/>
  </div>
</template>

<style scoped>
@import './control-styles.css';
</style>
