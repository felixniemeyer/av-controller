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

function touchstart(e: Event) {
  props.pad.onTouch();
  props.pad.press(1);
  (e.currentTarget as HTMLDivElement).focus()
  e.preventDefault()
}

function touchend() {
  props.pad.release()
}

</script>

<template>
  <div
    class="basis"
    :style=basisStyle
    :tabindex="props.pad.tabIndex()"
    @touchstart="touchstart"
    @mousedown="touchstart"
    @keydown.enter="touchstart"
    @keydown.space="touchstart"
    @keup="touchend"
    @touchend="touchend"
    @mouseup="touchend"
    >
  </div>
  <div class="centered-label" >
    {{ props.pad.spec.name }}
  </div>
  <MappingsIndicator :mappings="props.pad.mappings"/>
</template>

<style scoped>
@import './control-styles.css';

</style>
