<script setup lang=ts>
import { computed, ref } from 'vue'

import { ConfirmSwitch } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'
import { shade } from 'polished';

// vue
const props = defineProps({
  confirmSwitch: {
    type: Object as () => ConfirmSwitch,
    required: true,
  },
})

const posize = computed(() => {
  const spec = props.confirmSwitch.spec
  return {
    width: `${spec.width}%`,
    height: `${spec.height}%`,
    top: `${spec.y}%`,
    left: `${spec.x}%`,
  }
})

const color = computed(() => {
  const spec = props.confirmSwitch.spec
  if (props.confirmSwitch.on) {
    return shade(0.35, spec.color)
  } else {
    return spec.color
  }
})

const basisStyle = computed(() => {
  const spec = props.confirmSwitch.spec
  return {
    backgroundColor: color.value,
    boxShadow: `0 0 3rem -2rem ${spec.color}`,
    borderColor: spec.color,
  }
})

function press(e: Event) {
  props.confirmSwitch.press();
  const target = e.currentTarget as HTMLDivElement
  target.focus()
  e.preventDefault()
}


</script>

<template>
  <div class="control" :style=posize >
    <div
      class="basis"
      :style=basisStyle
      :tabindex="props.confirmSwitch.tabIndex()"
      @touchstart="press"
      @mousedown="press"
      @keydown.enter="press"
      @keydown.space="press"
      @blur="props.confirmSwitch.cancel"
      >
    </div>
    <div class="centered-label" >
      {{ props.confirmSwitch.awaitingConfirmation ? 'confirm' : props.confirmSwitch.spec.name }}
      <span v-if="props.confirmSwitch.awaitingConfirmation">
        turn {{ props.confirmSwitch.on ? 'off' : 'on' }}
      </span>
      
    </div>
    <MappingsIndicator :mappings="props.confirmSwitch.mappings"/>
  </div>
</template>

<style scoped>
@import './control-styles.css';

</style>
