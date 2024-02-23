<script setup lang=ts>
import { computed } from 'vue'

// for color manipulation
import { shade } from 'polished'
import { Pad } from '@/stores/controls'

import MappingsIndicator from './MappingsIndicator.vue'

// vue
const props = defineProps({
  pad: {
    type: Object as () => Pad,
    required: true,
  },
})

const sliderStyle = computed(() => {
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
    return shade(0.5, spec.color)
  } else {
    return spec.color
  }
})

const backgroundStyle = computed(() => {
  const spec = props.pad.spec
  return {
    backgroundColor: color.value,
    boxShadow: `0 0 3rem -2rem ${spec.color}`,
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
  <div class="pad-control" :style=sliderStyle >
    <div
      class=background
      :style=backgroundStyle
      @touchstart="touchstart"
      @touchend="touchend"
      >
    </div>
    <div class="text" >
      {{ props.pad.spec.name }}
    </div>
    <MappingsIndicator :mappings="props.pad.mappings"/>
  </div>
</template>

<style scoped>
.pad-control{
  position: absolute;
}

.background {
  position: absolute;
  width: calc(100% - 1rem);
  height: calc(100% - 1rem);
  margin: 0.5rem;
  border: 0.5rem solid #888;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
}

.text {
  color: #fff;
  position: absolute;
  top: 1.5rem;
  left: 0;
  width: 100%;
  text-align: center;
  pointer-events: none;
  font-family: monospace;
  font-weight: bold;
  user-select: none;
}

</style>
